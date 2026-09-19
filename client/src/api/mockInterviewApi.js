import axiosClient from './axiosClient'

export async function takeMockInterviewTurn(payload) {

    const response = await axiosClient.post(
        '/students/me/mock-interview/turn',
        payload
    )

    return response.data
}