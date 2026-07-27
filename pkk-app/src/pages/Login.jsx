import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError('Email atau password salah!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Sisi Kiri - Dekorasi */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white"></div>
        </div>
        <div className="text-center text-white z-10">
          <div className="text-8xl mb-6">🌿</div>
          <h1 className="text-4xl font-bold mb-4">ArtaWarga</h1>
          <p className="text-green-100 text-lg mb-8">Sistem Kas & Arisan PKK</p>
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <span className="text-green-100">Kelola kas PKK dengan mudah</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎰</span>
              <span className="text-green-100">Catat arisan uang & barang</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <span className="text-green-100">Kelola data anggota PKK</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <span className="text-green-100">Laporan keuangan otomatis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sisi Kanan - Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="text-5xl mb-3">🌿</div>
            <h1 className="text-2xl font-bold text-green-800">ArtaWarga</h1>
            <p className="text-green-600 text-sm">Sistem Informasi Kas & Arisan</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Selamat Datang! 👋</h2>
            <p className="text-gray-500 text-sm mb-8">Masuk ke akun PKK kamu</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                    placeholder="email@pkk.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Masuk...
                  </span>
                ) : 'Masuk →'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
          ArtaWarga Kelurahan Banjarsari © 2025
          </p>
        </div>
      </div>
    </div>
  )
}