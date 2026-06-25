import { useEffect, useState } from 'react'
import { db, auth } from '../../firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function RiwayatBayar() {
  const [riwayat, setRiwayat] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser
      const snap = await getDocs(collection(db, 'payments'))
      const data = snap.docs.map(d => d.data())
        .filter(d => d.userId === user.uid)
        .sort((a, b) => b.bulan.localeCompare(a.bulan))
      setRiwayat(data)
    }
    fetchData()
  }, [])

  const getStyle = (s) => {
    if (s === 'lunas') return 'bg-green-100 text-green-700'
    if (s === 'sebagian') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Riwayat Pembayaran</h1>
      {riwayat.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">📜</div>
          <p className="text-gray-500 text-sm">Belum ada riwayat pembayaran</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Bulan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((r, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-800">{r.bulan}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStyle(r.status)}`}>
                      {r.status?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}