import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enrollmentNo, setEnrollmentNo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await register(fullName, email, password, enrollmentNo)

      setUser({ role: result.data.role })

      navigate('/companies')

    } catch (err) {

      console.log(err.response);

      const message = err.response?.data?.error || 'Registration failed. Please try again.'

      setError(message)

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">

          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold text-primary">PlaceIntel</h1>
            <p className="text-sm text-base-content/60 mt-1">
              Create your student account
            </p>
          </div>

          {error && (
            <div role="alert" className="alert alert-error py-2 text-sm">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="form-control">
              <span className="label-text text-sm mb-1">Full Name</span>
              <input
                type="text"
                placeholder="Ritesh Mohan Chavan"
                className="input input-bordered w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text text-sm mb-1">Email</span>
              <input
                type="email"
                placeholder="you@college.edu"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text text-sm mb-1">Enrollment Number</span>
              <input
                type="text"
                placeholder="CS2024001"
                className="input input-bordered w-full"
                value={enrollmentNo}
                onChange={(e) => setEnrollmentNo(e.target.value)}
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text text-sm mb-1">Password</span>
              <input
                type="password"
                placeholder="At least 8 characters"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60 mt-2">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Register