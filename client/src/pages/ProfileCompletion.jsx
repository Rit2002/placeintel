import { useState, useEffect } from 'react'
import { getMyProfile, updateMyProfile } from '../api/studentApi'
import Navbar from '../components/Navbar'

function ProfileCompletion() {
  const [profile, setProfile] = useState(null)

  const [form, setForm] = useState({
    department: '',
    cgpa: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    activeBacklogs: '',
    skillsInput: '',
    linkedinUrl: '',
    githubUsername: '',
    resumeUrl: '',
  })

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  /*
   * Handles all possible response shapes for the INITIAL LOAD only
   * (getMyProfile). The save/update path doesn't depend on this — see
   * handleSubmit, which always refetches instead of trying to parse
   * the update endpoint's response shape.
   */
  function extractProfile(result) {
    if (result?.data?.data?.fullName !== undefined) {
      return result.data.data
    }

    if (result?.data?.fullName !== undefined) {
      return result.data
    }

    if (result?.fullName !== undefined) {
      return result
    }

    return null
  }

  function populateProfile(p) {
    if (!p) {
      throw new Error('Invalid profile response.')
    }

    setProfile(p)

    setForm({
      department: p.department ?? '',
      cgpa: p.cgpa ?? '',
      tenthPercentage: p.tenthPercentage ?? '',
      twelfthPercentage: p.twelfthPercentage ?? '',
      activeBacklogs: p.activeBacklogs ?? '',
      skillsInput: Array.isArray(p.skills)
        ? p.skills.join(', ')
        : '',
      linkedinUrl: p.linkedinUrl ?? '',
      githubUsername: p.githubUsername ?? '',
      resumeUrl: p.resumeUrl ?? '',
    })
  }

  async function loadProfile() {
    try {
      setError('')

      const result = await getMyProfile()
      const p = extractProfile(result)

      if (!p) {
        throw new Error('Invalid profile response.')
      }

      populateProfile(p)

      /*
       * First visit:
       *
       * profileCompleted = false -> editable
       * profileCompleted = true  -> read-only
       */
      setEditing(!p.profileCompleted)

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not load your profile.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))
    }
  }

  /*
   * Edit Profile ONLY enables editing.
   * It does NOT save anything, reload the profile, or show a message.
   */
  function handleEdit() {
    setEditing(true)
    setMessage('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // Defensive guard: this should be structurally impossible now
    // (there is no <form> in the DOM at all while editing is false —
    // see the render below), but this stays as a cheap second line
    // of defense against any stray call.
    if (!editing) {
      return
    }

    setSaving(true)
    setMessage('')
    setError('')

    try {
      const cgpa = parseFloat(form.cgpa)
      const tenthPercentage = parseInt(form.tenthPercentage, 10)
      const twelfthPercentage = parseInt(form.twelfthPercentage, 10)
      const activeBacklogs = parseInt(form.activeBacklogs, 10)

      if (
        Number.isNaN(cgpa) ||
        Number.isNaN(tenthPercentage) ||
        Number.isNaN(twelfthPercentage) ||
        Number.isNaN(activeBacklogs)
      ) {
        setError('Please enter valid values for all numeric fields.')
        return
      }

      const skills = form.skillsInput
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)

      const payload = {
        department: form.department,
        cgpa,
        tenthPercentage,
        twelfthPercentage,
        activeBacklogs,
        skills,
        linkedinUrl: form.linkedinUrl || null,
        githubUsername: form.githubUsername || null,
        resumeUrl: form.resumeUrl || null,
      }

      // Save changes.
      await updateMyProfile(payload)

      /*
       * Always refetch from the server after saving instead of trying
       * to parse the update endpoint's response shape — guarantees the
       * UI shows exactly what the server actually persisted.
       */
      await loadProfile()

      setMessage('Profile updated successfully.')
      setEditing(false)

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not save your profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  function getInitials(fullName) {
    if (!fullName) {
      return ''
    }

    const parts = fullName.trim().split(/\s+/)

    if (parts.length === 1) {
      return parts[0][0].toUpperCase()
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase()
  }

  function getVerificationBadgeClass(status) {
    if (status === 'VERIFIED') {
      return 'bg-black text-white border-black'
    }

    if (status === 'REJECTED') {
      return 'badge-error'
    }

    if (status === 'PENDING') {
      return 'badge-warning'
    }

    return 'badge-ghost'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />

        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    )
  }

  const inputClass = `
    input
    w-full
    border
    border-base-300
    bg-base-100
    focus:border-primary
    focus:outline-none
    focus:ring-2
    focus:ring-primary/20
    disabled:bg-base-200
    disabled:text-base-content
    disabled:cursor-not-allowed
  `

  /*
   * All the field markup, shared between the editing (<form>) and
   * read-only (<div>) render paths below, so the fields themselves
   * are defined exactly once.
   */
  const fields = (
    <>
      {/* Department */}
      <label className="form-control">
        <span className="label-text text-sm mb-1">Department</span>
        <input
          type="text"
          className={inputClass}
          value={form.department}
          onChange={handleChange('department')}
          disabled={!editing}
          required
        />
      </label>

      {/* Academic Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="form-control">
          <span className="label-text text-sm mb-1">CGPA</span>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            className={inputClass}
            value={form.cgpa}
            onChange={handleChange('cgpa')}
            disabled={!editing}
            required
          />
        </label>

        <label className="form-control">
          <span className="label-text text-sm mb-1">10th %</span>
          <input
            type="number"
            min="0"
            max="100"
            className={inputClass}
            value={form.tenthPercentage}
            onChange={handleChange('tenthPercentage')}
            disabled={!editing}
            required
          />
        </label>

        <label className="form-control">
          <span className="label-text text-sm mb-1">12th %</span>
          <input
            type="number"
            min="0"
            max="100"
            className={inputClass}
            value={form.twelfthPercentage}
            onChange={handleChange('twelfthPercentage')}
            disabled={!editing}
            required
          />
        </label>
      </div>

      {/* Active Backlogs */}
      <label className="form-control">
        <span className="label-text text-sm mb-1">Active Backlogs</span>
        <input
          type="number"
          min="0"
          className={inputClass}
          value={form.activeBacklogs}
          onChange={handleChange('activeBacklogs')}
          disabled={!editing}
          required
        />
      </label>

      {/* Skills */}
      <label className="form-control">
        <span className="label-text text-sm mb-1">Skills</span>
        <input
          type="text"
          placeholder="Java, Spring Boot, SQL"
          className={inputClass}
          value={form.skillsInput}
          onChange={handleChange('skillsInput')}
          disabled={!editing}
        />
        <span className="label-text-alt text-xs mt-1 text-base-content/50">
          Comma-separated
        </span>
      </label>

      {/* LinkedIn */}
      <label className="form-control">
        <span className="label-text text-sm mb-1">LinkedIn URL</span>
        <input
          type="url"
          className={inputClass}
          value={form.linkedinUrl}
          onChange={handleChange('linkedinUrl')}
          disabled={!editing}
        />
      </label>

      {/* GitHub */}
      <label className="form-control">
        <span className="label-text text-sm mb-1">GitHub Username</span>
        <input
          type="text"
          className={inputClass}
          value={form.githubUsername}
          onChange={handleChange('githubUsername')}
          disabled={!editing}
        />
      </label>

      {/* Resume */}
      <label className="form-control">
        <span className="label-text text-sm mb-1">Resume URL</span>
        <input
          type="url"
          placeholder="Link to your resume (Google Drive, etc.)"
          className={inputClass}
          value={form.resumeUrl}
          onChange={handleChange('resumeUrl')}
          disabled={!editing}
        />
      </label>
    </>
  )

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold shrink-0">
            {getInitials(profile?.fullName)}
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{profile?.fullName}</h1>
            <p className="text-sm text-base-content/60">{profile?.enrollmentNo}</p>

            {profile?.verificationStatus && (
              <span
                className={`badge w-fit px-2.5 py-1 text-xs font-medium ${getVerificationBadgeClass(
                  profile.verificationStatus
                )}`}
              >
                {profile.verificationStatus}
              </span>
            )}
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div role="alert" className="alert alert-success mb-4 text-sm">
            <span>{message}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div role="alert" className="alert alert-error mb-4 text-sm">
            <span>{error}</span>
          </div>
        )}

        {/*
         * Two entirely separate render paths on purpose: when NOT
         * editing, there is no <form> element in the DOM at all, so
         * it is structurally impossible for a stray submit to fire
         * off the "Edit Profile" button.
         */}
        {editing ? (
          <form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm">
            <div className="card-body gap-5">
              {fields}

              <button
                type="submit"
                className="btn btn-primary w-full mt-2"
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body gap-5">
              {fields}

              <button
                type="button"
                className="btn btn-outline w-full mt-2"
                onClick={handleEdit}
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ProfileCompletion