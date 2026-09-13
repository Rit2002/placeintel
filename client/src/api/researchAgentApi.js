import axiosClient from './axiosClient'

export async function researchCompany(companyName, role) {
  const response = await axiosClient.post('/tpo/company/research', {
    company_name: companyName,
    role: role,
  })
  return response.data
}