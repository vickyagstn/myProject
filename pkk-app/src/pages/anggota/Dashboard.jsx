import { useEffect, useState } from 'react'
import { auth, db } from '../../firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export default function DashboardAnggota() {
  const [nama, setNama] = useState('')
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7))
  const [statusBayar, setStatusBayar] = useState(null)
  const [arisanUang, setArisanUang] = useState([])
  const [arisanBarang, setArisanBarang] = useState([])
  const [pengumuman, setPengumuman] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser
      if (!user) return

      const userSnap = await getDoc(doc(db, 'users', user.uid))
      if (userSnap.exists()) setNama(userSnap.data().nama)

      const paySnap = await getDocs(collection(db, 'payments'))
      const payData = paySnap.docs.map(d => d.data())
        .find(d => d.userId === user.uid && d.bulan === bulan)
      setStatusBayar(payData?.status || 'belum')

      const uangSnap = await getDocs(query(collection(db, 'arisan_uang'), orderBy('putaran')))
      setArisanUang(uangSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      const barangSnap = await getDocs(query(collection(db, 'arisan_barang'), orderBy('putaran')))
      setArisanBarang(barangSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      const annSnap = await getDocs(query(collection(db, 'announcements'), orderBy('tanggal', 'desc')))
      setPengumuman(annSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      setLoading(false)
    }
    fetchData()
  }, [bulan])

  const handleLogout = async () => {
    if (confirm('Yakin mau logout?')) {
      await signOut(auth)
      navigate('/login')
    }
  }

  const getStatusColor = (s) => {
    if (s === 'lunas') return 'bg-green-100 text-green-700 border-green-200'
    if (s === 'sebagian') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  const getStatusText = (s) => {
    if (s === 'lunas') return '✅ Lunas'
    if (s === 'sebagian') return '⚠️ Sebagian Bayar'
    return '❌ Belum Bayar'
  }

  const arisanUangTerakhir = arisanUang[arisanUang.length - 1]
  const arisanBarangTerakhir = arisanBarang[arisanBarang.length - 1]
  const pengumumanTerbaru = pengumuman[0]

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-green-50">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🌿</div>
        <p className="text-green-700 font-medium">Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-500 text-white">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-200 text-xs mb-1">🌿 ArtaWarga PKK</p>
              <h1 className="text-xl font-bold">Halo, {nama}! 👋</h1>
              <p className="text-green-200 text-xs mt-1">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button onClick={handleLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-full text-xs font-medium transition">
              Logout 🚪
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* 🔔 Notifikasi Arisan Berikutnya */}
        {pengumumanTerbaru && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔔</span>
              <p className="text-amber-100 text-xs font-semibold uppercase tracking-wider">Info Arisan Berikutnya</p>
            </div>
            <p className="font-bold text-lg mb-1">{pengumumanTerbaru.judul}</p>
            <p className="text-amber-100 text-sm leading-relaxed">{pengumumanTerbaru.isi}</p>
            <div className="flex items-center gap-1 mt-3">
              <span className="text-amber-200 text-xs">📅</span>
              <p className="text-amber-200 text-xs">{pengumumanTerbaru.tanggal}</p>
            </div>
          </div>
        )}

        {/* 💳 Status Pembayaran */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 px-5 py-3 flex items-center gap-2">
            <span>💳</span>
            <h2 className="text-white font-bold text-sm">Status Pembayaran</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600 font-medium">Pilih Bulan:</span>
              <input type="month" value={bulan} onChange={e => setBulan(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div className={`border-2 rounded-2xl p-5 text-center ${getStatusColor(statusBayar)}`}>
              <div className="text-3xl font-bold mb-1">{getStatusText(statusBayar)}</div>
              <div className="text-xs opacity-70 mt-1">
                Iuran PKK bulan {new Date(bulan + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* 🪙 Arisan Uang */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-400 px-5 py-3 flex items-center gap-2">
            <span>🪙</span>
            <h2 className="text-white font-bold text-sm">Arisan Uang</h2>
          </div>
          <div className="p-5">
            {arisanUang.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🪙</div>
                <p className="text-gray-400 text-sm">Belum ada data arisan uang</p>
              </div>
            ) : (
              <>
                {/* Penerima Terakhir */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <p className="text-xs text-yellow-600 font-semibold mb-2">🏆 Penerima Putaran Terakhir</p>
                  <p className="text-xl font-bold text-yellow-800">{arisanUangTerakhir?.penerima}</p>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Putaran {arisanUangTerakhir?.putaran}
                    </span>
                    <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      📅 {arisanUangTerakhir?.tanggal}
                    </span>
                    <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                      💰 Rp {arisanUangTerakhir?.jumlah?.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Riwayat */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Riwayat Semua Putaran</p>
                <div className="space-y-2">
                  {arisanUang.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">
                          {a.putaran}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{a.penerima}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{a.tanggal}</p>
                        <p className="text-xs font-semibold text-green-600">Rp {a.jumlah?.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 🎁 Arisan Barang */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-rose-400 px-5 py-3 flex items-center gap-2">
            <span>🎁</span>
            <h2 className="text-white font-bold text-sm">Arisan Barang</h2>
          </div>
          <div className="p-5">
            {arisanBarang.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🎁</div>
                <p className="text-gray-400 text-sm">Belum ada data arisan barang</p>
              </div>
            ) : (
              <>
                {/* Penerima Terakhir */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4 mb-4">
                  <p className="text-xs text-pink-600 font-semibold mb-2">🏆 Penerima Putaran Terakhir</p>
                  <p className="text-xl font-bold text-pink-800">{arisanBarangTerakhir?.penerima}</p>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    <span className="bg-pink-200 text-pink-800 text-xs px-2 py-1 rounded-full">
                      Putaran {arisanBarangTerakhir?.putaran}
                    </span>
                    <span className="bg-pink-200 text-pink-800 text-xs px-2 py-1 rounded-full">
                      📅 {arisanBarangTerakhir?.tanggal}
                    </span>
                    <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                      🎁 {arisanBarangTerakhir?.barang}
                    </span>
                  </div>
                </div>

                {/* Riwayat */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Riwayat Semua Putaran</p>
                <div className="space-y-2">
                  {arisanBarang.map(a => (
                    <div key={a.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-pink-100 text-pink-700 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">
                          {a.putaran}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{a.penerima}</p>
                          <p className="text-xs text-gray-400">🎁 {a.barang}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">{a.tanggal}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 📢 Pengumuman */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-3 flex items-center gap-2">
            <span>📢</span>
            <h2 className="text-white font-bold text-sm">Pengumuman PKK</h2>
          </div>
          <div className="p-5">
            {pengumuman.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">📢</div>
                <p className="text-gray-400 text-sm">Belum ada pengumuman</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pengumuman.map(p => (
                  <div key={p.id} className="border border-gray-100 rounded-xl p-4 hover:border-green-200 hover:bg-green-50 transition">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-800">📢 {p.judul}</p>
                      <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded-full">{p.tanggal}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{p.isi}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">🌿 ArtaWarga PKK © 2025</p>
        </div>

      </div>
    </div>
  )
}