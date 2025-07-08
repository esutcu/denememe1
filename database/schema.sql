-- ScoreResultsAI Database Schema
-- ================================
-- LLM + Cache Tabanlı Futbol Tahmin Sistemi

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================
-- LLM PROVIDER MANAGEMENT SYSTEM
-- ================================

-- LLM Providers (OpenRouter API Keys Management)
CREATE TABLE llm_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- "OpenRouter_1", "OpenRouter_2", etc.
    api_endpoint VARCHAR(500) NOT NULL DEFAULT 'https://openrouter.ai/api/v1/chat/completions',
    api_key_encrypted TEXT NOT NULL, -- Encrypted API key
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    priority INTEGER DEFAULT 1, -- 1 = highest priority
    rate_limit_per_minute INTEGER DEFAULT 60,
    last_used_at TIMESTAMP,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Supported LLM Models
CREATE TABLE llm_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES llm_providers(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL, -- "deepseek/deepseek-r1", "openrouter/cypher-alpha:free"
    display_name VARCHAR(200) NOT NULL, -- "DeepSeek R1", "Cypher Alpha"
    cost_per_1k_tokens DECIMAL(10,6) DEFAULT 0, -- For cost tracking
    max_tokens INTEGER DEFAULT 4096,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_default BOOLEAN DEFAULT false,
    model_type VARCHAR(50) DEFAULT 'chat', -- 'chat', 'completion'
    supports_streaming BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- MATCH PREDICTIONS CACHE SYSTEM
-- ================================

-- Match Predictions Cache (CORE TABLE)
CREATE TABLE match_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id VARCHAR(100) NOT NULL, -- From API-Football
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    league_name VARCHAR(100) NOT NULL,
    match_date TIMESTAMP NOT NULL,
    
    -- LLM Analysis Source
    llm_provider VARCHAR(100) NOT NULL,
    llm_model VARCHAR(100) NOT NULL,
    
    -- Prediction Results
    winner_prediction VARCHAR(10) CHECK (winner_prediction IN ('HOME', 'DRAW', 'AWAY')),
    winner_confidence INTEGER CHECK (winner_confidence BETWEEN 1 AND 100),
    
    -- Goal Predictions
    goals_prediction JSONB, -- {"home": 2, "away": 1, "total": 3, "over_under_line": 2.5}
    over_under_prediction VARCHAR(10) CHECK (over_under_prediction IN ('OVER', 'UNDER')),
    over_under_confidence INTEGER CHECK (over_under_confidence BETWEEN 1 AND 100),
    
    -- Detailed Analysis
    analysis_text TEXT, -- LLM'in detaylı analizi
    risk_factors JSONB, -- ["injury_concerns", "weather_conditions"]
    key_stats JSONB, -- Önemli istatistikler ve faktörler
    confidence_breakdown JSONB, -- {"home": 45, "draw": 25, "away": 30}
    
    -- Match Context Data (LLM'e gönderilen veriler)
    input_data JSONB, -- Son 5 maç, head2head, form data etc.
    
    -- Cache Management
    cache_expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
    processing_time_ms INTEGER, -- LLM response süresi
    token_usage JSONB, -- {"input_tokens": 1500, "output_tokens": 300, "total_cost": 0.002}
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(match_id, llm_provider, llm_model)
);

-- ================================
-- USER SUBSCRIPTION SYSTEM
-- ================================

-- User Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('free', 'basic', 'pro')),
    
    -- Stripe Integration
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    
    -- Plan Limits
    daily_limit INTEGER NOT NULL,
    monthly_limit INTEGER,
    
    -- Status & Billing
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    
    -- Pricing
    amount INTEGER, -- in kuruş (TRY)
    currency VARCHAR(3) DEFAULT 'TRY',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id) -- Her kullanıcının sadece bir subscription'ı olabilir
);

-- Payment History
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Stripe Integration
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    
    -- Payment Details
    amount INTEGER NOT NULL, -- in kuruş
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled', 'refunded')),
    
    -- Metadata
    payment_method VARCHAR(50), -- 'card', 'bank_transfer', etc.
    failure_reason TEXT,
    receipt_url TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- USAGE TRACKING SYSTEM
-- ================================

-- Daily Usage Tracking
CREATE TABLE user_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    
    -- Usage Counters
    prediction_requests INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    
    -- API Usage
    llm_requests INTEGER DEFAULT 0,
    api_football_requests INTEGER DEFAULT 0,
    
    -- Plan tracking
    plan_type VARCHAR(20) DEFAULT 'free',
    daily_limit INTEGER DEFAULT 5,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, date)
);

-- User Activities Log
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'prediction_request', 'login', 'subscription_change'
    activity_data JSONB, -- Additional context
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- API FOOTBALL INTEGRATION
-- ================================

-- Football Fixtures Cache
CREATE TABLE football_fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id INTEGER UNIQUE NOT NULL, -- API-Football fixture ID
    
    -- Match Info
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    home_team_id INTEGER,
    away_team_id INTEGER,
    
    -- League Info
    league_name VARCHAR(100) NOT NULL,
    league_id INTEGER,
    season INTEGER,
    round VARCHAR(50),
    
    -- Match Details
    match_date TIMESTAMP NOT NULL,
    venue VARCHAR(100),
    referee VARCHAR(100),
    
    -- Status
    status VARCHAR(50), -- 'scheduled', 'live', 'finished', 'postponed'
    status_short VARCHAR(10),
    
    -- Scores (if finished)
    home_score INTEGER,
    away_score INTEGER,
    
    -- Metadata
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- TTL for cache
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Team Statistics Cache
CREATE TABLE team_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id INTEGER NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    league_id INTEGER NOT NULL,
    season INTEGER NOT NULL,
    
    -- Form and Stats
    form VARCHAR(20), -- "WWDLL"
    recent_matches JSONB, -- Son 5 maç detayları
    
    -- Home/Away Stats
    home_stats JSONB, -- Ev sahibi istatistikleri
    away_stats JSONB, -- Deplasman istatistikleri
    overall_stats JSONB, -- Genel istatistikler
    
    -- Head to Head vs opponents
    h2h_stats JSONB, -- Rakip takımlara karşı geçmiş
    
    -- Cache management
    last_updated TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '6 hours'),
    
    UNIQUE(team_id, league_id, season)
);

-- ================================
-- SYSTEM MONITORING
-- ================================

-- System Health Monitoring
CREATE TABLE system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(100) NOT NULL, -- 'llm_provider_1', 'api_football', 'stripe'
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
    response_time_ms INTEGER,
    error_message TEXT,
    last_check TIMESTAMP DEFAULT NOW(),
    
    -- Metrics
    success_rate DECIMAL(5,2), -- Son 24 saatteki başarı oranı
    total_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Match Predictions Cache indexes
CREATE INDEX idx_match_predictions_match_id ON match_predictions(match_id);
CREATE INDEX idx_match_predictions_date ON match_predictions(match_date);
CREATE INDEX idx_match_predictions_league ON match_predictions(league_name);
CREATE INDEX idx_match_predictions_cache_expires ON match_predictions(cache_expires_at);
CREATE INDEX idx_match_predictions_provider_model ON match_predictions(llm_provider, llm_model);

-- Usage tracking indexes
CREATE INDEX idx_user_usage_user_date ON user_usage(user_id, date);
CREATE INDEX idx_user_usage_date ON user_usage(date);

-- Subscription indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Football fixtures indexes
CREATE INDEX idx_football_fixtures_date ON football_fixtures(match_date);
CREATE INDEX idx_football_fixtures_league ON football_fixtures(league_name);
CREATE INDEX idx_football_fixtures_teams ON football_fixtures(home_team, away_team);
CREATE INDEX idx_football_fixtures_expires ON football_fixtures(expires_at);

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

-- Enable RLS
ALTER TABLE match_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Match predictions - herkes okuyabilir (public read), sadece service role yazabilir
CREATE POLICY "Public read access on match_predictions" ON match_predictions
    FOR SELECT USING (true);

CREATE POLICY "Service role full access on match_predictions" ON match_predictions
    USING (auth.role() = 'service_role');

-- Subscriptions - kullanıcılar sadece kendi kayıtlarını görebilir
CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on subscriptions" ON subscriptions
    USING (auth.role() = 'service_role');

-- User usage - kullanıcılar sadece kendi kullanımlarını görebilir
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on user_usage" ON user_usage
    USING (auth.role() = 'service_role');

-- ================================
-- FUNCTIONS AND TRIGGERS
-- ================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_match_predictions_updated_at BEFORE UPDATE ON match_predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatic cache cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    -- Clean expired match predictions
    DELETE FROM match_predictions WHERE cache_expires_at < NOW();
    
    -- Clean expired football fixtures
    DELETE FROM football_fixtures WHERE expires_at < NOW();
    
    -- Clean old team statistics
    DELETE FROM team_statistics WHERE expires_at < NOW();
    
    -- Clean old user activities (keep 30 days)
    DELETE FROM user_activities WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Clean old usage records (keep 90 days)
    DELETE FROM user_usage WHERE date < CURRENT_DATE - INTERVAL '90 days';
    
END;
$$ LANGUAGE plpgsql;

-- ================================
-- INITIAL DATA
-- ================================

-- Insert default LLM providers (4 yedekli OpenRouter API)
INSERT INTO llm_providers (name, api_endpoint, api_key_encrypted, priority) VALUES
('OpenRouter_Primary', 'https://openrouter.ai/api/v1/chat/completions', 
 crypt('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', gen_salt('bf')), 1),
('OpenRouter_Secondary', 'https://openrouter.ai/api/v1/chat/completions', 
 crypt('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', gen_salt('bf')), 2),
('OpenRouter_Tertiary', 'https://openrouter.ai/api/v1/chat/completions', 
 crypt('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', gen_salt('bf')), 3),
('OpenRouter_Backup', 'https://openrouter.ai/api/v1/chat/completions', 
 crypt('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', gen_salt('bf')), 4);

-- Insert supported models
WITH provider_ids AS (
    SELECT id, name FROM llm_providers
)
INSERT INTO llm_models (provider_id, model_name, display_name, is_default, max_tokens)
SELECT 
    p.id,
    'deepseek/deepseek-r1' as model_name,
    'DeepSeek R1' as display_name,
    (p.name = 'OpenRouter_Primary') as is_default,
    8192 as max_tokens
FROM provider_ids p
UNION ALL
SELECT 
    p.id,
    'deepseek/deepseek-chat-v3-0324',
    'DeepSeek Chat V3',
    false,
    4096
FROM provider_ids p
UNION ALL
SELECT 
    p.id,
    'openrouter/cypher-alpha:free',
    'Cypher Alpha (Free)',
    false,
    4096
FROM provider_ids p
UNION ALL
SELECT 
    p.id,
    'mistralai/mistral-small-3.2-24b-instruct:free',
    'Mistral Small 3.2 (Free)',
    false,
    4096
FROM provider_ids p;