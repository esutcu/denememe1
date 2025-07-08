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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_predictions_fixture_id ON public.predictions(fixture_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON public.predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_model_used ON public.predictions(model_used);
CREATE INDEX IF NOT EXISTS idx_predictions_accuracy ON public.predictions(accuracy DESC);

-- RLS Policies
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (public predictions)
CREATE POLICY "Public predictions are viewable by everyone" 
ON public.predictions FOR SELECT 
USING (true);

-- Sadece authenticated kullanıcılar insert edebilir
CREATE POLICY "Users can insert predictions" 
ON public.predictions FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_predictions_updated_at 
    BEFORE UPDATE ON public.predictions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Prediction cache tablosu (7 günlük TTL)
CREATE TABLE IF NOT EXISTS public.prediction_cache (
    fixture_id BIGINT PRIMARY KEY,
    prediction JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Cache index
CREATE INDEX IF NOT EXISTS idx_prediction_cache_expires_at ON public.prediction_cache(expires_at);

-- Cache cleanup function (expired entries)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM public.prediction_cache 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS for cache
ALTER TABLE public.prediction_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cache is viewable by everyone" 
ON public.prediction_cache FOR SELECT 
USING (expires_at > NOW());

CREATE POLICY "System can manage cache" 
ON public.prediction_cache FOR ALL 
TO authenticated 
USING (true);