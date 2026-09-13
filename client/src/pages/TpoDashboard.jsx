import { useState, useEffect } from 'react'

import {
  getAllCompaniesForTpo,
  createCompany,
  updateCompany,
  deleteCompany,
  getMyUserInfo,
  createBulkResources
} from '../api/tpoApi'

import { researchCompany } from '../api/researchAgentApi'


const COMPANY_TYPES = [
  'PRODUCT_BASED',
  'SERVICE_BASED',
  'STARTUP',
  'OTHER'
]

const EMPTY_FORM = {
  name: '',
  logoUrl: '',
  companyType: '',
  businessInfo: ''
}


function getErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  )
}


/* ============================================================
   COMPANY FORM MODAL
============================================================ */

function CompanyFormModal({
  open,
  onClose,
  onSaved,
  editingCompany,
  companies = []
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    if (editingCompany) {
      setForm({
        name: editingCompany.name || '',
        logoUrl:
          editingCompany.logoUrl ||
          editingCompany.logo_url ||
          '',
        companyType:
          editingCompany.companyType ||
          editingCompany.company_type ||
          '',
        businessInfo:
          editingCompany.businessInfo ||
          editingCompany.business_info ||
          ''
      })
    } else {
      setForm({
        ...EMPTY_FORM
      })
    }

    setError('')
  }, [editingCompany, open])


  function handleChange(field) {
    return (event) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.value
      }))

      setError('')
    }
  }


  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      setError('Company name is required.')
      return
    }

    if (!form.companyType) {
      setError('Company type is required.')
      return
    }

    setSaving(true)
    setError('')

    try {
      /*
       * Build the payload to match the backend request.
       *
       * Empty optional fields are NOT sent.
       */
      const payload = {
        name: form.name.trim(),
        companyType: form.companyType
      }

      const logoUrl = form.logoUrl.trim()
      const businessInfo = form.businessInfo.trim()

      if (logoUrl) {
        payload.logoUrl = logoUrl
      }

      if (businessInfo) {
        payload.businessInfo = businessInfo
      }


      console.log(
        'Company payload being sent:',
        JSON.stringify(payload, null, 2)
      )


      /*
       * --------------------------------------------------------
       * EDIT BUTTON
       * --------------------------------------------------------
       */
      if (editingCompany?.id) {

        console.log(
          'Updating existing company:',
          editingCompany.id
        )

        await updateCompany(
          editingCompany.id,
          payload
        )

      } else {

        /*
         * --------------------------------------------------------
         * + NEW COMPANY BUTTON
         *
         * Check whether the entered company already exists.
         * --------------------------------------------------------
         */

        const normalizedName =
          form.name.trim().toLowerCase()

        const existingCompany =
          companies.find(
            (company) =>
              (company?.name || '')
                .trim()
                .toLowerCase() ===
              normalizedName
          )


        if (existingCompany?.id) {

          console.log(
            'Company already exists. Updating instead:',
            existingCompany.id
          )

          /*
           * Preserve existing logo when the user did not
           * enter a new one.
           */
          const updatePayload = {
            ...payload
          }

          if (!updatePayload.logoUrl) {
            delete updatePayload.logoUrl
          }

          if (!updatePayload.businessInfo) {
            delete updatePayload.businessInfo
          }

          await updateCompany(
            existingCompany.id,
            updatePayload
          )

        } else {

          console.log(
            'Creating new company:',
            payload
          )

          await createCompany(payload)
        }
      }


      await onSaved()
      onClose()

    } catch (error) {

      console.error(
        'Failed to save company:',
        error
      )

      console.error(
        'Backend response:',
        error?.response?.data
      )

      setError(
        getErrorMessage(
          error,
          'Could not save company.'
        )
      )

    } finally {
      setSaving(false)
    }
  }


  if (!open) {
    return null
  }


  return (
    <div className="modal modal-open">

      <div className="modal-box">

        <h3 className="font-bold text-lg mb-4">
          {editingCompany
            ? 'Edit Company'
            : 'Create Company'}
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

          <input
            type="text"
            placeholder="Company name"
            required
            className="input input-bordered border-2 border-base-300 w-full"
            value={form.name}
            onChange={handleChange('name')}
          />


          <input
            type="text"
            placeholder="Logo URL"
            className="input input-bordered border-2 border-base-300 w-full"
            value={form.logoUrl}
            onChange={handleChange('logoUrl')}
          />


          <textarea
            placeholder="Business info"
            className="textarea textarea-bordered border-2 border-base-300 w-full"
            value={form.businessInfo}
            onChange={handleChange('businessInfo')}
            rows={5}
          />


          <select
            className="select select-bordered border-2 border-base-300 w-full"
            required
            value={form.companyType}
            onChange={handleChange('companyType')}
          >

            <option
              value=""
              disabled
            >
              Select type
            </option>

            {COMPANY_TYPES.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type.replaceAll('_', ' ')}
              </option>
            ))}

          </select>


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
                <span className="loading loading-spinner loading-sm" />
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


/* ============================================================
   DELETE CONFIRMATION MODAL
============================================================ */

function ConfirmDeleteModal({
  open,
  companyName,
  onConfirm,
  onCancel,
  deleting,
  error
}) {
  if (!open) {
    return null
  }

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
            type="button"
            className="btn btn-ghost"
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
            {deleting ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}


/* ============================================================
   COMPANY MANAGEMENT
============================================================ */

function CompanyManagement() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] =
    useState(null)

  const [researchModalOpen, setResearchModalOpen] =
    useState(false)

  const [deleteTarget, setDeleteTarget] =
    useState(null)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    setLoading(true)

    try {
      const result =
        await getAllCompaniesForTpo()

      /*
       * API functions return response.data.
       *
       * Expected backend response:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *     content: [...]
       *   },
       *   error: null
       * }
       */

      const data = result?.data

      const content = Array.isArray(data)
        ? data
        : data?.content || []

      setCompanies(content)
    } catch (error) {
      console.error(
        'Failed to load companies:',
        error
      )

      setCompanies([])
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

  function closeCompanyModal() {
    if (modalOpen) {
      setModalOpen(false)
      setEditingCompany(null)
    }
  }

  function requestDelete(company) {
    setDeleteError('')
    setDeleteTarget(company)
  }

  function cancelDelete() {
    if (deleting) {
      return
    }

    setDeleteTarget(null)
    setDeleteError('')
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) {
      return
    }

    setDeleting(true)
    setDeleteError('')

    try {
      await deleteCompany(deleteTarget.id)

      setDeleteTarget(null)

      await loadCompanies()
    } catch (error) {
      console.error(
        'Failed to delete company:',
        error
      )

      setDeleteError(
        getErrorMessage(
          error,
          'Could not delete company.'
        )
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">

        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">
            Companies
          </h2>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() =>
                setResearchModalOpen(true)
              }
            >
              🔍 Research Company
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={openCreate}
            >
              + New Company
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner" />
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-10 text-base-content/60">
            No companies found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Business Info</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {companies.map((company) => {
                  const companyType =
                    company.companyType ||
                    company.company_type ||
                    ''

                  const businessInfo =
                    company.businessInfo ||
                    company.business_info ||
                    '-'

                  const companyId =
                    company.id ||
                    company.companyId

                  return (
                    <tr key={companyId}>
                      <td className="font-medium">
                        {company.name || '-'}
                      </td>

                      <td>
                        <span className="badge badge-outline badge-sm">
                          {companyType
                            ? companyType.replaceAll(
                                '_',
                                ' '
                              )
                            : '-'}
                        </span>
                      </td>

                      <td className="text-sm text-base-content/60 max-w-md truncate">
                        {businessInfo}
                      </td>

                      <td>
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() =>
                              openEdit(company)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() =>
                              requestDelete(company)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <CompanyFormModal
          open={modalOpen}
          onClose={closeCompanyModal}
          onSaved={loadCompanies}
          editingCompany={editingCompany}
          companies={companies}
        />

        <ResearchAgentModal
          open={researchModalOpen}
          onClose={() =>
            setResearchModalOpen(false)
          }
          onPublished={loadCompanies}
          companies={companies}
        />

        <ConfirmDeleteModal
          open={!!deleteTarget}
          companyName={
            deleteTarget?.name || ''
          }
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          deleting={deleting}
          error={deleteError}
        />

      </div>
    </div>
  )
}


/* ============================================================
   TPO NAVBAR
============================================================ */

function TpoNavbar() {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    let mounted = true

    getMyUserInfo()
      .then((result) => {
        if (!mounted) {
          return
        }

        /*
         * API function returns response.data.
         *
         * Expected:
         *
         * {
         *   success: true,
         *   data: {
         *     fullName: "...",
         *     email: "...",
         *     role: "TPO"
         *   }
         * }
         */

        setInfo(result?.data || result)
      })
      .catch((error) => {
        console.error(
          'Failed to load user information:',
          error
        )
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-6">

      <div className="flex-1 text-xl font-bold text-primary">
        PlaceIntel — TPO
      </div>

      {info && (
        <div className="flex-none">
          <div className="dropdown dropdown-end">

            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost gap-2 normal-case"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                {info.fullName?.[0]?.toUpperCase() ||
                  info.email?.[0]?.toUpperCase() ||
                  '?'}
              </div>

              <span className="text-sm">
                {info.fullName ||
                  info.email ||
                  'TPO'}
              </span>
            </div>

            <ul
              tabIndex={0}
              className="menu dropdown-content bg-base-100 rounded-box z-10 mt-3 w-56 p-3 shadow border border-base-300"
            >
              <li className="px-2 py-1 text-xs text-base-content/50">
                {info.email ||
                  'No email'}
              </li>

              <li className="px-2">
                <span className="badge badge-outline badge-sm">
                  {info.role || 'TPO'}
                </span>
              </li>
            </ul>

          </div>
        </div>
      )}

    </div>
  )
}


/* ============================================================
   RESEARCH AGENT MODAL
============================================================ */

function ResearchAgentModal({
  open,
  onClose,
  onPublished,
  companies = []
}) {
  const [step, setStep] =
    useState('input')

  const [companyName, setCompanyName] =
    useState('')

  const [role, setRole] =
    useState('')

  const [draft, setDraft] =
    useState(null)

  const [selectedResources, setSelectedResources] =
    useState({})

  const [publishing, setPublishing] =
    useState(false)

  const [error, setError] =
    useState('')


  /* ==========================================================
     RESET
  ========================================================== */

  function reset() {
    setStep('input')
    setCompanyName('')
    setRole('')
    setDraft(null)
    setSelectedResources({})
    setPublishing(false)
    setError('')
  }


  function closeModal() {
    if (publishing) {
      return
    }

    onClose()
    reset()
  }


  /* ==========================================================
     RESEARCH
  ========================================================== */

  async function handleResearch(event) {
    event.preventDefault()

    const trimmedCompanyName =
      companyName.trim()

    const trimmedRole =
      role.trim()

    if (!trimmedCompanyName) {
      setError(
        'Company name is required.'
      )

      return
    }

    if (!trimmedRole) {
      setError(
        'Target role is required.'
      )

      return
    }

    setError('')
    setStep('loading')

    try {
      const result =
        await researchCompany(
          trimmedCompanyName,
          trimmedRole
        )

      /*
       * researchCompany() returns response.data.
       *
       * Backend response:
       *
       * {
       *   success: true,
       *   message: "Research completed",
       *   data: {
       *     business_info: "...",
       *     company_type: "PRODUCT_BASED",
       *     careers_page_url: "...",
       *     resources: [...]
       *   },
       *   error: null
       * }
       */

      const researchData =
        result?.data

      if (
        !researchData ||
        typeof researchData !== 'object'
      ) {
        throw new Error(
          'Invalid research response received from the server.'
        )
      }

      const resources =
        Array.isArray(
          researchData.resources
        )
          ? researchData.resources
          : []

      const normalizedDraft = {
        ...researchData,

        business_info:
          researchData.business_info || '',

        company_type:
          researchData.company_type || '',

        careers_page_url:
          researchData.careers_page_url || '',

        resources
      }

      setDraft(normalizedDraft)

      const initialSelection = {}

      resources.forEach((_, index) => {
        initialSelection[index] = true
      })

      setSelectedResources(
        initialSelection
      )

      setStep('review')
    } catch (error) {
      console.error(
        'Research failed:',
        error
      )

      setError(
        getErrorMessage(
          error,
          'Research failed. Please try again.'
        )
      )

      setStep('input')
    }
  }


  /* ==========================================================
     RESOURCE TOGGLE
  ========================================================== */

  function toggleResource(index) {
    setSelectedResources(
      (previous) => ({
        ...previous,

        [index]:
          !previous[index]
      })
    )
  }


  /* ==========================================================
     UPDATE RESEARCH DRAFT
  ========================================================== */

  function updateDraftField(field) {
    return (event) => {
      setDraft(
        (previous) => ({
          ...previous,
          [field]:
            event.target.value
        })
      )

      setError('')
    }
  }


  /* ==========================================================
     PUBLISH
  ========================================================== */

  async function handlePublish() {
    if (!draft) {
      setError(
        'There is no research data to publish.'
      )

      return
    }

    const trimmedCompanyName =
      companyName.trim()

    if (!trimmedCompanyName) {
      setError(
        'Company name is required.'
      )

      return
    }

    if (!draft.company_type) {
      setError(
        'Company type is required.'
      )

      return
    }

    setPublishing(true)
    setError('')

    try {

      /*
       * ========================================================
       * STEP 1: CREATE OR UPDATE COMPANY
       * ========================================================
       *
       * If the company already exists, update it.
       * Otherwise create a new company.
       */

      const companyPayload = {
        name: trimmedCompanyName,
        logoUrl: '',
        companyType: draft.company_type,
        businessInfo:
          draft.business_info || ''
      }

      console.log(
        'Company payload:',
        companyPayload
      )

      /*
       * Find an existing company using the company name.
       * Comparison ignores case and surrounding whitespace.
       */
      const normalizedCompanyName =
        trimmedCompanyName
          .trim()
          .toLowerCase()

      const existingCompany =
        companies.find(
          (company) =>
            (company?.name || '')
              .trim()
              .toLowerCase() ===
            normalizedCompanyName
        )

      let companyId

      if (existingCompany?.id) {
        /*
         * ======================================================
         * EXISTING COMPANY
         *
         * PUT /company/update/{id}
         * ======================================================
         */

        console.log(
          'Existing company found. Updating:',
          existingCompany
        )

        /*
         * The research agent does not provide a logo URL, so
         * preserve the existing company's logo when available.
         */
        const updatePayload = {
          ...companyPayload,
          logoUrl:
            existingCompany.logoUrl ||
            existingCompany.logo_url ||
            ''
        }

        console.log(
          'Updating company:',
          updatePayload
        )

        const updateResponse =
          await updateCompany(
            existingCompany.id,
            updatePayload
          )

        console.log(
          'Update company response:',
          updateResponse
        )

        companyId = existingCompany.id

      } else {
        /*
         * ======================================================
         * NEW COMPANY
         *
         * POST /company/register
         * ======================================================
         */

        console.log(
          'No existing company found. Creating:',
          companyPayload
        )

        const createResponse =
          await createCompany(
            companyPayload
          )

        console.log(
          'Create company response:',
          createResponse
        )

        /*
         * createCompany() returns response.data.
         *
         * Backend envelope:
         *
         * {
         *   success: true,
         *   message: "...",
         *   data: {
         *     id: "..."
         *   },
         *   error: null
         * }
         *
         * Therefore: createResponse.data.id
         */
        companyId =
          createResponse?.data?.id

        if (!companyId) {
          throw new Error(
            'Company was created, but the backend did not return a company ID.'
          )
        }
      }

      console.log(
        'Company ID:',
        companyId
      )


      /*
       * ========================================================
       * STEP 2: GET SELECTED RESOURCES
       * ========================================================
       */

      const approvedResources = (
        Array.isArray(draft.resources)
          ? draft.resources
          : []
      ).filter(
        (_, index) =>
          selectedResources[index]
      )


      /*
       * ========================================================
       * STEP 3: CREATE RESOURCES
       * ========================================================
       */

      if (
        approvedResources.length > 0
      ) {
        const validResources =
          approvedResources.filter(
            (resource) =>
              resource?.type &&
              resource?.title &&
              resource?.url
          )

        if (
          validResources.length > 0
        ) {
          const resourcePayload = {
            resources:
              validResources.map(
                (resource) => ({
                  resourceType:
                    resource.type,

                  title:
                    resource.title,

                  url:
                    resource.url
                })
              )
          }

          console.log(
            'Creating bulk resources:',
            resourcePayload
          )

          const resourceResponse =
            await createBulkResources(
              companyId,
              resourcePayload
            )

          console.log(
            'Bulk resources response:',
            resourceResponse
          )
        }
      }


      /*
       * ========================================================
       * STEP 4: REFRESH COMPANY LIST
       * ========================================================
       */

      await onPublished()


      /*
       * ========================================================
       * STEP 5: CLOSE MODAL
       * ========================================================
       */

      reset()
      onClose()

    } catch (error) {
      console.error(
        'Publish failed:',
        error
      )

      setError(
        getErrorMessage(
          error,
          'Could not publish the company.'
        )
      )
    } finally {
      setPublishing(false)
    }
  }


  if (!open) {
    return null
  }


  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl">

        <h3 className="font-bold text-lg mb-4">
          Research a Company
        </h3>


        {error && (
          <div
            role="alert"
            className="alert alert-error text-sm mb-4"
          >
            <span>{error}</span>
          </div>
        )}


        {/* ====================================================
            INPUT STEP
        ==================================================== */}

        {step === 'input' && (
          <form
            onSubmit={handleResearch}
            className="flex flex-col gap-3"
          >

            <input
              type="text"
              placeholder="Company name"
              required
              className="input input-bordered border-2 border-base-300 w-full"
              value={companyName}
              onChange={(event) => {
                setCompanyName(
                  event.target.value
                )

                setError('')
              }}
            />


            <input
              type="text"
              placeholder="Target role (e.g. Software Engineer)"
              required
              className="input input-bordered border-2 border-base-300 w-full"
              value={role}
              onChange={(event) => {
                setRole(
                  event.target.value
                )

                setError('')
              }}
            />


            <div className="modal-action">

              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeModal}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  !companyName.trim() ||
                  !role.trim()
                }
              >
                Research
              </button>

            </div>

          </form>
        )}


        {/* ====================================================
            LOADING STEP
        ==================================================== */}

        {step === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-10">

            <span className="loading loading-spinner loading-lg" />

            <p className="text-sm text-base-content/60 text-center">

              Researching{' '}

              <span className="font-medium">
                {companyName}
              </span>

              {' '}for{' '}

              <span className="font-medium">
                {role}
              </span>

              ...

            </p>

          </div>
        )}


        {/* ====================================================
            REVIEW STEP
        ==================================================== */}

        {step === 'review' && draft && (
          <div className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-1">

            {/* COMPANY */}

            <div className="rounded-lg border border-base-300 bg-base-200 p-4">

              <p className="text-xs uppercase tracking-wide text-base-content/50">
                Company
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {companyName}
              </h2>

              <p className="text-sm text-base-content/60 mt-1">
                Target role: {role}
              </p>

            </div>


            {/* BUSINESS INFO */}

            <label className="form-control">

              <span className="label-text text-sm font-medium mb-1">
                Business info
              </span>

              <textarea
                className="textarea textarea-bordered border-2 border-base-300 w-full"
                rows={7}
                value={
                  draft.business_info || ''
                }
                onChange={
                  updateDraftField(
                    'business_info'
                  )
                }
              />

            </label>


            {/* COMPANY TYPE */}

            <label className="form-control">

              <span className="label-text text-sm font-medium mb-1">
                Company type
              </span>

              <select
                className="select select-bordered border-2 border-base-300 w-full"
                value={
                  draft.company_type || ''
                }
                onChange={
                  updateDraftField(
                    'company_type'
                  )
                }
              >

                <option
                  value=""
                  disabled
                >
                  Select type
                </option>

                {COMPANY_TYPES.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type.replaceAll(
                        '_',
                        ' '
                      )}
                    </option>
                  )
                )}

              </select>

            </label>


            {/* CAREERS PAGE */}

            {draft.careers_page_url && (
              <div className="rounded-lg border border-base-300 p-4">

                <p className="text-sm font-medium mb-1">
                  Careers page
                </p>

                <a
                  href={
                    draft.careers_page_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary break-all text-sm"
                >
                  {
                    draft.careers_page_url
                  }
                </a>

              </div>
            )}


            {/* RESOURCES */}

            <div>

              <p className="text-sm font-medium mb-2">
                Suggested resources (
                {draft.resources?.length ||
                  0}
                )
              </p>


              {draft.resources?.length > 0 ? (

                <div className="flex flex-col gap-2">

                  {draft.resources.map(
                    (resource, index) => (

                      <label
                        key={`${resource.url || index}-${index}`}
                        className="flex items-start gap-3 p-3 rounded-lg border border-base-300 cursor-pointer"
                      >

                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm mt-1"
                          checked={
                            !!selectedResources[
                              index
                            ]
                          }
                          onChange={() =>
                            toggleResource(
                              index
                            )
                          }
                        />


                        <div className="flex-1 min-w-0">

                          <p className="text-sm font-medium">
                            {resource.title ||
                              'Untitled resource'}
                          </p>


                          {resource.type && (
                            <span className="badge badge-outline badge-xs mt-1">
                              {resource.type.replace(
                                /_/g,
                                ' '
                              )}
                            </span>
                          )}


                          {resource.url && (
                            <a
                              href={
                                resource.url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="link link-primary block text-xs mt-2 break-all"
                              onClick={(
                                event
                              ) =>
                                event.stopPropagation()
                              }
                            >
                              {
                                resource.url
                              }
                            </a>
                          )}

                        </div>

                      </label>
                    )
                  )}

                </div>

              ) : (

                <div className="text-sm text-base-content/60 border border-dashed border-base-300 rounded-lg p-4">
                  No resources were found.
                </div>

              )}

            </div>


            {/* ACTIONS */}

            <div className="modal-action">

              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeModal}
                disabled={publishing}
              >
                Cancel
              </button>


              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePublish}
                disabled={
                  publishing ||
                  !draft.company_type
                }
              >

                {publishing ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Publishing...
                  </>
                ) : (
                  'Publish'
                )}

              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  )
}


/* ============================================================
   TPO DASHBOARD
============================================================ */

function TpoDashboard() {
  return (
    <div className="min-h-screen bg-base-200">

      <TpoNavbar />

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6">

        <CompanyManagement />

      </div>

    </div>
  )
}


export default TpoDashboard