import axiosClient from './axiosClient'
import { streamSse } from './sseStream'

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



/**
 * Streams the prep-chat reply.
 *
 * This replaces the old sendPrepMessage(companyId, message) —
 * the backend endpoint no longer returns a single JSON body,
 * it streams the reply token-by-token, so there is no
 * non-streaming version of this call anymore.
 *
 * handlers:
 *   onToken(text)  - a chunk of the reply as it's generated
 *   onTool(name)   - a tool call started (e.g. web_search)
 *   onDone()       - stream finished; concatenated onToken text is the full reply
 *   onError(error)
 */
export async function streamPrepMessage(companyId, message, { onToken, onTool, onDone, onError } = {}) {
    const url = `${axiosClient.defaults.baseURL}/companies/${companyId}/prep-chat`

    await streamSse(url, { message }, {
        onMessage: (raw) => {
            try {
                onToken?.(JSON.parse(raw))
            } catch (e) {
                onError?.(e)
            }
        },
        onEvent: (name, data) => {
            if (name === 'tool') {
                onTool?.(data)
                return
            }

            if (name === 'error') {
                try {
                    const parsed = JSON.parse(data)
                    onError?.(new Error(parsed.message || 'Prep chat stream failed.'))
                } catch {
                    onError?.(new Error(data))
                }
            }
        },
        onDone,
        onError,
    })
}