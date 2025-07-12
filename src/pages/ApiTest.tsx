import React from 'react'
import { ApiTestPanel } from '../components/ApiTestPanel'

export default function ApiTest() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Test Center</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Backend-frontend bağlantılarını test edin ve sistem durumunu kontrol edin
          </p>
        </div>
        
        <ApiTestPanel />
      </div>
    </div>
  )
}