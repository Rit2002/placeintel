import { useState, useEffect } from 'react'
import {
  getAllCompaniesForTpo,
  createCompany,
  updateCompany,
  deleteCompany
} from '../api/tpoApi'

const COMPANY_TYPES = [
  'PRODUCT_BASED',
  'SERVICE_BASED',
  'STARTUP',
  'OTHER'
]

const EMPTY_FORM = {
  name: '',
  logoUrl: '',
  shortDescription: '',
  businessInfo: '',
  companyType: ''
}

function CompanyFormModal({
  open,
  onClose,
  onSaved,
  editingCompany
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editingCompany) {
      setForm({
        name: editingCompany.name || '',
        logoUrl: editingCompany.logoUrl || '',
        shortDescription: editingCompany.shortDescription || '',
        businessInfo: editingCompany.businessInfo || '',
        companyType: editingCompany.companyType || ''
      })
    } else {
      setForm({ ...EMPTY_FORM })
    }

    setError('')
  }, [editingCompany, open])

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value
      }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setSaving(true)
    setError('')

    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, form)
      } else {
        await createCompany(form)
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not save company.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {editingCompany ? 'Edit Company' : 'Create Company'}
        </h3>

        {error && (
          <div
            role="alert"
            className="alert alert-error text-sm mb-3"
          >
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
        >
          {/* Company Name */}
          <input
            type="text"
            placeholder="Company name"
            required
            className="input input-bordered border-2 border-base-300 w-full"
            value={form.name}
            onChange={handleChange('name')}
          />

          {/* Logo URL */}
          <input
            type="text"
            placeholder="Logo URL"
            className="input input-bordered border-2 border-base-300 w-full"
            value={form.logoUrl}
            onChange={handleChange('logoUrl')}
          />

          {/* Short Description */}
          <input
            type="text"
            placeholder="Short description"
            className="input input-bordered border-2 border-base-300 w-full"
            value={form.shortDescription}
            onChange={handleChange('shortDescription')}
          />

          {/* Business Info */}
          <textarea
            placeholder="Business info"
            className="textarea textarea-bordered border-2 border-base-300 w-full"
            value={form.businessInfo}
            onChange={handleChange('businessInfo')}
            rows={3}
          />

          {/* Company Type */}
          <select
            className="select select-bordered border-2 border-base-300 w-full"
            required
            value={form.companyType}
            onChange={handleChange('companyType')}
          >
            <option value="" disabled>
              Select type
            </option>

            {COMPANY_TYPES.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
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
              {saving ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


function ConfirmDeleteModal({
  open,
  companyName,
  onConfirm,
  onCancel,
  deleting,
  error
}) {
  if (!open) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-2">
          Delete company
        </h3>

        <p className="text-sm text-base-content/70">
          Are you sure you want to delete{' '}
          <span className="font-semibold">
            {companyName}
          </span>
          ?
          <br />
          This action cannot be undone.
        </p>

        {error && (
          <div
            role="alert"
            className="alert alert-error text-sm mt-4"
          >
            <span>{error}</span>
          </div>
        )}

        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            className="btn btn-error"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}


function CompanyManagement() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    setLoading(true)

    try {
      const result = await getAllCompaniesForTpo()

      setCompanies(result.data.content || [])
    } catch (err) {
      console.error('Failed to load companies:', err)
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingCompany(null)
    setModalOpen(true)
  }

  function openEdit(company) {
    setEditingCompany(company)
    setModalOpen(true)
  }

  function closeFormModal() {
    if (!deleting) {
      setModalOpen(false)
      setEditingCompany(null)
    }
  }

  function requestDelete(company) {
    setDeleteError('')
    setDeleteTarget(company)
  }

  function cancelDelete() {
    if (deleting) return

    setDeleteTarget(null)
    setDeleteError('')
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    setDeleting(true)
    setDeleteError('')

    try {
      await deleteCompany(deleteTarget.id)

      setDeleteTarget(null)
      setDeleteError('')

      await loadCompanies()
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
        'Could not delete company.'
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">
            Companies
          </h2>

          <button
            className="btn btn-primary btn-sm"
            onClick={openCreate}
          >
            + New Company
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner"></span>
          </div>
        ) : companies.length === 0 ? (

          /* Empty State */
          <div className="text-center py-10 text-base-content/60">
            No companies found.
          </div>

        ) : (

          /* Company Table */
          <div className="overflow-x-auto">
            <table className="table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>

                    {/* Name */}
                    <td className="font-medium">
                      {company.name}
                    </td>

                    {/* Type */}
                    <td>
                      <span className="badge badge-outline badge-sm">
                        {company.companyType
                          ?.replaceAll('_', ' ') || '-'}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="text-sm text-base-content/60 max-w-xs truncate">
                      {company.shortDescription || '-'}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex gap-2 justify-end">

                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => openEdit(company)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => requestDelete(company)}
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* Create / Edit Modal */}
      <CompanyFormModal
        open={modalOpen}
        onClose={closeFormModal}
        onSaved={loadCompanies}
        editingCompany={editingCompany}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        companyName={deleteTarget?.name || ''}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        deleting={deleting}
        error={deleteError}
      />
    </div>
  )
}


function TpoDashboard() {
  return (
    <div className="min-h-screen bg-base-200">

      {/* Navbar */}
      <div className="navbar bg-base-100 border-b border-base-300 px-6">
        <div className="flex-1 text-xl font-bold text-primary">
          PlaceIntel — TPO
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">
        <CompanyManagement />
      </div>

    </div>
  )
}

export default TpoDashboard