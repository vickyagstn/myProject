import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'

export default function DashboardAdmin() {
  const [stats, setStats] = useState({ anggota: 0, saldo: 0, belumBayar: 0, arisanUang: 0 })
  const [kasTerakhir, setKasTerakhir] = useState([])
  const [pengumuman, setPengumuman] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const anggotaSnap = await getDocs(collection(db, 'users'))
      const kasSnap = await getDocs(collection(db, 'cashbook'))
      const paySnap = await getDocs(collection(db, 'payments'))
      const arisanSnap = await getDocs(collection(db, 'arisan_uang'))
      const annSnap = await getDocs(collection(db, 'announcements'))

      let saldo = 0
      const kasData = kasSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      kasData.forEach(k => {
        if (k.tipe === 'masuk') saldo += k.jumlah
        if (k.tipe === 'keluar') saldo -= k.jumlah
      })

      const bulanIni = new Date().toISOString().slice(0, 7)
      const payData = paySnap.docs.map(d => d.data()).filter(p => p.bulan === bulanIni)
      const belumBayar = payData.filter(p => p.status !== 'lunas').length

      setStats({
        anggota: anggotaSnap.size,
        saldo,
        belumBayar,
        arisanUang: arisanSnap.size
      })
      setKasTerakhir(kasData.slice(0, 5))
      setPengumuman(annSnap.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 3))
    }
    fetchData()
  }, [])

  const statCards = [
    { label: 'Saldo Kas', value: `Rp ${stats.saldo.toLocaleString('id-ID')}`, icon: '💰', color: 'from-green-500 to-emerald-400', text: 'text-white' },
    { label: 'Total Anggota', value: `${stats.anggota} orang`, icon: '👥', color: 'from-blue-500 to-blue-400', text: 'text-white' },
    { label: 'Belum Bayar', value: `${stats.belumBayar} orang`, icon: '⚠️', color: 'from-orange-500 to-amber-400', text: 'text-white' },
    { label: 'Putaran Arisan', value: `${stats.arisanUang} putaran`, icon: '🪙', color: 'from-purple-500 to-purple-400', text: 'text-white' },
  ]

  return (
    <Layout title="Dashboard">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-6 mb-6 text-white">
        <h2 className="text-xl font-bold mb-1">Selamat Datang, Bendahara! 👋</h2>
        <p className="text-green-100 text-sm">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 shadow-sm`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className={`text-xs font-medium ${s.text} opacity-80 mb-1`}>{s.label}</div>
            <div className={`text-xl font-bold ${s.text}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Menu */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: '💳', label: 'Pembayaran', path: '/admin/pembayaran', color: 'bg-blue-50 hover:bg-blue-100' },
          { icon: '💰', label: 'Catat Kas', path: '/admin/kas', color: 'bg-green-50 hover:bg-green-100' },
          { icon: '🪙', label: 'Arisan Uang', path: '/admin/arisan-uang', color: 'bg-yellow-50 hover:bg-yellow-100' },
          { icon: '📊', label: 'Laporan PDF', path: '/admin/laporan', color: 'bg-purple-50 hover:bg-purple-100' },
        ].map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)}
            className={`${item.color} rounded-2xl p-4 text-center transition-all duration-200 border border-gray-100`}>
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="text-xs font-medium text-gray-700">{item.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Transaksi Terakhir */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">💰 Transaksi Terakhir</h3>
            <button onClick={() => navigate('/admin/kas')}
              className="text-xs text-green-600 hover:underline">Lihat semua</button>
          </div>
          {kasTerakhir.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Belum ada transaksi</p>
          ) : kasTerakhir.map(k => (
            <div key={k.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${k.tipe === 'masuk' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {k.tipe === 'masuk' ? '↑' : '↓'}
                </span>
                <div>
                  <p className="text-xs font-medium text-gray-800">{k.keterangan}</p>
                  <p className="text-xs text-gray-400">{k.tanggal}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold ${k.tipe === 'masuk' ? 'text-green-600' : 'text-red-500'}`}>
                {k.tipe === 'masuk' ? '+' : '-'}Rp {k.jumlah?.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
        </div>

        {/* Pengumuman */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">📢 Pengumuman</h3>
            <button onClick={() => navigate('/admin/pengumuman')}
              className="text-xs text-green-600 hover:underline">+ Buat</button>
          </div>
          {pengumuman.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Belum ada pengumuman</p>
          ) : pengumuman.map(p => (
            <div key={p.id} className="py-2 border-b border-gray-50 last:border-0">
              <p className="text-xs font-medium text-gray-800">{p.judul}</p>
              <p className="text-xs text-gray-400 mt-0.5">{p.tanggal}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}