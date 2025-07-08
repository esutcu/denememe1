import { useNavigate } from 'react-router-dom'

const Settings = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button onClick={() => navigate('/dashboard')} className="mb-4 text-blue-500">
        ← Dashboard'a Dön
      </button>
      <h1 className="text-2xl font-bold">Ayarlar</h1>
      <p className="text-gray-600 mt-4">Geliştirme aşamasında...</p>
    </div>
  )
}

export default Settings