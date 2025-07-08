-- Supabase Database Schema for ScoreResultsAI

-- 1. LLM Providers Management
CREATE TABLE llm_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- "OpenRouter"
    api_endpoint VARCHAR(500) NOT NULL DEFAULT 'https://openrouter.ai/api/v1/chat/completions',
    api_key_encrypted TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active/inactive/error
    priority INTEGER DEFAULT 1, -- 1=highest priority
    rate_limit_per_minute INTEGER DEFAULT 60,
    last_used_at TIMESTAMP,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. LLM Models Configuration
CREATE TABLE llm_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES llm_providers(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL, -- "deepseek/deepseek-r1", "openrouter/cypher-alpha:free"
    display_name VARCHAR(200) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    cost_per_1k_tokens DECIMAL(10,6) DEFAULT 0, -- For tracking
    max_tokens INTEGER DEFAULT 4096,
    temperature DECIMAL(3,2) DEFAULT 0.7,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Match Predictions Cache (Core System)
CREATE TABLE match_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id VARCHAR(100) NOT NULL, -- API-Football match ID
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    league_name VARCHAR(100) NOT NULL,
    league_id VARCHAR(50) NOT NULL,
    match_date TIMESTAMP NOT NULL,
    
    -- LLM Analysis Results
    llm_provider_id UUID REFERENCES llm_providers(id),
    llm_model_id UUID REFERENCES llm_models(id),
    
    -- Prediction Results
    winner_prediction VARCHAR(10), -- "HOME", "DRAW", "AWAY"
    winner_confidence INTEGER CHECK (winner_confidence >= 0 AND winner_confidence <= 100),
    home_win_probability INTEGER,
    draw_probability INTEGER,
    away_win_probability INTEGER,
    
    -- Goals Prediction
    predicted_home_goals DECIMAL(3,1),
    predicted_away_goals DECIMAL(3,1),
    over_under_prediction VARCHAR(10), -- "OVER", "UNDER"
    total_goals_line DECIMAL(3,1) DEFAULT 2.5,
    
    -- Detailed Analysis
    analysis_text TEXT, -- LLM'in detaylı analizi
    risk_level VARCHAR(10) DEFAULT 'medium', -- low/medium/high
    risk_factors JSONB, -- Riskler array
    key_stats JSONB, -- Önemli istatistikler
    team_form_analysis JSONB, -- Son 5 maç analizi
    
    -- Cache Management
    cache_expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
    is_valid BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(match_id, llm_provider_id, llm_model_id)
);

-- 4. Weekly Batch Process Log
CREATE TABLE batch_process_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_type VARCHAR(50) NOT NULL, -- "weekly_predictions", "daily_cleanup"
    status VARCHAR(20) DEFAULT 'running', -- running/completed/failed
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    processed_matches INTEGER DEFAULT 0,
    successful_predictions INTEGER DEFAULT 0,
    failed_predictions INTEGER DEFAULT 0,
    error_details JSONB,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. User Subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL, -- "free", "basic", "pro"
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active', -- active/inactive/canceled/past_due
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. User Daily Usage Tracking
CREATE TABLE user_daily_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    plan_type VARCHAR(20) NOT NULL,
    prediction_requests INTEGER DEFAULT 0,
    ai_analysis_requests INTEGER DEFAULT 0,
    daily_limit INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- 7. Payment History
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    amount INTEGER NOT NULL, -- in cents
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) DEFAULT 'pending', -- pending/succeeded/failed
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Sports API Data Cache
CREATE TABLE sports_fixtures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_match_id VARCHAR(100) NOT NULL UNIQUE,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    league_name VARCHAR(100) NOT NULL,
    league_id VARCHAR(50) NOT NULL,
    match_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled/live/finished/postponed
    
    -- Team Statistics (Last 5 matches for LLM prompt)
    home_team_form JSONB, -- Last 5 matches: [{"date": "2024-01-01", "opponent": "Team", "result": "W", "score": "2-1"}]
    away_team_form JSONB,
    home_team_stats JSONB, -- Goals scored/conceded, etc.
    away_team_stats JSONB,
    head_to_head JSONB, -- Last 3-5 H2H matches
    
    -- API Fetch Info
    fetched_at TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW(),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert Default LLM Providers (OpenRouter APIs)
INSERT INTO llm_providers (name, api_endpoint, api_key_encrypted, priority) VALUES
('OpenRouter-1', 'https://openrouter.ai/api/v1/chat/completions', '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', 1),
('OpenRouter-2', 'https://openrouter.ai/api/v1/chat/completions', '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', 2),
('OpenRouter-3', 'https://openrouter.ai/api/v1/chat/completions', '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', 3),
('OpenRouter-4', 'https://openrouter.ai/api/v1/chat/completions', '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', 4);

-- Insert LLM Models (will be linked to all providers)
DO $$
DECLARE
    provider_record RECORD;
BEGIN
    FOR provider_record IN SELECT id FROM llm_providers LOOP
        INSERT INTO llm_models (provider_id, model_name, display_name, is_active) VALUES
        (provider_record.id, 'deepseek/deepseek-r1', 'DeepSeek R1 (Reasoning)', true),
        (provider_record.id, 'deepseek/deepseek-chat-v3-0324', 'DeepSeek Chat v3', true),
        (provider_record.id, 'openrouter/cypher-alpha:free', 'Cypher Alpha Free', true),
        (provider_record.id, 'mistralai/mistral-small-3.2-24b-instruct:free', 'Mistral Small 3.2', true),
        (provider_record.id, 'qwen/qwen3-32b:free', 'Qwen3 32B', true);
    END LOOP;
END $$;

-- Create Indexes for Performance
CREATE INDEX idx_match_predictions_match_id ON match_predictions(match_id);
CREATE INDEX idx_match_predictions_date ON match_predictions(match_date);
CREATE INDEX idx_match_predictions_league ON match_predictions(league_id);
CREATE INDEX idx_match_predictions_cache ON match_predictions(cache_expires_at);
CREATE INDEX idx_match_predictions_valid ON match_predictions(is_valid);

CREATE INDEX idx_sports_fixtures_match_id ON sports_fixtures(api_match_id);
CREATE INDEX idx_sports_fixtures_date ON sports_fixtures(match_date);
CREATE INDEX idx_sports_fixtures_league ON sports_fixtures(league_id);

CREATE INDEX idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);

CREATE INDEX idx_user_daily_usage_user_date ON user_daily_usage(user_id, date);

-- RLS Policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage" ON user_daily_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON payment_history FOR SELECT USING (auth.uid() = user_id);

-- Public read access for predictions (cached data)
ALTER TABLE match_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view match predictions" ON match_predictions FOR SELECT USING (is_valid = true AND cache_expires_at > NOW());

-- Admin access for management tables
CREATE POLICY "Admins can manage LLM providers" ON llm_providers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.email LIKE '%@admin.com'
    )
);

-- Functions for subscription management
CREATE OR REPLACE FUNCTION get_user_subscription_info(user_uuid UUID)
RETURNS TABLE (
    plan_type TEXT,
    status TEXT,
    daily_limit INTEGER,
    current_usage INTEGER,
    remaining_predictions INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscription_plan TEXT := 'free';
    subscription_status TEXT := 'active';
    daily_limit_val INTEGER := 5; -- Free plan default
    today_usage INTEGER := 0;
BEGIN
    -- Get current subscription
    SELECT 
        COALESCE(us.plan_type, 'free'),
        COALESCE(us.status, 'active')
    INTO subscription_plan, subscription_status
    FROM user_subscriptions us
    WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND (us.current_period_end IS NULL OR us.current_period_end > NOW())
    ORDER BY us.created_at DESC
    LIMIT 1;
    
    -- Set daily limits based on plan
    daily_limit_val := CASE subscription_plan
        WHEN 'free' THEN 5
        WHEN 'basic' THEN 25
        WHEN 'pro' THEN 100
        ELSE 5
    END;
    
    -- Get today's usage
    SELECT COALESCE(prediction_requests, 0)
    INTO today_usage
    FROM user_daily_usage
    WHERE user_id = user_uuid
    AND date = CURRENT_DATE;
    
    RETURN QUERY SELECT 
        subscription_plan,
        subscription_status,
        daily_limit_val,
        today_usage,
        GREATEST(0, daily_limit_val - today_usage);
END;
$$;

-- Function to increment user usage
CREATE OR REPLACE FUNCTION increment_user_usage(user_uuid UUID, request_type TEXT DEFAULT 'prediction')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_plan TEXT;
    daily_limit_val INTEGER;
    current_usage INTEGER;
BEGIN
    -- Get user plan and limits
    SELECT plan_type, daily_limit, current_usage
    INTO user_plan, daily_limit_val, current_usage
    FROM get_user_subscription_info(user_uuid);
    
    -- Check if user has remaining predictions
    IF current_usage >= daily_limit_val THEN
        RETURN FALSE;
    END IF;
    
    -- Insert or update usage
    INSERT INTO user_daily_usage (user_id, date, plan_type, prediction_requests, daily_limit)
    VALUES (user_uuid, CURRENT_DATE, user_plan, 1, daily_limit_val)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        prediction_requests = user_daily_usage.prediction_requests + 1,
        plan_type = user_plan,
        daily_limit = daily_limit_val;
    
    RETURN TRUE;
END;
$$;