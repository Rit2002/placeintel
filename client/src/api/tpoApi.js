import axiosClient from './axiosClient'

export async function getAllCompaniesForTpo(page = 0) {
  const response = await axiosClient.get(`/company/all?page=${page}&size=50`)
  return response.data
}

export async function createCompany(companyData) {
  const response = await axiosClient.post('/company/register', companyData)
  return response.data
}

export async function updateCompany(id, companyData) {
  const response = await axiosClient.put(`/company/update/${id}`, companyData)
  return response.data
}

export async function deleteCompany(id) {
  const response = await axiosClient.delete(`/company/delete/${id}`)
  return response.data
}

export async function getPendingStudents(page = 0) {
  const response = await axiosClient.get(`/tpo/students/pending?page=${page}&size=20`)
  return response.data
}

export async function verifyStudent(studentProfileId, status, note) {
  const response = await axiosClient.patch(`/students/${studentProfileId}/verify`, { status, note })
  return response.data
}



export async function getMyUserInfo() {
  const response = await axiosClient.get('/tpo/me')
  return response.data
}