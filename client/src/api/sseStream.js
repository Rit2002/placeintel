/**
 * Minimal SSE client for POST-based streaming endpoints.
 *
 * Native EventSource only supports GET and can't attach a JSON
 * body or send credentials the way this app's cookie-auth
 * setup needs, so this reads the fetch() response body stream
 * manually and parses the SSE framing.
 *
 * Important:
 * We must NOT trim SSE data because the streamed content can
 * contain Markdown where spaces and newlines are meaningful.
 */

export async function streamSse(
  url,
  body,
  {
    onMessage,
    onEvent,
    onDone,
    onError,
  } = {}
) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok || !response.body) {
      const error = new Error(
        `Request failed with status ${response.status}`
      )

      error.status = response.status

      onError?.(error)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    let buffer = ''
    let finished = false

    const complete = () => {
      if (finished) {
        return
      }

      finished = true
      onDone?.()
    }

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      buffer += decoder.decode(value, {
        stream: true,
      })

      /*
       * SSE events are separated by a blank line.
       *
       * Handle both:
       *   \n\n
       *   \r\n\r\n
       */
      const rawEvents = buffer.split(/\r?\n\r?\n/)

      /*
       * The final element may still be incomplete.
       */
      buffer = rawEvents.pop() ?? ''

      for (const rawEvent of rawEvents) {
        if (!rawEvent) {
          continue
        }

        let eventName = null
        let data = ''

        const lines = rawEvent.split(/\r?\n/)

        for (const line of lines) {

          /*
           * event: tool
           *
           * trim() is safe here because event names themselves
           * are not Markdown content.
           */
          if (line.startsWith('event:')) {
            eventName = line.slice(6).trim()
            continue
          }

          /*
           * IMPORTANT:
           *
           * Do NOT call trim() on the data.
           *
           * We only remove the single optional space allowed
           * by the SSE format after "data:".
           *
           * Example:
           *   data: hello
           *
           * becomes:
           *   "hello"
           *
           * while:
           *   data:   hello
           *
           * keeps the additional spaces.
           */
          if (line.startsWith('data:')) {
            let value = line.slice(5)

            if (value.startsWith(' ')) {
              value = value.slice(1)
            }

            /*
             * Multiple data lines in one SSE event are joined
             * with a newline according to the SSE format.
             */
            data += `${value}\n`
          }
        }

        /*
         * Remove only the newline introduced by our joining
         * of multiple data lines.
         *
         * DO NOT trim the actual content.
         */
        if (data.endsWith('\n')) {
          data = data.slice(0, -1)
        }

        if (!data) {
          continue
        }

        /*
         * Named event:
         *
         * event: tool
         * data: web_search
         */
        if (eventName) {
          onEvent?.(eventName, data)
          continue
        }

        /*
         * Stream termination sentinel.
         */
        if (data === '[DONE]') {
          complete()
          continue
        }

        /*
         * Normal token/message event.
         */
        onMessage?.(data)
      }
    }

    /*
     * If the server closes the connection without [DONE],
     * consider the stream complete.
     */
    complete()

  } catch (error) {
    onError?.(error)
  }
}