import axiosClient from './axiosClient'

export async function getMyProfile() {
  const response = await axiosClient.get('/students/me/profile')
  return response.data
}

export async function updateMyProfile(profileData) {
  const response = await axiosClient.put('/students/me/profile', profileData)
  return response.data
}