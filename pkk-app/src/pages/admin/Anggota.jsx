import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, setDoc, doc } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import Layout from '../../components/Layout'

export default function Anggota() {
  const [anggota, setAnggota] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', alamat: '', noHp: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const fetchAnggota = async () => {
    const snap = await getDocs(collection(db, 'users'))
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    setAnggota(data)
  }

  useEffect(() => { fetchAnggota() }, [])

  const handleTambah = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const auth = getAuth()
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await setDoc(doc(db, 'users', userCred.user.uid), {
        nama: form.nama,
        alamat: form.alamat,
        noHp: form.noHp,
        email: form.email,
        role: 'anggota'
      })
      setForm({ nama: '', alamat: '', noHp: '', email: '', password: '' })
      setShowForm(false)
      fetchAnggota()
      alert('Anggota berhasil ditambahkan!')
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
            <h1 className="text-xl font-bold text-gray-800">Data Anggota</h1>
            <p className="text-gray-500 text-sm">Total: {anggota.length} anggota</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Tambah Anggota
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">Form Tambah Anggota</h2>
            <form onSubmit={handleTambah} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Nama Lengkap</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">No. HP</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.noHp} onChange={e => setForm({...form, noHp: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Alamat</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email (untuk login)</label>
                <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Password</label>
                <input type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
              </div>
              <div className="flex items-end gap-2">
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">No</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Nama</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">No. HP</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Alamat</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Role</th>
              </tr>
            </thead>
            <tbody>
              {anggota.map((a, i) => (
                <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.noHp || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.alamat || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      a.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>{a.role}</span>
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