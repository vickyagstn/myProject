import { useEffect, useState } from 'react'
import { db, auth } from '../../firebase'
import { collection, getDocs } from 'firebase/firestore'

export default function StatusBayar() {
  const [status, setStatus] = useState([])
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7))

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser
      const snap = await getDocs(collection(db, 'payments'))
      const data = snap.docs.map(d => d.data()).filter(d => d.userId === user.uid && d.bulan === bulan)
      setStatus(data)
    }
    fetchData()
  }, [bulan])

  const getStyle = (s) => {
    if (s === 'lunas') return 'bg-green-100 text-green-700'
    if (s === 'sebagian') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Status Pembayaran</h1>
        <input type="month" value={bulan} onChange={e => setBulan(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      {status.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 text-sm">Belum ada data pembayaran untuk bulan ini</p>
        </div>
      ) : status.map((s, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">Pembayaran Bulan {s.bulan}</p>
              <p className="text-sm text-gray-500 mt-1">Nama: {s.nama}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStyle(s.status)}`}>
              {s.status?.toUpperCase()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}