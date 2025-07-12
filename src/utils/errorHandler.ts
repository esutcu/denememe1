import { toast } from 'sonner'

// Error types for better error handling
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  SUPABASE = 'SUPABASE',
  LLM = 'LLM',
  UNKNOWN = 'UNKNOWN'
}

export interface ApiError {
  type: ErrorType
  message: string
  details?: any
  code?: string | number
  retryable?: boolean
  userMessage?: string
}

class ErrorHandler {
  // Convert various error types to standardized ApiError
  standardizeError(error: any): ApiError {
    // Supabase errors
    if (error?.code && typeof error.code === 'string') {
      return this.handleSupabaseError(error)
    }

    // Network/Fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Network connection failed',
        details: error,
        retryable: true,
        userMessage: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin'
      }
    }

    // HTTP errors
    if (error?.status) {
      return this.handleHttpError(error)
    }

    // Auth errors
    if (error?.message?.includes('auth') || error?.message?.includes('token')) {
      return {
        type: ErrorType.AUTH,
        message: error.message,
        details: error,
        retryable: false,
        userMessage: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın'
      }
    }

    // LLM/API provider errors
    if (error?.message?.includes('OpenRouter') || error?.message?.includes('provider')) {
      return {
        type: ErrorType.LLM,
        message: error.message,
        details: error,
        retryable: true,
        userMessage: 'AI servisinde geçici bir sorun var. Lütfen birkaç saniye bekleyip tekrar deneyin'
      }
    }

    // Rate limit errors
    if (error?.message?.includes('limit') || error?.status === 429) {
      return {
        type: ErrorType.RATE_LIMIT,
        message: error.message || 'Rate limit exceeded',
        details: error,
        retryable: false,
        userMessage: 'Günlük tahmin limitinize ulaştınız. Yarın tekrar deneyin veya planınızı yükseltin'
      }
    }

    // Timeout errors
    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        message: 'Request timeout',
        details: error,
        retryable: true,
        userMessage: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin'
      }
    }

    // Validation errors
    if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message,
        details: error,
        retryable: false,
        userMessage: 'Girilen bilgiler geçersiz. Lütfen kontrol edin'
      }
    }

    // Generic server errors
    if (error?.status >= 500) {
      return {
        type: ErrorType.SERVER,
        message: error.message || 'Server error',
        details: error,
        retryable: true,
        userMessage: 'Sunucuda geçici bir sorun var. Lütfen birkaç dakika bekleyip tekrar deneyin'
      }
    }

    // Unknown errors
    return {
      type: ErrorType.UNKNOWN,
      message: error?.message || 'Unknown error',
      details: error,
      retryable: false,
      userMessage: 'Beklenmedik bir hata oluştu. Sorun devam ederse destek ekibiyle iletişime geçin'
    }
  }

  private handleSupabaseError(error: any): ApiError {
    const code = error.code
    const message = error.message || 'Supabase error'

    // Auth errors
    if (code === 'invalid_credentials' || code === 'email_not_confirmed') {
      return {
        type: ErrorType.AUTH,
        message,
        code,
        details: error,
        retryable: false,
        userMessage: code === 'invalid_credentials' 
          ? 'E-posta veya şifre hatalı' 
          : 'E-posta adresinizi doğrulayın'
      }
    }

    // Network/Connection errors
    if (code === 'network_error' || message.includes('network')) {
      return {
        type: ErrorType.NETWORK,
        message,
        code,
        details: error,
        retryable: true,
        userMessage: 'Bağlantı sorunu. İnternet bağlantınızı kontrol edin'
      }
    }

    // Rate limit
    if (code === 'rate_limit_exceeded') {
      return {
        type: ErrorType.RATE_LIMIT,
        message,
        code,
        details: error,
        retryable: false,
        userMessage: 'Çok fazla istek gönderdiniz. Lütfen birkaç dakika bekleyin'
      }
    }

    // Generic Supabase error
    return {
      type: ErrorType.SUPABASE,
      message,
      code,
      details: error,
      retryable: true,
      userMessage: 'Veritabanı bağlantısında sorun var. Lütfen tekrar deneyin'
    }
  }

  private handleHttpError(error: any): ApiError {
    const status = error.status
    const message = error.message || `HTTP ${status} error`

    if (status === 400) {
      return {
        type: ErrorType.VALIDATION,
        message,
        code: status,
        details: error,
        retryable: false,
        userMessage: 'Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin'
      }
    }

    if (status === 401) {
      return {
        type: ErrorType.AUTH,
        message,
        code: status,
        details: error,
        retryable: false,
        userMessage: 'Yetkilendirme hatası. Lütfen tekrar giriş yapın'
      }
    }

    if (status === 403) {
      return {
        type: ErrorType.AUTH,
        message,
        code: status,
        details: error,
        retryable: false,
        userMessage: 'Bu işlem için yetkiniz yok'
      }
    }

    if (status === 404) {
      return {
        type: ErrorType.VALIDATION,
        message,
        code: status,
        details: error,
        retryable: false,
        userMessage: 'Aranan kaynak bulunamadı'
      }
    }

    if (status === 429) {
      return {
        type: ErrorType.RATE_LIMIT,
        message,
        code: status,
        details: error,
        retryable: false,
        userMessage: 'Çok fazla istek. Lütfen bekleyip tekrar deneyin'
      }
    }

    if (status >= 500) {
      return {
        type: ErrorType.SERVER,
        message,
        code: status,
        details: error,
        retryable: true,
        userMessage: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin'
      }
    }

    return {
      type: ErrorType.UNKNOWN,
      message,
      code: status,
      details: error,
      retryable: false,
      userMessage: 'Beklenmedik bir hata oluştu'
    }
  }

  // Handle errors with user notifications
  handleError(error: any, context?: string): ApiError {
    const standardError = this.standardizeError(error)
    
    // Log for debugging
    console.error(`Error in ${context || 'unknown context'}:`, {
      type: standardError.type,
      message: standardError.message,
      details: standardError.details
    })

    // Show user notification
    const toastMessage = standardError.userMessage || standardError.message
    
    switch (standardError.type) {
      case ErrorType.AUTH:
        toast.error(`🔒 ${toastMessage}`)
        break
      case ErrorType.NETWORK:
        toast.error(`🌐 ${toastMessage}`)
        break
      case ErrorType.RATE_LIMIT:
        toast.warning(`⏱️ ${toastMessage}`)
        break
      case ErrorType.VALIDATION:
        toast.warning(`⚠️ ${toastMessage}`)
        break
      case ErrorType.SERVER:
        toast.error(`🔧 ${toastMessage}`)
        break
      case ErrorType.LLM:
        toast.error(`🧠 ${toastMessage}`)
        break
      default:
        toast.error(`❌ ${toastMessage}`)
    }

    return standardError
  }

  // Retry logic for retryable errors
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000,
    context?: string
  ): Promise<T> {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        const standardError = this.standardizeError(error)

        // Don't retry non-retryable errors
        if (!standardError.retryable) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break
        }

        console.warn(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`, {
          context,
          error: standardError.message
        })

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delayMs))
        
        // Exponential backoff
        delayMs *= 1.5
      }
    }

    // All retries failed
    throw lastError
  }

  // Graceful degradation helper
  async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await primaryOperation()
    } catch (error) {
      const standardError = this.standardizeError(error)
      
      console.warn(`Primary operation failed, trying fallback...`, {
        context,
        error: standardError.message
      })

      try {
        const result = await fallbackOperation()
        toast.info('🔄 Yedek sistem kullanılıyor')
        return result
      } catch (fallbackError) {
        // Both failed - handle the original error
        this.handleError(error, context)
        throw error
      }
    }
  }

  // Circuit breaker pattern for external APIs
  private circuitBreakers = new Map<string, {
    failures: number
    lastFailure: number
    state: 'closed' | 'open' | 'half-open'
  }>()

  async withCircuitBreaker<T>(
    operation: () => Promise<T>,
    serviceName: string,
    failureThreshold: number = 5,
    timeoutMs: number = 60000
  ): Promise<T> {
    const now = Date.now()
    let breaker = this.circuitBreakers.get(serviceName)

    if (!breaker) {
      breaker = { failures: 0, lastFailure: 0, state: 'closed' }
      this.circuitBreakers.set(serviceName, breaker)
    }

    // Check if circuit should be reset
    if (breaker.state === 'open' && now - breaker.lastFailure > timeoutMs) {
      breaker.state = 'half-open'
      breaker.failures = 0
    }

    // Circuit is open - fail fast
    if (breaker.state === 'open') {
      throw new Error(`Circuit breaker is open for ${serviceName}`)
    }

    try {
      const result = await operation()
      
      // Success - reset circuit breaker
      if (breaker.state === 'half-open') {
        breaker.state = 'closed'
      }
      breaker.failures = 0
      
      return result
    } catch (error) {
      breaker.failures++
      breaker.lastFailure = now

      // Open circuit if threshold reached
      if (breaker.failures >= failureThreshold) {
        breaker.state = 'open'
        console.warn(`Circuit breaker opened for ${serviceName}`)
      }

      throw error
    }
  }

  // Validation helpers
  validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new Error(`${fieldName} is required`)
    }
  }

  validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format')
    }
  }

  validateMatchData(homeTeam: string, awayTeam: string): void {
    this.validateRequired(homeTeam, 'Home team')
    this.validateRequired(awayTeam, 'Away team')
    
    if (homeTeam.trim() === awayTeam.trim()) {
      throw new Error('Home and away teams cannot be the same')
    }
  }
}

export const errorHandler = new ErrorHandler()

// Utility functions for components
export const handleAsyncError = (error: any, context?: string) => {
  return errorHandler.handleError(error, context)
}

export const withRetry = (operation: () => Promise<any>, maxRetries?: number, context?: string) => {
  return errorHandler.withRetry(operation, maxRetries, 1000, context)
}

export const withFallback = (primary: () => Promise<any>, fallback: () => Promise<any>, context?: string) => {
  return errorHandler.withFallback(primary, fallback, context)
}