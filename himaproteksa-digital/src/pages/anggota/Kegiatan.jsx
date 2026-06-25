import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function KegiatanAnggota() {
  const { user, userData } = useAuth();
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('semua');
  const [absensiStatus, setAbsensiStatus] = useState({});

  // Kamera
  const [activeKegiatan, setActiveKegiatan] = useState(null);
  const [step, setStep] = useState(''); // 'camera' | 'preview' | 'done'
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => { fetchKegiatan(); }, []);

  const fetchKegiatan = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'kegiatan'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => a.tanggal?.localeCompare(b.tanggal));
      setKegiatan(data);

      // Cek absensi user untuk setiap kegiatan
      if (user) {
        const attSnap = await getDocs(
          query(collection(db, 'attendance'), where('userId', '==', user.uid))
        );
        const status = {};
        attSnap.docs.forEach(d => {
          const att = d.data();
          status[att.meetingId || att.kegiatanId] = att.status;
        });
        setAbsensiStatus(status);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const bukaKamera = async (k) => {
    setActiveKegiatan(k);
    setPhoto(null);
    setStep('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (e) {
      toast.error('Gagal membuka kamera! Izinkan akses kamera.');
      setStep('');
      setActiveKegiatan(null);
    }
  };

  const ambilFoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setPhoto(dataUrl);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setStep('preview');
  };

  const ulangi = async () => {
    setPhoto(null);
    await bukaKamera(activeKegiatan);
  };

  const hitungStatus = (k) => {
    const now = new Date();
    const [jam, menit] = k.waktuMulai?.split(':').map(Number) || [0, 0];
    const waktuMulai = new Date();
    waktuMulai.setHours(jam, menit, 0);
    const selisih = (now - waktuMulai) / 60000;
    return selisih <= 15 ? 'Hadir' : 'Terlambat';
  };

  const simpanAbsensi = async () => {
    if (!photo || !activeKegiatan) return;
    setUploading(true);
    try {
      const fotoRef = ref(storage, `attendance/${activeKegiatan.id}/${user.uid}_${Date.now()}.jpg`);
      await uploadString(fotoRef, photo, 'data_url');
      const photoUrl = await getDownloadURL(fotoRef);
      const status = hitungStatus(activeKegiatan);

      await addDoc(collection(db, 'attendance'), {
        meetingId: activeKegiatan.id,
        kegiatanId: activeKegiatan.id,
        userId: user.uid,
        userName: userData?.nama || userData?.name || user.email,
        photoUrl,
        checkInTime: serverTimestamp(),
        status,
      });

      toast.success(`Absensi berhasil! Status: ${status}`);
      setAbsensiStatus(prev => ({ ...prev, [activeKegiatan.id]: status }));
      setStep('done');
    } catch (e) {
      toast.error('Gagal menyimpan absensi: ' + e.message);
    }
    setUploading(false);
  };

  const tutupModal = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setStep('');
    setActiveKegiatan(null);
    setPhoto(null);
  };

  const getStatusStyle = (status) => {
    if (status === 'akan_datang') return { bg: '#dbeafe', color: '#1d4ed8', label: 'Akan Datang' };
    if (status === 'berlangsung') return { bg: '#dcfce7', color: '#16a34a', label: 'Berlangsung' };
    return { bg: '#f3f4f6', color: '#6b7280', label: 'Selesai' };
  };

  const getJenisStyle = (jenis) => {
    if (jenis === 'rapat') return { bg: '#fef3c7', color: '#d97706' };
    if (jenis === 'pelatihan') return { bg: '#ede9fe', color: '#7c3aed' };
    if (jenis === 'acara') return { bg: '#fce7f3', color: '#be185d' };
    return { bg: '#f3f4f6', color: '#6b7280' };
  };

  const getAbsenBadge = (kegiatanId) => {
    const s = absensiStatus[kegiatanId];
    if (s === 'Hadir') return { label: '✅ Sudah Absen - Hadir', color: '#16a34a', bg: '#dcfce7' };
    if (s === 'Terlambat') return { label: '⏰ Sudah Absen - Terlambat', color: '#d97706', bg: '#fef3c7' };
    return null;
  };

  const today = new Date().toISOString().split('T')[0];
  const filtered = kegiatan.filter(k => {
    const matchSearch = k.namaKegiatan?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'semua' || k.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>Kegiatan & Absensi</h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Lihat jadwal dan lakukan absensi kegiatan</p>
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Cari kegiatan..."
          style={{ padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', flex: 1, minWidth: '200px', outline: 'none' }} />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'semua', label: 'Semua' },
            { key: 'akan_datang', label: 'Akan Datang' },
            { key: 'berlangsung', label: 'Berlangsung' },
            { key: 'selesai', label: 'Selesai' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', background: filter === f.key ? '#800020' : 'white', color: filter === f.key ? 'white' : '#6b7280', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Memuat data...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#6b7280' }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📭</p>
          <p style={{ margin: 0 }}>Tidak ada kegiatan ditemukan</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(k => {
            const statusStyle = getStatusStyle(k.status);
            const jenisStyle = getJenisStyle(k.jenisKegiatan);
            const absenBadge = getAbsenBadge(k.id);
            const sudahAbsen = !!absensiStatus[k.id];
            const isMendatang = k.tanggal >= today;

            return (
              <div key={k.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderTop: `4px solid ${isMendatang ? '#800020' : '#e5e7eb'}` }}>

                {/* Badge status & jenis */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ background: jenisStyle.bg, color: jenisStyle.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                    {k.jenisKegiatan}
                  </span>
                  <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                    {statusStyle.label}
                  </span>
                </div>

                {/* Nama */}
                <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{k.namaKegiatan}</h3>

                {/* Detail */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>📅 {k.tanggal}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>🕐 {k.waktuMulai} - {k.waktuSelesai}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>📍 {k.lokasi}</p>
                  {k.deskripsi && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af', lineHeight: '1.4' }}>{k.deskripsi}</p>}
                </div>

                {/* Status absen */}
                {absenBadge && (
                  <div style={{ background: absenBadge.bg, color: absenBadge.color, padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', textAlign: 'center', marginBottom: '10px' }}>
                    {absenBadge.label}
                  </div>
                )}

                {/* Tombol Absen */}
                {!sudahAbsen && k.status !== 'selesai' && (
                  <button onClick={() => bukaKamera(k)}
                    style={{ width: '100%', background: '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                    📷 Absen Sekarang
                  </button>
                )}

                {k.status === 'selesai' && !sudahAbsen && (
                  <div style={{ background: '#f3f4f6', color: '#9ca3af', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', textAlign: 'center' }}>
                    Kegiatan sudah selesai
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Kamera */}
      {activeKegiatan && step && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '420px' }}>

            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#800020', fontSize: '16px' }}>
                {step === 'camera' ? '📷 Ambil Foto Selfie' : step === 'preview' ? '🔍 Preview Foto' : '🎉 Absensi Berhasil!'}
              </h3>
              <button onClick={tutupModal}
                style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}>
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280' }}>
              {activeKegiatan.namaKegiatan} • {activeKegiatan.tanggal}
            </p>

            {/* Kamera */}
            {step === 'camera' && (
              <>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>Posisikan wajah di tengah</p>
                <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000', marginBottom: '12px' }}>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', borderRadius: '12px' }} />
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button onClick={ambilFoto}
                  style={{ width: '100%', background: '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  📸 Ambil Foto
                </button>
              </>
            )}

            {/* Preview */}
            {step === 'preview' && photo && (
              <>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>Pastikan foto jelas dan wajah terlihat</p>
                <img src={photo} alt="Preview" style={{ width: '100%', borderRadius: '12px', marginBottom: '12px', border: '2px solid #e5e7eb' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={ulangi}
                    style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: '500' }}>
                    🔄 Ulangi
                  </button>
                  <button onClick={simpanAbsensi} disabled={uploading}
                    style={{ flex: 1, background: uploading ? '#9ca3af' : '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                    {uploading ? 'Menyimpan...' : '✅ Kirim Absensi'}
                  </button>
                </div>
              </>
            )}

            {/* Done */}
            {step === 'done' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: '48px', margin: '0 0 12px' }}>🎉</p>
                <p style={{ fontWeight: '700', fontSize: '16px', color: '#16a34a', margin: '0 0 4px' }}>Absensi Berhasil!</p>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 16px' }}>
                  Status: <strong style={{ color: '#800020' }}>{absensiStatus[activeKegiatan.id]}</strong>
                </p>
                {photo && <img src={photo} alt="Foto absen" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #800020', margin: '0 auto 16px', display: 'block' }} />}
                <button onClick={tutupModal}
                  style={{ background: '#800020', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', fontWeight: '600' }}>
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}