import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Giriş Yap</h1>
        <p className="text-center text-gray-600 mb-4">Geliştirme aşamasında...</p>
        <button
          onClick={() => navigate('/')}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  )
}

export default Login