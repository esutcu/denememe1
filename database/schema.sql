-- 1. Kullanıcı Profilleri
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'pro')),
  daily_prediction_limit INTEGER DEFAULT 5,
  predictions_used_today INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LLM Provider Yönetimi
CREATE TABLE IF NOT EXISTS public.llm_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  priority INTEGER DEFAULT 1,
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Maç Fikstürleri
CREATE TABLE IF NOT EXISTS public.match_fixtures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_match_id VARCHAR(100) UNIQUE NOT NULL,
  home_team VARCHAR(100) NOT NULL,
  away_team VARCHAR(100) NOT NULL,
  league_name VARCHAR(100) NOT NULL,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. LLM Tahmin Cache
CREATE TABLE IF NOT EXISTS public.match_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.match_fixtures(id),
  llm_provider_id UUID REFERENCES public.llm_providers(id),
  home_win_probability DECIMAL(5,2),
  draw_probability DECIMAL(5,2),
  away_win_probability DECIMAL(5,2),
  confidence_score DECIMAL(5,2),
  analysis_summary TEXT,
  key_factors JSONB,
  risk_level VARCHAR(10) CHECK (risk_level IN ('low', 'medium', 'high')),
  cache_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, llm_provider_id)
);

-- 5. LLM Provider Verilerini Ekle
INSERT INTO public.llm_providers (name, api_key_encrypted, model_name, priority) VALUES
('OpenRouter-DeepSeek', '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', 'deepseek/deepseek-r1:free', 1),
('OpenRouter-Mistral', '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', 'mistralai/mistral-small-3.2-24b-instruct:free', 2),
('OpenRouter-Qwen', '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', 'qwen/qwen3-32b:free', 3),
('OpenRouter-GLM', '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', 'thudm/glm-4-32b:free', 4)
ON CONFLICT (name) DO NOTHING;

-- 6. RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Anyone can view predictions" ON public.match_predictions
  FOR SELECT USING (true);

-- 7. User creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();