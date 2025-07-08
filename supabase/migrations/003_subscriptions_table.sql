-- Subscription usage tracking tablosu
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
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON public.subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_reset_date ON public.subscription_usage(reset_date);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_plan_id ON public.subscription_usage(plan_id);

-- RLS Policies
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view own subscription usage" 
ON public.subscription_usage FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update own subscription usage" 
ON public.subscription_usage FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- System can insert usage records
CREATE POLICY "System can insert subscription usage" 
ON public.subscription_usage FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Function to increment user predictions
CREATE OR REPLACE FUNCTION increment_user_predictions(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.subscription_usage 
    SET 
        predictions_used = predictions_used + 1,
        updated_at = NOW()
    WHERE 
        subscription_usage.user_id = increment_user_predictions.user_id 
        AND reset_date > NOW();
        
    -- If no current period found, create one
    IF NOT FOUND THEN
        INSERT INTO public.subscription_usage (
            user_id, 
            predictions_used, 
            reset_date
        ) VALUES (
            increment_user_predictions.user_id,
            1,
            DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    -- Archive old usage and create new periods
    UPDATE public.subscription_usage 
    SET predictions_used = 0,
        reset_date = reset_date + INTERVAL '1 month'
    WHERE reset_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Updated at trigger
CREATE TRIGGER update_subscription_usage_updated_at 
    BEFORE UPDATE ON public.subscription_usage 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();