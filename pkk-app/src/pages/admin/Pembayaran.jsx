import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'
import Layout from '../../components/Layout'

export default function Pembayaran() {
  const [anggota, setAnggota] = useState([])
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7))
  const [status, setStatus] = useState({})
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    const snap = await getDocs(collection(db, 'users'))
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'anggota')
    setAnggota(data)

    const bayarSnap = await getDocs(collection(db, 'payments'))
    const statusMap = {}
    bayarSnap.docs.forEach(d => {
      const data = d.data()
      if (data.bulan === bulan) {
        statusMap[data.userId] = data.status
      }
    })
    setStatus(statusMap)
  }

  useEffect(() => { fetchData() }, [bulan])

  const handleUbahStatus = async (userId, nama, newStatus) => {
    setLoading(true)
    try {
      await setDoc(doc(db, 'payments', `${userId}_${bulan}`), {
        userId,
        nama,
        bulan,
        status: newStatus,
        updatedAt: new Date()
      })
      setStatus(prev => ({ ...prev, [userId]: newStatus }))
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  const getStatusStyle = (s) => {
    if (s === 'lunas') return 'bg-green-100 text-green-700'
    if (s === 'belum') return 'bg-red-100 text-red-700'
    if (s === 'sebagian') return 'bg-yellow-100 text-yellow-700'
    return 'bg-gray-100 text-gray-500'
  }

  const sudahBayar = Object.values(status).filter(s => s === 'lunas').length
  const belumBayar = anggota.length - sudahBayar

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Pembayaran</h1>
            <p className="text-gray-500 text-sm">Catat status pembayaran bulanan</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Bulan:</label>
            <input
              type="month"
              value={bulan}
              onChange={e => setBulan(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Total Anggota</div>
            <div className="text-xl font-bold text-gray-800">{anggota.length} orang</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Sudah Lunas</div>
            <div className="text-xl font-bold text-green-700">{sudahBayar} orang</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Belum Bayar</div>
            <div className="text-xl font-bold text-red-600">{belumBayar} orang</div>
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">No</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ubah Status</th>
              </tr>
            </thead>
            <tbody>
              {anggota.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400 text-sm">
                    Belum ada anggota. Tambah anggota di menu Anggota.
                  </td>
                </tr>
              ) : anggota.map((a, i) => (
                <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.nama}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle(status[a.id])}`}>
                      {status[a.id] || 'belum'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUbahStatus(a.id, a.nama, 'lunas')}
                        disabled={loading}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                      >
                        Lunas
                      </button>
                      <button
                        onClick={() => handleUbahStatus(a.id, a.nama, 'sebagian')}
                        disabled={loading}
                        className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                      >
                        Sebagian
                      </button>
                      <button
                        onClick={() => handleUbahStatus(a.id, a.nama, 'belum')}
                        disabled={loading}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                      >
                        Belum
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}