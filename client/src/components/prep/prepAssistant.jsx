import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { streamPrepMessage } from '../../api/companyApi'

import {
    getPrepChat,
    savePrepChat,
    clearPrepChat
} from '../../utils/prepStorage'


// ==================================================
// MESSAGE FACTORY
// ==================================================

function createMessage(role, content) {
    return {
        id: crypto.randomUUID(),
        role,
        content,
    }
}


// ==================================================
// ERROR MESSAGE
// ==================================================

function errorMessageFor(err) {

    if (err?.status === 429) {
        return 'Too many requests. Please wait a moment and try again.'
    }

    if (err?.status === 403) {
        return 'You are not allowed to use the preparation assistant.'
    }

    return err?.message || 'Something went wrong. Please try again.'
}


// ==================================================
// MARKDOWN RENDERER
// ==================================================

function MarkdownContent({ content }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{

                // ------------------------------------------
                // HEADINGS
                // ------------------------------------------

                h1: ({ children }) => (
                    <h1 className="text-xl font-bold mt-6 mb-3 first:mt-0">
                        {children}
                    </h1>
                ),

                h2: ({ children }) => (
                    <h2 className="text-lg font-bold mt-5 mb-2 first:mt-0">
                        {children}
                    </h2>
                ),

                h3: ({ children }) => (
                    <h3 className="text-base font-semibold mt-4 mb-2 first:mt-0">
                        {children}
                    </h3>
                ),

                h4: ({ children }) => (
                    <h4 className="font-semibold mt-3 mb-1.5 first:mt-0">
                        {children}
                    </h4>
                ),

                // ------------------------------------------
                // PARAGRAPH
                // ------------------------------------------

                p: ({ children }) => (
                    <p className="mb-3 leading-7 last:mb-0">
                        {children}
                    </p>
                ),

                // ------------------------------------------
                // EMPHASIS
                // ------------------------------------------

                strong: ({ children }) => (
                    <strong className="font-semibold">
                        {children}
                    </strong>
                ),

                em: ({ children }) => (
                    <em>
                        {children}
                    </em>
                ),

                del: ({ children }) => (
                    <del>
                        {children}
                    </del>
                ),

                // ------------------------------------------
                // UNORDERED LIST
                // ------------------------------------------

                ul: ({ children }) => (
                    <ul className="list-disc pl-6 mb-4 space-y-1.5">
                        {children}
                    </ul>
                ),

                // ------------------------------------------
                // ORDERED LIST
                // ------------------------------------------

                ol: ({ children }) => (
                    <ol className="list-decimal pl-6 mb-4 space-y-1.5">
                        {children}
                    </ol>
                ),

                // ------------------------------------------
                // LIST ITEM
                // ------------------------------------------

                li: ({ children }) => (
                    <li className="leading-7">
                        {children}
                    </li>
                ),

                // ------------------------------------------
                // BLOCKQUOTE
                // ------------------------------------------

                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-base-300 pl-4 my-4 text-base-content/70">
                        {children}
                    </blockquote>
                ),

                // ------------------------------------------
                // HORIZONTAL RULE
                // ------------------------------------------

                hr: () => (
                    <hr className="my-5 border-base-300" />
                ),

                // ------------------------------------------
                // LINKS
                // ------------------------------------------

                a: ({ href, children }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="link link-primary"
                    >
                        {children}
                    </a>
                ),

                // ------------------------------------------
                // TABLE
                // ------------------------------------------

                table: ({ children }) => (
                    <div className="w-full overflow-x-auto my-4">
                        <table className="w-full border-collapse text-sm">
                            {children}
                        </table>
                    </div>
                ),

                thead: ({ children }) => (
                    <thead className="bg-base-300">
                        {children}
                    </thead>
                ),

                tbody: ({ children }) => (
                    <tbody>
                        {children}
                    </tbody>
                ),

                tr: ({ children }) => (
                    <tr className="border-b border-base-300">
                        {children}
                    </tr>
                ),

                th: ({ children }) => (
                    <th className="text-left font-semibold px-3 py-2 border border-base-300 whitespace-nowrap">
                        {children}
                    </th>
                ),

                td: ({ children }) => (
                    <td className="align-top px-3 py-2 border border-base-300 break-words">
                        {children}
                    </td>
                ),

                // ------------------------------------------
                // INLINE CODE + CODE BLOCK
                // ------------------------------------------

                code: ({ children, className }) => {

                    const isInline =
                        !className &&
                        typeof children === 'string' &&
                        !children.includes('\n')

                    if (isInline) {
                        return (
                            <code
                                className="
                                    px-1.5
                                    py-0.5
                                    rounded
                                    bg-base-300
                                    text-sm
                                    font-mono
                                "
                            >
                                {children}
                            </code>
                        )
                    }

                    return (
                        <code
                            className={`
                                block
                                font-mono
                                text-sm
                                leading-6
                                whitespace-pre
                                ${className || ''}
                            `}
                        >
                            {children}
                        </code>
                    )
                },

                pre: ({ children }) => (
                    <pre
                        className="
                            my-4
                            p-4
                            rounded-xl
                            bg-neutral
                            text-neutral-content
                            overflow-x-auto
                            text-sm
                            leading-6
                        "
                    >
                        {children}
                    </pre>
                ),

                // ------------------------------------------
                // IMAGE
                // ------------------------------------------

                img: ({ src, alt }) => (
                    <img
                        src={src}
                        alt={alt || ''}
                        className="
                            max-w-full
                            h-auto
                            rounded-xl
                            my-4
                        "
                    />
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    )
}


// ==================================================
// PREP ASSISTANT
// ==================================================

function PrepAssistant({ companyId, companyName }) {

    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [failedMessage, setFailedMessage] = useState(null)

    const messagesEndRef = useRef(null)

    /*
     * Important:
     *
     * We need to know whether the initial sessionStorage load
     * has completed before saving messages.
     *
     * Without this guard, the initial [] state can overwrite
     * an already existing conversation.
     */
    const hasLoadedChat = useRef(false)


    // ==================================================
    // LOAD COMPANY CHAT
    // ==================================================

    useEffect(() => {

        hasLoadedChat.current = false

        const savedChat = getPrepChat(companyId)

        if (
            savedChat &&
            Array.isArray(savedChat.messages)
        ) {
            setMessages(savedChat.messages)
        } else {
            setMessages([])
        }

        setMessage('')
        setError(null)
        setFailedMessage(null)

        /*
         * Mark the initial load as complete only after
         * the existing chat has been read.
         */
        hasLoadedChat.current = true

    }, [companyId])


    // ==================================================
    // SAVE COMPANY CHAT
    // ==================================================

    useEffect(() => {

        /*
         * Do NOT save anything until the initial chat
         * has been loaded.
         *
         * This prevents [] from overwriting an existing chat.
         */
        if (!hasLoadedChat.current) {
            return
        }

        savePrepChat(companyId, {
            companyName,
            messages,
        })

    }, [companyId, companyName, messages])


    // ==================================================
    // AUTO SCROLL
    // ==================================================

    useEffect(() => {

        if (!isOpen) {
            return
        }

        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        })

    }, [messages, isLoading, isOpen])


    // ==================================================
    // STREAM A REPLY INTO A GIVEN ASSISTANT MESSAGE
    // ==================================================
    //
    // Shared by handleSendMessage and handleResend: streams
    // tokens into the assistant bubble identified by
    // assistantMessageId, growing it live instead of waiting
    // for the full reply. On failure the (still-empty or
    // partial) assistant bubble is removed and the user
    // message is marked as failed/resendable.
    // ==================================================

    async function streamReplyInto(
        trimmedMessage,
        assistantMessageId,
        userMessageId
    ) {

        let accumulated = ''
        let receivedAnyToken = false

        await streamPrepMessage(
            companyId,
            trimmedMessage,
            {

                onToken: (text) => {

                    accumulated += text
                    receivedAnyToken = true

                    setIsLoading(false)

                    setMessages(prev =>
                        prev.map(item =>
                            item.id === assistantMessageId
                                ? {
                                    ...item,
                                    content: accumulated
                                }
                                : item
                        )
                    )
                },

                onDone: () => {

                    setIsLoading(false)

                    if (!receivedAnyToken) {

                        /*
                         * Stream closed with no tokens at all.
                         */
                        setMessages(prev =>
                            prev.filter(
                                item =>
                                    item.id !== assistantMessageId
                            )
                        )

                        setError(
                            'The AI service returned an empty response.'
                        )

                        setFailedMessage({
                            message: trimmedMessage,
                            messageId: userMessageId,
                        })
                    }
                },

                onError: (err) => {

                    console.error(
                        'Prep assistant error:',
                        err
                    )

                    setMessages(prev =>
                        prev.filter(
                            item =>
                                item.id !== assistantMessageId
                        )
                    )

                    setError(errorMessageFor(err))

                    setFailedMessage({
                        message: trimmedMessage,
                        messageId: userMessageId,
                    })

                    setIsLoading(false)
                },
            }
        )
    }


    // ==================================================
    // SEND MESSAGE
    // ==================================================

    async function handleSendMessage() {

        const trimmedMessage = message.trim()

        if (!trimmedMessage || isLoading) {
            return
        }

        setError(null)
        setFailedMessage(null)

        const userMessage = createMessage(
            'user',
            trimmedMessage
        )

        const assistantMessage = createMessage(
            'assistant',
            ''
        )

        setMessages(prev => [
            ...prev,
            userMessage,
            assistantMessage,
        ])

        setMessage('')
        setIsLoading(true)

        await streamReplyInto(
            trimmedMessage,
            assistantMessage.id,
            userMessage.id
        )
    }


    // ==================================================
    // RESEND FAILED MESSAGE
    // ==================================================

    async function handleResend() {

        if (!failedMessage || isLoading) {
            return
        }

        const trimmedMessage = failedMessage.message
        const userMessageId = failedMessage.messageId

        setError(null)
        setFailedMessage(null)

        const assistantMessage = createMessage(
            'assistant',
            ''
        )

        setMessages(prev => [
            ...prev,
            assistantMessage,
        ])

        setIsLoading(true)

        await streamReplyInto(
            trimmedMessage,
            assistantMessage.id,
            userMessageId
        )
    }


    // ==================================================
    // EDIT USER MESSAGE
    // ==================================================

    function handleEditMessage(messageToEdit) {

        if (isLoading) {
            return
        }

        const messageIndex = messages.findIndex(
            item => item.id === messageToEdit.id
        )

        if (messageIndex === -1) {
            return
        }

        /*
         * Remove the selected message and everything
         * after it.
         */
        setMessages(
            messages.slice(0, messageIndex)
        )

        setMessage(messageToEdit.content)

        setError(null)
        setFailedMessage(null)

        setTimeout(() => {

            const textarea =
                document.getElementById(
                    'prep-assistant-input'
                )

            textarea?.focus()

        }, 50)
    }


    // ==================================================
    // NEW CHAT
    // ==================================================

    function handleNewChat() {

        if (isLoading) {
            return
        }

        /*
         * Clear the current company's saved conversation.
         */
        clearPrepChat(companyId)

        setMessages([])
        setMessage('')
        setError(null)
        setFailedMessage(null)
    }


    // ==================================================
    // KEYBOARD HANDLING
    // ==================================================

    function handleKeyDown(event) {

        if (
            event.key === 'Enter' &&
            !event.shiftKey
        ) {

            event.preventDefault()

            handleSendMessage()
        }
    }


    // ==================================================
    // CLOSE CHAT
    // ==================================================

    function handleClose() {

        if (isLoading) {
            return
        }

        setIsOpen(false)
    }


    // ==================================================
    // FLOATING LAUNCHER
    // ==================================================

    if (!isOpen) {

        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="
                    fixed
                    bottom-6
                    right-6
                    z-40
                    w-16
                    h-16
                    rounded-full
                    bg-black
                    text-white
                    shadow-xl
                    flex
                    items-center
                    justify-center
                    text-2xl
                    cursor-pointer
                    hover:scale-105
                    transition
                "
                aria-label="Open Company Prep Assistant"
            >
                ✦
            </button>
        )
    }


    // ==================================================
    // CHAT MODAL
    // ==================================================

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                bg-black/20
                backdrop-blur-sm
                flex
                items-center
                justify-center
                p-4
            "
        >

            <div
                className="
                    w-full
                    max-w-5xl
                    h-[78vh]
                    bg-base-100
                    rounded-3xl
                    shadow-2xl
                    overflow-hidden
                    flex
                    flex-col
                "
            >

                {/* ====================================== */}
                {/* HEADER */}
                {/* ====================================== */}

                <div
                    className="
                        px-7
                        py-4
                        border-b
                        border-base-300
                        flex
                        items-center
                        justify-between
                        shrink-0
                    "
                >

                    <div className="flex items-center gap-3">

                        <div
                            className="
                                w-11
                                h-11
                                rounded-full
                                bg-black
                                text-white
                                flex
                                items-center
                                justify-center
                                text-xl
                                shrink-0
                            "
                        >
                            ✦
                        </div>

                        <div>

                            <h2 className="font-semibold text-lg">
                                Company Prep AI
                            </h2>

                            <p className="text-sm text-base-content/60">
                                Preparing for {companyName}
                            </p>

                        </div>

                    </div>


                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={handleNewChat}
                            disabled={isLoading}
                            className="
                                px-4
                                py-2
                                rounded-xl
                                border
                                border-base-300
                                text-sm
                                font-medium
                                hover:bg-base-200
                                transition
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                cursor-pointer
                            "
                        >
                            + New Chat
                        </button>


                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="
                                w-10
                                h-10
                                rounded-full
                                flex
                                items-center
                                justify-center
                                text-2xl
                                hover:bg-base-200
                                transition
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                                cursor-pointer
                            "
                            aria-label="Close"
                        >
                            ×
                        </button>

                    </div>

                </div>


                {/* ====================================== */}
                {/* MESSAGES */}
                {/* ====================================== */}

                <div
                    className="
                        flex-1
                        min-h-0
                        overflow-y-auto
                        overflow-x-hidden
                        px-7
                        py-5
                    "
                >

                    {/* ---------------------------------- */}
                    {/* EMPTY STATE */}
                    {/* ---------------------------------- */}

                    {messages.length === 0 && !isLoading && (

                        <div
                            className="
                                h-full
                                flex
                                flex-col
                                items-center
                                justify-center
                                text-center
                                px-6
                            "
                        >

                            <div
                                className="
                                    w-14
                                    h-14
                                    rounded-full
                                    bg-black
                                    text-white
                                    flex
                                    items-center
                                    justify-center
                                    text-2xl
                                    mb-4
                                "
                            >
                                ✦
                            </div>


                            <h3
                                className="
                                    text-2xl
                                    font-semibold
                                    mb-2
                                "
                            >
                                Prepare for {companyName}
                            </h3>


                            <p
                                className="
                                    text-base-content/60
                                    max-w-2xl
                                    mb-6
                                "
                            >
                                Ask anything about preparing for
                                this company's recruitment process.
                            </p>


                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    gap-3
                                    w-full
                                    max-w-2xl
                                "
                            >

                                {[
                                    'Create my preparation roadmap',
                                    'What skills should I focus on?',
                                    'What interview questions should I prepare?',
                                    'Help me prepare for the technical round',
                                ].map(prompt => (

                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() =>
                                            setMessage(prompt)
                                        }
                                        className="
                                            text-left
                                            px-4
                                            py-3
                                            rounded-xl
                                            border
                                            border-base-300
                                            text-sm
                                            hover:bg-base-200
                                            transition
                                            cursor-pointer
                                        "
                                    >
                                        {prompt}
                                    </button>

                                ))}

                            </div>

                        </div>
                    )}


                    {/* ---------------------------------- */}
                    {/* MESSAGE LIST */}
                    {/* ---------------------------------- */}

                    {messages.map(item => {

                        const isUser =
                            item.role === 'user'

                        const isFailedUserMessage =
                            isUser &&
                            failedMessage?.messageId === item.id


                        return (
                            <div
                                key={item.id}
                                className={`
                                    flex
                                    mb-5
                                    min-w-0
                                    ${
                                        isUser
                                            ? 'justify-end'
                                            : 'justify-start'
                                    }
                                `}
                            >

                                <div
                                    className={`
                                        min-w-0
                                        max-w-[92%]
                                        ${
                                            isUser
                                                ? 'items-end'
                                                : 'items-start'
                                        }
                                        flex
                                        flex-col
                                    `}
                                >

                                    {/* MESSAGE BUBBLE */}

                                    <div
                                        className={`
                                            min-w-0
                                            max-w-full
                                            px-5
                                            py-3
                                            rounded-2xl
                                            leading-relaxed
                                            break-words
                                            overflow-wrap-anywhere
                                            ${
                                                isUser
                                                    ? 'bg-black text-white rounded-br-md'
                                                    : 'bg-base-200 text-base-content rounded-bl-md'
                                            }
                                        `}
                                    >

                                        {isUser ? (

                                            <p className="whitespace-pre-wrap break-words">
                                                {item.content}
                                            </p>

                                        ) : (

                                            /*
                                             * Explicit Markdown rendering.
                                             *
                                             * This handles:
                                             * - headings
                                             * - bold / italic
                                             * - numbered lists
                                             * - bullet lists
                                             * - nested lists
                                             * - tables
                                             * - code blocks
                                             * - inline code
                                             * - blockquotes
                                             * - links
                                             * - horizontal rules
                                             *
                                             * The content is streamed into
                                             * item.content and ReactMarkdown
                                             * re-parses it automatically.
                                             */
                                            <div
                                                className="
                                                    w-full
                                                    min-w-0
                                                    break-words
                                                    overflow-x-hidden
                                                    text-sm
                                                "
                                            >
                                                <MarkdownContent
                                                    content={item.content}
                                                />
                                            </div>

                                        )}

                                    </div>


                                    {/* -------------------------------- */}
                                    {/* USER ACTIONS */}
                                    {/* -------------------------------- */}

                                    {isUser && (

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-4
                                                mt-1.5
                                                mr-1
                                            "
                                        >

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEditMessage(item)
                                                }
                                                disabled={
                                                    isLoading ||
                                                    isFailedUserMessage
                                                }
                                                className="
                                                    text-xs
                                                    text-base-content/50
                                                    hover:text-base-content
                                                    transition
                                                    disabled:opacity-40
                                                    disabled:cursor-not-allowed
                                                    cursor-pointer
                                                "
                                            >
                                                Edit
                                            </button>


                                            {isFailedUserMessage && (

                                                <button
                                                    type="button"
                                                    onClick={handleResend}
                                                    disabled={isLoading}
                                                    className="
                                                        text-xs
                                                        font-medium
                                                        text-red-600
                                                        hover:text-red-700
                                                        transition
                                                        disabled:opacity-40
                                                        disabled:cursor-not-allowed
                                                        cursor-pointer
                                                    "
                                                >
                                                    Resend
                                                </button>

                                            )}

                                        </div>

                                    )}

                                </div>

                            </div>
                        )
                    })}


                    {/* ---------------------------------- */}
                    {/* LOADING */}
                    {/* ---------------------------------- */}

                    {/*
                        Only shown before the first token of a new
                        reply arrives. streamReplyInto() flips
                        isLoading off as soon as onToken fires.
                    */}

                    {isLoading && (

                        <div className="flex justify-start mb-5">

                            <div
                                className="
                                    bg-base-200
                                    rounded-2xl
                                    rounded-bl-md
                                    px-5
                                    py-3
                                "
                            >

                                <div className="flex gap-1.5">

                                    <span
                                        className="
                                            w-2
                                            h-2
                                            bg-base-content/40
                                            rounded-full
                                            animate-bounce
                                        "
                                    />

                                    <span
                                        className="
                                            w-2
                                            h-2
                                            bg-base-content/40
                                            rounded-full
                                            animate-bounce
                                            [animation-delay:150ms]
                                        "
                                    />

                                    <span
                                        className="
                                            w-2
                                            h-2
                                            bg-base-content/40
                                            rounded-full
                                            animate-bounce
                                            [animation-delay:300ms]
                                        "
                                    />

                                </div>

                            </div>

                        </div>

                    )}


                    {/* ---------------------------------- */}
                    {/* ERROR */}
                    {/* ---------------------------------- */}

                    {error && (

                        <div
                            className="
                                flex
                                justify-center
                                mb-4
                            "
                        >

                            <div
                                className="
                                    text-sm
                                    text-red-600
                                    border
                                    border-red-200
                                    bg-red-50
                                    rounded-xl
                                    px-4
                                    py-2.5
                                    flex
                                    items-center
                                    gap-3
                                    max-w-full
                                "
                            >

                                <span>
                                    {error}
                                </span>


                                {failedMessage && !isLoading && (

                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        className="
                                            font-semibold
                                            underline
                                            cursor-pointer
                                            hover:no-underline
                                            shrink-0
                                        "
                                    >
                                        Resend
                                    </button>

                                )}

                            </div>

                        </div>

                    )}


                    <div ref={messagesEndRef} />

                </div>


                {/* ====================================== */}
                {/* INPUT */}
                {/* ====================================== */}

                <div
                    className="
                        border-t
                        border-base-300
                        px-7
                        py-3
                        shrink-0
                    "
                >

                    <div
                        className="
                            relative
                            border
                            border-base-300
                            rounded-2xl
                            bg-base-100
                            shadow-sm
                            focus-within:border-base-content/30
                            transition
                        "
                    >

                        <textarea
                            id="prep-assistant-input"
                            value={message}
                            onChange={event =>
                                setMessage(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            placeholder={
                                `Ask anything about preparing for ${companyName}...`
                            }
                            rows={2}
                            className="
                                w-full
                                resize-none
                                bg-transparent
                                outline-none
                                px-5
                                py-3
                                pr-16
                                text-sm
                                disabled:opacity-50
                            "
                        />


                        <button
                            type="button"
                            onClick={handleSendMessage}
                            disabled={
                                !message.trim() ||
                                isLoading
                            }
                            className="
                                absolute
                                right-3
                                bottom-2.5
                                w-10
                                h-10
                                rounded-xl
                                bg-black
                                text-white
                                flex
                                items-center
                                justify-center
                                text-lg
                                transition
                                hover:bg-black/80
                                disabled:opacity-30
                                disabled:cursor-not-allowed
                                cursor-pointer
                            "
                            aria-label="Send message"
                        >
                            ↑
                        </button>

                    </div>


                    <p
                        className="
                            text-xs
                            text-base-content/50
                            text-center
                            mt-2
                        "
                    >
                        Enter to send · Shift + Enter for a new line
                    </p>

                </div>

            </div>

        </div>
    )
}


export default PrepAssistant