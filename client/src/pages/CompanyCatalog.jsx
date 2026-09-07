import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCompanies, searchCompanies, searchEligibleCompanies } from '../api/companyApi'
import Navbar from '../components/Navbar'

const COMPANY_TYPES = ['PRODUCT_BASED', 'SERVICE_BASED', 'STARTUP', 'OTHER']

function CompanyCatalog() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [companyType, setCompanyType] = useState('')

  const [cgpa, setCgpa] = useState('')
  const [tenth, setTenth] = useState('')
  const [twelfth, setTwelfth] = useState('')
  const [backlogs, setBacklogs] = useState('')
  const [skillsInput, setSkillsInput] = useState('')

  useEffect(() => {
    loadCompanies()
  }, [])

  async function loadCompanies() {
    setLoading(true)
    try {
      const result = await getCompanies()
      setCompanies(result.data.content)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleNameSearch(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await searchCompanies({ name, companyType })
      setCompanies(result.data.content)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleEligibilityFilter(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const skills = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const result = await searchEligibleCompanies({ cgpa, tenth, twelfth, backlogs, skills })
      setCompanies(result.data.content)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleClearAll() {
    setName('')
    setCompanyType('')
    setCgpa('')
    setTenth('')
    setTwelfth('')
    setBacklogs('')
    setSkillsInput('')
    loadCompanies()
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Search bar */}
        <form onSubmit={handleNameSearch} className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search companies by name..."
            className="input input-bordered flex-1 min-w-64 bg-base-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="select select-bordered bg-base-100"
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
          >
            <option value="">All types</option>
            {COMPANY_TYPES.map((type) => (
              <option key={type} value={type}>{type.replace('_', ' ')}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        <div className="flex gap-6">

          {/* Filter sidebar */}
          <aside className="w-72 shrink-0">
            <div className="card bg-base-100 shadow-sm p-5 sticky top-6">
              <h2 className="font-semibold mb-4">Am I eligible?</h2>

              <form onSubmit={handleEligibilityFilter} className="flex flex-col gap-3">
                <label className="form-control">
                  <span className="label-text text-sm mb-1">My CGPA</span>
                  <input
                    type="number" step="0.1" min="0" max="10"
                    placeholder="e.g. 7.5"
                    className="input input-bordered input-sm w-full"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                  />
                </label>

                <label className="form-control">
                  <span className="label-text text-sm mb-1">10th percentage</span>
                  <input
                    type="number" min="0" max="100"
                    placeholder="e.g. 60"
                    className="input input-bordered input-sm w-full"
                    value={tenth}
                    onChange={(e) => setTenth(e.target.value)}
                  />
                </label>

                <label className="form-control">
                  <span className="label-text text-sm mb-1">12th percentage</span>
                  <input
                    type="number" min="0" max="100"
                    placeholder="e.g. 60"
                    className="input input-bordered input-sm w-full"
                    value={twelfth}
                    onChange={(e) => setTwelfth(e.target.value)}
                  />
                </label>

                <label className="form-control">
                  <span className="label-text text-sm mb-1">Active backlogs</span>
                  <input
                    type="number" min="0"
                    placeholder="e.g. 0"
                    className="input input-bordered input-sm w-full"
                    value={backlogs}
                    onChange={(e) => setBacklogs(e.target.value)}
                  />
                </label>

                <label className="form-control">
                  <span className="label-text text-sm mb-1">Skills</span>
                  <input
                    type="text"
                    placeholder="Java, SQL, React"
                    className="input input-bordered input-sm w-full"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                  />
                  <span className="label-text-alt text-xs mt-1 text-base-content/50">
                    Comma-separated
                  </span>
                </label>

                <button type="submit" className="btn btn-primary btn-sm w-full mt-1">
                  Filter
                </button>
                <button type="button" className="btn btn-ghost btn-sm w-full" onClick={handleClearAll}>
                  Clear all
                </button>
              </form>
            </div>
          </aside>

          {/* Company grid */}
          <main className="flex-1">
            <h1 className="text-2xl font-bold mb-6">Companies</h1>

            {loading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : companies.length === 0 ? (
              <p className="text-center text-base-content/60 py-12">No companies found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <Link
                    key={company.id}
                    to={`/companies/${company.id}`}
                    className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-300"
                  >
                    <div className="card-body gap-3">
                      <div className="flex items-center gap-3">
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={company.name}
                            className="w-10 h-10 rounded object-contain bg-base-200 p-1"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-neutral text-neutral-content flex items-center justify-center font-semibold">
                            {company.name?.[0]}
                          </div>
                        )}
                        <h2 className="card-title text-base">{company.name}</h2>
                      </div>

                      <div className="badge badge-outline badge-sm w-fit">
                        {company.companyType?.replace('_', ' ')}
                      </div>

                      <p className="text-sm text-base-content/60 line-clamp-2">
                        {company.shortDescription}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  )
}

export default CompanyCatalog