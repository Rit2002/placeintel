import axiosClient from './axiosClient'

export async function getMyProfile() {
  const response = await axiosClient.get('/students/me/profile')
  return response.data
}

export async function updateMyProfile(profileData) {
  const response = await axiosClient.put('/students/me/profile', profileData)
  return response.data
}


// Apply to Drive
export async function applyToDrive(
  driveId,
  resumeFile
) {
  const formData = new FormData()

  formData.append(
    'resume',
    resumeFile
  )

  const response = await axiosClient.post(
    `/students/me/applications/${driveId}`,
    formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  )

  return response.data
}


// Get application
export async function getMyApplications(
  page = 0,
  size = 20
) {
  const response = await axiosClient.get(
    `/students/me/applications?page=${page}&size=${size}`
  )

  return response.data
}


export async function getStudentDrives(
  page = 0,
  size = 20
) {
  const response = await axiosClient.get(
    `/students/drives?page=${page}&size=${size}`
  )

  return response.data
}