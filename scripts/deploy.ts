#!/usr/bin/env tsx

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Vercel deployment configuration
const VERCEL_CONFIG = {
  token: 'zRUDjwxOcrmbODzLbCsBhO9Q',
  username: 'thmnt001-7773',
  userId: 'JumNFYtn16pf8Thk5KAHVLJT',
  projectUrl: 'https://y3fnh28unp.space.minimax.io'
}

async function deployToVercel() {
  try {
    console.log('🚀 ScoreResultsAI Deployment başlatılıyor...')
    
    // 1. Build kontrolü
    console.log('📦 Build işlemi başlatılıyor...')
    await execAsync('npm run build')
    console.log('✅ Build tamamlandı')
    
    // 2. Vercel deploy
    console.log('🌐 Vercel\'e deploy ediliyyor...')
    const { stdout, stderr } = await execAsync(`vercel --token ${VERCEL_CONFIG.token} --prod`)
    
    if (stderr) {
      console.error('❌ Deploy hatası:', stderr)
      return
    }
    
    console.log('✅ Deploy başarılı!')
    console.log('🔗 URL:', VERCEL_CONFIG.projectUrl)
    console.log('📊 Deploy detayları:', stdout)
    
    // 3. Health check
    console.log('🏥 Health check yapılıyor...')
    const healthCheck = await fetch(VERCEL_CONFIG.projectUrl)
    
    if (healthCheck.ok) {
      console.log('✅ Site başarıyla çalışıyor!')
    } else {
      console.log('⚠️ Site response kodu:', healthCheck.status)
    }
    
  } catch (error) {
    console.error('❌ Deploy başarısız:', error)
    process.exit(1)
  }
}

// Script çalıştır
if (require.main === module) {
  deployToVercel()
}

export { deployToVercel, VERCEL_CONFIG }