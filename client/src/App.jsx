import { Routes, Route } from "react-router-dom";
import Login from './pages/Login'
import Register from "./pages/Register";
import CompanyCatalog from './pages/CompanyCatalog'
import CompanyDetail from './pages/CompanyDetails'
import ProfileCompletion from './pages/ProfileCompletion'
import TpoDashboard from './pages/TpoDashboard'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />}></Route> 

      <Route path="/register" element={<Register />}></Route> 

      <Route path="/companies" element={ <ProtectedRoute allowedRoles={['STUDENT']}><CompanyCatalog /></ProtectedRoute>}></Route> 

      <Route path="/companies/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><CompanyDetail /></ProtectedRoute>}></Route>

      <Route path="/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><ProfileCompletion /></ProtectedRoute>}></Route> 

      <Route path="/tpo" element={<ProtectedRoute allowedRoles={['TPO']}><TpoDashboard /></ProtectedRoute>}></Route>      
    </Routes>
  )
}

export default App;