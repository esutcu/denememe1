import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { ArrowLeft, Home, Search, AlertTriangle } from 'lucide-react'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center space-y-6">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          
          {/* Error Message */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-red-600 dark:text-red-400">404</h1>
            <h2 className="text-2xl font-semibold">Sayfa Bulunamadı</h2>
            <p className="text-muted-foreground">
              Aradığınız sayfa mevcut değil, taşınmış ya da silinmiş olabilir.
            </p>
          </div>

          {/* Suggestions */}
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Aşağıdaki seçenekleri deneyebilirsiniz:</p>
              <ul className="text-left space-y-1">
                <li>• URL'yi doğru yazdığınızdan emin olun</li>
                <li>• Ana sayfaya giderek aradığınızı bulun</li>
                <li>• Dashboard'da maçları ve analizleri inceleyin</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Dashboard
            </Button>
            
            <Button 
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri Dön
            </Button>
          </div>

          {/* Additional Help */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Problem devam ediyorsa, 
              <a href="#" className="text-primary hover:underline ml-1">
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