import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { setUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      setUser({ role: result.data.role })

      if (result.data.role === 'STUDENT') {
        navigate('/companies')
      } else if (result.data.role === 'TPO') {
        navigate('/tpo')
      }
    } catch (err) {
      setError('Invalid email or password')
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
              Sign in to continue
            </p>
          </div>

          {error && (
            <div role="alert" className="alert alert-error py-2 text-sm">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* Email */}
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

            {/* Password */}
            <label className="form-control">
              <span className="label-text text-sm mb-1">Password</span>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input input-bordered w-full pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

               <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-base-content/60 hover:text-base-content cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    // Eye Off
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.5 12c1.756 3.905 5.617 6.5 10.5 6.5 1.53 0 2.984-.327 4.298-.915M6.228 6.228A10.45 10.45 0 0112 4.5c4.883 0 8.744 2.595 10.5 6.5a10.523 10.523 0 01-4.151 4.742M6.228 6.228L3 3m3.228 3.228l3.084 3.084m6.46 6.46L21 21m-5.228-5.228l-3.084-3.084M9.312 9.312a3 3 0 104.243 4.243"
                      />
                    </svg>
                  ) : (
                    // Eye
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6-9.75-6-9.75-6z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60 mt-2">
            Don't have an account?{' '}
            <Link to="/register" className="link link-primary">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login