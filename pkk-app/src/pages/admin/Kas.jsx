import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore'
import Layout from '../../components/Layout'

export default function Kas() {
  const [transaksi, setTransaksi] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ keterangan: '', jumlah: '', tipe: 'masuk', tanggal: '' })
  const [loading, setLoading] = useState(false)
  const [saldo, setSaldo] = useState(0)

  const fetchData = async () => {
    const q = query(collection(db, 'cashbook'), orderBy('tanggal', 'desc'))
    const snap = await getDocs(q)
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setTransaksi(data)
    let total = 0
    data.forEach(d => {
      if (d.tipe === 'masuk') total += d.jumlah
      if (d.tipe === 'keluar') total -= d.jumlah
    })
    setSaldo(total)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, 'cashbook'), {
        keterangan: form.keterangan,
        jumlah: parseInt(form.jumlah),
        tipe: form.tipe,
        tanggal: form.tanggal,
        createdAt: new Date()
      })
      setForm({ keterangan: '', jumlah: '', tipe: 'masuk', tanggal: '' })
      setShowForm(false)
      fetchData()
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Buku Kas</h1>
            <p className="text-gray-500 text-sm">Pemasukan & Pengeluaran</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Tambah Transaksi
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Saldo Kas</div>
            <div className="text-xl font-bold text-green-700">Rp {saldo.toLocaleString('id-ID')}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Total Pemasukan</div>
            <div className="text-xl font-bold text-blue-700">
              Rp {transaksi.filter(t => t.tipe === 'masuk').reduce((a, b) => a + b.jumlah, 0).toLocaleString('id-ID')}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Total Pengeluaran</div>
            <div className="text-xl font-bold text-red-600">
              Rp {transaksi.filter(t => t.tipe === 'keluar').reduce((a, b) => a + b.jumlah, 0).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">Tambah Transaksi</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Keterangan</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.keterangan}
                  onChange={e => setForm({...form, keterangan: e.target.value})}
                  placeholder="contoh: Iuran bulan Juni"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Jumlah (Rp)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.jumlah}
                  onChange={e => setForm({...form, jumlah: e.target.value})}
                  placeholder="50000"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Jenis</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.tipe}
                  onChange={e => setForm({...form, tipe: e.target.value})}
                >
                  <option value="masuk">Pemasukan</option>
                  <option value="keluar">Pengeluaran</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Tanggal</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.tanggal}
                  onChange={e => setForm({...form, tanggal: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-2 items-end">
                <button type="submit" disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-sm">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tanggal</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Keterangan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Jenis</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {transaksi.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400 text-sm">Belum ada transaksi</td>
                </tr>
              ) : transaksi.map(t => (
                <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{t.tanggal}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{t.keterangan}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.tipe === 'masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t.tipe === 'masuk' ? '↑ Masuk' : '↓ Keluar'}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium text-right ${
                    t.tipe === 'masuk' ? 'text-green-700' : 'text-red-600'
                  }`}>
                    {t.tipe === 'masuk' ? '+' : '-'} Rp {t.jumlah?.toLocaleString('id-ID')}
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