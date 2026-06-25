import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

export default function PengumumanAnggota() {
  const [pengumuman, setPengumuman] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, 'announcements'), orderBy('tanggal', 'desc'))
      const snap = await getDocs(q)
      setPengumuman(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetchData()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Pengumuman PKK</h1>
      {pengumuman.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">📢</div>
          <p className="text-gray-500 text-sm">Belum ada pengumuman</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pengumuman.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base font-semibold text-gray-800">📢 {p.judul}</span>
                <span className="text-xs text-gray-400">{p.tanggal}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{p.isi}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}