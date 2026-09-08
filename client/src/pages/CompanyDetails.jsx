import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getCompanyById } from '../api/companyApi'
import Navbar from '../components/Navbar'

function groupDrivesByYear(drives) {
  const groups = {}

  for (const drive of drives) {
    const year = drive.driveDate
      ? drive.driveDate.slice(0, 4)
      : 'Unscheduled'

    if (!groups[year]) groups[year] = []

    groups[year].push(drive)
  }

  return groups
}

function RoundRow({ round }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-base-300 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-base-100 hover:bg-base-200 transition-colors"
      >
        <span className="font-medium text-sm">
          Round {round.sequenceNumber}: {round.roundName}
        </span>

        <span
          className={`transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="px-4 py-3 bg-base-200 text-sm flex flex-col gap-1.5 border-t border-base-300">
          {round.durationMinutes && (
            <p>
              <span className="text-base-content/50">Duration:</span>{' '}
              {round.durationMinutes} minutes
            </p>
          )}

          {round.difficulty && (
            <p>
              <span className="text-base-content/50">Difficulty:</span>{' '}
              {round.difficulty}
            </p>
          )}

          {round.description && (
            <p>
              <span className="text-base-content/50">Details:</span>{' '}
              {round.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function CompanyDetail() {
  const { id } = useParams()

  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedYear, setSelectedYear] = useState(null)

  useEffect(() => {
    loadCompany()
  }, [id])

  async function loadCompany() {
    setLoading(true)
    setError('')

    try {
      const result = await getCompanyById(id)

      setCompany(result.data)

      const years = groupDrivesByYear(result.data.drives || [])
      const firstYear = Object.keys(years).sort().reverse()[0]

      setSelectedYear(firstYear || null)
    } catch (err) {
      if (err.response?.status === 403) {
        setError(
          'Your profile must be verified before viewing company details.'
        )
      } else {
        setError('Could not load this company.')
      }
    } finally {
      setLoading(false)
    }
  }

  const drivesByYear = useMemo(
    () => groupDrivesByYear(company?.drives || []),
    [company]
  )

  const news =
    company?.resources?.filter((r) => r.resourceType === 'NEWS') || []

  const prepMaterial =
    company?.resources?.filter((r) => r.resourceType === 'PREP_MATERIAL') || []

  const interviewExperience =
    company?.resources?.filter(
      (r) =>
        r.resourceType === 'INTERVIEW_EXPERIENCE_VIDEO' ||
        r.resourceType === 'INTERVIEW_EXPERIENCE_BLOG'
    ) || []

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

  if (error) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />

        <div className="max-w-2xl mx-auto px-6 py-12">
          <div role="alert" className="alert alert-warning">
            <span>{error}</span>
          </div>
        </div>
      </div>
    )
  }

  const years = Object.keys(drivesByYear).sort().reverse()

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Section 1: header */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body flex-row items-start gap-5">

            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-20 h-20 rounded-xl object-contain bg-base-200 p-2 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-neutral text-neutral-content flex items-center justify-center text-3xl font-semibold shrink-0">
                {company.name?.[0]}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold">
                {company.name}
              </h1>

              <div className="badge badge-outline w-fit">
                {company.companyType?.replace('_', ' ')}
              </div>

              <p className="text-sm text-base-content/70 mt-2">
                {company.businessInfo || company.shortDescription}
              </p>

              {company.careersPageUrl && (
                <a
                  href={company.careersPageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="link link-primary text-sm mt-1 w-fit"
                >
                  Careers page ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: news */}
        {news.length > 0 && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg mb-2">
                Recent News
              </h2>

              <div className="flex flex-col gap-2">
                {news.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm p-3 rounded-lg border border-base-300 hover:bg-base-200 transition-colors"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 3: drives by year */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-lg mb-3">
              Drives
            </h2>

            {years.length === 0 ? (
              <p className="text-sm text-base-content/60">
                No drives recorded yet for this company.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-5">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`btn btn-sm rounded-full ${
                        selectedYear === year
                          ? 'btn-primary'
                          : 'btn-outline'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-5">
                  {(drivesByYear[selectedYear] || []).map((drive) => (
                    <div
                      key={drive.id}
                      className="border border-base-300 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <h3 className="font-semibold">
                          {drive.roleOffered}
                        </h3>

                        <div className="flex gap-2">
                          <span className="badge badge-sm">
                            {drive.employmentType?.replace('_', ' ')}
                          </span>

                          <span className="badge badge-sm badge-outline">
                            {drive.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-base-content/70 flex flex-wrap gap-x-4 gap-y-1 mb-3">
                        {drive.ctcOffered && (
                          <span>
                            CTC: ₹{drive.ctcOffered.toLocaleString()}
                          </span>
                        )}

                        {drive.cutOffCgpa && (
                          <span>
                            CGPA cutoff: {drive.cutOffCgpa}
                          </span>
                        )}
                      </div>

                      {drive.requiredSkills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {drive.requiredSkills.map((skill) => (
                            <span
                              key={skill}
                              className="badge badge-ghost badge-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {drive.rounds?.length > 0 && (
                        <div className="flex flex-col gap-2">
                          {drive.rounds
                            .slice()
                            .sort(
                              (a, b) =>
                                a.sequenceNumber - b.sequenceNumber
                            )
                            .map((round) => (
                              <RoundRow
                                key={round.id}
                                round={round}
                              />
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg mb-2">
                Prep Material
              </h2>

              {prepMaterial.length === 0 ? (
                <p className="text-sm text-base-content/60">
                  Nothing added yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {prepMaterial.map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm p-3 rounded-lg border border-base-300 hover:bg-base-200 transition-colors"
                    >
                      {r.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <h2 className="card-title text-lg mb-2">
                Interview Experiences
              </h2>

              {interviewExperience.length === 0 ? (
                <p className="text-sm text-base-content/60">
                  Nothing added yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {interviewExperience.map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm p-3 rounded-lg border border-base-300 hover:bg-base-200 transition-colors"
                    >
                      {r.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default CompanyDetail