import { useEffect, useState } from 'react'

import {
    getAllTpos,
    createTpo,
    updateTpo,
    deleteTpo
} from '../api/adminApi'


function CreateTpoForm({ onCreated }) {

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [showPassword, setShowPassword] = useState(false)

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)


    async function handleSubmit(event) {

        event.preventDefault()

        setError('')
        setLoading(true)

        try {

            await createTpo(
                fullName.trim(),
                email.trim(),
                password
            )

            setFullName('')
            setEmail('')
            setPassword('')
            setShowPassword(false)

            onCreated()

        } catch (err) {

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                'Failed to create TPO account.'
            )

        } finally {

            setLoading(false)
        }
    }


    return (

        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
        >

            {error && (

                <div
                    role="alert"
                    className="alert alert-error text-sm"
                >
                    <span>{error}</span>
                </div>

            )}

            <label className="form-control">

                <span className="label-text text-sm mb-1">
                    Full Name
                </span>

                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                />

            </label>

            <label className="form-control">

                <span className="label-text text-sm mb-1">
                    Email
                </span>

                <input
                    type="email"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

            </label>

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
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowPassword(
                                previous => !previous
                            )
                        }
                        className="absolute right-0 top-0 h-full px-3 text-base-content/50 hover:text-base-content cursor-pointer"
                    >
                        {showPassword
                            ? 'Hide'
                            : 'Show'}
                    </button>

                </div>

            </label>

            <button
                type="submit"
                className="btn btn-primary mt-1"
                disabled={loading}
            >

                {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                ) : (
                    'Create TPO'
                )}

            </button>

        </form>

    )
}


function EditTpoForm({ tpo, onSaved, onCancel }) {

    const [fullName, setFullName] = useState(tpo.fullName)
    const [email, setEmail] = useState(tpo.email)
    const [enabled, setEnabled] = useState(tpo.enabled)

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)


    async function handleSubmit(event) {

        event.preventDefault()

        setError('')
        setLoading(true)

        try {

            await updateTpo(
                tpo.id,
                fullName.trim(),
                email.trim(),
                enabled
            )

            onSaved()

        } catch (err) {

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                'Failed to update TPO account.'
            )

        } finally {

            setLoading(false)
        }
    }


    return (

        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3"
        >

            {error && (

                <div
                    role="alert"
                    className="alert alert-error text-sm"
                >
                    <span>{error}</span>
                </div>

            )}

            <label className="form-control">

                <span className="label-text text-sm mb-1">
                    Full Name
                </span>

                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                />

            </label>

            <label className="form-control">

                <span className="label-text text-sm mb-1">
                    Email
                </span>

                <input
                    type="email"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

            </label>

            <label className="label cursor-pointer justify-start gap-3">

                <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={enabled}
                    onChange={(event) => setEnabled(event.target.checked)}
                />

                <span className="label-text text-sm">
                    Account Enabled
                </span>

            </label>

            <div className="flex gap-2 mt-1">

                <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={loading}
                >

                    {loading ? (
                        <span className="loading loading-spinner loading-sm" />
                    ) : (
                        'Save Changes'
                    )}

                </button>

                <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </button>

            </div>

        </form>

    )
}


function DeleteConfirmModal({ tpo, loading, onConfirm, onCancel }) {

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">


            {/* Backdrop */}

            <div
                className="absolute inset-0 bg-black/50"
                onClick={onCancel}
            />


            {/* Modal card */}

            <div className="relative card w-full max-w-sm bg-base-100 shadow-xl">

                <div className="card-body gap-4">

                    <h3 className="text-lg font-bold">
                        Delete TPO Account
                    </h3>

                    <p className="text-sm text-base-content/70">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold">
                            {tpo.fullName}
                        </span>{' '}
                        ({tpo.email})? This action cannot be undone.
                    </p>

                    <div className="flex justify-end gap-2 mt-2">

                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="btn btn-error"
                            onClick={onConfirm}
                            disabled={loading}
                        >

                            {loading ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                'Delete'
                            )}

                        </button>

                    </div>

                </div>

            </div>

        </div>

    )
}


function AdminTpoManagement() {

    const [tpos, setTpos] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingTpo, setEditingTpo] = useState(null)

    const [tpoPendingDelete, setTpoPendingDelete] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)


    async function loadTpos() {

        setLoading(true)
        setError('')

        try {

            const result = await getAllTpos()

            setTpos(result?.data ?? [])

        } catch (err) {

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                'Failed to load TPO accounts.'
            )

        } finally {

            setLoading(false)
        }
    }


    useEffect(() => {

        loadTpos()

    }, [])


    async function handleConfirmDelete() {

        if (!tpoPendingDelete) {
            return
        }

        setDeleteLoading(true)
        setError('')

        try {

            await deleteTpo(tpoPendingDelete.id)

            setTpoPendingDelete(null)

            await loadTpos()

        } catch (err) {

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                'Failed to delete TPO account.'
            )

        } finally {

            setDeleteLoading(false)
        }
    }


    return (

        <div className="flex flex-col gap-6">


            {/* Header */}

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-2xl font-bold">
                        TPO Management
                    </h1>

                    <p className="text-sm text-base-content/60 mt-1">
                        View, create, update, and remove TPO accounts.
                    </p>

                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowCreateForm(previous => !previous)}
                >
                    {showCreateForm ? 'Close' : '+ New TPO'}
                </button>

            </div>


            {/* Top-level error (list load / delete) */}

            {error && (

                <div
                    role="alert"
                    className="alert alert-error text-sm"
                >
                    <span>{error}</span>
                </div>

            )}


            {/* Create form */}

            {showCreateForm && (

                <div className="card bg-base-100 border border-base-300 shadow-sm max-w-md">

                    <div className="card-body">

                        <h2 className="text-lg font-semibold">
                            Create TPO Account
                        </h2>

                        <CreateTpoForm
                            onCreated={() => {

                                setShowCreateForm(false)

                                loadTpos()
                            }}
                        />

                    </div>

                </div>

            )}


            {/* Edit form */}

            {editingTpo && (

                <div className="card bg-base-100 border border-base-300 shadow-sm max-w-md">

                    <div className="card-body">

                        <h2 className="text-lg font-semibold">
                            Edit TPO Account
                        </h2>

                        <EditTpoForm
                            tpo={editingTpo}
                            onSaved={() => {

                                setEditingTpo(null)

                                loadTpos()
                            }}
                            onCancel={() => setEditingTpo(null)}
                        />

                    </div>

                </div>

            )}


            {/* TPO list */}

            <div className="card bg-base-100 border border-base-300 shadow-sm">

                <div className="card-body p-0">

                    {loading ? (

                        <div className="flex justify-center py-10">
                            <span className="loading loading-spinner loading-md" />
                        </div>

                    ) : tpos.length === 0 ? (

                        <p className="text-sm text-base-content/60 p-6">
                            No TPO accounts found.
                        </p>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="table">

                                <thead>

                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {tpos.map((tpo) => (

                                        <tr key={tpo.id}>

                                            <td>{tpo.fullName}</td>

                                            <td>{tpo.email}</td>

                                            <td>

                                                <span
                                                    className={`badge whitespace-nowrap px-4 py-3 text-sm ${
                                                        tpo.enabled
                                                            ? 'badge-success'
                                                            : 'badge-ghost'
                                                    }`}
                                                >
                                                    {tpo.enabled ? 'Enabled' : 'Disabled'}
                                                </span>

                                            </td>

                                            <td className="text-right">

                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        type="button"
                                                        className="btn btn-ghost btn-xs"
                                                        onClick={() => setEditingTpo(tpo)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-ghost btn-xs text-error"
                                                        onClick={() => setTpoPendingDelete(tpo)}
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

            </div>


            {/* Custom delete confirmation modal */}

            {tpoPendingDelete && (

                <DeleteConfirmModal
                    tpo={tpoPendingDelete}
                    loading={deleteLoading}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setTpoPendingDelete(null)}
                />

            )}

        </div>

    )
}


export default AdminTpoManagement