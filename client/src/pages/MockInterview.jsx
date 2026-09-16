import { useEffect, useRef, useState } from 'react'
import {
    useLocation,
    useNavigate,
    useParams
} from 'react-router-dom'

import Navbar from '../components/Navbar'
import { takeMockInterviewTurn } from '../api/mockInterviewApi'
import { useAuth } from '../context/AuthContext'

function MockInterview() {

    const location = useLocation()
    const navigate = useNavigate()
    const { companyId: routeCompanyId } = useParams()

    const { user } = useAuth()

    /*
     * Company ID comes from the URL.
     *
     * The state fallback is useful if we navigate here
     * programmatically.
     */
    const companyId =
        routeCompanyId ||
        location.state?.companyId

    const companyName =
        location.state?.companyName ||
        'Mock Interview'

    const role =
        location.state?.role ||
        ''


    const [question, setQuestion] = useState('')
    const [questionNumber, setQuestionNumber] = useState(0)

    const [conversationHistory, setConversationHistory] =
        useState([])

    const [answer, setAnswer] = useState('')

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const [error, setError] = useState('')

    const [isComplete, setIsComplete] = useState(false)
    const [evaluation, setEvaluation] = useState(null)


    /*
     * Prevent React StrictMode from starting
     * the interview more than once.
     */
    const interviewStarted = useRef(false)


    /*
     * IMPORTANT:
     *
     * Do NOT start the interview immediately on mount.
     *
     * On the first render, user may still be null.
     * Wait until user and studentId are available.
     */
    useEffect(() => {

        if (interviewStarted.current) {
            return
        }

        /*
         * Wait for authentication state.
         *
         * When user becomes available, this effect
         * runs again because user is in the dependency array.
         */
        if (!user?.studentId) {
            return
        }

        /*
         * Wait for company information as well.
         */
        if (!companyId) {
            return
        }

        interviewStarted.current = true

        startInterview(user.studentId)

    }, [user, companyId])


    async function startInterview(studentId) {

        if (!companyId) {

            setError(
                'Company information is missing. Please start the mock interview from a company drive.'
            )

            setLoading(false)

            return
        }

        if (!studentId) {

            setError(
                'Student information is missing. Please log in again.'
            )

            setLoading(false)

            return
        }


        try {

            setLoading(true)
            setError('')

            const payload = {

                company_id: companyId,

                /*
                 * Internal React property is studentId.
                 *
                 * HTTP JSON field is student_id.
                 */
                student_id: studentId,

                round_type: 'TECHNICAL',

                conversation_history: [],

                student_answer: ''

            }


            console.log(
                'Starting mock interview:',
                payload
            )


            const result =
                await takeMockInterviewTurn(payload)


            if (!result?.success) {

                throw new Error(
                    result?.message ||
                    'Failed to start mock interview'
                )
            }


            const data = result.data


            setIsComplete(false)
            setEvaluation(null)

            setQuestion(
                data?.question || ''
            )

            setQuestionNumber(
                data?.question_number || 1
            )

            setConversationHistory(
                data?.conversation_history || []
            )


        } catch (err) {

            console.error(
                'Failed to start mock interview:',
                err
            )

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                err?.message ||
                'Could not start mock interview.'
            )

        } finally {

            setLoading(false)

        }
    }


    async function submitAnswer() {

        if (!answer.trim() || submitting) {
            return
        }


        if (!companyId) {

            setError(
                'Company information is missing.'
            )

            return
        }


        /*
         * Safety check.
         *
         * This should normally never fail because
         * startInterview cannot begin without studentId.
         */
        if (!user?.studentId) {

            setError(
                'Student information is missing. Please log in again.'
            )

            return
        }


        try {

            setSubmitting(true)
            setError('')


            const payload = {

                company_id: companyId,

                /*
                 * JSON field expected by Spring/FastAPI.
                 */
                student_id: user.studentId,

                round_type: 'TECHNICAL',

                /*
                 * Send exactly the history returned
                 * by the previous backend response.
                 */
                conversation_history:
                    conversationHistory,

                student_answer:
                    answer.trim()

            }


            console.log(
                'Submitting mock interview answer:',
                payload
            )


            const result =
                await takeMockInterviewTurn(payload)


            if (!result?.success) {

                throw new Error(
                    result?.message ||
                    'Failed to submit answer'
                )
            }


            const data = result.data


            /*
             * Interview completed after Q5.
             */
            if (data?.is_complete) {

                setQuestionNumber(
                    data?.question_number || 5
                )

                setIsComplete(true)

                setConversationHistory(
                    data?.conversation_history ||
                    conversationHistory
                )

                setEvaluation(
                    data?.evaluation || null
                )

                setQuestion('')
                setAnswer('')

                return
            }


            /*
             * Normal interview turn:
             *
             * Q1 -> Q2
             * Q2 -> Q3
             * Q3 -> Q4
             * Q4 -> Q5
             */
            setQuestion(
                data?.question || ''
            )

            setQuestionNumber(
                data?.question_number ||
                questionNumber + 1
            )

            setConversationHistory(
                data?.conversation_history || []
            )

            setAnswer('')


        } catch (err) {

            console.error(
                'Failed to submit mock interview answer:',
                err
            )

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                err?.message ||
                'Could not submit your answer.'
            )

        } finally {

            setSubmitting(false)

        }
    }


    return (

        <div className="min-h-screen bg-base-200">

            <Navbar />


            <main className="max-w-4xl mx-auto px-6 py-10">


                {/* Header */}

                <div className="mb-8">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn btn-ghost btn-sm mb-4 rounded-xl px-3 gap-2"
                    >
                        <span className="text-base">←</span>
                        Back
                    </button>

                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-base-100 to-base-100 border border-base-300 shadow-sm">
                        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl"></div>
                        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-secondary/10 blur-3xl"></div>

                        <div className="relative p-6 sm:p-8">

                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="badge badge-primary badge-outline">
                                    Mock Interview
                                </span>

                                <span className="badge badge-ghost">
                                    5 Questions
                                </span>

                                <span className="badge badge-ghost">
                                    Technical Round
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium text-base-content/60">
                                    Prepare for your next interview
                                </p>

                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                    {companyName}
                                </h1>

                                {role && (
                                    <p className="text-base sm:text-lg text-base-content/70">
                                        {role}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3 text-sm text-base-content/60">
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-success"></span>
                                    Company-focused questions
                                </span>

                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-info"></span>
                                    Adaptive interview flow
                                </span>
                            </div>

                        </div>
                    </div>

                </div>


                {/* Loading */}

                {loading && (

                    <div className="flex justify-center py-20">

                        <span className="loading loading-spinner loading-lg" />

                    </div>

                )}


                {/* Error */}

                {error && (

                    <div
                        role="alert"
                        className="alert alert-error mb-6"
                    >
                        <span>{error}</span>
                    </div>

                )}


                {/* Interview */}

                {!loading &&
                    !error &&
                    !isComplete && (

                        <div className="card bg-base-100 shadow-sm">

                            <div className="card-body">


                                {/* Question number */}

                                <div className="flex justify-between items-center">

                                    <span className="text-sm text-base-content/60">
                                        Question {questionNumber} / 5
                                    </span>

                                </div>


                                <div className="divider"></div>


                                {/* Question */}

                                {question && (

                                    <div className="rounded-xl bg-base-200 p-6">

                                        <p className="text-lg leading-relaxed">
                                            {question}
                                        </p>

                                    </div>

                                )}


                                {/* Answer */}

                                <div className="mt-6">

                                    <label
                                        htmlFor="answer"
                                        className="text-sm font-semibold"
                                    >
                                        Your Answer
                                    </label>


                                    <textarea
                                        id="answer"
                                        value={answer}
                                        onChange={(e) =>
                                            setAnswer(e.target.value)
                                        }
                                        disabled={submitting}
                                        className="textarea textarea-bordered w-full mt-2 min-h-48"
                                        placeholder="Type your answer here..."
                                    />

                                </div>


                                {/* Submit */}

                                <div className="flex justify-end mt-4">

                                    <button
                                        type="button"
                                        onClick={submitAnswer}
                                        className="btn btn-primary"
                                        disabled={
                                            !answer.trim() ||
                                            submitting
                                        }
                                    >

                                        {submitting ? (

                                            <>
                                                <span className="loading loading-spinner loading-sm" />
                                                Processing...
                                            </>

                                        ) : (

                                            'Submit Answer'

                                        )}

                                    </button>

                                </div>


                            </div>

                        </div>

                    )}


                {/* Completed */}

                {!loading &&
                    !error &&
                    isComplete && (

                        <div className="card bg-base-100 shadow-sm">

                            <div className="card-body">

                                <h2 className="text-2xl font-bold">
                                    Interview Completed
                                </h2>


                                <p className="text-base-content/60 mt-1">
                                    You completed all 5 questions.
                                </p>


                                {evaluation && (

                                    <div className="mt-6">

                                        <h3 className="text-lg font-semibold mb-3">
                                            Evaluation
                                        </h3>


                                        <pre className="bg-base-200 rounded-xl p-4 overflow-auto text-sm whitespace-pre-wrap">
                                            {JSON.stringify(
                                                evaluation,
                                                null,
                                                2
                                            )}
                                        </pre>

                                    </div>

                                )}

                            </div>

                        </div>

                    )}

            </main>

        </div>

    )
}

export default MockInterview