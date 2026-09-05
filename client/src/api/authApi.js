import axiosClient from './axiosClient';

export async function login(email, password) {
    const response = await axiosClient.post('/auth/login', { email, password })

    return response.data
}

export async function register(fullName, email, password, enrollmentNo) {
    const response = await axiosClient.post('/auth/register', {
        fullName, email, password, enrollmentNo
    })

    return response.data
}