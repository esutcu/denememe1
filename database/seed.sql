-- =============================================
-- ScoreResultsAI - Complete Seed Data
-- Initial LLM providers, models, and system config
-- =============================================

-- ===== 1. INSERT LLM PROVIDERS (4 yedekli OpenRouter) =====

INSERT INTO llm_providers (name, api_endpoint, api_key_encrypted, priority, status) VALUES
('OpenRouter_Primary', 'https://openrouter.ai/api/v1/chat/completions', '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', 1, 'active'),
('OpenRouter_Backup1', 'https://openrouter.ai/api/v1/chat/completions', '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', 2, 'active'),
('OpenRouter_Backup2', 'https://openrouter.ai/api/v1/chat/completions', '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', 3, 'active'),
('OpenRouter_Backup3', 'https://openrouter.ai/api/v1/chat/completions', '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', 4, 'active');

-- ===== 2. INSERT SUPPORTED LLM MODELS =====

-- Get provider IDs for reference
DO $$
DECLARE
    provider_1_id UUID;
    provider_2_id UUID;
    provider_3_id UUID;
    provider_4_id UUID;
BEGIN
    SELECT id INTO provider_1_id FROM llm_providers WHERE name = 'OpenRouter_Primary';
    SELECT id INTO provider_2_id FROM llm_providers WHERE name = 'OpenRouter_Backup1';
    SELECT id INTO provider_3_id FROM llm_providers WHERE name = 'OpenRouter_Backup2';
    SELECT id INTO provider_4_id FROM llm_providers WHERE name = 'OpenRouter_Backup3';

    -- Insert models for all providers (her provider'da aynı modeller)
    INSERT INTO llm_models (provider_id, model_name, display_name, cost_per_1k_tokens, max_tokens, status, is_default) VALUES
    -- Provider 1
    (provider_1_id, 'deepseek/deepseek-r1', 'DeepSeek R1', 0.0, 8192, 'active', true),
    (provider_1_id, 'deepseek/deepseek-r1-0528', 'DeepSeek R1 (May 28)', 0.0, 8192, 'active', false),
    (provider_1_id, 'deepseek/deepseek-r1-0528-qwen3-8b', 'DeepSeek R1 Qwen3 8B', 0.0, 4096, 'active', false),
    (provider_1_id, 'deepseek/deepseek-chat-v3-0324', 'DeepSeek Chat V3', 0.0, 4096, 'active', false),
    (provider_1_id, 'deepseek/deepseek-v3-base', 'DeepSeek V3 Base', 0.0, 4096, 'active', false),
    (provider_1_id, 'mistralai/mistral-small-3.2-24b-instruct', 'Mistral Small 3.2 24B', 0.0, 4096, 'active', false),
    (provider_1_id, 'qwen/qwen3-30b-a3b', 'Qwen3 30B', 0.0, 4096, 'active', false),
    (provider_1_id, 'qwen/qwen3-32b', 'Qwen3 32B', 0.0, 4096, 'active', false),
    (provider_1_id, 'qwen/qwen2.5-vl-32b-instruct', 'Qwen2.5 VL 32B', 0.0, 4096, 'active', false),
    (provider_1_id, 'thudm/glm-4-32b', 'GLM-4 32B', 0.0, 4096, 'active', false),
    (provider_1_id, 'moonshotai/kimi-dev-72b', 'Kimi Dev 72B', 0.0, 8192, 'active', false),
    (provider_1_id, 'openrouter/cypher-alpha', 'Cypher Alpha', 0.0, 4096, 'active', false),

    -- Provider 2 (same models)
    (provider_2_id, 'deepseek/deepseek-r1', 'DeepSeek R1', 0.0, 8192, 'active', true),
    (provider_2_id, 'deepseek/deepseek-r1-0528', 'DeepSeek R1 (May 28)', 0.0, 8192, 'active', false),
    (provider_2_id, 'deepseek/deepseek-r1-0528-qwen3-8b', 'DeepSeek R1 Qwen3 8B', 0.0, 4096, 'active', false),
    (provider_2_id, 'deepseek/deepseek-chat-v3-0324', 'DeepSeek Chat V3', 0.0, 4096, 'active', false),
    (provider_2_id, 'deepseek/deepseek-v3-base', 'DeepSeek V3 Base', 0.0, 4096, 'active', false),
    (provider_2_id, 'mistralai/mistral-small-3.2-24b-instruct', 'Mistral Small 3.2 24B', 0.0, 4096, 'active', false),
    (provider_2_id, 'qwen/qwen3-30b-a3b', 'Qwen3 30B', 0.0, 4096, 'active', false),
    (provider_2_id, 'qwen/qwen3-32b', 'Qwen3 32B', 0.0, 4096, 'active', false),
    (provider_2_id, 'qwen/qwen2.5-vl-32b-instruct', 'Qwen2.5 VL 32B', 0.0, 4096, 'active', false),
    (provider_2_id, 'thudm/glm-4-32b', 'GLM-4 32B', 0.0, 4096, 'active', false),
    (provider_2_id, 'moonshotai/kimi-dev-72b', 'Kimi Dev 72B', 0.0, 8192, 'active', false),
    (provider_2_id, 'openrouter/cypher-alpha', 'Cypher Alpha', 0.0, 4096, 'active', false),

    -- Provider 3 (same models)
    (provider_3_id, 'deepseek/deepseek-r1', 'DeepSeek R1', 0.0, 8192, 'active', true),
    (provider_3_id, 'deepseek/deepseek-r1-0528', 'DeepSeek R1 (May 28)', 0.0, 8192, 'active', false),
    (provider_3_id, 'deepseek/deepseek-r1-0528-qwen3-8b', 'DeepSeek R1 Qwen3 8B', 0.0, 4096, 'active', false),
    (provider_3_id, 'deepseek/deepseek-chat-v3-0324', 'DeepSeek Chat V3', 0.0, 4096, 'active', false),
    (provider_3_id, 'deepseek/deepseek-v3-base', 'DeepSeek V3 Base', 0.0, 4096, 'active', false),
    (provider_3_id, 'mistralai/mistral-small-3.2-24b-instruct', 'Mistral Small 3.2 24B', 0.0, 4096, 'active', false),
    (provider_3_id, 'qwen/qwen3-30b-a3b', 'Qwen3 30B', 0.0, 4096, 'active', false),
    (provider_3_id, 'qwen/qwen3-32b', 'Qwen3 32B', 0.0, 4096, 'active', false),
    (provider_3_id, 'qwen/qwen2.5-vl-32b-instruct', 'Qwen2.5 VL 32B', 0.0, 4096, 'active', false),
    (provider_3_id, 'thudm/glm-4-32b', 'GLM-4 32B', 0.0, 4096, 'active', false),
    (provider_3_id, 'moonshotai/kimi-dev-72b', 'Kimi Dev 72B', 0.0, 8192, 'active', false),
    (provider_3_id, 'openrouter/cypher-alpha', 'Cypher Alpha', 0.0, 4096, 'active', false),

    -- Provider 4 (same models)
    (provider_4_id, 'deepseek/deepseek-r1', 'DeepSeek R1', 0.0, 8192, 'active', true),
    (provider_4_id, 'deepseek/deepseek-r1-0528', 'DeepSeek R1 (May 28)', 0.0, 8192, 'active', false),
    (provider_4_id, 'deepseek/deepseek-r1-0528-qwen3-8b', 'DeepSeek R1 Qwen3 8B', 0.0, 4096, 'active', false),
    (provider_4_id, 'deepseek/deepseek-chat-v3-0324', 'DeepSeek Chat V3', 0.0, 4096, 'active', false),
    (provider_4_id, 'deepseek/deepseek-v3-base', 'DeepSeek V3 Base', 0.0, 4096, 'active', false),
    (provider_4_id, 'mistralai/mistral-small-3.2-24b-instruct', 'Mistral Small 3.2 24B', 0.0, 4096, 'active', false),
    (provider_4_id, 'qwen/qwen3-30b-a3b', 'Qwen3 30B', 0.0, 4096, 'active', false),
    (provider_4_id, 'qwen/qwen3-32b', 'Qwen3 32B', 0.0, 4096, 'active', false),
    (provider_4_id, 'qwen/qwen2.5-vl-32b-instruct', 'Qwen2.5 VL 32B', 0.0, 4096, 'active', false),
    (provider_4_id, 'thudm/glm-4-32b', 'GLM-4 32B', 0.0, 4096, 'active', false),
    (provider_4_id, 'moonshotai/kimi-dev-72b', 'Kimi Dev 72B', 0.0, 8192, 'active', false),
    (provider_4_id, 'openrouter/cypher-alpha', 'Cypher Alpha', 0.0, 4096, 'active', false);
END $$;

-- ===== 3. SYSTEM CONFIGURATION =====

INSERT INTO system_config (key, value, description, is_public) VALUES
('subscription_plans', '{
  "free": {
    "name": "Ücretsiz",
    "price": 0,
    "currency": "TRY",
    "billing_cycle": "monthly",
    "daily_prediction_limit": 5,
    "monthly_prediction_limit": 150,
    "leagues_access": ["Premier League", "Süper Lig"],
    "features": {
      "basic_predictions": true,
      "email_notifications": false,
      "api_access": false,
      "priority_support": false,
      "advanced_analytics": false
    }
  },
  "basic": {
    "name": "Temel",
    "price": 2900,
    "currency": "TRY",
    "billing_cycle": "monthly",
    "daily_prediction_limit": 50,
    "monthly_prediction_limit": 1500,
    "leagues_access": ["ALL"],
    "features": {
      "basic_predictions": true,
      "email_notifications": true,
      "api_access": false,
      "priority_support": false,
      "advanced_analytics": true
    }
  },
  "pro": {
    "name": "Pro",
    "price": 7900,
    "currency": "TRY",
    "billing_cycle": "monthly",
    "daily_prediction_limit": 200,
    "monthly_prediction_limit": 6000,
    "leagues_access": ["ALL"],
    "features": {
      "basic_predictions": true,
      "email_notifications": true,
      "api_access": true,
      "priority_support": true,
      "advanced_analytics": true,
      "custom_reports": true,
      "bulk_export": true
    }
  }
}', 'Subscription plan definitions', true),

('prediction_leagues', '{
  "supported_leagues": [
    {
      "id": "premier-league",
      "name": "Premier League",
      "country": "England",
      "tier": "basic"
    },
    {
      "id": "super-lig",
      "name": "Süper Lig",
      "country": "Turkey",
      "tier": "basic"
    },
    {
      "id": "la-liga",
      "name": "La Liga",
      "country": "Spain",
      "tier": "premium"
    },
    {
      "id": "bundesliga",
      "name": "Bundesliga",
      "country": "Germany",
      "tier": "premium"
    },
    {
      "id": "serie-a",
      "name": "Serie A",
      "country": "Italy",
      "tier": "premium"
    },
    {
      "id": "ligue-1",
      "name": "Ligue 1",
      "country": "France",
      "tier": "premium"
    },
    {
      "id": "champions-league",
      "name": "Champions League",
      "country": "Europe",
      "tier": "premium"
    },
    {
      "id": "europa-league",
      "name": "Europa League",
      "country": "Europe",
      "tier": "premium"
    }
  ]
}', 'Supported leagues and their tiers', true),

('llm_prompt_templates', '{
  "football_prediction_v1": {
    "system_prompt": "You are an expert football analyst with deep knowledge of team statistics, player form, historical data, and match dynamics. Analyze the provided match data and generate accurate predictions.",
    "user_prompt_template": "Analyze this football match and provide predictions:\n\nMatch: {home_team} vs {away_team}\nLeague: {league_name}\nDate: {match_date}\n\nTeam Data:\n{team_stats}\n\nRecent Form:\n{recent_form}\n\nHead-to-Head:\n{head_to_head}\n\nPlease provide:\n1. Winner prediction (HOME/DRAW/AWAY) with confidence %\n2. Probability distribution for all outcomes\n3. Over/Under 2.5 goals prediction\n4. Expected goals for each team\n5. Key factors influencing the match\n6. Risk assessment (LOW/MEDIUM/HIGH)\n\nFormat your response as JSON.",
    "response_format": "json"
  }
}', 'LLM prompt templates for different prediction types', false),

('cache_settings', '{
  "default_ttl_days": 7,
  "auto_cleanup_enabled": true,
  "cleanup_interval_hours": 24,
  "max_cache_size_gb": 10,
  "prediction_expiry_buffer_hours": 2
}', 'Cache management settings', false),

('rate_limits', '{
  "openrouter_rpm": 60,
  "api_football_rpm": 100,
  "user_requests_per_minute": 10,
  "admin_requests_per_minute": 100
}', 'API rate limiting configuration', false);

-- ===== 4. DEFAULT ADMIN USER SUBSCRIPTION =====
-- Note: Bu admin user'ı manuel olarak Supabase Auth'da oluşturulmalı

-- ===== 5. SAMPLE MATCH PREDICTIONS (for testing) =====

INSERT INTO match_predictions (
    match_id, home_team, away_team, league_name, match_date,
    llm_provider, llm_model, 
    winner_prediction, winner_confidence,
    home_win_probability, draw_probability, away_win_probability,
    over_under_prediction, over_under_confidence,
    predicted_home_goals, predicted_away_goals, predicted_total_goals,
    analysis_summary, key_factors, risk_assessment,
    form_analysis, processing_time_ms, tokens_used
) VALUES
(
    'demo_match_1',
    'Manchester City',
    'Liverpool',
    'Premier League',
    '2025-07-15 19:00:00',
    'OpenRouter_Primary',
    'deepseek/deepseek-r1',
    'HOME',
    75,
    45, 30, 25,
    'OVER',
    68,
    2, 1, 3.2,
    'Manchester City ev sahipliği avantajıyla güçlü. Liverpool deplasmanda zorlanabilir ancak kaliteli kadroları var.',
    '["Man City evinde çok güçlü", "Liverpool son 3 deplasman maçında 1 galibiyet", "Her iki takım da golcü oyun sergiliyor"]',
    'MEDIUM',
    '{"home_last_5": ["W","W","D","W","L"], "away_last_5": ["W","L","W","D","W"]}',
    2340,
    1250
),
(
    'demo_match_2',
    'Galatasaray',
    'Fenerbahçe',
    'Süper Lig',
    '2025-07-16 20:00:00',
    'OpenRouter_Primary',
    'deepseek/deepseek-r1',
    'HOME',
    65,
    55, 25, 20,
    'OVER',
    82,
    2, 1, 3.1,
    'İstanbul derbisinde Galatasaray ev sahipliği avantajıyla öne çıkıyor. Yüksek tempo ve gol beklentisi var.',
    '["Derbi maçında ev sahipliği avantajı", "Her iki takım da form halinde", "Son derbilerde bol gol var"]',
    'HIGH',
    '{"home_last_5": ["W","W","W","D","W"], "away_last_5": ["W","W","L","W","D"]}',
    2650,
    1420
);

-- ===== 6. ADMIN LOG SAMPLE =====

INSERT INTO admin_logs (action, details, status) VALUES
('system_initialization', '{"event": "Database seeded successfully", "version": "1.0"}', 'success'),
('llm_providers_setup', '{"providers_count": 4, "models_count": 48}', 'success');

COMMIT;