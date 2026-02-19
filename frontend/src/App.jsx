import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

//pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";
import TherapistDashboardPage from "./pages/TherapistDashboardPage";
import RoomPage from "./pages/RoomPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/*Default */}
          <Route path="/" element={<Navigate to ="/login" replace />} />

          {/*Auth Pages*/}

          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>

          {/* protected and soon-to-be */}
          <Route path="/dashboard/client" element={
            <ProtectedRoute>
              <ClientDashboardPage/>
            </ProtectedRoute>
            } />
          <Route path="dashboard/therapist" element={
            <ProtectedRoute>
              <TherapistDashboardPage/>
            </ProtectedRoute>
            } />
          <Route path="/rooms/:roomId" element={
            <ProtectedRoute>
              <RoomPage/>
            </ProtectedRoute>
            } />

          {/*fallback? */}

          <Route path="*" element={<Navigate to ="/login" replace />}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;