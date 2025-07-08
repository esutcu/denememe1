-- ScoreResultsAI - Complete Database Setup
-- Updated: 2025-01-08

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles tablosu (auth.users'ı extend eder)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_expires TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fixtures tablosu (API-Football verilerini cache'ler)
CREATE TABLE IF NOT EXISTS public.fixtures (
    fixture_id BIGINT PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NS',
    league JSONB NOT NULL,
    teams JSONB NOT NULL,
    goals JSONB,
    score JSONB,
    stats JSONB,
    odds JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictions tablosu
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fixture_id BIGINT NOT NULL,
    prediction JSONB NOT NULL,
    model_used VARCHAR(100) NOT NULL DEFAULT 'deepseek-r1',
    accuracy INTEGER CHECK (accuracy >= 0 AND accuracy <= 100),
    profit DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prediction cache tablosu
CREATE TABLE IF NOT EXISTS public.prediction_cache (
    fixture_id BIGINT PRIMARY KEY,
    prediction JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Subscription usage tracking
CREATE TABLE IF NOT EXISTS public.subscription_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL DEFAULT 'free',
    predictions_used INTEGER NOT NULL DEFAULT 0,
    predictions_limit INTEGER NOT NULL DEFAULT 150,
    reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
    leagues_access TEXT[] DEFAULT ARRAY['super-lig'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, reset_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fixtures_date ON public.fixtures(date DESC);
CREATE INDEX IF NOT EXISTS idx_fixtures_status ON public.fixtures(status);
CREATE INDEX IF NOT EXISTS idx_predictions_fixture_id ON public.predictions(fixture_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON public.predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prediction_cache_expires_at ON public.prediction_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON public.subscription_usage(user_id);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Fixtures policies (public read)
CREATE POLICY "Fixtures are viewable by everyone" ON public.fixtures FOR SELECT USING (true);
CREATE POLICY "System can manage fixtures" ON public.fixtures FOR ALL TO authenticated USING (true);

-- Predictions policies
CREATE POLICY "Public predictions are viewable by everyone" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert predictions" ON public.predictions FOR INSERT TO authenticated WITH CHECK (true);

-- Cache policies
CREATE POLICY "Cache is viewable by everyone" ON public.prediction_cache FOR SELECT USING (expires_at > NOW());
CREATE POLICY "System can manage cache" ON public.prediction_cache FOR ALL TO authenticated USING (true);

-- Usage policies
CREATE POLICY "Users can view own subscription usage" ON public.subscription_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription usage" ON public.subscription_usage FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert subscription usage" ON public.subscription_usage FOR INSERT TO authenticated WITH CHECK (true);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON public.predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON public.subscription_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment predictions function
CREATE OR REPLACE FUNCTION increment_user_predictions(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.subscription_usage 
    SET predictions_used = predictions_used + 1, updated_at = NOW()
    WHERE subscription_usage.user_id = increment_user_predictions.user_id AND reset_date > NOW();
    
    IF NOT FOUND THEN
        INSERT INTO public.subscription_usage (user_id, predictions_used, reset_date)
        VALUES (increment_user_predictions.user_id, 1, DATE_TRUNC('month', NOW()) + INTERVAL '1 month');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cache cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM public.prediction_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Sample data eklemek için
INSERT INTO public.fixtures (fixture_id, date, status, league, teams, goals, score) VALUES
(1001, NOW() + INTERVAL '1 day', 'NS', 
 '{"id": 203, "name": "Süper Lig", "country": "Turkey", "flag": "🇹🇷"}'::jsonb,
 '{"home": {"id": 610, "name": "Fenerbahçe", "logo": ""}, "away": {"id": 645, "name": "Galatasaray", "logo": ""}}'::jsonb,
 '{"home": null, "away": null}'::jsonb,
 '{"halftime": {"home": null, "away": null}, "fulltime": {"home": null, "away": null}}'::jsonb)
ON CONFLICT (fixture_id) DO NOTHING;

COMMIT;