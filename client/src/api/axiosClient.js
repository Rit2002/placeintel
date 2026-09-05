import axios from "axios";

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/placeintel/api/v1',
  withCredentials: true,
})

export default axiosClient