-- LLM Provider Management
CREATE TABLE llm_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  api_endpoint VARCHAR(500) NOT NULL DEFAULT 'https://openrouter.ai/api/v1',
  api_key_encrypted TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, error
  priority INTEGER DEFAULT 1, -- 1 = highest priority
  rate_limit_per_minute INTEGER DEFAULT 60,
  last_error TEXT,
  last_success_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- LLM Models
CREATE TABLE llm_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES llm_providers(id) ON DELETE CASCADE,
  model_name VARCHAR(100) NOT NULL, -- e.g., "deepseek/deepseek-r1"
  display_name VARCHAR(200) NOT NULL, -- e.g., "DeepSeek R1"
  cost_per_1k_tokens DECIMAL(10,6) DEFAULT 0.000, -- Free models = 0
  max_tokens INTEGER DEFAULT 4096,
  status VARCHAR(20) DEFAULT 'active',
  is_default BOOLEAN DEFAULT false,
  model_type VARCHAR(50) DEFAULT 'chat', -- chat, completion
  created_at TIMESTAMP DEFAULT NOW()
);

-- Match Predictions Cache (CORE TABLE)
CREATE TABLE match_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id VARCHAR(100) NOT NULL, -- API-Football match ID
  home_team VARCHAR(100) NOT NULL,
  away_team VARCHAR(100) NOT NULL,
  league_name VARCHAR(100) NOT NULL,
  match_date TIMESTAMP NOT NULL,
  
  -- LLM Processing Info
  llm_provider_id UUID REFERENCES llm_providers(id),
  llm_model_id UUID REFERENCES llm_models(id),
  llm_provider_name VARCHAR(100),
  llm_model_name VARCHAR(100),
  
  -- Prediction Results (JSON for flexibility)
  prediction_result JSONB NOT NULL,
  /* Example structure:
  {
    "winner": "HOME|DRAW|AWAY",
    "winner_confidence": 85,
    "score_prediction": {"home": 2, "away": 1},
    "over_under": "OVER|UNDER",
    "over_under_line": 2.5,
    "both_teams_score": true|false,
    "analysis": "Detailed analysis text...",
    "key_factors": ["Factor 1", "Factor 2"],
    "risk_level": "LOW|MEDIUM|HIGH"
  }
  */
  
  -- Match Context Data (for prompt)
  match_context JSONB,
  /* Contains:
  {
    "home_last_5": [match results],
    "away_last_5": [match results],
    "head_to_head": [last 3 meetings],
    "league_stats": {...},
    "injuries": [...],
    "weather": "..."
  }
  */
  
  -- Processing Metadata
  processing_time_ms INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_cost DECIMAL(10,6) DEFAULT 0.000,
  
  -- Cache Management
  cache_expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(match_id, llm_provider_name, llm_model_name)
);

-- User Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type VARCHAR(20) NOT NULL DEFAULT 'free', -- free, basic, pro
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, past_due
  
  -- Plan Limits
  daily_prediction_limit INTEGER NOT NULL DEFAULT 5,
  monthly_limit INTEGER,
  supported_leagues JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '{}'::jsonb,
  
  -- Billing
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_end TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Usage Tracking
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  prediction_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- User Prediction History
CREATE TABLE user_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_prediction_id UUID REFERENCES match_predictions(id),
  requested_at TIMESTAMP DEFAULT NOW(),
  source VARCHAR(20) DEFAULT 'cache', -- cache, live_llm
  
  INDEX(user_id, requested_at DESC)
);

-- Batch Processing Jobs
CREATE TABLE batch_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(50) NOT NULL, -- weekly_predictions, daily_cleanup
  status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Job Configuration
  config JSONB DEFAULT '{}'::jsonb,
  
  -- Results
  processed_items INTEGER DEFAULT 0,
  successful_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_match_predictions_match_id ON match_predictions(match_id);
CREATE INDEX idx_match_predictions_date ON match_predictions(match_date);
CREATE INDEX idx_match_predictions_cache ON match_predictions(cache_expires_at) WHERE is_active = true;
CREATE INDEX idx_match_predictions_league ON match_predictions(league_name);

CREATE INDEX idx_user_usage_user_date ON user_usage(user_id, date DESC);
CREATE INDEX idx_user_predictions_user ON user_predictions(user_id, requested_at DESC);

CREATE INDEX idx_llm_providers_status ON llm_providers(status, priority);
CREATE INDEX idx_llm_models_status ON llm_models(status, is_default);

-- Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own predictions" ON user_predictions
  FOR SELECT USING (auth.uid() = user_id);

-- Insert default LLM providers and models
INSERT INTO llm_providers (name, api_key_encrypted, priority) VALUES
('OpenRouter-1', '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', 1),
('OpenRouter-2', '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', 2),
('OpenRouter-3', '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', 3),
('OpenRouter-4', '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', 4);

-- Insert LLM models for each provider
DO $$
DECLARE
  provider_rec RECORD;
BEGIN
  FOR provider_rec IN SELECT id FROM llm_providers LOOP
    INSERT INTO llm_models (provider_id, model_name, display_name, is_default) VALUES
    (provider_rec.id, 'deepseek/deepseek-r1', 'DeepSeek R1', true),
    (provider_rec.id, 'deepseek/deepseek-r1-0528', 'DeepSeek R1 (0528)', false),
    (provider_rec.id, 'deepseek/deepseek-chat-v3-0324', 'DeepSeek Chat V3', false),
    (provider_rec.id, 'deepseek/deepseek-v3-base', 'DeepSeek V3 Base', false),
    (provider_rec.id, 'mistralai/mistral-small-3.2-24b-instruct', 'Mistral Small 3.2', false),
    (provider_rec.id, 'qwen/qwen3-30b-a3b', 'Qwen3 30B', false),
    (provider_rec.id, 'qwen/qwen3-32b', 'Qwen3 32B', false),
    (provider_rec.id, 'qwen/qwen2.5-vl-32b-instruct', 'Qwen2.5 VL 32B', false),
    (provider_rec.id, 'thudm/glm-4-32b', 'GLM-4 32B', false),
    (provider_rec.id, 'moonshotai/kimi-dev-72b', 'Kimi Dev 72B', false),
    (provider_rec.id, 'openrouter/cypher-alpha', 'Cypher Alpha', false);
  END LOOP;
END $$;