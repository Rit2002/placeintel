import { useEffect, useMemo, useState } from 'react'

import {
  getAllStudents,
  getPublicAchievements,
  createAchievement,
  deleteAchievement
} from '../api/tpoApi'


function getErrorMessage(
  error,
  fallbackMessage
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    fallbackMessage
  )
}


function formatDate(value) {

  if (!value) {
    return '-'
  }


  const date = new Date(value)


  if (Number.isNaN(date.getTime())) {
    return '-'
  }


  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  )
}


function formatCtc(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return '-'
  }


  const number = Number(value)


  if (!Number.isFinite(number)) {
    return '-'
  }


  return number.toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 2
    }
  )
}


/* ============================================================
   CREATE ACHIEVEMENT FORM
============================================================ */

function CreateAchievementForm({
  students,
  onCreated
}) {

  const [
    studentProfileId,
    setStudentProfileId
  ] = useState('')


  const [
    companyName,
    setCompanyName
  ] = useState('')


  const [
    ctcOffered,
    setCtcOffered
  ] = useState('')


  const [
    image,
    setImage
  ] = useState(null)


  const [saving, setSaving] =
    useState(false)


  const [error, setError] =
    useState('')


  const [success, setSuccess] =
    useState('')


  function handleImageChange(event) {

    const file =
      event.target.files?.[0]


    setError('')
    setSuccess('')


    if (!file) {

      setImage(null)
      return
    }


    setImage(file)
  }


  async function handleSubmit(event) {

    event.preventDefault()


    setError('')
    setSuccess('')


    if (!studentProfileId) {

      setError(
        'Please select a student.'
      )

      return
    }


    if (!companyName.trim()) {

      setError(
        'Company name is required.'
      )

      return
    }


    if (
      ctcOffered === '' ||
      ctcOffered === null ||
      Number(ctcOffered) <= 0
    ) {

      setError(
        'CTC must be greater than 0.'
      )

      return
    }


    setSaving(true)


    try {

      const result =
        await createAchievement(
          studentProfileId,
          companyName,
          Number(ctcOffered),
          image
        )


      if (!result?.success) {

        throw new Error(
          result?.message ||
          'Failed to create placement achievement.'
        )
      }


      setStudentProfileId('')
      setCompanyName('')
      setCtcOffered('')
      setImage(null)


      const fileInput =
        document.getElementById(
          'achievement-image-input'
        )


      if (fileInput) {
        fileInput.value = ''
      }


      setSuccess(
        result?.message ||
        'Placement achievement added successfully.'
      )


      if (onCreated) {
        await onCreated()
      }

    } catch (err) {

      console.error(
        'Failed to create placement achievement:',
        err
      )


      setError(
        getErrorMessage(
          err,
          'Could not create placement achievement.'
        )
      )

    } finally {

      setSaving(false)
    }
  }


  return (
    <section className="card bg-base-100 shadow-sm border border-base-300">

      <div className="card-body">

        <div className="mb-4">

          <h2 className="text-xl font-bold">
            Add Student Achievement
          </h2>

          <p className="text-sm text-base-content/60 mt-1">
            Add a verified student's placement achievement.
          </p>

        </div>


        {error && (

          <div
            role="alert"
            className="alert alert-error text-sm mb-4"
          >
            <span>{error}</span>
          </div>

        )}


        {success && (

          <div
            role="alert"
            className="alert alert-success text-sm mb-4"
          >
            <span>{success}</span>
          </div>

        )}


        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >

          {/* Student */}

          <label className="form-control">

            <span className="label-text text-sm mb-1">
              Student
            </span>


            <select
              className="select select-bordered w-full"
              value={studentProfileId}
              onChange={(event) =>
                setStudentProfileId(
                  event.target.value
                )
              }
              disabled={saving}
              required
            >

              <option value="">
                Select verified student
              </option>


              {students.map((student) => (

                <option
                  key={student.id}
                  value={student.id}
                >

                  {student.fullName ||
                    'Unnamed Student'}

                  {' | '}

                  {student.department ||
                    'No Department'}

                  {' | '}

                  {student.enrollmentNo ||
                    'No Enrollment No.'}

                </option>

              ))}

            </select>

          </label>


          {/* Company */}

          <label className="form-control">

            <span className="label-text text-sm mb-1">
              Company Name
            </span>


            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. TCS"
              value={companyName}
              onChange={(event) =>
                setCompanyName(
                  event.target.value
                )
              }
              disabled={saving}
              required
            />

          </label>


          {/* CTC */}

          <label className="form-control">

            <span className="label-text text-sm mb-1">
              CTC Offered
            </span>


            <input
              type="number"
              min="0.01"
              step="0.01"
              className="input input-bordered w-full"
              placeholder="e.g. 8.5"
              value={ctcOffered}
              onChange={(event) =>
                setCtcOffered(
                  event.target.value
                )
              }
              disabled={saving}
              required
            />

          </label>


          {/* Image */}

          <label className="form-control">

            <span className="label-text text-sm mb-1">
              Achievement Image
            </span>


            <input
              id="achievement-image-input"
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full"
              onChange={handleImageChange}
              disabled={saving}
            />


            <span className="label-text-alt text-base-content/50 mt-1">
              Optional
            </span>

          </label>


          {image && (

            <div className="rounded-lg border border-base-300 bg-base-200 px-4 py-3">

              <p className="text-sm">
                Selected image:
              </p>


              <p className="text-sm font-medium mt-1 break-all">
                {image.name}
              </p>

            </div>

          )}


          <div className="flex justify-end">

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                saving ||
                students.length === 0
              }
            >

              {saving ? (

                <>
                  <span className="loading loading-spinner loading-sm" />
                  Adding...
                </>

              ) : (

                'Add Achievement'

              )}

            </button>

          </div>

        </form>

      </div>

    </section>
  )
}


/* ============================================================
   DELETE MODAL
============================================================ */

function DeleteAchievementModal({
  achievement,
  deleting,
  error,
  onCancel,
  onConfirm
}) {

  if (!achievement) {
    return null
  }


  return (
    <div className="modal modal-open">

      <div className="modal-box">

        <h3 className="font-bold text-lg">
          Delete Achievement
        </h3>


        <p className="text-sm text-base-content/70 mt-3">

          Are you sure you want to delete the placement
          achievement of{' '}

          <span className="font-semibold text-base-content">
            {achievement.studentName ||
              'this student'}
          </span>

          {' '}at{' '}

          <span className="font-semibold text-base-content">
            {achievement.companyName ||
              'this company'}
          </span>
          ?

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

              <>
                <span className="loading loading-spinner loading-sm" />
                Deleting...
              </>

            ) : (

              'Delete'

            )}

          </button>

        </div>

      </div>


      <form
        method="dialog"
        className="modal-backdrop"
        onClick={onCancel}
      >
        <button>close</button>
      </form>

    </div>
  )
}


/* ============================================================
   ACHIEVEMENT CARD
============================================================ */

function AchievementCard({
  achievement,
  onDelete
}) {

  return (
    <article className="card bg-base-100 border border-base-300 shadow-sm overflow-hidden">

      {achievement.imageUrl ? (

        <figure className="h-52 bg-base-200">

          <img
            src={achievement.imageUrl}
            alt={`${achievement.studentName || 'Student'} placement achievement`}
            className="w-full h-full object-cover"
          />

        </figure>

      ) : (

        <div className="h-52 bg-base-200 flex items-center justify-center">

          <div className="text-center px-4">

            <div className="text-4xl mb-2">
              🏆
            </div>


            <p className="text-sm text-base-content/50">
              No achievement image
            </p>

          </div>

        </div>

      )}


      <div className="card-body">

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <h3 className="font-bold text-lg truncate">
              {achievement.studentName ||
                'Unnamed Student'}
            </h3>


            <p className="text-sm text-base-content/60">
              {achievement.branch ||
                'Department not available'}
            </p>

          </div>


          <button
            type="button"
            className="btn btn-error btn-sm btn-outline shrink-0"
            onClick={() =>
              onDelete(achievement)
            }
          >
            Delete
          </button>

        </div>


        {/* Company */}

        <div className="rounded-lg bg-base-200 p-3 mt-4">

          <p className="text-xs text-base-content/50">
            Company
          </p>

          <p className="font-bold mt-1">
            {achievement.companyName ||
              '-'}
          </p>

        </div>


        <div className="grid grid-cols-2 gap-3 mt-3">

          <div className="rounded-lg bg-base-200 p-3">

            <p className="text-xs text-base-content/50">
              CTC Offered
            </p>


            <p className="font-bold mt-1">
              ₹{formatCtc(
                achievement.ctcOffered
              )}
            </p>

          </div>


          <div className="rounded-lg bg-base-200 p-3">

            <p className="text-xs text-base-content/50">
              Added On
            </p>


            <p className="font-medium text-sm mt-1">
              {formatDate(
                achievement.createdAt
              )}
            </p>

          </div>

        </div>

      </div>

    </article>
  )
}


/* ============================================================
   MAIN PAGE
============================================================ */

export default function TpoAchievements() {

  const [students, setStudents] =
    useState([])


  const [achievements, setAchievements] =
    useState([])


  const [studentSearch, setStudentSearch] =
    useState('')


  const [
    loadingStudents,
    setLoadingStudents
  ] = useState(true)


  const [
    loadingAchievements,
    setLoadingAchievements
  ] = useState(true)


  const [pageError, setPageError] =
    useState('')


  const [deleteTarget, setDeleteTarget] =
    useState(null)


  const [deleting, setDeleting] =
    useState(false)


  const [deleteError, setDeleteError] =
    useState('')


  async function loadStudents() {

    setLoadingStudents(true)


    try {

      const firstResult =
        await getAllStudents(0, 100)


      if (!firstResult?.success) {

        throw new Error(
          firstResult?.message ||
          'Failed to fetch students.'
        )
      }


      const firstPage =
        firstResult?.data


      let allStudents = [
        ...(firstPage?.content || [])
      ]


      const totalPages =
        firstPage?.totalPages || 1


      for (
        let page = 1;
        page < totalPages;
        page += 1
      ) {

        const result =
          await getAllStudents(
            page,
            100
          )


        if (!result?.success) {

          throw new Error(
            result?.message ||
            'Failed to fetch students.'
          )
        }


        allStudents = [
          ...allStudents,
          ...(result?.data?.content || [])
        ]
      }


      const verifiedStudents =
        allStudents.filter(
          (student) =>
            String(
              student?.verificationStatus ||
              ''
            ).toUpperCase() ===
            'VERIFIED'
        )


      setStudents(
        verifiedStudents
      )

    } catch (err) {

      console.error(
        'Failed to load verified students:',
        err
      )

      throw err

    } finally {

      setLoadingStudents(false)
    }
  }


  async function loadAchievements() {

    setLoadingAchievements(true)


    try {

      const result =
        await getPublicAchievements()


      if (!result?.success) {

        throw new Error(
          result?.message ||
          'Failed to fetch achievements.'
        )
      }


      setAchievements(
        Array.isArray(result?.data)
          ? result.data
          : []
      )

    } catch (err) {

      console.error(
        'Failed to load achievements:',
        err
      )

      throw err

    } finally {

      setLoadingAchievements(false)
    }
  }


  async function loadPageData() {

    setPageError('')


    try {

      await Promise.all([
        loadStudents(),
        loadAchievements()
      ])

    } catch (err) {

      setPageError(
        getErrorMessage(
          err,
          'Could not load achievement data.'
        )
      )
    }
  }


  useEffect(() => {
    loadPageData()
  }, [])


  const filteredStudents =
    useMemo(() => {

      const query =
        studentSearch
          .trim()
          .toLowerCase()


      if (!query) {
        return students
      }


      return students.filter(
        (student) => {

          const fullName =
            String(
              student.fullName || ''
            ).toLowerCase()


          const enrollmentNo =
            String(
              student.enrollmentNo ||
              ''
            ).toLowerCase()


          const department =
            String(
              student.department ||
              ''
            ).toLowerCase()


          return (
            fullName.includes(query) ||
            enrollmentNo.includes(query) ||
            department.includes(query)
          )
        }
      )

    }, [
      students,
      studentSearch
    ])


  async function handleCreated() {
    await loadAchievements()
  }


  function openDeleteModal(
    achievement
  ) {

    setDeleteTarget(
      achievement
    )

    setDeleteError('')
  }


  function closeDeleteModal() {

    if (deleting) {
      return
    }


    setDeleteTarget(null)
    setDeleteError('')
  }


  async function handleDelete() {

    if (!deleteTarget) {
      return
    }


    setDeleting(true)
    setDeleteError('')


    try {

      const result =
        await deleteAchievement(
          deleteTarget.id
        )


      if (!result?.success) {

        throw new Error(
          result?.message ||
          'Failed to delete achievement.'
        )
      }


      setAchievements(
        (previous) =>
          previous.filter(
            (achievement) =>
              achievement.id !==
              deleteTarget.id
          )
      )


      setDeleteTarget(null)

    } catch (err) {

      console.error(
        'Failed to delete achievement:',
        err
      )


      setDeleteError(
        getErrorMessage(
          err,
          'Could not delete the achievement.'
        )
      )

    } finally {

      setDeleting(false)
    }
  }


  return (
    <main className="flex flex-col gap-6">

      {/* Header */}

      <div>

        <h1 className="text-2xl font-bold">
          Student Achievements
        </h1>


        <p className="text-sm text-base-content/60 mt-1">
          Manage placement achievements displayed on PlaceIntel.
        </p>

      </div>


      {pageError && (

        <div
          role="alert"
          className="alert alert-error"
        >
          <span>{pageError}</span>
        </div>

      )}


      {/* Main sections */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Create */}

        <div className="xl:col-span-1">

          {loadingStudents ? (

            <section className="card bg-base-100 shadow-sm border border-base-300">

              <div className="card-body">

                <div className="flex justify-center py-10">

                  <span className="loading loading-spinner loading-lg" />

                </div>

              </div>

            </section>

          ) : (

            <>

              <div className="mb-3">

                <input
                  type="text"
                  className="input input-bordered w-full bg-base-100"
                  placeholder="Search verified students..."
                  value={studentSearch}
                  onChange={(event) =>
                    setStudentSearch(
                      event.target.value
                    )
                  }
                />

              </div>


              <CreateAchievementForm
                students={
                  filteredStudents
                }
                onCreated={
                  handleCreated
                }
              />

            </>

          )}

        </div>


        {/* Existing */}

        <div className="xl:col-span-2">

          <section className="card bg-base-100 shadow-sm border border-base-300">

            <div className="card-body">

              <div className="flex items-center justify-between gap-4 mb-4">

                <div>

                  <h2 className="text-xl font-bold">
                    Existing Achievements
                  </h2>


                  <p className="text-sm text-base-content/60 mt-1">

                    {achievements.length}

                    {' '}

                    achievement
                    {achievements.length === 1
                      ? ''
                      : 's'}

                  </p>

                </div>

              </div>


              {loadingAchievements ? (

                <div className="flex justify-center py-16">

                  <span className="loading loading-spinner loading-lg" />

                </div>

              ) : achievements.length === 0 ? (

                <div className="rounded-xl border border-dashed border-base-300 bg-base-200/50 p-10 text-center">

                  <div className="text-4xl mb-3">
                    🏆
                  </div>


                  <h3 className="font-semibold">
                    No achievements yet
                  </h3>


                  <p className="text-sm text-base-content/60 mt-1">
                    Add a verified student's first placement achievement.
                  </p>

                </div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {achievements.map(
                    (achievement) => (

                      <AchievementCard
                        key={achievement.id}
                        achievement={
                          achievement
                        }
                        onDelete={
                          openDeleteModal
                        }
                      />

                    )
                  )}

                </div>

              )}

            </div>

          </section>

        </div>

      </div>


      {/* Delete Modal */}

      <DeleteAchievementModal
        achievement={
          deleteTarget
        }
        deleting={
          deleting
        }
        error={
          deleteError
        }
        onCancel={
          closeDeleteModal
        }
        onConfirm={
          handleDelete
        }
      />

    </main>
  )
}