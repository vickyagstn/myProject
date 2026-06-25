import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Laporan() {
  const [anggota, setAnggota] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState('');
  const [selectedKegiatan, setSelectedKegiatan] = useState('');
  const [selectedKehadiran, setSelectedKehadiran] = useState('');
  const [showKegiatanModal, setShowKegiatanModal] = useState(false);
  const [showKehadiranModal, setShowKehadiranModal] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [anggotaSnap, kegiatanSnap, attendanceSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'kegiatan')),
        getDocs(collection(db, 'attendance')),
      ]);
      setAnggota(anggotaSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'anggota'));
      setKegiatan(kegiatanSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAttendance(attendanceSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      toast.error('Gagal memuat data');
    }
    setLoading(false);
  };

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
    doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 105, 50, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  };

  // LAPORAN ANGGOTA
  const exportLaporanAnggota = () => {
    setGenerating('anggota');
    try {
      const doc = new jsPDF();
      headerPDF(doc, 'LAPORAN DATA ANGGOTA');
      autoTable(doc, {
        startY: 58,
        head: [['No', 'Nama', 'NIM', 'Angkatan', 'Divisi', 'No HP', 'Status']],
        body: anggota.map((a, i) => [i + 1, a.nama || '-', a.nim || '-', a.angkatan || '-', a.divisi || '-', a.noHp || '-', a.status || '-']),
        headStyles: { fillColor: [128, 0, 32], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [253, 242, 244] },
        styles: { cellPadding: 3 },
      });
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(9);
      doc.text(`Total Anggota: ${anggota.length}`, 14, finalY);
      doc.text(`Aktif: ${anggota.filter(a => a.status === 'aktif').length}`, 14, finalY + 6);
      doc.save('Laporan_Anggota_HIMAPROTEKSA.pdf');
      toast.success('Laporan Anggota berhasil diexport!');
    } catch (e) {
      toast.error('Gagal export: ' + e.message);
    }
    setGenerating('');
  };

  // LAPORAN KEHADIRAN PER KEGIATAN
  const exportLaporanKehadiran = () => {
    if (!selectedKehadiran) return toast.error('Pilih kegiatan dulu!');
    const k = kegiatan.find(k => k.id === selectedKehadiran);
    if (!k) return;
    setGenerating('kehadiran');
    try {
      const doc = new jsPDF();
      headerPDF(doc, 'LAPORAN KEHADIRAN');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Detail Kegiatan:', 14, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Nama Kegiatan : ${k.namaKegiatan || '-'}`, 14, 68);
      doc.text(`Tanggal       : ${k.tanggal || '-'}`, 14, 74);
      doc.text(`Waktu         : ${k.waktuMulai || '-'} - ${k.waktuSelesai || '-'}`, 14, 80);
      doc.text(`Lokasi        : ${k.lokasi || '-'}`, 14, 86);

      // Gabungkan anggota dengan status kehadiran
      const absensiKegiatan = attendance.filter(a => a.meetingId === k.id || a.kegiatanId === k.id);
      const hadirIds = absensiKegiatan.map(a => a.userId);

      const rows = [
        // Yang hadir/terlambat
        ...absensiKegiatan.map((a, i) => [
          i + 1,
          a.userName || '-',
          a.checkInTime?.toDate
            ? a.checkInTime.toDate().toLocaleTimeString('id-ID')
            : a.checkInTime || '-',
          a.status || '-'
        ]),
        // Yang tidak hadir
        ...anggota
          .filter(a => !hadirIds.includes(a.id))
          .map((a, i) => [
            absensiKegiatan.length + i + 1,
            a.nama || '-',
            '-',
            'Tidak Hadir'
          ])
      ];

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Daftar Kehadiran:', 14, 96);

      autoTable(doc, {
        startY: 100,
        head: [['No', 'Nama', 'Waktu Absen', 'Status']],
        body: rows.length > 0 ? rows : [['', 'Belum ada data', '', '']],
        headStyles: { fillColor: [128, 0, 32], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [253, 242, 244] },
        styles: { cellPadding: 3 },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 3) {
            const val = data.cell.raw;
            if (val === 'Hadir') data.cell.styles.textColor = [22, 163, 74];
            else if (val === 'Terlambat') data.cell.styles.textColor = [217, 119, 6];
            else if (val === 'Tidak Hadir') data.cell.styles.textColor = [220, 38, 38];
          }
        }
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      const totalHadir = absensiKegiatan.filter(a => a.status === 'Hadir').length;
      const totalTerlambat = absensiKegiatan.filter(a => a.status === 'Terlambat').length;
      const totalTidakHadir = anggota.length - hadirIds.length;
      const persen = anggota.length > 0 ? Math.round((absensiKegiatan.length / anggota.length) * 100) : 0;

      doc.setFontSize(9);
      doc.text(`Hadir        : ${totalHadir} orang`, 14, finalY);
      doc.text(`Terlambat    : ${totalTerlambat} orang`, 14, finalY + 6);
      doc.text(`Tidak Hadir  : ${totalTidakHadir} orang`, 14, finalY + 12);
      doc.text(`Total Anggota: ${anggota.length} orang`, 14, finalY + 18);
      doc.text(`Kehadiran    : ${persen}%`, 14, finalY + 24);

      doc.save(`Laporan_Kehadiran_${k.namaKegiatan}.pdf`);
      toast.success('Laporan Kehadiran berhasil diexport!');
      setShowKehadiranModal(false);
      setSelectedKehadiran('');
    } catch (e) {
      toast.error('Gagal export: ' + e.message);
    }
    setGenerating('');
  };

  // LAPORAN KEGIATAN
  const exportLaporanKegiatan = () => {
    if (!selectedKegiatan) return toast.error('Pilih kegiatan dulu!');
    const k = kegiatan.find(k => k.id === selectedKegiatan);
    if (!k) return;
    setGenerating('kegiatan');
    try {
      const doc = new jsPDF();
      headerPDF(doc, 'LAPORAN KEGIATAN');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Detail Kegiatan:', 14, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Nama Kegiatan : ${k.namaKegiatan || '-'}`, 14, 68);
      doc.text(`Tanggal       : ${k.tanggal || '-'}`, 14, 74);
      doc.text(`Waktu         : ${k.waktuMulai || '-'} - ${k.waktuSelesai || '-'}`, 14, 80);
      doc.text(`Lokasi        : ${k.lokasi || '-'}`, 14, 86);
      doc.text(`Jenis         : ${k.jenisKegiatan || '-'}`, 14, 92);
      doc.text(`Status        : ${k.status?.replace('_', ' ') || '-'}`, 14, 98);
      if (k.deskripsi) doc.text(`Deskripsi     : ${k.deskripsi}`, 14, 104);

      const absensiKegiatan = attendance.filter(a => a.meetingId === k.id || a.kegiatanId === k.id);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Daftar Kehadiran:', 14, 116);

      autoTable(doc, {
        startY: 120,
        head: [['No', 'Nama', 'Waktu Absen', 'Status']],
        body: absensiKegiatan.length > 0
          ? absensiKegiatan.map((a, i) => [
              i + 1, a.userName || '-',
              a.checkInTime?.toDate ? a.checkInTime.toDate().toLocaleTimeString('id-ID') : a.checkInTime || '-',
              a.status || '-'
            ])
          : [['', 'Belum ada data absensi', '', '']],
        headStyles: { fillColor: [128, 0, 32], textColor: 255, fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [253, 242, 244] },
        styles: { cellPadding: 3 },
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(9);
      doc.text(`Total Hadir: ${absensiKegiatan.filter(a => a.status === 'Hadir').length}`, 14, finalY);
      doc.text(`Terlambat: ${absensiKegiatan.filter(a => a.status === 'Terlambat').length}`, 14, finalY + 6);

      doc.save(`Laporan_Kegiatan_${k.namaKegiatan}.pdf`);
      toast.success('Laporan Kegiatan berhasil diexport!');
      setShowKegiatanModal(false);
      setSelectedKegiatan('');
    } catch (e) {
      toast.error('Gagal export: ' + e.message);
    }
    setGenerating('');
  };

  const cards = [
    {
      title: 'Laporan Data Anggota',
      desc: 'Ekspor seluruh data anggota beserta divisi, status, dan informasi kontak.',
      icon: '👥', count: `${anggota.length} Anggota`,
      color: '#2563eb', key: 'anggota',
      action: exportLaporanAnggota,
      btnLabel: '📥 Export PDF'
    },
    {
      title: 'Laporan Kehadiran',
      desc: 'Pilih kegiatan lalu ekspor rekap kehadiran lengkap beserta status tiap anggota.',
      icon: '✅', count: `${attendance.length} Absensi`,
      color: '#16a34a', key: 'kehadiran',
      action: () => setShowKehadiranModal(true),
      btnLabel: '📋 Pilih Kegiatan'
    },
    {
      title: 'Laporan Kegiatan',
      desc: 'Pilih kegiatan tertentu lalu ekspor detail dan daftar kehadiran pesertanya.',
      icon: '📅', count: `${kegiatan.length} Kegiatan`,
      color: '#800020', key: 'kegiatan',
      action: () => setShowKegiatanModal(true),
      btnLabel: '📋 Pilih Kegiatan'
    },
  ];

  const ModalPilihKegiatan = ({ show, onClose, selected, onSelect, onExport, title, generating: gen, genKey }) => {
    if (!show) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px' }}>
          <h3 style={{ color: '#800020', marginTop: 0 }}>📅 {title}</h3>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>Pilih kegiatan yang ingin diekspor</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
            {kegiatan.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>Belum ada kegiatan</p>
            ) : kegiatan.map(k => (
              <div key={k.id} onClick={() => onSelect(k.id)}
                style={{ padding: '12px 16px', border: `2px solid ${selected === k.id ? '#800020' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', background: selected === k.id ? '#fdf2f4' : 'white', transition: 'all 0.2s' }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#1f2937' }}>{k.namaKegiatan}</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>📅 {k.tanggal} • 📍 {k.lokasi}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose}
              style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: '500' }}>
              Batal
            </button>
            <button onClick={onExport} disabled={!selected || gen === genKey}
              style={{ flex: 1, background: !selected ? '#9ca3af' : '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: !selected ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
              {gen === genKey ? '⏳ Generating...' : '📥 Export PDF'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Laporan PDF</h1>
      <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: '14px' }}>Export laporan organisasi dalam format PDF</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Memuat data...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {cards.map(card => (
            <div key={card.key} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderTop: `4px solid ${card.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px' }}>{card.icon}</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{card.title}</h3>
                  <span style={{ fontSize: '12px', color: card.color, fontWeight: '600' }}>{card.count}</span>
                </div>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>{card.desc}</p>
              <button onClick={card.action} disabled={generating === card.key}
                style={{ width: '100%', background: generating === card.key ? '#9ca3af' : card.color, color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: generating === card.key ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}>
                {generating === card.key ? '⏳ Generating...' : card.btnLabel}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '24px', background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>ℹ️ Informasi</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', fontSize: '13px', lineHeight: '2' }}>
          <li>PDF otomatis terdownload setelah diklik</li>
          <li>Laporan kehadiran menampilkan status tiap anggota per kegiatan</li>
          <li>Data diambil realtime dari Firebase</li>
        </ul>
      </div>

      {/* Modal Kehadiran */}
      <ModalPilihKegiatan
        show={showKehadiranModal}
        onClose={() => { setShowKehadiranModal(false); setSelectedKehadiran(''); }}
        selected={selectedKehadiran}
        onSelect={setSelectedKehadiran}
        onExport={exportLaporanKehadiran}
        title="Pilih Kegiatan - Laporan Kehadiran"
        generating={generating}
        genKey="kehadiran"
      />

      {/* Modal Kegiatan */}
      <ModalPilihKegiatan
        show={showKegiatanModal}
        onClose={() => { setShowKegiatanModal(false); setSelectedKegiatan(''); }}
        selected={selectedKegiatan}
        onSelect={setSelectedKegiatan}
        onExport={exportLaporanKegiatan}
        title="Pilih Kegiatan - Laporan Kegiatan"
        generating={generating}
        genKey="kegiatan"
      />
    </div>
  );
}