import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { sendPrepMessage } from '../../api/companyApi'

import {
    getPrepChat,
    savePrepChat,
    clearPrepChat,
} from '../../utils/prepStorage'


function createMessage(role, content) {
    return {
        id: crypto.randomUUID(),
        role,
        content,
    }
}


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

        setMessages(prev => [
            ...prev,
            userMessage,
        ])

        setMessage('')
        setIsLoading(true)

        try {

            const response = await sendPrepMessage(
                companyId,
                trimmedMessage
            )

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    'Unable to generate a response.'
                )
            }

            const reply = response?.data?.reply

            if (!reply) {
                throw new Error(
                    'The AI service returned an empty response.'
                )
            }

            const assistantMessage = createMessage(
                'assistant',
                reply
            )

            setMessages(prev => [
                ...prev,
                assistantMessage,
            ])

            setError(null)
            setFailedMessage(null)

        } catch (err) {

            console.error(
                'Prep assistant error:',
                err
            )

            let errorMessage =
                'Something went wrong. Please try again.'

            if (err?.response?.status === 429) {

                errorMessage =
                    'Too many requests. Please wait a moment and try again.'

            } else if (err?.response?.status === 403) {

                errorMessage =
                    'You are not allowed to use the preparation assistant.'

            } else if (
                err?.response?.data?.message
            ) {

                errorMessage =
                    err.response.data.message

            } else if (err?.message) {

                errorMessage = err.message
            }

            setError(errorMessage)

            /*
             * Remember which message failed so the user
             * can resend the same request.
             */
            setFailedMessage({
                message: trimmedMessage,
                messageId: userMessage.id,
            })

        } finally {

            setIsLoading(false)
        }
    }


    // ==================================================
    // RESEND FAILED MESSAGE
    // ==================================================

    async function handleResend() {

        if (!failedMessage || isLoading) {
            return
        }

        const trimmedMessage = failedMessage.message

        setError(null)
        setFailedMessage(null)
        setIsLoading(true)

        try {

            const response = await sendPrepMessage(
                companyId,
                trimmedMessage
            )

            if (!response?.success) {
                throw new Error(
                    response?.message ||
                    'Unable to generate a response.'
                )
            }

            const reply = response?.data?.reply

            if (!reply) {
                throw new Error(
                    'The AI service returned an empty response.'
                )
            }

            const assistantMessage = createMessage(
                'assistant',
                reply
            )

            setMessages(prev => [
                ...prev,
                assistantMessage,
            ])

            setError(null)
            setFailedMessage(null)

        } catch (err) {

            console.error(
                'Prep assistant resend error:',
                err
            )

            let errorMessage =
                'Something went wrong. Please try again.'

            if (err?.response?.status === 429) {

                errorMessage =
                    'Too many requests. Please wait a moment and try again.'

            } else if (err?.response?.status === 403) {

                errorMessage =
                    'You are not allowed to use the preparation assistant.'

            } else if (
                err?.response?.data?.message
            ) {

                errorMessage =
                    err.response.data.message

            } else if (err?.message) {

                errorMessage = err.message
            }

            setError(errorMessage)

            setFailedMessage({
                message: trimmedMessage,
                messageId: failedMessage.messageId,
            })

        } finally {

            setIsLoading(false)
        }
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
         *
         * Example:
         *
         * User A
         * AI A
         * User B  <-- Edit this
         * AI B
         *
         * becomes:
         *
         * User A
         * AI A
         *
         * User B's text goes into the input box.
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
         * No window.confirm().
         *
         * The current company's conversation is cleared
         * immediately.
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
                                    ${isUser
                                        ? 'justify-end'
                                        : 'justify-start'
                                    }
                                `}
                            >

                                <div
                                    className={`
                                        min-w-0
                                        max-w-[92%]
                                        ${isUser
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
                                             * overflow-x-hidden prevents
                                             * markdown content from creating
                                             * a horizontal scrollbar.
                                             */
                                            <div
                                                className="
                                                    prose
                                                    prose-sm
                                                    max-w-none
                                                    w-full
                                                    min-w-0
                                                    break-words
                                                    overflow-x-hidden
                                                    [&_pre]:whitespace-pre-wrap
                                                    [&_pre]:break-words
                                                    [&_pre]:overflow-x-hidden
                                                    [&_code]:break-words
                                                    [&_table]:block
                                                    [&_table]:w-full
                                                    [&_table]:overflow-hidden
                                                    [&_td]:break-words
                                                    [&_th]:break-words
                                                "
                                            >

                                                <ReactMarkdown
                                                    remarkPlugins={[
                                                        remarkGfm,
                                                    ]}
                                                >
                                                    {item.content}
                                                </ReactMarkdown>

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