import { useState, useEffect } from 'react'
import './admin.css'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import { supabase } from '../../supabaseClient'

function TambahPembayaran() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [daftarKeluarga, setDaftarKeluarga] = useState([])
  const [form, setForm] = useState({
    keluarga_id: '', periode: '', tanggal: '', nominal: '', metode: 'transfer', catatan: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    ambilKeluarga()
  }, [])

  async function ambilKeluarga() {
    const { data } = await supabase.from('anggota_keluarga').select('id, nama').order('nama')
    setDaftarKeluarga(data || [])
  }

  function updateField(key, value) {
    setForm({ ...form, [key]: value })
  }

  async function handleSimpan() {
    setError('')

    if (!form.keluarga_id || !form.tanggal || !form.nominal) {
      setError('Keluarga, Tanggal, dan Nominal wajib diisi')
      return
    }

    setLoading(true)

    const { error: insertError } = await supabase.from('kas_masuk').insert([
      {
        keluarga_id: form.keluarga_id,
        periode: form.periode,
        tanggal: form.tanggal,
        nominal: Number(form.nominal),
        metode: form.metode,
        catatan: form.catatan,
      },
    ])

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    navigate('/admin/kas-masuk', { state: { toast: 'Pembayaran berhasil ditambahkan' } })
  }

  return (
    <div className="dash">
      <Sidebar active="kas-masuk" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <div className="topbar">
          <div>
            <h2>Tambah Pembayaran</h2>
            <p>Catat pemasukan kas dari keluarga</p>
          </div>
        </div>

        <div className="form-card">
          <div className="form-group form-group-icon">
            <label>Pilih Keluarga</label>
            <span className="fg-icon">👪</span>
            <select value={form.keluarga_id} onChange={(e) => updateField('keluarga_id', e.target.value)}>
              <option value="">-- Pilih Keluarga --</option>
              {daftarKeluarga.map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>

          <div className="form-group form-group-icon">
            <label>Periode</label>
            <span className="fg-icon">🗓️</span>
            <input
              type="text"
              placeholder="Contoh: Juli 2026"
              value={form.periode}
              onChange={(e) => updateField('periode', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>Tanggal</label>
            <span className="fg-icon">📅</span>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => updateField('tanggal', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>Nominal</label>
            <span className="fg-icon">💵</span>
            <input
              type="number"
              placeholder="Contoh: 200000"
              value={form.nominal}
              onChange={(e) => updateField('nominal', e.target.value)}
            />
          </div>

          <div className="form-group form-group-icon">
            <label>Metode Pembayaran</label>
            <span className="fg-icon">💳</span>
            <select value={form.metode} onChange={(e) => updateField('metode', e.target.value)}>
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer</option>
              <option value="qris">QRIS</option>
            </select>
          </div>

          <div className="form-group form-group-icon">
            <label>Catatan</label>
            <span className="fg-icon">📝</span>
            <input
              type="text"
              placeholder="Catatan tambahan (opsional)"
              value={form.catatan}
              onChange={(e) => updateField('catatan', e.target.value)}
            />
          </div>

          {error && (
            <p style={{ color: '#E5484D', fontSize: '12.5px', marginBottom: '14px' }}>{error}</p>
          )}

          <div className="form-actions">
            <Link to="/admin/kas-masuk" className="btn-cancel">Batal</Link>
            <button className="btn-save" onClick={handleSimpan} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TambahPembayaran