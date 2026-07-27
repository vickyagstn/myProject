import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, orderBy, query } from 'firebase/firestore'
import Layout from '../../components/Layout'

export default function ArisanBarang() {
  const [anggota, setAnggota] = useState([])
  const [riwayat, setRiwayat] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ penerima: '', barang: 'Persabunan', tanggal: '', putaran: '' })
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notif, setNotif] = useState(null)

  const fetchData = async () => {
    const anggotaSnap = await getDocs(collection(db, 'users'))
    setAnggota(anggotaSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'anggota'))
    const q = query(collection(db, 'arisan_barang'), orderBy('putaran'))
    const snap = await getDocs(q)
    setRiwayat(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { fetchData() }, [])

  const showNotif = (msg, type = 'success') => {
    setNotif({ msg, type })
    setTimeout(() => setNotif(null), 3000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editId) {
        await updateDoc(doc(db, 'arisan_barang', editId), {
          penerima: form.penerima,
          barang: 'Persabunan',
          tanggal: form.tanggal,
          putaran: parseInt(form.putaran),
        })
        showNotif('✅ Data berhasil diperbarui!')
        setEditId(null)
      } else {
        await addDoc(collection(db, 'arisan_barang'), {
          penerima: form.penerima,
          barang: 'Persabunan',
          tanggal: form.tanggal,
          putaran: parseInt(form.putaran),
          createdAt: new Date()
        })
        showNotif('✅ Data arisan barang berhasil disimpan!')
      }
      setForm({ penerima: '', barang: 'Persabunan', tanggal: '', putaran: '' })
      setShowForm(false)
      fetchData()
    } catch (err) {
      showNotif('❌ Gagal menyimpan data!', 'error')
    }
    setLoading(false)
  }

  const handleEdit = (item) => {
    setForm({
      penerima: item.penerima,
      barang: 'Persabunan',
      tanggal: item.tanggal,
      putaran: item.putaran
    })
    setEditId(item.id)
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const handleHapus = async (id) => {
    if (!confirm('Hapus data arisan ini?')) return
    await deleteDoc(doc(db, 'arisan_barang', id))
    fetchData()
    showNotif('🗑️ Data berhasil dihapus!')
  }

  return (
    <Layout title="Arisan Barang">
      {notif && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-lg text-white text-sm font-medium ${
          notif.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {notif.msg}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🎁 Arisan Barang</h1>
          <p className="text-gray-500 text-sm mt-0.5">Arisan persabunan PKK</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ penerima: '', barang: 'Persabunan', tanggal: '', putaran: '' }) }}
          className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all">
          {showForm ? '✕ Tutup' : '+ Tambah Penerima'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-pink-500 to-rose-400 rounded-2xl p-4 text-white">
          <div className="text-2xl mb-1">🧴</div>
          <div className="text-xs opacity-80 mb-1">Jenis Arisan</div>
          <div className="text-lg font-bold">Persabunan</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-400 rounded-2xl p-4 text-white">
          <div className="text-2xl mb-1">🎁</div>
          <div className="text-xs opacity-80 mb-1">Total Putaran</div>
          <div className="text-xl font-bold">{riwayat.length} putaran</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-400 rounded-2xl p-4 text-white">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-xs opacity-80 mb-1">Sisa Putaran</div>
          <div className="text-xl font-bold">{Math.max(0, anggota.length - riwayat.length)} putaran</div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">
            {editId ? '✏️ Edit Data Arisan Barang' : '➕ Tambah Penerima Arisan Barang'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Penerima</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                value={form.penerima} onChange={e => setForm({...form, penerima: e.target.value})} required>
                <option value="">-- Pilih Anggota --</option>
                {anggota.map(a => <option key={a.id} value={a.nama}>{a.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Putaran ke-</label>
              <input type="number"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                value={form.putaran} onChange={e => setForm({...form, putaran: e.target.value})}
                placeholder={riwayat.length + 1} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Jenis Barang</label>
              <div className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-100 text-gray-600 font-medium flex items-center gap-2">
                🧴 Persabunan
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Tanggal</label>
              <input type="date"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} required />
            </div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" disabled={loading}
                className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-sm">
                {loading ? '⏳ Menyimpan...' : editId ? '💾 Update' : '💾 Simpan'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }}
                className="border border-gray-200 px-6 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">📋 Riwayat Penerima Persabunan</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{riwayat.length} data</span>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Putaran</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Penerima</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Barang</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Tanggal</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-gray-400 text-sm">
                  <div className="text-4xl mb-2">🧴</div>
                  <p>Belum ada data arisan persabunan</p>
                </td>
              </tr>
            ) : riwayat.map(r => (
              <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3">
                  <span className="bg-pink-100 text-pink-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    Putaran {r.putaran}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm font-semibold text-gray-800">{r.penerima}</td>
                <td className="px-5 py-3">
                  <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-1 rounded-full">
                    🧴 {r.barang}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{r.tanggal}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => handleEdit(r)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg transition">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleHapus(r.id)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg transition">
                      🗑️ Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}