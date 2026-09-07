import axiosClient from './axiosClient'

export async function getCompanies(page = 0) {
  const response = await axiosClient.get(`/company/all?page=${page}&size=20`)
  return response.data
}

export async function searchCompanies({ name, companyType, page = 0 }) {
  const params = new URLSearchParams({ page, size: 20 })
  if (name) params.append('name', name)
  if (companyType) params.append('companyType', companyType)

  const response = await axiosClient.get(`/company/search?${params.toString()}`)
  return response.data
}

export async function searchEligibleCompanies({ cgpa, tenth, twelfth, backlogs, skills, page = 0 }) {
  const params = new URLSearchParams({ page, size: 20 })
  if (cgpa) params.append('cgpa', cgpa)
  if (tenth) params.append('tenth', tenth)
  if (twelfth) params.append('twelfth', twelfth)
  if (backlogs !== '' && backlogs != null) params.append('backlogs', backlogs)
  if (skills && skills.length > 0) skills.forEach((s) => params.append('skills', s))

  const response = await axiosClient.get(`/company/eligible-search?${params.toString()}`)
  return response.data
}

export async function getCompanyById(id) {
  const response = await axiosClient.get(`/company/${id}`)
  return response.data
}