import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

export default function Arisan() {
  const [arisanUang, setArisanUang] = useState([])
  const [arisanBarang, setArisanBarang] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const uangSnap = await getDocs(query(collection(db, 'arisan_uang'), orderBy('putaran')))
      setArisanUang(uangSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      const barangSnap = await getDocs(query(collection(db, 'arisan_barang'), orderBy('putaran')))
      setArisanBarang(barangSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    fetchData()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Penerima Arisan</h1>

      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3">🪙 Arisan Uang</h2>
        {arisanUang.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
            Belum ada data arisan uang
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Putaran</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Penerima</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tanggal</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {arisanUang.map(a => (
                  <tr key={a.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-600">Putaran {a.putaran}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.penerima}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.tanggal}</td>
                    <td className="px-4 py-3 text-sm text-green-700 font-medium text-right">
                      Rp {a.jumlah?.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">🎁 Arisan Barang</h2>
        {arisanBarang.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
            Belum ada data arisan barang
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Putaran</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Penerima</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Barang</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {arisanBarang.map(a => (
                  <tr key={a.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-600">Putaran {a.putaran}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.penerima}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">🎁 {a.barang}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.tanggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}