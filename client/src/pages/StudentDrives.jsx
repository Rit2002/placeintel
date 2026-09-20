import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import {
  getMyApplications,
  getStudentDrives
} from '../api/studentApi'
import axiosClient from '../api/axiosClient'

function formatEnum(value) {
  if (!value) return '-'

  return String(value)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value) {
  if (!value) return '-'

  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function formatAmount(value) {
  if (value === null || value === undefined) {
    return null
  }

  return `₹${Number(value).toLocaleString('en-IN')}`
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    fallback
  )
}

function isDriveExpired(driveDate) {
  if (!driveDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const driveDateValue = new Date(`${driveDate}T00:00:00`)
  driveDateValue.setHours(0, 0, 0, 0)

  return driveDateValue < today
}

function getDriveDisplayStatus(drive) {
  /*
   * The backend status is authoritative for non-expired drives.
   *
   * The old implementation checked the date first and returned
   * "Upcoming" for every future drive. That meant a backend status
   * of ONGOING was silently replaced by "Upcoming".
   *
   * We still keep the date check first for expired drives because
   * the UI should not present an already-past drive as active.
   */
  if (isDriveExpired(drive.driveDate)) {
    return 'Expired'
  }

  const backendStatus = String(drive.status || '').trim().toUpperCase()

  if (backendStatus === 'ONGOING') {
    return 'Ongoing'
  }

  if (backendStatus === 'UPCOMING') {
    return 'Upcoming'
  }

  if (backendStatus === 'CLOSED') {
    return 'Closed'
  }

  // Fallback only when the backend did not provide a usable status.
  if (drive.driveDate) {
    return 'Upcoming'
  }

  return formatEnum(drive.status)
}

function StudentDrives() {
  const [drives, setDrives] = useState([])
  const [appliedDriveIds, setAppliedDriveIds] = useState(new Set())

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [expandedDriveId, setExpandedDriveId] = useState(null)

  const [selectedDrive, setSelectedDrive] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)

  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadDrives()
  }, [])

  async function loadDrives() {
    setLoading(true)
    setError('')

    try {
      const [driveResult, applicationResult] = await Promise.all([
        getStudentDrives(0, 20),
        getMyApplications(0, 50)
      ])

      const drivePage = driveResult?.data
      const applicationPage = applicationResult?.data

      const driveContent = drivePage?.content || []
      const applicationContent = applicationPage?.content || []

      // Latest drive first
      const sortedDrives = [...driveContent].sort(
        (a, b) =>
          new Date(b.driveDate || 0) -
          new Date(a.driveDate || 0)
      )

      setDrives(sortedDrives)

      setAppliedDriveIds(
        new Set(
          applicationContent
            .map((application) => application.driveId)
            .filter(Boolean)
        )
      )
    } catch (requestError) {
      console.error('Failed to load student drives:', requestError)

      setError(
        getErrorMessage(
          requestError,
          'Could not load placement drives.'
        )
      )
    } finally {
      setLoading(false)
    }
  }

  function toggleDrive(driveId) {
    setExpandedDriveId((previousId) =>
      previousId === driveId ? null : driveId
    )
  }

  function openApplyModal(drive) {
    setSelectedDrive(drive)
    setResumeFile(null)
    setApplyError('')
    setSuccessMessage('')
  }

  function closeApplyModal() {
    if (applying) return

    setSelectedDrive(null)
    setResumeFile(null)
    setApplyError('')
  }

  function handleResumeChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      setResumeFile(null)
      return
    }

    if (file.type !== 'application/pdf') {
      setResumeFile(null)
      setApplyError('Only PDF resumes are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeFile(null)
      setApplyError('Resume size must not exceed 5 MB.')
      return
    }

    setApplyError('')
    setResumeFile(file)
  }

  async function handleApply() {
    if (!selectedDrive) return

    if (!resumeFile) {
      setApplyError('Please select your resume.')
      return
    }

    setApplying(true)
    setApplyError('')

    try {
      const formData = new FormData()

      formData.append(
        'resume',
        resumeFile,
        resumeFile.name
      )

      await axiosClient.post(
        `/students/me/applications/${selectedDrive.id}`,
        formData
      )

      setAppliedDriveIds((previous) => {
        const updated = new Set(previous)
        updated.add(selectedDrive.id)
        return updated
      })

      setSuccessMessage(
        `Application submitted successfully for ${selectedDrive.roleOffered}.`
      )

      setSelectedDrive(null)
      setResumeFile(null)
    } catch (requestError) {
      console.error('Failed to apply:', requestError)

      setApplyError(
        getErrorMessage(
          requestError,
          'Could not submit your application.'
        )
      )
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-200">

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Placement Drives
          </h1>

          <p className="text-base-content/60 mt-1">
            Explore the latest placement opportunities and apply with your resume.
          </p>

        </div>

        {/* Success message */}
        {successMessage && (
          <div className="alert alert-success mb-6">
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : drives.length === 0 ? (

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body items-center text-center py-16">

              <h2 className="text-xl font-semibold">
                No placement drives
              </h2>

              <p className="text-base-content/60">
                There are no placement drives available right now.
              </p>

            </div>
          </div>

        ) : (

          <div className="flex flex-col gap-4">

            {drives.map((drive) => {

              const hasApplied =
                appliedDriveIds.has(drive.id)

              const expired =
                isDriveExpired(drive.driveDate)

              const displayStatus =
                getDriveDisplayStatus(drive)

              const isExpanded =
                expandedDriveId === drive.id

              const canApply =
                !hasApplied && !expired

              const ctc =
                formatAmount(drive.ctcOffered)

              const stipend =
                formatAmount(drive.stipend)

              return (
                <div
                  key={drive.id}
                  className="card bg-base-100 shadow-sm border border-base-300"
                >

                  {/* =====================================================
                      COLLAPSED HEADER
                  ===================================================== */}

                  <div className="px-5 py-5">

                    <div className="flex items-center gap-4">

                      {/* Expand / Collapse button */}
                      <button
                        type="button"
                        onClick={() => toggleDrive(drive.id)}
                        className="btn btn-ghost btn-circle shrink-0 cursor-pointer"
                        aria-label={
                          isExpanded
                            ? 'Collapse drive'
                            : 'Expand drive'
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className={`w-5 h-5 transition-transform duration-200 ${
                            isExpanded
                              ? 'rotate-90'
                              : ''
                          }`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </button>

                      {/* Main drive information */}
                      <div className="flex-1 min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="text-xl font-bold">
                            {drive.roleOffered}
                          </h2>

                          <span
                            className={`badge badge-lg min-w-24 justify-center px-3 py-2 text-xs font-medium ${
                              displayStatus === 'Expired'
                                ? 'badge-error'
                                : displayStatus === 'Upcoming'
                                  ? 'badge-info'
                                  : displayStatus === 'Ongoing'
                                    ? 'badge-success'
                                    : 'badge-neutral'
                            }`}
                          >
                            {displayStatus}
                          </span>

                        </div>

                        <p className="text-lg font-medium mt-1">
                          {drive.companyName}
                        </p>

                        <p className="text-sm text-base-content/60 mt-1">
                          Drive date: {formatDate(drive.driveDate)}
                        </p>

                      </div>

                      {/* Apply button */}
                      <div className="shrink-0">

                        {hasApplied ? (

                          <span
                            className="
                              inline-flex
                              items-center
                              justify-center
                              min-w-[120px]
                              h-11
                              px-5
                              rounded-lg
                              bg-success
                              text-success-content
                              text-base
                              font-semibold
                              leading-none
                              shadow-sm
                            "
                          >
                            Applied
                          </span>

                        ) : (

                          <button
                            type="button"
                            className={`btn btn-primary ${
                              canApply
                                ? 'cursor-pointer'
                                : 'cursor-not-allowed'
                            }`}
                            disabled={!canApply}
                            onClick={() =>
                              openApplyModal(drive)
                            }
                          >
                            {expired
                              ? 'Expired'
                              : 'Apply Now'}
                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                  {/* =====================================================
                      EXPANDED CONTENT
                  ===================================================== */}

                  {isExpanded && (
                    <div className="px-5 pb-6">

                      <div className="divider my-1" />

                      {/* Drive metadata */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">

                        <div>
                          <p className="text-xs uppercase tracking-wide text-base-content/50">
                            Employment
                          </p>

                          <p className="font-medium mt-1">
                            {formatEnum(drive.employmentType)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-base-content/50">
                            Work Mode
                          </p>

                          <p className="font-medium mt-1">
                            {formatEnum(drive.workMode)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-base-content/50">
                            CTC
                          </p>

                          <p className="font-medium mt-1">
                            {ctc || '-'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-base-content/50">
                            Stipend
                          </p>

                          <p className="font-medium mt-1">
                            {stipend || '-'}
                          </p>
                        </div>

                      </div>

                      {/* Description */}
                      {drive.jobDescription && (
                        <div className="mt-6">

                          <h3 className="font-semibold mb-2">
                            Job Description
                          </h3>

                          <p className="text-sm text-base-content/70 whitespace-pre-line">
                            {drive.jobDescription}
                          </p>

                        </div>
                      )}

                      {/* Skills */}
                      {drive.requiredSkills?.length > 0 && (
                        <div className="mt-6">

                          <h3 className="font-semibold mb-2">
                            Required Skills
                          </h3>

                          <div className="flex flex-wrap gap-2">

                            {drive.requiredSkills.map(
                              (skill) => (
                                <span
                                  key={skill}
                                  className="badge badge-outline"
                                >
                                  {skill}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                      {/* Eligibility */}
                      <div className="mt-6">

                        <h3 className="font-semibold mb-2">
                          Eligibility
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">

                          <div>
                            <span className="text-base-content/50">
                              CGPA
                            </span>

                            <p className="font-medium">
                              {drive.cutOffCgpa ?? '-'}
                            </p>
                          </div>

                          <div>
                            <span className="text-base-content/50">
                              10th
                            </span>

                            <p className="font-medium">
                              {drive.cutOffTenthPercentage != null
                                ? `${drive.cutOffTenthPercentage}%`
                                : '-'}
                            </p>
                          </div>

                          <div>
                            <span className="text-base-content/50">
                              12th
                            </span>

                            <p className="font-medium">
                              {drive.cutOffTwelfthPercentage != null
                                ? `${drive.cutOffTwelfthPercentage}%`
                                : '-'}
                            </p>
                          </div>

                          <div>
                            <span className="text-base-content/50">
                              Max Backlogs
                            </span>

                            <p className="font-medium">
                              {drive.maxAllowedBacklogs ?? '-'}
                            </p>
                          </div>

                        </div>

                      </div>

                      {/* Departments */}
                      {drive.eligibleDepartments?.length > 0 && (
                        <div className="mt-6">

                          <h3 className="font-semibold mb-2">
                            Eligible Departments
                          </h3>

                          <div className="flex flex-wrap gap-2">

                            {drive.eligibleDepartments.map(
                              (department) => (
                                <span
                                  key={department}
                                  className="badge badge-ghost"
                                >
                                  {department}
                                </span>
                              )
                            )}

                          </div>

                        </div>
                      )}

                      {/* Rounds */}
                      {drive.rounds?.length > 0 && (
                        <div className="mt-6">

                          <h3 className="font-semibold mb-2">
                            Selection Process
                          </h3>

                          <div className="flex flex-wrap gap-2">

                            {drive.rounds
                              .slice()
                              .sort(
                                (a, b) =>
                                  a.sequenceNumber -
                                  b.sequenceNumber
                              )
                              .map((round) => (
                                <div
                                  key={
                                    round.id ||
                                    round.sequenceNumber
                                  }
                                  className="badge badge-outline"
                                >
                                  {round.sequenceNumber}.{' '}
                                  {round.roundName}
                                </div>
                              ))}

                          </div>

                        </div>
                      )}

                    </div>
                  )}

                </div>
              )
            })}

          </div>

        )}

      </main>

      {/* =========================================================
          Apply Modal
      ========================================================= */}

      {selectedDrive && (
        <dialog
          open
          className="modal modal-open"
        >

          <div className="modal-box">

            <h3 className="font-bold text-xl">
              Apply for {selectedDrive.roleOffered}
            </h3>

            <p className="text-sm text-base-content/60 mt-1">
              {selectedDrive.companyName}
            </p>

            <div className="divider" />

            <div className="form-control">

              <label className="label">

                <span className="label-text font-medium">
                  Upload Resume
                </span>

              </label>

              <input
                type="file"
                accept="application/pdf,.pdf"
                className="file-input file-input-bordered w-full"
                onChange={handleResumeChange}
                disabled={applying}
              />

              <label className="label">

                <span className="label-text-alt text-base-content/50">
                  PDF only, maximum 5 MB
                </span>

              </label>

            </div>

            {resumeFile && (
              <div className="alert mt-3">

                <span className="text-sm">
                  Selected: {resumeFile.name}
                </span>

              </div>
            )}

            {applyError && (
              <div className="alert alert-error mt-4">

                <span>
                  {applyError}
                </span>

              </div>
            )}

            <div className="modal-action">

              <button
                type="button"
                className="btn btn-ghost cursor-pointer"
                onClick={closeApplyModal}
                disabled={applying}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApply}
                disabled={!resumeFile || applying}
              >
                {applying ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Applying...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>

            </div>

          </div>

          <form
            method="dialog"
            className="modal-backdrop"
            onClick={closeApplyModal}
          >
            <button>close</button>
          </form>

        </dialog>
      )}

    </div>
  )
}

export default StudentDrives