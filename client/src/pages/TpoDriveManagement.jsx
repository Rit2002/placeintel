import { useEffect, useMemo, useState } from 'react'
import {
  createDrive,
  deleteDrive,
  getAllCompaniesForTpo,
  getAllDrives,
  getDriveApplicants,
  updateDrive
} from '../api/tpoApi'

const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'INTERNSHIP',
]

const WORK_MODES = [
  'ON_SITE',
  'REMOTE',
  'HYBRID'
]

const DRIVE_STATUSES = [
  'UPCOMING',
  'ONGOING',
  'CLOSED'
]

const ROUND_DIFFICULTIES = [
  'EASY',
  'MEDIUM',
  'HARD'
]

const EMPTY_ROUND = {
  roundName: '',
  sequenceNumber: 1,
  description: '',
  durationMinutes: '',
  difficulty: 'MEDIUM'
}

const EMPTY_FORM = {
  companyId: '',
  roleOffered: '',
  employmentType: 'FULL_TIME',
  workMode: 'ON_SITE',
  ctcOffered: '',
  stipend: '',
  jobDescription: '',
  requiredSkills: '',
  eligibleDepartments: '',
  cutOffCgpa: '',
  cutOffTenthPercentage: '',
  cutOffTwelfthPercentage: '',
  maxAllowedBacklogs: '',
  driveDate: '',
  status: 'UPCOMING',
  rounds: [{ ...EMPTY_ROUND }]
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  )
}

function formatEnum(value) {
  if (!value) return '-'
  return String(value).replaceAll('_', ' ')
}

function normalizeWorkMode(value) {
  if (!value) return 'ON_SITE'

  const normalized = String(value).trim().toUpperCase()

  if (normalized === 'ONSITE' || normalized === 'ON_SITE') {
    return 'ON_SITE'
  }

  if (normalized === 'REMOTE') {
    return 'REMOTE'
  }

  if (normalized === 'HYBRID') {
    return 'HYBRID'
  }

  return 'ON_SITE'
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString()
}

function splitCommaSeparated(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function toPayload(form) {
  return {
    roleOffered: form.roleOffered.trim(),
    employmentType: form.employmentType,
    workMode: normalizeWorkMode(form.workMode),
    ctcOffered: toNumberOrNull(form.ctcOffered),
    stipend: toNumberOrNull(form.stipend),
    jobDescription: form.jobDescription.trim(),
    requiredSkills: splitCommaSeparated(form.requiredSkills),
    eligibleDepartments: splitCommaSeparated(form.eligibleDepartments),
    cutOffCgpa: toNumberOrNull(form.cutOffCgpa),
    cutOffTenthPercentage: toNumberOrNull(form.cutOffTenthPercentage),
    cutOffTwelfthPercentage: toNumberOrNull(form.cutOffTwelfthPercentage),
    maxAllowedBacklogs: toNumberOrNull(form.maxAllowedBacklogs),
    driveDate: form.driveDate,
    status: form.status,
    rounds: form.rounds.map((round, index) => ({
      roundName: round.roundName.trim(),
      sequenceNumber: Number(round.sequenceNumber) || index + 1,
      description: round.description.trim(),
      durationMinutes: toNumberOrNull(round.durationMinutes),
      difficulty: round.difficulty || null
    }))
  }
}

function formFromDrive(drive) {
  return {
    companyId: drive.companyId || '',
    roleOffered: drive.roleOffered || '',
    employmentType: drive.employmentType || 'FULL_TIME',
    workMode: normalizeWorkMode(drive.workMode),
    ctcOffered: drive.ctcOffered ?? '',
    stipend: drive.stipend ?? '',
    jobDescription: drive.jobDescription || '',
    requiredSkills: (drive.requiredSkills || []).join(', '),
    eligibleDepartments: (drive.eligibleDepartments || []).join(', '),
    cutOffCgpa: drive.cutOffCgpa ?? '',
    cutOffTenthPercentage: drive.cutOffTenthPercentage ?? '',
    cutOffTwelfthPercentage: drive.cutOffTwelfthPercentage ?? '',
    maxAllowedBacklogs: drive.maxAllowedBacklogs ?? '',
    driveDate: drive.driveDate || '',
    status: drive.status || 'UPCOMING',
    rounds: (drive.rounds || []).length
      ? drive.rounds
          .slice()
          .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
          .map((round) => ({
            roundName: round.roundName || '',
            sequenceNumber: round.sequenceNumber || 1,
            description: round.description || '',
            durationMinutes: round.durationMinutes ?? '',
            difficulty: round.difficulty || 'MEDIUM'
          }))
      : [{ ...EMPTY_ROUND }]
  }
}

const FIELD_CLASS =
  'w-full rounded-lg border-2 border-base-content/20 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none transition-colors placeholder:text-base-content/40 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-base-200 disabled:cursor-not-allowed'

const TEXTAREA_CLASS =
  `${FIELD_CLASS} min-h-28 resize-y leading-6`

function Field({ label, hint, children, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label className="block text-sm font-semibold text-base-content mb-2">
        {label}
      </label>

      {children}

      {hint && (
        <p className="mt-1.5 text-xs text-base-content/50">
          {hint}
        </p>
      )}
    </div>
  )
}

function DriveFormModal({
  open,
  editingDrive,
  companies,
  onClose,
  onSaved
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return

    setForm(
      editingDrive
        ? formFromDrive(editingDrive)
        : {
            ...EMPTY_FORM,
            rounds: [{ ...EMPTY_ROUND }]
          }
    )

    setError('')
  }, [open, editingDrive])

  function changeField(field) {
    return (event) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value
      }))

      setError('')
    }
  }

  function changeRound(index, field) {
    return (event) => {
      setForm((previous) => ({
        ...previous,
        rounds: previous.rounds.map((round, roundIndex) =>
          roundIndex === index
            ? { ...round, [field]: event.target.value }
            : round
        )
      }))

      setError('')
    }
  }

  function addRound() {
    setForm((previous) => ({
      ...previous,
      rounds: [
        ...previous.rounds,
        {
          ...EMPTY_ROUND,
          sequenceNumber: previous.rounds.length + 1
        }
      ]
    }))
  }

  function removeRound(index) {
    setForm((previous) => {
      const nextRounds = previous.rounds
        .filter((_, roundIndex) => roundIndex !== index)
        .map((round, roundIndex) => ({
          ...round,
          sequenceNumber: roundIndex + 1
        }))

      return {
        ...previous,
        rounds: nextRounds.length
          ? nextRounds
          : [{ ...EMPTY_ROUND }]
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!editingDrive && !form.companyId) {
      setError('Select a company.')
      return
    }

    if (!form.roleOffered.trim()) {
      setError('Role is required.')
      return
    }

    if (!form.driveDate) {
      setError('Drive date is required.')
      return
    }

    if (
      !form.rounds.length ||
      form.rounds.some(
        (round) => !round.roundName.trim()
      )
    ) {
      setError(
        'Every drive must contain at least one named round.'
      )
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload = toPayload(form)

      if (editingDrive?.id) {
        await updateDrive(editingDrive.id, payload)
      } else {
        await createDrive(form.companyId, payload)
      }

      await onSaved()
      onClose()
    } catch (requestError) {
      console.error(
        'Failed to save drive:',
        requestError
      )

      setError(
        getErrorMessage(
          requestError,
          'Could not save the drive.'
        )
      )
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal modal-open">
      <div
        className="modal-box w-11/12 max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl border-2 border-base-content/10 bg-base-100 p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h3 className="font-bold text-xl sm:text-2xl">
              {editingDrive
                ? 'Edit Drive'
                : 'Create Drive'}
            </h3>

            <p className="text-sm text-base-content/60 mt-1.5">
              Configure the hiring drive and its interview rounds.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost shrink-0"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border-2 border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* =========================
              BASIC DRIVE INFORMATION
          ========================== */}
          <section className="rounded-xl border-2 border-base-content/10 bg-base-200/20 p-4 sm:p-5">
            <div className="mb-5">
              <h4 className="font-semibold text-base">
                Drive Information
              </h4>
              <p className="text-xs text-base-content/50 mt-1">
                Configure the company, role, employment details and compensation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <Field
                label="Company"
                hint={
                  editingDrive
                    ? 'Company cannot be changed by the current update endpoint.'
                    : null
                }
              >
                <select
                  className={`${FIELD_CLASS} cursor-pointer`}
                  value={form.companyId}
                  onChange={changeField('companyId')}
                  disabled={Boolean(editingDrive)}
                  required={!editingDrive}
                >
                  <option value="">
                    Select company
                  </option>

                  {companies.map((company) => (
                    <option
                      key={company.id}
                      value={company.id}
                    >
                      {company.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Role">
                <input
                  className={FIELD_CLASS}
                  value={form.roleOffered}
                  onChange={changeField('roleOffered')}
                  placeholder="Software Engineer"
                />
              </Field>

              <Field label="Employment Type">
                <select
                  className={`${FIELD_CLASS} cursor-pointer`}
                  value={form.employmentType}
                  onChange={changeField('employmentType')}
                >
                  {EMPLOYMENT_TYPES.map((value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {formatEnum(value)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Work Mode">
                <select
                  className={`${FIELD_CLASS} cursor-pointer`}
                  value={form.workMode}
                  onChange={changeField('workMode')}
                >
                  {WORK_MODES.map((value) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {formatEnum(value)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Drive Date">
                <input
                  type="date"
                  className={FIELD_CLASS}
                  value={form.driveDate}
                  onChange={changeField('driveDate')}
                />
              </Field>

              {editingDrive && (
                <Field
                  label="Drive Status"
                  hint="Change the current status of this placement drive."
                >
                  <select
                    className={`${FIELD_CLASS} cursor-pointer`}
                    value={form.status}
                    onChange={changeField('status')}
                  >
                    {DRIVE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatEnum(status)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="CTC Offered">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={FIELD_CLASS}
                  value={form.ctcOffered}
                  onChange={changeField('ctcOffered')}
                  placeholder="800000"
                />
              </Field>

              <Field label="Stipend">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={FIELD_CLASS}
                  value={form.stipend}
                  onChange={changeField('stipend')}
                  placeholder="25000"
                />
              </Field>

              <Field label="Maximum Backlogs">
                <input
                  type="number"
                  min="0"
                  className={FIELD_CLASS}
                  value={form.maxAllowedBacklogs}
                  onChange={changeField(
                    'maxAllowedBacklogs'
                  )}
                  placeholder="0"
                />
              </Field>

            </div>
          </section>

          {/* =========================
              ACADEMIC ELIGIBILITY
          ========================== */}
          <section className="rounded-xl border-2 border-base-content/10 bg-base-200/20 p-4 sm:p-5">
            <div className="mb-5">
              <h4 className="font-semibold text-base">
                Academic Eligibility
              </h4>
              <p className="text-xs text-base-content/50 mt-1">
                Define the minimum academic requirements for applicants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="CGPA Cutoff">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  className={FIELD_CLASS}
                  value={form.cutOffCgpa}
                  onChange={changeField('cutOffCgpa')}
                  placeholder="7.0"
                />
              </Field>

              <Field label="10th % Cutoff">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className={FIELD_CLASS}
                  value={form.cutOffTenthPercentage}
                  onChange={changeField(
                    'cutOffTenthPercentage'
                  )}
                  placeholder="60"
                />
              </Field>

              <Field label="12th % Cutoff">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className={FIELD_CLASS}
                  value={form.cutOffTwelfthPercentage}
                  onChange={changeField(
                    'cutOffTwelfthPercentage'
                  )}
                  placeholder="60"
                />
              </Field>
            </div>
          </section>

          {/* =========================
              SKILLS / DEPARTMENTS
          ========================== */}
          <section className="rounded-xl border-2 border-base-content/10 bg-base-200/20 p-4 sm:p-5">
            <div className="mb-5">
              <h4 className="font-semibold text-base">
                Eligibility & Requirements
              </h4>
              <p className="text-xs text-base-content/50 mt-1">
                Enter comma-separated skills and eligible departments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field
                label="Required Skills"
                hint="Comma separated."
              >
                <textarea
                  className={TEXTAREA_CLASS}
                  value={form.requiredSkills}
                  onChange={changeField(
                    'requiredSkills'
                  )}
                  placeholder="Java, Spring Boot, SQL"
                />
              </Field>

              <Field
                label="Eligible Departments"
                hint="Comma separated."
              >
                <textarea
                  className={TEXTAREA_CLASS}
                  value={form.eligibleDepartments}
                  onChange={changeField(
                    'eligibleDepartments'
                  )}
                  placeholder="CSE, IT, ECE"
                />
              </Field>
            </div>
          </section>

          {/* =========================
              JOB DESCRIPTION
          ========================== */}
          <section className="rounded-xl border-2 border-base-content/10 bg-base-200/20 p-4 sm:p-5">
            <Field label="Job Description">
              <textarea
                className={`${TEXTAREA_CLASS} min-h-36`}
                value={form.jobDescription}
                onChange={changeField(
                  'jobDescription'
                )}
                placeholder="Responsibilities, expectations, technologies..."
              />
            </Field>
          </section>

          {/* =========================
              INTERVIEW ROUNDS
          ========================== */}
          <section className="rounded-xl border-2 border-base-content/10 bg-base-200/20 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div>
                <h4 className="font-semibold text-base">
                  Interview Rounds
                </h4>

                <p className="text-xs text-base-content/50 mt-1">
                  At least one round is required by the backend.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline border-2"
                onClick={addRound}
              >
                + Add Round
              </button>
            </div>

            <div className="space-y-4">
              {form.rounds.map((round, index) => (
                <div
                  key={`${index}-${round.sequenceNumber}`}
                  className="rounded-xl border-2 border-base-content/15 bg-base-100 p-4 sm:p-5"
                >
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div>
                      <p className="font-semibold text-sm">
                        Round {index + 1}
                      </p>
                      <p className="text-xs text-base-content/50 mt-0.5">
                        Configure the round details.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => removeRound(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <Field
                      label="Round Name"
                      className="lg:col-span-2"
                    >
                      <input
                        className={FIELD_CLASS}
                        value={round.roundName}
                        onChange={changeRound(
                          index,
                          'roundName'
                        )}
                        placeholder="Technical Interview"
                      />
                    </Field>

                    <Field label="Sequence">
                      <input
                        type="number"
                        min="1"
                        className={FIELD_CLASS}
                        value={round.sequenceNumber}
                        onChange={changeRound(
                          index,
                          'sequenceNumber'
                        )}
                      />
                    </Field>

                    <Field label="Difficulty">
                      <select
                        className={`${FIELD_CLASS} cursor-pointer`}
                        value={round.difficulty}
                        onChange={changeRound(
                          index,
                          'difficulty'
                        )}
                      >
                        {ROUND_DIFFICULTIES.map(
                          (value) => (
                            <option
                              key={value}
                              value={value}
                            >
                              {formatEnum(value)}
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    <Field
                      label="Duration (minutes)"
                      className="lg:col-span-2"
                    >
                      <input
                        type="number"
                        min="1"
                        className={FIELD_CLASS}
                        value={
                          round.durationMinutes
                        }
                        onChange={changeRound(
                          index,
                          'durationMinutes'
                        )}
                        placeholder="60"
                      />
                    </Field>

                    <Field
                      label="Description"
                      className="lg:col-span-2"
                    >
                      <input
                        className={FIELD_CLASS}
                        value={round.description}
                        onChange={changeRound(
                          index,
                          'description'
                        )}
                        placeholder="Problem solving and core CS questions"
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button
              type="button"
              className="btn btn-outline border-2"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : editingDrive
                  ? 'Update Drive'
                  : 'Create Drive'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

function ConfirmDeleteDriveModal({ drive, deleting, onCancel, onConfirm }) {
  useEffect(() => {
    if (!drive) return

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !deleting) onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [drive, deleting, onCancel])

  if (!drive) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => {
        if (!deleting) onCancel()
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-drive-title"
        className="w-full max-w-md rounded-2xl border-2 border-base-content/10 bg-base-100 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="delete-drive-title" className="font-bold text-lg">
          Delete this drive?
        </h3>

        <p className="mt-3 text-sm text-base-content/80">
          <span className="font-semibold">
            {drive.companyName || 'This company'}
            {drive.roleOffered ? ` — ${drive.roleOffered}` : ''}
          </span>{' '}
          will be deleted permanently, along with every student application
          and uploaded resume for it. This can't be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            className="btn btn-outline border-2"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-error"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete drive'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ResumePreviewModal({ resume, onClose }) {
  useEffect(() => {
    if (!resume) return

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resume, onClose])

  if (!resume) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Resume preview"
        className="flex flex-col w-full max-w-4xl h-[85vh] rounded-2xl border-2 border-base-content/10 bg-base-100 shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-base-300">
          <div className="min-w-0">
            <h3 className="font-bold text-lg truncate">
              {resume.studentName || 'Resume'}
            </h3>
            <p className="text-xs text-base-content/60">Resume preview</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={resume.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-xs btn-outline"
            >
              Open in new tab
            </a>
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <iframe
          src={resume.url}
          title={`${resume.studentName || 'Student'} resume`}
          className="flex-1 w-full bg-base-200"
        />
      </div>
    </div>
  )
}

function ApplicantsTable({ applicants, loading, onViewResume }) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  if (!applicants.length) {
    return (
      <div className="text-center py-10 text-base-content/60">
        No students have applied to this drive yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student</th>
            <th>Enrollment No.</th>
            <th>Score</th>
            <th>Status</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant, index) => (
            <tr key={applicant.applicationId}>
              <td className="font-semibold">{index + 1}</td>
              <td>{applicant.studentName || '-'}</td>
              <td>{applicant.enrollmentNo || '-'}</td>
              <td>
                {typeof applicant.ruleBasedScore === 'number'
                  ? applicant.ruleBasedScore.toFixed(2)
                  : '-'}
              </td>
              <td>
                <span className="badge badge-outline badge-sm">
                  {formatEnum(applicant.status)}
                </span>
              </td>
              <td>
                {applicant.resumeUrl ? (
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    onClick={() =>
                      onViewResume({
                        url: applicant.resumeUrl,
                        studentName: applicant.studentName
                      })
                    }
                  >
                    View Resume
                  </button>
                ) : (
                  <span className="text-xs text-base-content/40">Not uploaded</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TpoDriveManagement() {
  const [drives, setDrives] = useState([])
  const [companies, setCompanies] = useState([])
  const [selectedDriveId, setSelectedDriveId] = useState(null)
  const [applicants, setApplicants] = useState([])

  const [drivePage, setDrivePage] = useState(0)
  const [driveTotalPages, setDriveTotalPages] = useState(0)
  const [applicantPage, setApplicantPage] = useState(0)
  const [applicantTotalPages, setApplicantTotalPages] = useState(0)

  const [loadingDrives, setLoadingDrives] = useState(true)
  const [loadingApplicants, setLoadingApplicants] = useState(false)
  const [error, setError] = useState('')

  const [formOpen, setFormOpen] = useState(false)
  const [editingDrive, setEditingDrive] = useState(null)
  const [deletingDriveId, setDeletingDriveId] = useState(null)
  const [resumePreview, setResumePreview] = useState(null)
  const [driveToDelete, setDriveToDelete] = useState(null)

  const selectedDrive = useMemo(
    () => drives.find((drive) => drive.id === selectedDriveId) || null,
    [drives, selectedDriveId]
  )

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    loadDrives()
  }, [drivePage])

  useEffect(() => {
    if (!selectedDriveId) {
      setApplicants([])
      return
    }

    loadApplicants()
  }, [selectedDriveId, applicantPage])

  async function loadCompanies() {
    try {
      const result = await getAllCompaniesForTpo(0)
      const pageData = result?.data
      setCompanies(pageData?.content || pageData || [])
    } catch (requestError) {
      console.error('Failed to load companies:', requestError)
      setError(getErrorMessage(requestError, 'Could not load companies.'))
    }
  }

  async function loadDrives() {
    setLoadingDrives(true)
    setError('')

    try {
      // TPO page uses the TPO drive endpoint only.
      const result = await getAllDrives(drivePage, 20)

      const pageData = result?.data
      const content = pageData?.content || []

      setDrives(content)
      setDriveTotalPages(pageData?.totalPages || 0)

      if (
        selectedDriveId &&
        content.some((drive) => drive.id === selectedDriveId)
      ) {
        return
      }

      if (content.length) {
        setSelectedDriveId(content[0].id)
        setApplicantPage(0)
      } else {
        setSelectedDriveId(null)
        setApplicants([])
      }
    } catch (requestError) {
      console.error('Failed to load TPO drives:', requestError)

      setError(
        getErrorMessage(
          requestError,
          'Could not load drives.'
        )
      )

      setDrives([])
      setSelectedDriveId(null)
      setApplicants([])
      setDriveTotalPages(0)
    } finally {
      setLoadingDrives(false)
    }
  }

  async function loadApplicants() {
    setLoadingApplicants(true)

    try {
      const result = await getDriveApplicants(
        selectedDriveId,
        applicantPage,
        20
      )

      const pageData = result?.data
      setApplicants(pageData?.content || [])
      setApplicantTotalPages(pageData?.totalPages || 0)
    } catch (requestError) {
      console.error('Failed to load applicants:', requestError)
      setError(getErrorMessage(requestError, 'Could not load applicants.'))
      setApplicants([])
      setApplicantTotalPages(0)
    } finally {
      setLoadingApplicants(false)
    }
  }

  function selectDrive(driveId) {
    setSelectedDriveId(driveId)
    setApplicantPage(0)
    setError('')
  }

  function openCreate() {
    setEditingDrive(null)
    setFormOpen(true)
    setError('')
  }

  function openEdit(drive) {
    setEditingDrive(drive)
    setFormOpen(true)
    setError('')
  }

  async function handleDelete(drive) {
    setDeletingDriveId(drive.id)
    setError('')

    try {
      await deleteDrive(drive.id)
      await loadDrives()
    } catch (requestError) {
      console.error('Failed to delete drive:', requestError)
      setError(getErrorMessage(requestError, 'Could not delete the drive.'))
    } finally {
      setDeletingDriveId(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Drive Management</h1>
          <p className="text-sm text-base-content/60 mt-1">
            Create, view, edit and delete placement drives, then review their applicants from the same page.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + New Drive
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.4fr)] gap-5">
        <section className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="card-title text-lg">All Drives</h2>
                <p className="text-xs text-base-content/60">
                  Select a drive to inspect its applicants.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={loadDrives}
                disabled={loadingDrives}
              >
                Refresh
              </button>
            </div>

            {loadingDrives ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : drives.length === 0 ? (
              <div className="text-center py-12 text-base-content/60">
                No drives found.
              </div>
            ) : (
              <div className="space-y-2">
                {drives.map((drive) => (
                  <div
                    key={drive.id}
                    onClick={() => selectDrive(drive.id)}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' ||
                        event.key === ' '
                      ) {
                        event.preventDefault()
                        selectDrive(drive.id)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                      selectedDriveId === drive.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-base-content/15 bg-base-100 hover:border-base-content/35 hover:bg-base-200/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {drive.companyName || 'Unknown Company'}
                        </p>

                        <p className="text-sm text-base-content/70 truncate mt-0.5">
                          {drive.roleOffered || '-'}
                        </p>
                      </div>

                      <span className="badge badge-outline badge-sm shrink-0">
                        {formatEnum(drive.status)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
                      <span>{formatDate(drive.driveDate)}</span>
                      <span>{formatEnum(drive.workMode)}</span>

                      {drive.ctcOffered && (
                        <span>
                          ₹
                          {Number(
                            drive.ctcOffered
                          ).toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t-2 border-base-content/10">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline border-2 flex-1"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEdit(drive)
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline btn-error border-2 flex-1"
                        onClick={(event) => {
                          event.stopPropagation()
                          setDriveToDelete(drive)
                        }}
                        disabled={
                          deletingDriveId === drive.id
                        }
                      >
                        {deletingDriveId === drive.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingDrives && driveTotalPages > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-base-300">
                <span className="text-xs text-base-content/60">
                  Page {drivePage + 1} of {driveTotalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    disabled={drivePage === 0}
                    onClick={() => setDrivePage((page) => page - 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline"
                    disabled={drivePage + 1 >= driveTotalPages}
                    onClick={() => setDrivePage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="card bg-base-100 shadow-sm">
          <div className="card-body p-5">
            {!selectedDrive ? (
              <div className="flex items-center justify-center min-h-72 text-base-content/50">
                Select a drive to view its details.
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedDrive.companyName}
                    </h2>
                    <p className="text-base-content/70">
                      {selectedDrive.roleOffered}
                    </p>
                  </div>
                  <span className="badge badge-primary badge-outline">
                    {formatEnum(selectedDrive.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                  <InfoItem label="Drive Date" value={formatDate(selectedDrive.driveDate)} />
                  <InfoItem label="Employment" value={formatEnum(selectedDrive.employmentType)} />
                  <InfoItem label="Work Mode" value={formatEnum(selectedDrive.workMode)} />
                  <InfoItem
                    label="CTC"
                    value={
                      selectedDrive.ctcOffered
                        ? `₹${Number(selectedDrive.ctcOffered).toLocaleString()}`
                        : '-'
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <InfoItem label="CGPA Cutoff" value={selectedDrive.cutOffCgpa ?? '-'} />
                  <InfoItem label="10th Cutoff" value={selectedDrive.cutOffTenthPercentage ?? '-'} />
                  <InfoItem label="12th Cutoff" value={selectedDrive.cutOffTwelfthPercentage ?? '-'} />
                </div>

                {selectedDrive.requiredSkills?.length > 0 && (
                  <div className="mt-5">
                    <h3 className="font-semibold text-sm mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDrive.requiredSkills.map((skill) => (
                        <span key={skill} className="badge badge-ghost badge-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDrive.eligibleDepartments?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-sm mb-2">Eligible Departments</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedDrive.eligibleDepartments.map((department) => (
                        <span key={department} className="badge badge-outline badge-sm">
                          {department}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDrive.jobDescription && (
                  <div className="mt-5">
                    <h3 className="font-semibold text-sm mb-2">Job Description</h3>
                    <p className="text-sm whitespace-pre-wrap text-base-content/80">
                      {selectedDrive.jobDescription}
                    </p>
                  </div>
                )}

                <div className="mt-5">
                  <h3 className="font-semibold text-sm mb-2">Interview Rounds</h3>
                  <div className="space-y-2">
                    {(selectedDrive.rounds || [])
                      .slice()
                      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
                      .map((round) => (
                        <div
                          key={round.id || `${round.sequenceNumber}-${round.roundName}`}
                          className="border border-base-300 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-sm">
                              {round.sequenceNumber}. {round.roundName}
                            </span>
                            <span className="badge badge-sm badge-outline">
                              {formatEnum(round.difficulty)}
                            </span>
                          </div>
                          <div className="text-xs text-base-content/60 mt-1 flex gap-3">
                            {round.durationMinutes && (
                              <span>{round.durationMinutes} min</span>
                            )}
                            {round.description && <span>{round.description}</span>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="card-title text-lg">
                Applicants {selectedDrive ? `— ${selectedDrive.companyName} / ${selectedDrive.roleOffered}` : ''}
              </h2>
              <p className="text-xs text-base-content/60 mt-1">
                Ranked applicants for the selected drive. Click View Resume to preview a resume.
              </p>
            </div>

            {selectedDrive && (
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={loadApplicants}
                disabled={loadingApplicants}
              >
                Refresh Applicants
              </button>
            )}
          </div>

          {!selectedDrive ? (
            <div className="text-center py-10 text-base-content/50">
              Select a drive above to view applicants.
            </div>
          ) : (
            <>
              <ApplicantsTable
                applicants={applicants}
                loading={loadingApplicants}
                onViewResume={setResumePreview}
              />

              {!loadingApplicants && applicantTotalPages > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-base-300">
                  <span className="text-xs text-base-content/60">
                    Page {applicantPage + 1} of {applicantTotalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-xs btn-outline"
                      disabled={applicantPage === 0}
                      onClick={() => setApplicantPage((page) => page - 1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline"
                      disabled={applicantPage + 1 >= applicantTotalPages}
                      onClick={() => setApplicantPage((page) => page + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <DriveFormModal
        open={formOpen}
        editingDrive={editingDrive}
        companies={companies}
        onClose={() => setFormOpen(false)}
        onSaved={loadDrives}
      />

      <ConfirmDeleteDriveModal
        drive={driveToDelete}
        deleting={
          Boolean(driveToDelete) &&
          deletingDriveId === driveToDelete.id
        }
        onCancel={() => setDriveToDelete(null)}
        onConfirm={async () => {
          await handleDelete(driveToDelete)
          setDriveToDelete(null)
        }}
      />

      <ResumePreviewModal
        resume={resumePreview}
        onClose={() => setResumePreview(null)}
      />
    </div>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg bg-base-200 p-3">
      <p className="text-xs text-base-content/50">{label}</p>
      <p className="text-sm font-medium mt-1 wrap-break-word">{value}</p>
    </div>
  )
}

export default TpoDriveManagement