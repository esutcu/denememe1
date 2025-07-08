import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // URL'den hash fragment'i al
        const hashFragment = window.location.hash

        if (hashFragment && hashFragment.length > 0) {
          // Auth code'u session ile değiştir
          const { data, error } = await supabase.auth.exchangeCodeForSession(hashFragment)

          if (error) {
            console.error('Error exchanging code for session:', error.message)
            navigate('/auth?error=' + encodeURIComponent(error.message))
            return
          }

          if (data.session) {
            // Başarıyla giriş yapıldı, dashboard'a yönlendir
            navigate('/dashboard')
            return
          }
        }

        // Eğer buraya geldiysek, birşeyler yanlış
        navigate('/auth?error=No session found')
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/auth?error=Authentication failed')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
        <p className="text-white">Giriş işlemi tamamlanıyor...</p>
      </div>
    </div>
  )
}