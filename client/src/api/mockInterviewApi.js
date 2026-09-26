import axiosClient from './axiosClient'
import { streamSse } from './sseStream'

/**
 * Streams a mock-interview turn.
 *
 * This replaces the old takeMockInterviewTurn(payload) —
 * the backend endpoint no longer returns a single JSON body,
 * it streams SSE events, so there is no non-streaming version
 * of this call anymore.
 *
 * handlers:
 *   onToken(text)   - a chunk of the interviewer's question as it's generated
 *   onTool(name)    - a tool call started (e.g. fetching drive requirements)
 *   onDone(payload) - final state: { question_number, question, is_complete,
 *                     conversation_history, evaluation }
 *   onError(error)
 */
export async function streamMockInterviewTurn(payload, { onToken, onTool, onDone, onError } = {}) {
  const url = `${axiosClient.defaults.baseURL}/students/me/mock-interview/turn`

  await streamSse(url, payload, {
    onMessage: (raw) => {
      try {
        const parsed = JSON.parse(raw)

        if (parsed.type === 'token') {
          onToken?.(parsed.text)
        } else if (parsed.type === 'done') {
          onDone?.(parsed)
        } else {
          onError?.(new Error(`Unrecognized stream payload type: ${parsed.type}`))
        }
      } catch (e) {
        onError?.(e)
      }
    },
    onEvent: (name, data) => {
      if (name === 'tool') {
        onTool?.(data)
        return
      }

      if (name === 'error') {
        try {
          const parsed = JSON.parse(data)
          onError?.(new Error(parsed.message || 'Mock interview stream failed.'))
        } catch {
          onError?.(new Error(data))
        }
      }
    },
    onError,
  })
}