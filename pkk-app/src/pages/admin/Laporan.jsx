import { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import Layout from '../../components/Layout'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Laporan() {
  const [kas, setKas] = useState([])
  const [pembayaran, setPembayaran] = useState([])
  const [arisanUang, setArisanUang] = useState([])
  const [arisanBarang, setArisanBarang] = useState([])
  const [bulan, setBulan] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  const fetchData = async () => {
    setDataLoading(true)
    try {
      const kasSnap = await getDocs(collection(db, 'cashbook'))
      const kasData = kasSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      setKas(kasData)

      const bayarSnap = await getDocs(collection(db, 'payments'))
      setPembayaran(bayarSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      const uangSnap = await getDocs(collection(db, 'arisan_uang'))
      setArisanUang(uangSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      const barangSnap = await getDocs(collection(db, 'arisan_barang'))
      setArisanBarang(barangSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
    }
    setDataLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const kasBulanIni = kas.filter(k => k.tanggal?.startsWith(bulan))
  const totalMasuk = kas.reduce((a, b) => b.tipe === 'masuk' ? a + (b.jumlah || 0) : a, 0)
  const totalKeluar = kas.reduce((a, b) => b.tipe === 'keluar' ? a + (b.jumlah || 0) : a, 0)
  const totalSaldo = totalMasuk - totalKeluar
  const totalMasukBulanIni = kasBulanIni.filter(k => k.tipe === 'masuk').reduce((a, b) => a + (b.jumlah || 0), 0)
  const totalKeluarBulanIni = kasBulanIni.filter(k => k.tipe === 'keluar').reduce((a, b) => a + (b.jumlah || 0), 0)
  const pembayaranBulanIni = pembayaran.filter(p => p.bulan === bulan)
  const sudahLunas = pembayaranBulanIni.filter(p => p.status === 'lunas').length

  const exportPDF = () => {
    setLoading(true)
    const docPDF = new jsPDF()

    docPDF.setFontSize(18)
    docPDF.setFont('helvetica', 'bold')
    docPDF.text('LAPORAN KEUANGAN ARTAWARGA PKK', 105, 15, { align: 'center' })
    docPDF.setFontSize(11)
    docPDF.setFont('helvetica', 'normal')
    docPDF.text(`Periode: ${bulan}`, 105, 23, { align: 'center' })
    docPDF.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 105, 30, { align: 'center' })
    docPDF.line(14, 34, 196, 34)

    docPDF.setFontSize(12)
    docPDF.setFont('helvetica', 'bold')
    docPDF.text('RINGKASAN KAS KESELURUHAN', 14, 42)

    autoTable(docPDF, {
      startY: 46,
      head: [['Keterangan', 'Jumlah']],
      body: [
        ['Total Pemasukan (Semua)', `Rp ${totalMasuk.toLocaleString('id-ID')}`],
        ['Total Pengeluaran (Semua)', `Rp ${totalKeluar.toLocaleString('id-ID')}`],
        ['Saldo Kas', `Rp ${totalSaldo.toLocaleString('id-ID')}`],
        ['Pemasukan Bulan ' + bulan, `Rp ${totalMasukBulanIni.toLocaleString('id-ID')}`],
        ['Pengeluaran Bulan ' + bulan, `Rp ${totalKeluarBulanIni.toLocaleString('id-ID')}`],
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 101, 52] },
    })

    docPDF.setFont('helvetica', 'bold')
    docPDF.text('DETAIL TRANSAKSI KAS', 14, docPDF.lastAutoTable.finalY + 10)
    autoTable(docPDF, {
      startY: docPDF.lastAutoTable.finalY + 14,
      head: [['Tanggal', 'Keterangan', 'Jenis', 'Jumlah']],
      body: kas.map(k => [k.tanggal || '-', k.keterangan || '-', k.tipe === 'masuk' ? 'Pemasukan' : 'Pengeluaran', `Rp ${(k.jumlah || 0).toLocaleString('id-ID')}`]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 101, 52] },
    })

    docPDF.addPage()
    docPDF.setFontSize(12)
    docPDF.setFont('helvetica', 'bold')
    docPDF.text(`STATUS PEMBAYARAN - ${bulan}`, 14, 20)
    autoTable(docPDF, {
      startY: 24,
      head: [['No', 'Nama', 'Status']],
      body: pembayaranBulanIni.map((p, i) => [i + 1, p.nama || '-', (p.status || 'belum').toUpperCase()]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 101, 52] },
    })

    docPDF.setFont('helvetica', 'bold')
    docPDF.text('RIWAYAT ARISAN UANG', 14, docPDF.lastAutoTable.finalY + 10)
    autoTable(docPDF, {
      startY: docPDF.lastAutoTable.finalY + 14,
      head: [['Putaran', 'Penerima', 'Tanggal', 'Jumlah']],
      body: arisanUang.map(a => [`Putaran ${a.putaran}`, a.penerima || '-', a.tanggal || '-', `Rp ${(a.jumlah || 0).toLocaleString('id-ID')}`]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 101, 52] },
    })

    docPDF.setFont('helvetica', 'bold')
    docPDF.text('RIWAYAT ARISAN BARANG', 14, docPDF.lastAutoTable.finalY + 10)
    autoTable(docPDF, {
      startY: docPDF.lastAutoTable.finalY + 14,
      head: [['Putaran', 'Penerima', 'Barang', 'Tanggal']],
      body: arisanBarang.map(a => [`Putaran ${a.putaran}`, a.penerima || '-', a.barang || '-', a.tanggal || '-']),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 101, 52] },
    })

    docPDF.save(`Laporan-ArtaWarga-${bulan}.pdf`)
    setLoading(false)
  }

  return (
    <Layout title="Laporan">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">📊 Laporan Keuangan</h1>
          <p className="text-gray-500 text-sm mt-0.5">Ringkasan keuangan ArtaWarga PKK</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="month" value={bulan} onChange={e => setBulan(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          <button onClick={exportPDF} disabled={loading}
            className="bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm disabled:opacity-50 transition-all">
            {loading ? '⏳ Membuat...' : '📄 Export PDF'}
          </button>
        </div>
      </div>

      {dataLoading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3 animate-bounce">📊</div>
          <p className="text-gray-400 text-sm">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-400 rounded-2xl p-4 text-white">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-xs opacity-80 mb-1">Saldo Kas</div>
              <div className="text-lg font-bold">Rp {totalSaldo.toLocaleString('id-ID')}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-400 rounded-2xl p-4 text-white">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-xs opacity-80 mb-1">Total Masuk</div>
              <div className="text-lg font-bold">Rp {totalMasuk.toLocaleString('id-ID')}</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-rose-400 rounded-2xl p-4 text-white">
              <div className="text-2xl mb-1">📉</div>
              <div className="text-xs opacity-80 mb-1">Total Keluar</div>
              <div className="text-lg font-bold">Rp {totalKeluar.toLocaleString('id-ID')}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-400 rounded-2xl p-4 text-white">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-xs opacity-80 mb-1">Lunas Bulan Ini</div>
              <div className="text-lg font-bold">{sudahLunas} orang</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Kas Bulan Ini */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3">💰 Kas Bulan {bulan}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pemasukan</span>
                  <span className="text-green-600 font-semibold">+ Rp {totalMasukBulanIni.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Pengeluaran</span>
                  <span className="text-red-500 font-semibold">- Rp {totalKeluarBulanIni.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm font-bold">
                  <span className="text-gray-700">Selisih</span>
                  <span className={totalMasukBulanIni - totalKeluarBulanIni >= 0 ? 'text-green-600' : 'text-red-500'}>
                    Rp {(totalMasukBulanIni - totalKeluarBulanIni).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Arisan Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-3">🎰 Info Arisan</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">🪙 Putaran Arisan Uang</span>
                  <span className="text-yellow-600 font-semibold">{arisanUang.length} putaran</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">🎁 Putaran Arisan Barang</span>
                  <span className="text-pink-600 font-semibold">{arisanBarang.length} putaran</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">💳 Lunas Bulan Ini</span>
                  <span className="text-green-600 font-semibold">{sudahLunas} anggota</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Kas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">📋 Semua Transaksi Kas</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{kas.length} transaksi</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Tanggal</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Keterangan</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Jenis</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {kas.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-8 text-gray-400 text-sm">Belum ada transaksi kas</td></tr>
                  ) : kas.map(k => (
                    <tr key={k.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm text-gray-600">{k.tanggal}</td>
                      <td className="px-5 py-3 text-sm text-gray-800">{k.keterangan}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${k.tipe === 'masuk' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {k.tipe === 'masuk' ? '↑ Masuk' : '↓ Keluar'}
                        </span>
                      </td>
                      <td className={`px-5 py-3 text-sm font-semibold text-right ${k.tipe === 'masuk' ? 'text-green-600' : 'text-red-500'}`}>
                        {k.tipe === 'masuk' ? '+' : '-'} Rp {(k.jumlah || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center mt-4">
            <p className="text-green-700 text-sm font-medium">📄 Klik "Export PDF" untuk download laporan lengkap</p>
            <p className="text-green-500 text-xs mt-1">Laporan berisi kas, pembayaran, arisan uang & barang</p>
          </div>
        </>
      )}
    </Layout>
  )
}