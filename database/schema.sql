-- =============================================
-- ScoreResultsAI - Complete Database Schema
-- LLM + Cache Based Football Prediction System
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ===== 1. LLM PROVIDERS & MODELS =====

CREATE TABLE llm_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    api_endpoint VARCHAR(500) NOT NULL DEFAULT 'https://openrouter.ai/api/v1/chat/completions',
    api_key_encrypted TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    priority INTEGER DEFAULT 1,
    rate_limit_per_minute INTEGER DEFAULT 60,
    last_used_at TIMESTAMP,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE llm_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES llm_providers(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL, -- "deepseek/deepseek-r1"
    display_name VARCHAR(200) NOT NULL,
    cost_per_1k_tokens DECIMAL(10,6) DEFAULT 0.0,
    max_tokens INTEGER DEFAULT 4096,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_default BOOLEAN DEFAULT false,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    avg_response_time INTEGER DEFAULT 0, -- milliseconds
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider_id, model_name)
);

-- ===== 2. MATCH PREDICTIONS CACHE =====

CREATE TABLE match_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id VARCHAR(100) NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    league_name VARCHAR(100) NOT NULL,
    match_date TIMESTAMP NOT NULL,
    
    -- LLM Analysis Info
    llm_provider VARCHAR(100) NOT NULL,
    llm_model VARCHAR(100) NOT NULL,
    prompt_version VARCHAR(10) DEFAULT 'v1.0',
    
    -- Main Predictions
    winner_prediction VARCHAR(10) CHECK (winner_prediction IN ('HOME', 'DRAW', 'AWAY')),
    winner_confidence INTEGER CHECK (winner_confidence >= 0 AND winner_confidence <= 100),
    
    -- Probability Distribution
    home_win_probability INTEGER CHECK (home_win_probability >= 0 AND home_win_probability <= 100),
    draw_probability INTEGER CHECK (draw_probability >= 0 AND draw_probability <= 100),
    away_win_probability INTEGER CHECK (away_win_probability >= 0 AND away_win_probability <= 100),
    
    -- Goal Predictions
    over_under_prediction VARCHAR(10) CHECK (over_under_prediction IN ('OVER', 'UNDER')),
    over_under_line DECIMAL(3,1) DEFAULT 2.5,
    over_under_confidence INTEGER CHECK (over_under_confidence >= 0 AND over_under_confidence <= 100),
    predicted_home_goals INTEGER,
    predicted_away_goals INTEGER,
    predicted_total_goals DECIMAL(3,1),
    
    -- Detailed Analysis (JSONB for flexibility)
    analysis_summary TEXT,
    key_factors JSONB, -- ["Home team strong at home", "Away team missing key players"]
    risk_assessment VARCHAR(20) CHECK (risk_assessment IN ('LOW', 'MEDIUM', 'HIGH')),
    form_analysis JSONB, -- {"home_last_5": ["W","W","L","D","W"], "away_last_5": [...]}
    head_to_head JSONB, -- Recent H2H results
    team_news JSONB, -- Injuries, suspensions
    weather_impact TEXT,
    
    -- Performance Tracking
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    
    -- Cache Management
    cache_expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    is_expired BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(match_id, llm_provider, llm_model)
);

-- ===== 3. USER SUBSCRIPTIONS =====

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('free', 'basic', 'pro')),
    
    -- Stripe Integration
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255),
    
    -- Subscription Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP,
    trial_end TIMESTAMP,
    
    -- Plan Limits & Features
    daily_prediction_limit INTEGER NOT NULL,
    monthly_prediction_limit INTEGER,
    leagues_access JSONB DEFAULT '["ALL"]'::jsonb, -- ["Premier League", "La Liga"] or ["ALL"]
    features JSONB DEFAULT '{}'::jsonb, -- {"api_access": true, "priority_support": false}
    
    -- Billing
    amount INTEGER, -- Price in kuruş (TRY)
    currency VARCHAR(3) DEFAULT 'TRY',
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ===== 4. PAYMENT HISTORY =====

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Stripe Payment Details
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_invoice_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    
    -- Payment Info
    amount INTEGER NOT NULL, -- Amount in kuruş (TRY)
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled', 'refunded')),
    payment_method VARCHAR(50), -- "card", "bank_transfer", etc.
    
    -- Invoice Details
    description TEXT,
    receipt_url TEXT,
    invoice_pdf TEXT,
    
    -- Dates
    paid_at TIMESTAMP,
    failed_at TIMESTAMP,
    refunded_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== 5. USER USAGE TRACKING =====

CREATE TABLE user_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    
    -- Usage Metrics
    prediction_requests INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    llm_requests INTEGER DEFAULT 0, -- Actual LLM API calls
    
    -- Performance Metrics
    avg_response_time_ms INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    
    -- Feature Usage
    leagues_accessed JSONB DEFAULT '[]'::jsonb,
    api_calls INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- ===== 6. ADMIN & SYSTEM LOGS =====

CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50), -- "match_prediction", "user", "subscription"
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE batch_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_type VARCHAR(50) NOT NULL, -- "weekly_predictions", "cache_cleanup", "model_test"
    run_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    
    -- Processing Stats
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    successful_items INTEGER DEFAULT 0,
    failed_items INTEGER DEFAULT 0,
    
    -- Timing
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    
    -- Results & Errors
    results JSONB DEFAULT '{}'::jsonb,
    error_details JSONB DEFAULT '[]'::jsonb,
    
    UNIQUE(run_type, run_date)
);

-- ===== 7. SYSTEM CONFIGURATION =====

CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Can be read by client-side
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== INDEXES FOR PERFORMANCE =====

-- Match Predictions
CREATE INDEX idx_match_predictions_match_id ON match_predictions(match_id);
CREATE INDEX idx_match_predictions_date ON match_predictions(match_date);
CREATE INDEX idx_match_predictions_league ON match_predictions(league_name);
CREATE INDEX idx_match_predictions_cache_expires ON match_predictions(cache_expires_at);
CREATE INDEX idx_match_predictions_expired ON match_predictions(is_expired);

-- User Usage
CREATE INDEX idx_user_usage_user_date ON user_usage(user_id, date);
CREATE INDEX idx_user_usage_date ON user_usage(date);

-- Subscriptions
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan_type);

-- Payments
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created ON payments(created_at);

-- LLM Performance
CREATE INDEX idx_llm_providers_status ON llm_providers(status, priority);
CREATE INDEX idx_llm_models_provider ON llm_models(provider_id, status);

-- ===== ROW LEVEL SECURITY =====

-- Enable RLS on user-specific tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Public read access to match predictions (cached data)
ALTER TABLE match_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read match predictions" ON match_predictions FOR SELECT USING (true);

-- Users can only access their own data
CREATE POLICY "Users own subscription data" ON subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own payment data" ON payments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own usage data" ON user_usage FOR ALL USING (auth.uid() = user_id);

-- Admin-only access to system tables
CREATE POLICY "Admin access llm_providers" ON llm_providers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email LIKE '%@admin.scoreresultsai.com'
    )
);

-- ===== TRIGGERS FOR AUTO-UPDATES =====

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_match_predictions_updated_at BEFORE UPDATE ON match_predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== HELPER FUNCTIONS =====

-- Function to get user's current plan limits
CREATE OR REPLACE FUNCTION get_user_limits(user_uuid UUID)
RETURNS TABLE(
    plan_type VARCHAR,
    daily_limit INTEGER,
    current_usage INTEGER,
    remaining_predictions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.plan_type,
        s.daily_prediction_limit,
        COALESCE(u.prediction_requests, 0) as current_usage,
        (s.daily_prediction_limit - COALESCE(u.prediction_requests, 0)) as remaining_predictions
    FROM subscriptions s
    LEFT JOIN user_usage u ON s.user_id = u.user_id 
        AND u.date = CURRENT_DATE
    WHERE s.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;