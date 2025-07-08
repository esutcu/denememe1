import { useNavigate } from 'react-router-dom'

const Pricing = () => {
  const navigate = useNavigate()

  const plans = [
    {
      name: 'Ücretsiz',
      price: 0,
      features: ['5 tahmin/gün', 'Temel analiz', 'Sadece Süper Lig']
    },
    {
      name: 'Temel',
      price: 99,
      features: ['50 tahmin/ay', 'Detaylı analiz', '3 Major Lig'],
      popular: true
    },
    {
      name: 'Orta',
      price: 199,
      features: ['200 tahmin/ay', 'Gelişmiş AI', '6 Major Lig']
    },
    {
      name: 'Gelişmiş',
      price: 399,
      features: ['Sınırsız tahmin', 'Premium AI', 'Tüm Ligler']
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            ← Ana Sayfaya Dön
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Size Uygun Paketi Seçin</h1>
          <p className="text-xl text-gray-600">AI destekli futbol tahmin sistemi</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white p-6 rounded-lg shadow-lg ${plan.popular ? 'border-2 border-blue-500 scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white text-center py-1 px-3 rounded-full text-sm mb-4">
                  En Popüler
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold mb-4">
                {plan.price === 0 ? 'Ücretsiz' : `₺${plan.price}`}
                {plan.price > 0 && <span className="text-sm text-gray-600">/ay</span>}
              </div>
              
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => navigate('/auth/register')}
                className={`w-full py-2 px-4 rounded font-medium ${
                  plan.popular 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {plan.price === 0 ? 'Hemen Başla' : 'Satın Al'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Pricing