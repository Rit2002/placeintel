import { useState } from 'react'

import { login } from '../api/authApi'
import { useAuth } from '../context/AuthContext'


function AdminLogin() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [showPassword, setShowPassword] =
        useState(false)

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)


    const { setUser } = useAuth()


    async function handleSubmit(event) {

        event.preventDefault()

        setError('')
        setLoading(true)


        try {

            const result = await login(
                email.trim(),
                password
            )


            /*
             * Backend response:
             *
             * {
             *   success: true,
             *   message: "Successfully Logged in.",
             *   data: {
             *      role: "ADMIN",
             *      student_id: null
             *   }
             * }
             */
            const role =
                result?.data?.role


            console.log(
                'Admin login response:',
                result
            )

            console.log(
                'Authenticated role:',
                role
            )


            /*
             * Only ADMIN accounts can use
             * the Admin login page.
             */
            if (role !== 'ADMIN') {

                setError(
                    'This account does not have administrator access.'
                )

                return
            }


            /*
             * Save Admin authentication state.
             *
             * AuthContext also stores this in
             * localStorage.
             */
            setUser({
                role: 'ADMIN'
            })


            console.log(
                'Admin authentication state saved.'
            )


            /*
             * Redirect to Admin dashboard.
             *
             * We use a full navigation here so
             * AuthContext is initialized again
             * from localStorage.
             */
            window.location.replace('/admin')

        } catch (err) {

            console.error(
                'Admin login failed:',
                err
            )


            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                'Invalid administrator credentials.'
            )

        } finally {

            setLoading(false)
        }
    }


    return (

        <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">

            <div className="card w-full max-w-md bg-base-100 shadow-xl">

                <div className="card-body gap-5">


                    {/* Header */}

                    <div className="text-center">

                        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary text-primary-content flex items-center justify-center text-xl font-bold">
                            PI
                        </div>


                        <h1 className="text-2xl font-bold mt-4">
                            PlaceIntel Admin
                        </h1>


                        <p className="text-sm text-base-content/60 mt-1">
                            Administrator sign in
                        </p>

                    </div>


                    {/* Error */}

                    {error && (

                        <div
                            role="alert"
                            className="alert alert-error text-sm"
                        >
                            <span>
                                {error}
                            </span>
                        </div>

                    )}


                    {/* Login form */}

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >


                        {/* Email */}

                        <label className="form-control">

                            <span className="label-text text-sm mb-1">
                                Administrator Email
                            </span>


                            <input
                                type="email"
                                className="input input-bordered w-full"
                                placeholder="admin@placeintel.com"
                                value={email}
                                onChange={(event) => {

                                    setEmail(
                                        event.target.value
                                    )

                                    setError('')
                                }}
                                required
                            />

                        </label>


                        {/* Password */}

                        <label className="form-control">

                            <span className="label-text text-sm mb-1">
                                Password
                            </span>


                            <div className="relative">

                                <input
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    className="input input-bordered w-full pr-12"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(event) => {

                                        setPassword(
                                            event.target.value
                                        )

                                        setError('')
                                    }}
                                    required
                                />


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            previous =>
                                                !previous
                                        )
                                    }
                                    className="absolute right-0 top-0 h-full px-3 text-base-content/50 hover:text-base-content"
                                >
                                    {showPassword
                                        ? 'Hide'
                                        : 'Show'}
                                </button>

                            </div>

                        </label>


                        {/* Login button */}

                        <button
                            type="submit"
                            className="btn btn-primary w-full mt-2"
                            disabled={loading}
                        >

                            {loading ? (

                                <span className="loading loading-spinner loading-sm" />

                            ) : (

                                'Sign In'

                            )}

                        </button>

                    </form>


                    <div className="text-center">

                        <p className="text-xs text-base-content/40">
                            Restricted administrator area
                        </p>

                    </div>

                </div>

            </div>

        </div>
    )
}


export default AdminLogin