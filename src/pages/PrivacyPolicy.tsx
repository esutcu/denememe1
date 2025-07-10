import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Gizlilik Politikası</h1>
      
      <div className="prose prose-lg dark:prose-invert">
        <p className="mb-4">
          Bu Gizlilik Politikası, ScoreResultsAI ("Şirket", "biz", "bize" veya "bizim") olarak, 
          web sitemiz aracılığıyla sağladığınız bilgileri nasıl topladığımızı, kullandığımızı, 
          paylaştığımızı ve koruduğumuzu açıklar.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Toplanan Bilgiler</h2>
        <p className="mb-4">
          Kullanıcılarımızdan şu tür kişisel bilgileri toplayabiliriz:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>İsim ve iletişim bilgileri (e-posta adresi, telefon numarası)</li>
          <li>Demografik bilgiler (ülke, şehir)</li>
          <li>Hesap bilgileri (kullanıcı adı, şifre)</li>
          <li>Ödeme bilgileri (kredi kartı detayları, fatura adresi)</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Bilgilerin Kullanımı</h2>
        <p className="mb-4">
          Topladığımız bilgileri şu amaçlarla kullanırız:
        </p>
        <ul className="list-disc pl-8 mb-4">
          <li>Hesabınızı yönetmek ve hizmetlerimizi sağlamak</li>
          <li>Müşteri desteği sağlamak</li>
          <li>Hizmetlerimizi iyileştirmek</li>
          <li>Yasal gereklilikleri yerine getirmek</li>
        </ul>
        
        <div className="mt-12">
          <Button asChild>
            <Link to="/">Ana Sayfaya Dön</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy