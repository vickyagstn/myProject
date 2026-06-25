import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Sidebar from '../../components/layout/Sidebar';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LaporanKegiatan() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchKegiatan = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'kegiatan'));
        setKegiatan(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        toast.error('Gagal memuat data kegiatan');
      }
      setLoading(false);
    };
    fetchKegiatan();
  }, []);

  const headerPDF = (doc, title) => {
    doc.setFillColor(128, 0, 32);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('HIMAPROTEKSA DIGITAL', 105, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Himpunan Mahasiswa Teknologi Rekayasa Perangkat Lunak', 105, 20, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 42, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      105, 50, { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  };

  const exportPDF = () => {
    if (kegiatan.length === 0) return toast.error('Belum ada data kegiatan!');
    setGenerating(true);
    try {
      const doc = new jsPDF();
      headerPDF(doc, 'LAPORAN KEGIATAN');

      autoTable(doc, {
        startY: 58,
        head: [['No', 'Nama Kegiatan', 'Tanggal', 'Waktu', 'Lokasi', 'Jenis', 'Status']],
        body: kegiatan.map((k, i) => [
          i + 1,
          k.namaKegiatan || '-',
          k.tanggal || '-',
          `${k.waktuMulai || '-'} - ${k.waktuSelesai || '-'}`,
          k.lokasi || '-',
          k.jenisKegiatan || '-',
          k.status?.replace('_', ' ') || '-',
        ]),
        headStyles: { fillColor: [128, 0, 32], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [253, 242, 244] },
        styles: { cellPadding: 3 },
        columnStyles: { 1: { cellWidth: 40 } },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(9);
      doc.text(`Total Kegiatan: ${kegiatan.length}`, 14, finalY);
      doc.text(`Akan Datang: ${kegiatan.filter(k => k.status === 'akan_datang').length}`, 14, finalY + 6);
      doc.text(`Berlangsung: ${kegiatan.filter(k => k.status === 'berlangsung').length}`, 14, finalY + 12);
      doc.text(`Selesai: ${kegiatan.filter(k => k.status === 'selesai').length}`, 14, finalY + 18);

      doc.save('Laporan_Kegiatan_HIMAPROTEKSA.pdf');
      toast.success('Laporan Kegiatan berhasil diexport!');
    } catch (e) {
      toast.error('Gagal export: ' + e.message);
    }
    setGenerating(false);
  };

  const statusColor = {
    'akan_datang': { bg: '#dbeafe', color: '#1d4ed8' },
    'berlangsung': { bg: '#dcfce7', color: '#15803d' },
    'selesai':     { bg: '#f3f4f6', color: '#6b7280' },
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div style={{ marginLeft: sidebarOpen ? '260px' : '0', flex: 1, transition: 'margin 0.3s ease' }}>

        {/* Navbar */}
        <div style={{ background: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 30 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#800020' }}>☰</button>
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#374151' }}>📅 Laporan Kegiatan</h1>
          <button
            onClick={exportPDF}
            disabled={generating || loading}
            style={{ marginLeft: 'auto', background: generating ? '#9ca3af' : '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 18px', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}>
            {generating ? '⏳ Generating...' : '📥 Export PDF'}
          </button>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Kegiatan', value: kegiatan.length, color: '#800020', bg: '#fdf2f4' },
              { label: 'Akan Datang', value: kegiatan.filter(k => k.status === 'akan_datang').length, color: '#1d4ed8', bg: '#dbeafe' },
              { label: 'Berlangsung', value: kegiatan.filter(k => k.status === 'berlangsung').length, color: '#15803d', bg: '#dcfce7' },
              { label: 'Selesai', value: kegiatan.filter(k => k.status === 'selesai').length, color: '#6b7280', bg: '#f3f4f6' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{loading ? '-' : s.value}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabel Kegiatan */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#800020', marginTop: 0, marginBottom: '16px' }}>📋 Daftar Kegiatan</h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>⏳ Memuat data...</div>
            ) : kegiatan.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                <p>Belum ada data kegiatan</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#800020', color: 'white' }}>
                      {['No', 'Nama Kegiatan', 'Tanggal', 'Waktu', 'Lokasi', 'Jenis', 'Status'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {kegiatan.map((k, i) => {
                      const st = statusColor[k.status] || { bg: '#f3f4f6', color: '#6b7280' };
                      return (
                        <tr key={k.id} style={{ background: i % 2 === 0 ? 'white' : '#fdf2f4' }}>
                          <td style={{ padding: '10px 12px', color: '#6b7280' }}>{i + 1}</td>
                          <td style={{ padding: '10px 12px', fontWeight: '500', color: '#1f2937' }}>{k.namaKegiatan || '-'}</td>
                          <td style={{ padding: '10px 12px', color: '#374151' }}>{k.tanggal || '-'}</td>
                          <td style={{ padding: '10px 12px', color: '#374151' }}>{k.waktuMulai || '-'} - {k.waktuSelesai || '-'}</td>
                          <td style={{ padding: '10px 12px', color: '#374151' }}>{k.lokasi || '-'}</td>
                          <td style={{ padding: '10px 12px', color: '#374151' }}>{k.jenisKegiatan || '-'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                              {k.status?.replace('_', ' ') || '-'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}