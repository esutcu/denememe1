import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { ArrowLeft, Home, Search, AlertCircle } from 'lucide-react'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-lg glass-card border-white/20">
        <CardContent className="p-8 text-center space-y-6">
          {/* Error Icon */}
          <div className="glass-medium rounded-2xl p-6 w-24 h-24 flex items-center justify-center mx-auto">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
          
          {/* Error Message */}
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-red-400">404</h1>
            <h2 className="text-2xl font-semibold text-white">Sayfa Bulunamadı</h2>
            <p className="text-white/80">
              Aradığınız sayfa mevcut değil, taşınmış ya da silinmiş olabilir.
            </p>
          </div>

          {/* Suggestions */}
          <div className="glass-medium rounded-xl p-4">
            <div className="text-sm text-white/80">
              <p className="mb-3 font-medium text-white">Aşağıdaki seçenekleri deneyebilirsiniz:</p>
              <ul className="text-left space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  URL'yi doğru yazdığınızdan emin olun
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  Ana sayfaya giderek aradığınızı bulun
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  Dashboard'da maçları ve analizleri inceleyin
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 glass-medium border-white/30 text-white hover:border-white/50 transition-all duration-300"
            >
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 glass-button border-white/30 text-white/90 hover:text-white transition-all duration-300"
            >
              <Search className="h-4 w-4" />
              Dashboard
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri Dön
            </Button>
          </div>

          {/* Additional Help */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-white/70">
              Problem devam ediyorsa, 
              <a href="mailto:support@scoreresultsai.com" className="text-blue-400 hover:text-blue-300 transition-colors ml-1">
                destek ekibimizle iletişim kurun
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotFound