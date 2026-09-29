import axiosClient from "./axiosClient";

export async function login(email, password) {
  const response = await axiosClient.post("/auth/login", {
    email,
    password,
  });

  return response.data;
}

export async function register(
  fullName,
  email,
  password,
  enrollmentNo
) {
  const response = await axiosClient.post("/auth/register", {
    fullName,
    email,
    password,
    enrollmentNo,
  });

  return response.data;
}

/**
 * Logs out the current browser session.
 *
 * The JWT is HttpOnly, so the browser cannot delete it
 * directly. The backend expires the cookie and revokes
 * the JWT server-side.
 */
export async function logout() {
  const response = await axiosClient.post("/auth/logout");

  return response.data;
}