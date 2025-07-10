import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'

const TermsOfUse = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Kullanım Şartları</h1>
      
      <div className="prose prose-lg dark:prose-invert">
        <p className="mb-4">
          Lütfen ScoreResultsAI web sitesini ("Site") ve hizmetlerimizi ("Hizmetler") 
          kullanmadan önce bu Kullanım Şartlarını dikkatlice okuyun.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Hesap Sorumlulukları</h2>
        <p className="mb-4">
          Hesabınızın güvenliğinden siz sorumlusunuz. Hesap bilgilerinizi gizli tutmalı ve 
          hesabınız üzerindeki tüm etkinliklerden sorumlu olduğunuzu kabul etmelisiniz.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Fikri Mülkiyet</h2>
        <p className="mb-4">
          Sitedeki tüm içerikler (metinler, grafikler, logolar, görseller) ScoreResultsAI'ın 
          mülkiyetindedir ve uluslararası telif hakkı yasalarıyla korunmaktadır.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Hizmet Değişiklikleri</h2>
        <p className="mb-4">
          Hizmetlerimizi herhangi bir bildirimde bulunmaksızın değiştirme, askıya alma veya 
          sonlandırma hakkını saklı tutarız.
        </p>
        
        <div className="mt-12">
          <Button asChild>
            <Link to="/">Ana Sayfaya Dön</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TermsOfUse