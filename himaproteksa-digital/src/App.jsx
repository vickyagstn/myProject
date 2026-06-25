import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Auth
import Login from "./pages/auth/Login";

// Layouts
import AdminLayout from "./components/layout/Sidebar";
import AnggotaLayout from "./components/layout/SidebarAnggota";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Anggota from "./pages/admin/Anggota";
import Kegiatan from "./pages/admin/Kegiatan";
import Notulen from "./pages/admin/Notulen";
import Pengumuman from "./pages/admin/Pengumuman";
import AbsensiRapat from "./pages/admin/AbsensiRapat";
import Dokumentasi from "./pages/admin/Dokumentasi";
import Laporan from "./pages/admin/Laporan";

// Anggota Pages
import DashboardAnggota from "./pages/anggota/Dashboard";
import KegiatanAnggota from "./pages/anggota/Kegiatan";
import PengumumanAnggota from "./pages/anggota/Pengumuman";
import NotulenAnggota from "./pages/anggota/NotulenRapat";
import DokumentasiAnggota from "./pages/anggota/Dokumentasi";
import ProfilAnggota from "./pages/anggota/Profil";


function ProtectedRoute({ children, role }) {
  const { user, userData, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #800020', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (role && userData?.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function HomeRedirect() {
  const { user, userData, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (userData?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (userData?.role === "anggota") return <Navigate to="/anggota/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />

          {/* ===== ADMIN ===== */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="anggota" element={<Anggota />} />
            <Route path="kegiatan" element={<Kegiatan />} />
            <Route path="absensi" element={<AbsensiRapat />} />
            <Route path="notulen" element={<Notulen />} />
            <Route path="pengumuman" element={<Pengumuman />} />
            <Route path="dokumentasi" element={<Dokumentasi />} />
            <Route path="laporan" element={<Laporan />} />
          </Route>

          {/* ===== ANGGOTA ===== */}
          <Route path="/anggota" element={
            <ProtectedRoute role="anggota">
              <AnggotaLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardAnggota />} />
            <Route path="kegiatan" element={<KegiatanAnggota />} />
            <Route path="pengumuman" element={<PengumumanAnggota />} />
            <Route path="notulen" element={<NotulenAnggota />} />
            <Route path="dokumentasi" element={<DokumentasiAnggota />} />
            <Route path="profil" element={<ProfilAnggota />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}