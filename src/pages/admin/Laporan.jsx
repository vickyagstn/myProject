import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, getDocs } from 'firebase/firestore'
import Layout from '../../components/Layout'

export default function Laporan() {
  const [data, setData] = useState({ kas: [], pembayaran: [], arisan: [] })

  useEffect(() => {
    const fetchAll = async () => {
      const kasSnap = await getDocs(collection(db, 'kas'))
      const bayarSnap = await getDocs(collection(db, 'pembayaran'))
      const arisanSnap = await getDocs(collection(db, 'arisan_uang'))
      setData({
        kas: kasSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        pembayaran: bayarSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        arisan: arisanSnap.docs.map(d => ({ id: d.id, ...d.data() })),
      })
    }
    fetchAll()
  }, [])

  const totalKasMasuk = data.kas.filter(k => k.jenis === 'masuk').reduce((a, b) => a + (b.jumlah || 0), 0)
  const totalKasKeluar = data.kas.filter(k => k.jenis === 'keluar').reduce((a, b) => a + (b.jumlah || 0), 0)
  const totalPembayaran = data.pembayaran.reduce((a, b) => a + (b.jumlah || 0), 0)

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Laporan</h1>
        <p className="text-gray-500 text-sm mb-6">Ringkasan keuangan PKK</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Total Kas Masuk</p>
            <p className="text-2xl font-bold text-green-600">Rp {totalKasMasuk.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Total Kas Keluar</p>
            <p className="text-2xl font-bold text-red-500">Rp {totalKasKeluar.toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Total Pembayaran</p>
            <p className="text-2xl font-bold text-blue-600">Rp {totalPembayaran.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="font-bold text-gray-700 mb-3">Riwayat Kas</h2>
          {data.kas.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Belum ada data kas</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Keterangan</th>
                  <th className="pb-2">Jenis</th>
                  <th className="pb-2">Jumlah</th>
                  <th className="pb-2">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {data.kas.map(k => (
                  <tr key={k.id} className="border-b last:border-0">
                    <td className="py-2">{k.keterangan}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${k.jenis === 'masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {k.jenis}
                      </span>
                    </td>
                    <td className="py-2">Rp {(k.jumlah || 0).toLocaleString('id-ID')}</td>
                    <td className="py-2 text-gray-400">{k.tanggal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}