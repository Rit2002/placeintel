import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CompanyCatalog from "./pages/CompanyCatalog";
import CompanyDetail from "./pages/CompanyDetails";
import ProfileCompletion from "./pages/ProfileCompletion";

import TpoDashboard from "./pages/TpoDashboard";
import TpoCompanies from "./pages/TpoCompanies";
import TpoVerification from "./pages/TpoVerification";
import TpoStudents from "./pages/TpoStudents";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* =========================
          STUDENT ROUTES
      ========================== */}

      <Route
        path="/companies"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <CompanyCatalog />
          </ProtectedRoute>
        }
      />

      <Route
        path="/companies/:id"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <CompanyDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["STUDENT"]}>
            <ProfileCompletion />
          </ProtectedRoute>
        }
      />

      {/* =========================
          TPO ROUTES
      ========================== */}

      <Route
        path="/tpo"
        element={
          <ProtectedRoute allowedRoles={["TPO"]}>
            <TpoDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="companies" replace />} />

        <Route path="companies" element={<TpoCompanies />} />

        <Route path="verification" element={<TpoVerification />} />
        <Route path="students" element={<TpoStudents />} />
      </Route>
    </Routes>
  );
}

export default App;
