import { useEffect, useRef, useState } from 'react'
import {
    useLocation,
    useNavigate,
    useParams
} from 'react-router-dom'

import Navbar from '../components/Navbar'
import { takeMockInterviewTurn } from '../api/mockInterviewApi'
import { useAuth } from '../context/AuthContext'

function ScoreRing({ score }) {
    const safeScore = Math.min(100, Math.max(0, Number(score) || 0))
    const radius = 52
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (safeScore / 100) * circumference

    return (
        <div className="relative h-36 w-36 shrink-0 sm:h-44 sm:w-44">
            <svg
                viewBox="0 0 120 120"
                className="h-full w-full -rotate-90"
                aria-label={`Score ${safeScore} out of 100`}
            >
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="9"
                    className="text-base-300"
                />
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="9"
                    strokeLinecap="round"
                    className="text-primary transition-all duration-700"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black tracking-tight">
                    {safeScore}
                </span>
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-base-content/50">
                    / 100
                </span>
            </div>
        </div>
    )
}

function ScoreTone({ score }) {
    const value = Number(score) || 0

    if (value >= 80) {
        return {
            label: 'Strong performance',
            className: 'badge-success',
            description: 'Your fundamentals and interview communication are coming through clearly.'
        }
    }

    if (value >= 60) {
        return {
            label: 'Solid foundation',
            className: 'badge-warning',
            description: 'You have the core ideas. More depth and implementation detail will make the answers stronger.'
        }
    }

    return {
        label: 'Needs improvement',
        className: 'badge-error',
        description: 'Focus on completeness, concrete examples, trade-offs, and implementation details.'
    }
}

function StatCard({ value, label, icon }) {
    return (
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">
                    {icon}
                </div>
                <div>
                    <p className="text-xl font-bold leading-none">{value}</p>
                    <p className="mt-1 text-xs text-base-content/55">{label}</p>
                </div>
            </div>
        </div>
    )
}

function SectionCard({ title, icon, children }) {
    return (
        <section className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">
            <div className="flex items-center gap-3 border-b border-base-300 px-5 py-4 sm:px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-base-200 text-base">
                    {icon}
                </div>
                <h3 className="font-bold">{title}</h3>
            </div>
            <div className="px-5 py-5 sm:px-6">
                {children}
            </div>
        </section>
    )
}

function FeedbackList({ items, emptyText }) {
    if (!Array.isArray(items) || items.length === 0) {
        return (
            <p className="text-sm leading-6 text-base-content/60">
                {emptyText}
            </p>
        )
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div
                    key={`${item}-${index}`}
                    className="flex gap-3 rounded-xl border border-base-300 bg-base-200/60 p-4"
                >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-base-100 text-xs font-bold shadow-sm">
                        {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-base-content/80">
                        {item}
                    </p>
                </div>
            ))}
        </div>
    )
}

function QuestionEvaluation({ item, index }) {
    const [open, setOpen] = useState(index === 0)

    return (
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-base-200/60 sm:px-6"
            >
                <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                        <span className="badge badge-neutral badge-sm">
                            Q{index + 1}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-wider text-base-content/45">
                            Question review
                        </span>
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold leading-6 sm:text-base">
                        {item?.question || 'Question not available'}
                    </p>
                </div>

                <span
                    className={`shrink-0 text-base-content/45 transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                >
                    ▼
                </span>
            </button>

            {open && (
                <div className="border-t border-base-300 px-5 py-5 sm:px-6">
                    <div className="grid gap-5 lg:grid-cols-2">
                        <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4">
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-base-content/45">
                                Answer summary
                            </p>
                            <p className="text-sm leading-6 text-base-content/75">
                                {item?.answer_summary || 'No answer summary was provided.'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-200/50 p-4">
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-base-content/45">
                                Strengths
                            </p>
                            <p className="text-sm leading-6 text-base-content/75">
                                {item?.strengths || 'No specific strength was recorded.'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-base-300 bg-base-200/50 p-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-base-content/45">
                            Improve next time
                        </p>
                        <p className="text-sm leading-6 text-base-content/75">
                            {item?.improvement_areas || 'No improvement areas were recorded.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

function EvaluationView({ evaluation }) {
    const score = Number(evaluation?.overall_score) || 0
    const tone = ScoreTone({ score })
    const questionFeedback = Array.isArray(evaluation?.per_question_feedback)
        ? evaluation.per_question_feedback
        : []
    const strengths = Array.isArray(evaluation?.key_strengths)
        ? evaluation.key_strengths
        : []
    const improvementAreas = Array.isArray(evaluation?.key_improvement_areas)
        ? evaluation.key_improvement_areas
        : []

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />

                <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:items-center">
                    <div className="flex justify-center lg:justify-start">
                        <ScoreRing score={score} />
                    </div>

                    <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className={`badge ${tone.className} badge-outline font-semibold`}>
                                {tone.label}
                            </span>
                            <span className="badge badge-ghost">
                                {questionFeedback.length || 0} questions reviewed
                            </span>
                        </div>

                        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                            Your interview performance
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/65 sm:text-base">
                            {evaluation?.overall_feedback ||
                                'Your interview has been completed. Review the section-by-section feedback below.'}
                        </p>
                        <p className="mt-4 max-w-2xl text-sm font-medium text-base-content/75">
                            {tone.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard value={`${questionFeedback.length}/5`} label="Questions reviewed" icon="◉" />
                <StatCard value={strengths.length} label="Key strengths" icon="✓" />
                <StatCard value={improvementAreas.length} label="Focus areas" icon="↗" />
                <StatCard value={`${score}%`} label="Overall score" icon="★" />
            </div>

            <SectionCard title="What you did well" icon="✓">
                <FeedbackList
                    items={strengths}
                    emptyText="No key strengths were returned by the evaluator."
                />
            </SectionCard>

            <SectionCard title="What to improve" icon="↗">
                <FeedbackList
                    items={improvementAreas}
                    emptyText="No key improvement areas were returned by the evaluator."
                />
            </SectionCard>

            <section>
                <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-base-content/45">
                            Detailed breakdown
                        </p>
                        <h3 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                            Question-by-question feedback
                        </h3>
                    </div>
                    <span className="hidden text-xs text-base-content/45 sm:block">
                        Click a question to expand it
                    </span>
                </div>

                <div className="space-y-3">
                    {questionFeedback.length > 0 ? (
                        questionFeedback.map((item, index) => (
                            <QuestionEvaluation
                                key={`${item?.question || 'question'}-${index}`}
                                item={item}
                                index={index}
                            />
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center">
                            <p className="font-semibold">No detailed question feedback available.</p>
                            <p className="mt-1 text-sm text-base-content/55">
                                The interview completed successfully, but the evaluator did not return per-question details.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

function MockInterview() {

    const location = useLocation()
    const navigate = useNavigate()
    const { companyId: routeCompanyId } = useParams()

    const { user } = useAuth()

    /*
     * Company ID comes from the URL.
     * The state fallback is useful if we navigate here programmatically.
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

    /* Prevent React StrictMode from starting the interview more than once. */
    const interviewStarted = useRef(false)

    /*
     * Wait until authentication state and company information are available
     * before starting the interview.
     */
    useEffect(() => {
        if (interviewStarted.current) {
            return
        }

        if (!user?.studentId) {
            return
        }

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
                student_id: studentId,
                round_type: 'TECHNICAL',
                conversation_history: [],
                student_answer: ''
            }

            console.log('Starting mock interview:', payload)

            const result = await takeMockInterviewTurn(payload)

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                    'Failed to start mock interview'
                )
            }

            const data = result.data

            setIsComplete(false)
            setEvaluation(null)
            setQuestion(data?.question || '')
            setQuestionNumber(data?.question_number || 1)
            setConversationHistory(data?.conversation_history || [])

        } catch (err) {
            console.error('Failed to start mock interview:', err)

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
            setError('Company information is missing.')
            return
        }

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
                student_id: user.studentId,
                round_type: 'TECHNICAL',
                conversation_history: conversationHistory,
                student_answer: answer.trim()
            }

            console.log('Submitting mock interview answer:', payload)

            const result = await takeMockInterviewTurn(payload)

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                    'Failed to submit answer'
                )
            }

            const data = result.data

            /* Interview completes after the final question. */
            if (data?.is_complete) {
                setQuestionNumber(data?.question_number || 5)
                setIsComplete(true)
                setConversationHistory(
                    data?.conversation_history ||
                    conversationHistory
                )
                setEvaluation(data?.evaluation || null)
                setQuestion('')
                setAnswer('')
                return
            }

            setQuestion(data?.question || '')
            setQuestionNumber(
                data?.question_number ||
                questionNumber + 1
            )
            setConversationHistory(
                data?.conversation_history || []
            )
            setAnswer('')

        } catch (err) {
            console.error('Failed to submit mock interview answer:', err)

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

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
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

                    <div className="relative overflow-hidden rounded-3xl border border-base-300 bg-gradient-to-br from-primary/20 via-base-100 to-base-100 shadow-sm">
                        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
                        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />

                        <div className="relative p-6 sm:p-8">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <span className="badge badge-primary badge-outline font-semibold">
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
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                    {companyName}
                                </h1>
                                {role && (
                                    <p className="text-base text-base-content/70 sm:text-lg">
                                        {role}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/60">
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-success" />
                                    Company-focused questions
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-info" />
                                    Adaptive interview flow
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                    Detailed evaluation
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-base-300 bg-base-100 py-20 shadow-sm">
                        <span className="loading loading-spinner loading-lg text-primary" />
                        <p className="mt-4 font-semibold">Preparing your interview...</p>
                        <p className="mt-1 text-sm text-base-content/50">
                            Your interviewer is thinking very hard. Allegedly.
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="alert alert-error mb-6 rounded-2xl shadow-sm"
                    >
                        <span>{error}</span>
                    </div>
                )}

                {/* Interview */}
                {!loading && !error && !isComplete && (
                    <div className="rounded-3xl border border-base-300 bg-base-100 shadow-sm">
                        <div className="p-5 sm:p-7">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-base-content/45">
                                        Current question
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-base-content/70">
                                        Question {questionNumber} of 5
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: 5 }, (_, index) => {
                                        const number = index + 1
                                        const complete = number < questionNumber
                                        const current = number === questionNumber

                                        return (
                                            <span
                                                key={number}
                                                className={`h-2.5 w-8 rounded-full transition-colors ${
                                                    complete
                                                        ? 'bg-success'
                                                        : current
                                                            ? 'bg-primary'
                                                            : 'bg-base-300'
                                                }`}
                                                aria-hidden="true"
                                            />
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="my-6 border-t border-base-300" />

                            {question && (
                                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/70">
                                        Interviewer
                                    </p>
                                    <p className="mt-3 text-lg font-medium leading-8 sm:text-xl">
                                        {question}
                                    </p>
                                </div>
                            )}

                            <div className="mt-6">
                                <div className="flex items-center justify-between gap-4">
                                    <label
                                        htmlFor="answer"
                                        className="text-sm font-bold"
                                    >
                                        Your Answer
                                    </label>
                                    <span className="text-xs text-base-content/45">
                                        Be specific and use examples where possible.
                                    </span>
                                </div>

                                <textarea
                                    id="answer"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    disabled={submitting}
                                    className="textarea textarea-bordered mt-2 min-h-52 w-full rounded-2xl bg-base-100 p-4 leading-7"
                                    placeholder="Type your answer here..."
                                />
                            </div>

                            <div className="mt-5 flex justify-end">
                                <button
                                    type="button"
                                    onClick={submitAnswer}
                                    className="btn btn-primary rounded-xl px-6"
                                    disabled={!answer.trim() || submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm" />
                                            Evaluating...
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
                {!loading && !error && isComplete && (
                    <div>
                        <div className="mb-8 text-center sm:text-left">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-success">
                                <span>✓</span>
                                Interview complete
                            </div>
                            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                                Your results are ready
                            </h2>
                            <p className="mt-2 text-sm text-base-content/55 sm:text-base">
                                You completed all 5 questions. Here is the evaluator feedback in a form that does not require squinting at raw JSON.
                            </p>
                        </div>

                        {evaluation ? (
                            <EvaluationView evaluation={evaluation} />
                        ) : (
                            <div className="rounded-3xl border border-base-300 bg-base-100 p-8 text-center shadow-sm">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 text-2xl">
                                    !
                                </div>
                                <h3 className="mt-4 text-xl font-bold">
                                    Evaluation unavailable
                                </h3>
                                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-base-content/55">
                                    The interview completed successfully, but no evaluation payload was returned by the backend.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}

export default MockInterview
