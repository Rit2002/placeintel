import { useState, useEffect } from 'react'
import { getPendingStudents, verifyStudent } from '../api/tpoApi'









function getErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  )
}








function VerifyActionModal({ student, onClose, onDone }) {
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleAction(status) {
    setSubmitting(true)
    setError('')
    try {
      await verifyStudent(student.id, status, note.trim() || null)
      onDone()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update verification status.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!student) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-2">{student.fullName}</h3>
        <p className="text-sm text-base-content/60 mb-4">
          {student.enrollmentNo} · {student.department} · CGPA {student.cgpa}
        </p>

        {error && (
          <div role="alert" className="alert alert-error text-sm mb-3">
            <span>{error}</span>
          </div>
        )}

        <label className="form-control">
          <span className="label-text text-sm mb-1">Note (optional, useful for rejection)</span>
          <textarea
            className="textarea textarea-bordered border-2 border-base-300 w-full"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-error"
            onClick={() => handleAction('REJECTED')}
            disabled={submitting}
          >
            Reject
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleAction('VERIFIED')}
            disabled={submitting}
          >
            {submitting ? <span className="loading loading-spinner loading-sm" /> : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  )
}








function TpoVerification() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    loadPending()
  }, [])

  async function loadPending() {
    setLoading(true)
    try {
      const result = await getPendingStudents()
      const data = result?.data
      const content = Array.isArray(data) ? data : data?.content || []
      setStudents(content)
    } catch (err) {
      console.error('Failed to load pending students:', err)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h2 className="card-title mb-4">Pending Verifications</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-10 text-base-content/60">
            No students awaiting verification.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Enrollment No</th>
                  <th>Department</th>
                  <th>CGPA</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="font-medium">{student.fullName || '-'}</td>
                    <td>{student.enrollmentNo || '-'}</td>
                    <td>{student.department || '-'}</td>
                    <td>{student.cgpa ?? '-'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => setSelectedStudent(student)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <VerifyActionModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onDone={loadPending}
        />
      </div>
    </div>
  )
}








export default TpoVerification