import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import {
  collection, getDocs, query, orderBy, deleteDoc, doc
} from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function AbsensiRapat() {
  const [meetings, setMeetings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [meetSnap, userSnap] = await Promise.all([
        getDocs(query(collection(db, "meetings"), orderBy("date", "desc"))),
        getDocs(collection(db, "users")),
      ]);
      setMeetings(meetSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllUsers(userSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === "anggota"));
    } catch (e) {
      toast.error("Gagal memuat data");
    }
    setLoading(false);
  };

  const fetchAttendance = async (meetingId) => {
    try {
      const snap = await getDocs(collection(db, "attendance"));
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.meetingId === meetingId);
      setAttendance(data);
    } catch (e) {
      toast.error("Gagal memuat absensi");
    }
  };

  const handleSelect = (meeting) => {
    setSelected(meeting);
    setSearch("");
    fetchAttendance(meeting.id);
  };

  const handleHapusAbsen = async (absenId) => {
    if (!confirm("Hapus data absensi ini?")) return;
    try {
      await deleteDoc(doc(db, "attendance", absenId));
      toast.success("Data absensi dihapus");
      fetchAttendance(selected.id);
    } catch (e) {
      toast.error("Gagal menghapus");
    }
  };

  // Gabungkan anggota yang belum absen
  const getMergedData = () => {
    const hadir = attendance.map(a => ({
      ...a,
      isAbsent: false,
    }));
    const hadirIds = attendance.map(a => a.userId);
    const belumAbsen = allUsers
      .filter(u => !hadirIds.includes(u.id))
      .map(u => ({
        id: null,
        userId: u.id,
        userName: u.name,
        photoUrl: null,
        checkInTime: null,
        status: "Tidak Hadir",
        isAbsent: true,
      }));
    return [...hadir, ...belumAbsen].filter(d =>
      d.userName?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      "Hadir": "bg-green-100 text-green-700",
      "Terlambat": "bg-yellow-100 text-yellow-700",
      "Tidak Hadir": "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  const merged = selected ? getMergedData() : [];
  const totalHadir = attendance.filter(a => a.status === "Hadir").length;
  const totalTerlambat = attendance.filter(a => a.status === "Terlambat").length;
  const totalTidakHadir = allUsers.length - attendance.length;
  const persen = allUsers.length > 0
    ? Math.round((attendance.length / allUsers.length) * 100) : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Absensi Rapat</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Kiri: Daftar Rapat */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Daftar Rapat
          </h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Memuat...</p>
          ) : meetings.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-400 shadow">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">Belum ada rapat</p>
            </div>
          ) : (
            meetings.map(m => (
              <div
                key={m.id}
                onClick={() => handleSelect(m)}
                className={`cursor-pointer bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border-l-4 ${
                  selected?.id === m.id
                    ? "border-[#800020] bg-red-50"
                    : "border-transparent"
                }`}
              >
                <p className="font-semibold text-gray-800 text-sm">{m.title}</p>
                <p className="text-xs text-gray-500 mt-1">📅 {m.date}</p>
                <p className="text-xs text-gray-500">🕐 {m.startTime} – {m.endTime}</p>
                <p className="text-xs text-gray-500">📍 {m.location}</p>
              </div>
            ))
          )}
        </div>

        {/* Kanan: Detail Absensi */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-white rounded-xl p-16 text-center text-gray-400 shadow">
              <p className="text-5xl mb-3">👈</p>
              <p>Pilih rapat untuk melihat absensi</p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Header */}
              <div className="bg-white rounded-xl shadow p-5">
                <h2 className="text-lg font-bold text-[#800020]">{selected.title}</h2>
                <p className="text-sm text-gray-500">
                  {selected.date} • {selected.startTime} – {selected.endTime} • 📍 {selected.location}
                </p>

                {/* Statistik */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-green-600">{totalHadir}</p>
                    <p className="text-xs text-green-600">Hadir</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-yellow-600">{totalTerlambat}</p>
                    <p className="text-xs text-yellow-600">Terlambat</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-red-600">{totalTidakHadir}</p>
                    <p className="text-xs text-red-600">Tidak Hadir</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-blue-600">{persen}%</p>
                    <p className="text-xs text-blue-600">Kehadiran</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#800020] h-2 rounded-full transition-all"
                      style={{ width: `${persen}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">{persen}% kehadiran</p>
                </div>
              </div>

              {/* Tabel */}
              <div className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">Daftar Kehadiran</h3>
                  <input
                    type="text"
                    placeholder="Cari nama..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Foto</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Nama</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Waktu Absen</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Status</th>
                        <th className="px-3 py-2 text-center text-gray-500 font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {merged.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-400">
                            Belum ada data absensi
                          </td>
                        </tr>
                      ) : (
                        merged.map((a, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition">
                            <td className="px-3 py-2">
                              {a.photoUrl ? (
                                <img
                                  src={a.photoUrl}
                                  alt={a.userName}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 cursor-pointer"
                                  onClick={() => window.open(a.photoUrl, "_blank")}
                                  title="Klik untuk lihat foto"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg">
                                  👤
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 font-medium text-gray-800">{a.userName}</td>
                            <td className="px-3 py-2 text-gray-500">
                              {a.checkInTime
                                ? (a.checkInTime?.toDate
                                  ? a.checkInTime.toDate().toLocaleTimeString("id-ID")
                                  : a.checkInTime)
                                : "-"}
                            </td>
                            <td className="px-3 py-2">{getStatusBadge(a.status)}</td>
                            <td className="px-3 py-2 text-center">
                              {!a.isAbsent && a.id && (
                                <button
                                  onClick={() => handleHapusAbsen(a.id)}
                                  className="text-red-500 hover:text-red-700 text-xs underline"
                                >
                                  Hapus
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}