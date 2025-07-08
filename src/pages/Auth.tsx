import React, { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, User, Brain } from 'lucide-react'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const { user, loading: authLoading, signIn, signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('signin')
  
  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Hata mesajı varsa göster
  const error = searchParams.get('error')
  React.useEffect(() => {
    if (error) {
      toast.error(decodeURIComponent(error))
    }
  }, [error])

  // Kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
  if (user && !authLoading) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('E-posta ve şifre gerekli')
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      toast.success('Giriş başarılı!')
    } catch (error: any) {
      toast.error(error.message || 'Giriş yapılırken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) {
      toast.error('Tüm alanlar gerekli')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor')
      return
    }

    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password)
      toast.success('Kayıt başarılı! E-posta adresinizi kontrol edin.')
    } catch (error: any) {
      toast.error(error.message || 'Kayıt olurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-10 w-10 text-blue-400" />
            <span className="text-3xl font-bold text-white">ScoreResults</span>
            <span className="text-xl font-light text-blue-400">AI</span>
          </div>
          <p className="text-slate-300">AI destekli futbol tahmin sistemi</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/90 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-xl">Hesap İşlemleri</CardTitle>
            <CardDescription className="text-slate-300">
              Tahminlere erişmek için giriş yapın veya yeni hesap oluşturun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-700 border-slate-600">
                <TabsTrigger 
                  value="signin" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-blue-600"
                >
                  Giriş Yap
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-green-600"
                >
                  Kayıt Ol
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium">E-posta</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-slate-600 border-slate-500 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium">Şifre</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-slate-600 border-slate-500 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Giriş Yap
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white font-medium">E-posta</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-slate-600 border-slate-500 text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-green-400/20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white font-medium">Şifre</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="En az 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-slate-600 border-slate-500 text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-green-400/20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white font-medium">Şifre Tekrar</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Şifrenizi tekrar girin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 bg-slate-600 border-slate-500 text-white placeholder:text-slate-400 focus:border-green-400 focus:ring-green-400/20"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Kayıt Ol
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-300">
                Kayıt olarak{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                  Kullanım Şartları
                </a>{' '}
                ve{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                  Gizlilik Politikası
                </a>
                'nı kabul etmiş olursunuz.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}