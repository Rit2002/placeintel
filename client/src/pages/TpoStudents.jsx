import { useEffect, useState } from 'react'
import { getAllStudents, deleteStudent } from '../api/tpoApi'

function VerificationBadge({ status }) {
    const value = status || 'PENDING'

    if (value === 'REJECTED') {
        return (
            <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 bg-[#1A1A1A] text-white text-[8px] font-medium whitespace-nowrap">
                <span>✕</span>
                REJECTED
            </span>
        )
    }

    if (value === 'VERIFIED') {
        return (
            <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 bg-[#1A1A1A] text-white text-[8px] font-medium whitespace-nowrap">
                <span>✓</span>
                VERIFIED
            </span>
        )
    }

    return (
        <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 bg-white border border-[#1A1A1A] text-[#1A1A1A] text-[8px] font-medium whitespace-nowrap">
            <span>—</span>
            PENDING
        </span>
    )
}

function ProfileBadge({ completed }) {
    if (completed) {
        return (
            <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 bg-[#1A1A1A] text-white text-[8px] font-medium whitespace-nowrap">
                <span>✓</span>
                COMPLETED
            </span>
        )
    }

    return (
        <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 bg-white border border-[#1A1A1A] text-[#1A1A1A] text-[8px] font-medium whitespace-nowrap">
            <span>—</span>
            INCOMPLETE
        </span>
    )
}

function getDepartmentName(department) {
    if (!department) {
        return '-'
    }

    const value = department.toUpperCase()

    if (
        value.includes('COMPUTER SCIENCE') ||
        value.includes('COMPUTER ENGINEERING')
    ) {
        return 'CSE'
    }

    if (
        value.includes('ELECTRONICS') &&
        value.includes('TELECOMMUNICATION')
    ) {
        return 'ENTC'
    }

    if (value.includes('ELECTRONICS')) {
        return 'ECE'
    }

    if (value.includes('MECHANICAL')) {
        return 'MECH'
    }

    if (value.includes('CIVIL')) {
        return 'CIVIL'
    }

    if (value.includes('INFORMATION TECHNOLOGY')) {
        return 'IT'
    }

    return department
}

export default function TpoStudents() {
    const [students, setStudents] = useState([])

    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const PAGE_SIZE = 20

    const loadStudents = async (page = currentPage) => {
        try {
            setLoading(true)
            setError('')

            const result = await getAllStudents(page, PAGE_SIZE)

            if (!result?.success) {
                throw new Error(
                    result?.message || 'Failed to fetch students'
                )
            }

            const pageData = result.data

            const content = pageData?.content || []

            setStudents(content)
            setTotalPages(pageData?.totalPages || 0)
            setTotalElements(pageData?.totalElements || 0)

            /*
             * If we deleted the last student from the current page,
             * the backend may tell us that this page no longer exists.
             *
             * Move back to the previous page.
             */
            if (
                pageData?.totalPages > 0 &&
                page >= pageData.totalPages
            ) {
                const previousPage = pageData.totalPages - 1

                setCurrentPage(previousPage)

                if (previousPage !== page) {
                    await loadStudents(previousPage)
                }
            }
        } catch (err) {
            console.error('Failed to fetch students:', err)

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to fetch students'
            )

            setStudents([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStudents(currentPage)
    }, [currentPage])

    const handleDeleteClick = (student) => {
        setDeleteTarget(student)
    }

    const handleDeleteCancel = () => {
        if (deleting) {
            return
        }

        setDeleteTarget(null)
    }

    const handleDeleteStudent = async () => {
        if (!deleteTarget?.id) {
            return
        }

        try {
            setDeleting(true)

            const result = await deleteStudent(deleteTarget.id)

            if (!result?.success) {
                throw new Error(
                    result?.message || 'Failed to delete student'
                )
            }

            setDeleteTarget(null)

            /*
             * Reload the current page.
             *
             * If this was the last student on the page,
             * loadStudents() will move to the previous page.
             */
            await loadStudents(currentPage)
        } catch (err) {
            console.error('Failed to delete student:', err)

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to delete student'
            )
        } finally {
            setDeleting(false)
        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage((page) => page - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage((page) => page + 1)
        }
    }

    return (
        <div className="w-full min-w-0">
            {/* Header */}
            <div className="mb-3">
                <h1 className="text-lg font-semibold text-base-content">
                    Students
                </h1>

                <p className="text-[10px] text-base-content/60 mt-0.5">
                    Manage registered student profiles
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-[10px] text-red-700">
                    {error}
                </div>
            )}

            {/* Table Card */}
            <div className="card bg-base-100 shadow-sm overflow-hidden">
                <div className="card-body p-2">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <span className="loading loading-spinner loading-sm"></span>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="py-10 text-center text-xs text-base-content/60">
                            No students found.
                        </div>
                    ) : (
                        <div className="w-full overflow-hidden">
                            <table
                                className="w-full table-fixed text-[9px]"
                                style={{ borderSpacing: 0 }}
                            >
                                <colgroup>
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '15%' }} />
                                    <col style={{ width: '13%' }} />
                                    <col style={{ width: '5%' }} />
                                    <col style={{ width: '6%' }} />
                                    <col style={{ width: '7%' }} />
                                    <col style={{ width: '7%' }} />
                                    <col style={{ width: '7%' }} />
                                    <col style={{ width: '13%' }} />
                                    <col style={{ width: '7%' }} />
                                </colgroup>

                                <thead>
                                    <tr className="border-b border-base-300">
                                        <th className="px-0.5 py-1.5 text-left font-semibold whitespace-nowrap">
                                            Verification
                                        </th>

                                        <th className="px-0.5 py-1.5 text-left font-semibold whitespace-nowrap">
                                            Profile
                                        </th>

                                        <th className="px-0.5 py-1.5 text-left font-semibold whitespace-nowrap">
                                            Name
                                        </th>

                                        <th className="px-0.5 py-1.5 text-left font-semibold whitespace-nowrap">
                                            Enrollment
                                        </th>

                                        <th className="px-0.5 py-1.5 text-left font-semibold whitespace-nowrap">
                                            Dept
                                        </th>

                                        <th className="px-0.5 py-1.5 text-left font-semibold whitespace-nowrap">
                                            CGPA
                                        </th>

                                        <th className="px-0.5 py-1.5 text-left font-semibold whitespace-nowrap">
                                            10th
                                        </th>

                                        <th className="px-0.5 py-1.5 text-left font-semibold whitespace-nowrap">
                                            12th
                                        </th>

                                        <th className="px-0.5 py-1.5 text-left font-semibold whitespace-nowrap">
                                            Backlogs
                                        </th>

                                        <th className="px-0.5 py-1.5 text-left font-semibold whitespace-nowrap">
                                            Links
                                        </th>

                                        <th className="px-0.5 py-1.5 text-left font-semibold whitespace-nowrap">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {students.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="border-b border-base-200"
                                        >
                                            {/* Verification */}
                                            <td className="px-0.5 py-1 align-middle">
                                                <VerificationBadge
                                                    status={
                                                        student.verificationStatus
                                                    }
                                                />
                                            </td>

                                            {/* Profile */}
                                            <td className="px-0.5 py-1 align-middle">
                                                <ProfileBadge
                                                    completed={
                                                        student.profileCompleted
                                                    }
                                                />
                                            </td>

                                            {/* Name */}
                                            <td
                                                className="px-0.5 py-1 align-middle truncate"
                                                title={student.fullName || '-'}
                                            >
                                                {student.fullName || '-'}
                                            </td>

                                            {/* Enrollment */}
                                            <td
                                                className="px-0.5 py-1 align-middle truncate"
                                                title={
                                                    student.enrollmentNo || '-'
                                                }
                                            >
                                                {student.enrollmentNo || '-'}
                                            </td>

                                            {/* Department */}
                                            <td
                                                className="px-0.5 py-1 align-middle truncate"
                                                title={
                                                    student.department || '-'
                                                }
                                            >
                                                {getDepartmentName(
                                                    student.department
                                                )}
                                            </td>

                                            {/* CGPA */}
                                            <td className="px-0.5 py-1 align-middle">
                                                {student.cgpa != null
                                                    ? student.cgpa
                                                    : '-'}
                                            </td>

                                            {/* 10th */}
                                            <td className="px-0.5 py-1 align-middle">
                                                {student.tenthPercentage != null
                                                    ? `${student.tenthPercentage}%`
                                                    : '-'}
                                            </td>

                                            {/* 12th */}
                                            <td className="px-0.5 py-1 align-middle">
                                                {student.twelfthPercentage != null
                                                    ? `${student.twelfthPercentage}%`
                                                    : '-'}
                                            </td>

                                            {/* Backlogs */}
                                            <td className="px-0.5 py-1 align-middle">
                                                {student.activeBacklogs != null
                                                    ? student.activeBacklogs
                                                    : '-'}
                                            </td>

                                            {/* Links */}
                                            <td className="px-0.5 py-1 align-middle">
                                                <div className="flex flex-col gap-0">
                                                    {student.linkedinUrl && (
                                                        <a
                                                            href={
                                                                student.linkedinUrl
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[9px] leading-3.5 hover:underline"
                                                        >
                                                            LinkedIn
                                                        </a>
                                                    )}

                                                    {student.githubUsername && (
                                                        <a
                                                            href={`https://github.com/${student.githubUsername}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[9px] leading-3.5 hover:underline"
                                                        >
                                                            GitHub
                                                        </a>
                                                    )}

                                                    {student.resumeUrl && (
                                                        <a
                                                            href={
                                                                student.resumeUrl
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[9px] leading-3.5 hover:underline"
                                                        >
                                                            Resume
                                                        </a>
                                                    )}

                                                    {!student.linkedinUrl &&
                                                        !student.githubUsername &&
                                                        !student.resumeUrl && (
                                                            <span className="text-[9px]">
                                                                -
                                                            </span>
                                                        )}
                                                </div>
                                            </td>

                                            {/* Action */}
                                            <td className="px-0.5 py-1 align-middle">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(student)}
                                                    className="
                                                        border
                                                        border-transparent
                                                        bg-transparent
                                                        text-red-600
                                                        text-[9px]
                                                        font-medium
                                                        px-1.5
                                                        py-1
                                                        rounded
                                                        cursor-pointer
                                                        hover:border-red-500
                                                        hover:bg-[#F7EFE7]
                                                        transition-colors
                                                    "
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 0 && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-base-200">
                            <span className="text-[9px] text-base-content/60">
                                {totalElements} student
                                {totalElements === 1 ? '' : 's'}
                            </span>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 0}
                                    className="
                                        px-2
                                        py-1
                                        rounded
                                        border
                                        border-base-300
                                        text-[9px]
                                        disabled:opacity-40
                                        disabled:cursor-not-allowed
                                        hover:bg-base-200
                                    "
                                >
                                    Previous
                                </button>

                                <span className="px-2 text-[9px] text-base-content/70">
                                    Page {currentPage + 1} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={handleNextPage}
                                    disabled={
                                        currentPage >= totalPages - 1
                                    }
                                    className="
                                        px-2
                                        py-1
                                        rounded
                                        border
                                        border-base-300
                                        text-[9px]
                                        disabled:opacity-40
                                        disabled:cursor-not-allowed
                                        hover:bg-base-200
                                    "
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="w-[320px] max-w-[90vw] rounded-lg bg-white shadow-xl p-5">
                        <h2 className="text-sm font-semibold text-gray-900">
                            Delete Student
                        </h2>

                        <p className="mt-2 text-xs text-gray-600 leading-5">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-gray-900">
                                {deleteTarget.fullName}
                            </span>
                            ?
                            <br />
                            This will permanently remove the student's
                            profile and account.
                        </p>

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleDeleteCancel}
                                disabled={deleting}
                                className="
                                    px-3
                                    py-1.5
                                    rounded
                                    border
                                    border-gray-300
                                    bg-white
                                    text-gray-700
                                    text-xs
                                    cursor-pointer
                                    hover:bg-gray-100
                                    disabled:opacity-50
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteStudent}
                                disabled={deleting}
                                className="
                                    px-3
                                    py-1.5
                                    rounded
                                    border
                                    border-red-600
                                    bg-red-600
                                    text-white
                                    text-xs
                                    cursor-pointer
                                    hover:bg-red-700
                                    disabled:opacity-50
                                "
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}