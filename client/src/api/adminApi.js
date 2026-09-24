import axiosClient from './axiosClient'


export async function createTpo(
    fullName,
    email,
    password
) {

    const response =
        await axiosClient.post(
            '/admin/tpo',
            {
                fullName,
                email,
                password
            }
        )

    return response.data
}


export async function getAllTpos() {

    const response =
        await axiosClient.get(
            '/admin/tpo'
        )

    return response.data
}


export async function updateTpo(
    id,
    fullName,
    email,
    enabled
) {

    const response =
        await axiosClient.put(
            `/admin/tpo/${id}`,
            {
                fullName,
                email,
                enabled
            }
        )

    return response.data
}


export async function deleteTpo(id) {

    const response =
        await axiosClient.delete(
            `/admin/tpo/${id}`
        )

    return response.data
}