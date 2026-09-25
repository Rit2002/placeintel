import axiosClient from './axiosClient'


export async function getAllCompaniesForTpo(page = 0) {
  const response = await axiosClient.get(
    `/company/all?page=${page}&size=50`
  )

  return response.data
}


export async function createCompany(companyData) {
  const response = await axiosClient.post(
    '/company/register',
    companyData
  )

  return response.data
}


export async function updateCompany(id, companyData) {
  const response = await axiosClient.put(
    `/company/update/${id}`,
    companyData
  )

  return response.data
}


export async function deleteCompany(id) {
  const response = await axiosClient.delete(
    `/company/delete/${id}`
  )

  return response.data
}


/* ============================================================
   DRIVES
============================================================ */

export async function getAllDrives(
  page = 0,
  size = 20
) {
  const response = await axiosClient.get(
    `/drive/all?page=${page}&size=${size}`
  )

  return response.data
}


export async function createDrive(
  companyId,
  driveData
) {
  const response = await axiosClient.post(
    `/company/${companyId}/drive`,
    driveData
  )

  return response.data
}


export async function updateDrive(
  driveId,
  driveData
) {
  const response = await axiosClient.put(
    `/company/drive/update/${driveId}`,
    driveData
  )

  return response.data
}


export async function deleteDrive(driveId) {
  const response = await axiosClient.delete(
    `/company/drive/delete/${driveId}`
  )

  return response.data
}


export async function getDriveApplicants(
  driveId,
  page = 0,
  size = 20
) {
  const response = await axiosClient.get(
    `/tpo/drives/${driveId}/applicants?page=${page}&size=${size}`
  )

  return response.data
}


/* ============================================================
   TPO USER
============================================================ */

export async function getMyUserInfo() {
  const response = await axiosClient.get(
    '/tpo/me'
  )

  return response.data
}


/* ============================================================
   COMPANY RESOURCES
============================================================ */

export async function createBulkResources(
  companyId,
  resourcePayload
) {
  const response = await axiosClient.post(
    `/tpo/companies/${companyId}/resources/bulk`,
    resourcePayload
  )

  return response.data
}


/* ============================================================
   STUDENTS
============================================================ */

export async function getPendingStudents(
  page = 0
) {
  const response = await axiosClient.get(
    `/tpo/students/pending?page=${page}&size=20`
  )

  return response.data
}


export async function verifyStudent(
  studentProfileId,
  status,
  note
) {
  const response = await axiosClient.patch(
    `/students/${studentProfileId}/verify`,
    {
      status,
      note
    }
  )

  return response.data
}


export async function deleteStudent(
  studentProfileId
) {
  const response = await axiosClient.delete(
    `/tpo/students/${studentProfileId}`
  )

  return response.data
}


export async function getAllStudents(
  page = 0,
  size = 20
) {
  const response = await axiosClient.get(
    `/tpo/students?page=${page}&size=${size}`
  )

  return response.data
}


/* ============================================================
   PLACEMENT ACHIEVEMENTS
============================================================ */

/*
 * Public endpoint
 */
export async function getPublicAchievements() {
  const response = await axiosClient.get(
    '/achievements'
  )

  return response.data
}


/*
 * TPO-only create endpoint
 *
 * Backend expects:
 *
 * studentProfileId -> UUID
 * companyName      -> String
 * ctcOffered       -> Double
 * image            -> MultipartFile
 *
 * Scalar multipart values are sent as application/json
 * so Spring can deserialize them correctly.
 */
export async function createAchievement(
  studentProfileId,
  companyName,
  ctcOffered,
  image = null
) {

  const formData = new FormData()


  formData.append(
    'studentProfileId',
    new Blob(
      [
        JSON.stringify(studentProfileId)
      ],
      {
        type: 'application/json'
      }
    )
  )


  formData.append(
    'companyName',
    new Blob(
      [
        JSON.stringify(companyName.trim())
      ],
      {
        type: 'application/json'
      }
    )
  )


  formData.append(
    'ctcOffered',
    new Blob(
      [
        JSON.stringify(Number(ctcOffered))
      ],
      {
        type: 'application/json'
      }
    )
  )


  if (image) {

    formData.append(
      'image',
      image,
      image.name
    )
  }


  /*
   * IMPORTANT:
   *
   * Do NOT manually set:
   *
   * Content-Type: multipart/form-data
   *
   * Axios/browser will create the boundary automatically.
   */

  const response = await axiosClient.post(
    '/tpo/achievements',
    formData
  )


  return response.data
}


/*
 * TPO-only delete endpoint
 */
export async function deleteAchievement(
  achievementId
) {

  const response = await axiosClient.delete(
    `/tpo/achievements/${achievementId}`
  )

  return response.data
}