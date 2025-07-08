-- database/triggers.sql
-- ScoreResultsAI Database Triggers ve Utility Functions

-- 1. Auto-expire cache cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM match_predictions 
    WHERE cache_expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log cleanup action
    INSERT INTO admin_stats_cache (stats_date, total_predictions)
    VALUES (CURRENT_DATE, (SELECT COUNT(*) FROM match_predictions))
    ON CONFLICT (stats_date) DO UPDATE SET
        total_predictions = (SELECT COUNT(*) FROM match_predictions),
        updated_at = NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Update user usage function
CREATE OR REPLACE FUNCTION increment_user_usage(p_user_id UUID, p_prediction_requests INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO user_usage (user_id, date, prediction_requests, api_calls, plan_type)
    VALUES (
        p_user_id, 
        CURRENT_DATE, 
        p_prediction_requests, 
        1,
        COALESCE((SELECT plan_type FROM subscriptions WHERE user_id = p_user_id AND status = 'active' LIMIT 1), 'free')
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
        prediction_requests = user_usage.prediction_requests + p_prediction_requests,
        api_calls = user_usage.api_calls + 1,
        plan_type = COALESCE((SELECT plan_type FROM subscriptions WHERE user_id = p_user_id AND status = 'active' LIMIT 1), 'free');
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 3. Check user limits function
CREATE OR REPLACE FUNCTION check_user_daily_limit(p_user_id UUID)
RETURNS TABLE(
    user_id UUID,
    plan_type VARCHAR(20),
    daily_limit INTEGER,
    current_usage INTEGER,
    remaining_predictions INTEGER,
    can_make_prediction BOOLEAN
) AS $$
DECLARE
    v_plan_type VARCHAR(20) := 'free';
    v_daily_limit INTEGER := 5;
    v_current_usage INTEGER := 0;
BEGIN
    -- Get user's current subscription
    SELECT s.plan_type, s.daily_limit INTO v_plan_type, v_daily_limit
    FROM subscriptions s 
    WHERE s.user_id = p_user_id 
      AND s.status = 'active' 
      AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
    LIMIT 1;
    
    -- If no active subscription, use free plan defaults
    IF v_plan_type IS NULL THEN
        v_plan_type := 'free';
        v_daily_limit := 5;
    END IF;
    
    -- Get today's usage
    SELECT COALESCE(uu.prediction_requests, 0) INTO v_current_usage
    FROM user_usage uu
    WHERE uu.user_id = p_user_id AND uu.date = CURRENT_DATE;
    
    -- Return the result
    RETURN QUERY SELECT 
        p_user_id,
        v_plan_type,
        v_daily_limit,
        v_current_usage,
        GREATEST(0, v_daily_limit - v_current_usage),
        (v_current_usage < v_daily_limit);
END;
$$ LANGUAGE plpgsql;

-- 4. Generate admin stats function
CREATE OR REPLACE FUNCTION refresh_admin_stats()
RETURNS BOOLEAN AS $$
DECLARE
    v_total_users INTEGER;
    v_total_predictions INTEGER;
    v_daily_requests INTEGER;
    v_user_breakdown JSONB;
    v_model_usage JSONB;
    v_cache_hit_rate DECIMAL(5,2);
BEGIN
    -- Count total users
    SELECT COUNT(*) INTO v_total_users FROM auth.users;
    
    -- Count total predictions
    SELECT COUNT(*) INTO v_total_predictions FROM match_predictions;
    
    -- Count daily requests
    SELECT COALESCE(SUM(prediction_requests), 0) INTO v_daily_requests
    FROM user_usage 
    WHERE date = CURRENT_DATE;
    
    -- User breakdown by plan
    SELECT jsonb_object_agg(
        COALESCE(plan_type, 'free'), 
        user_count
    ) INTO v_user_breakdown
    FROM (
        SELECT 
            COALESCE(s.plan_type, 'free') as plan_type,
            COUNT(*) as user_count
        FROM auth.users u
        LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
        GROUP BY COALESCE(s.plan_type, 'free')
    ) plan_counts;
    
    -- Model usage stats
    SELECT jsonb_object_agg(llm_model, prediction_count) INTO v_model_usage
    FROM (
        SELECT 
            llm_model,
            COUNT(*) as prediction_count
        FROM match_predictions
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY llm_model
        ORDER BY prediction_count DESC
        LIMIT 10
    ) model_stats;
    
    -- Calculate cache hit rate (assume 95% for now - would need actual tracking)
    v_cache_hit_rate := 95.0;
    
    -- Insert or update admin stats
    INSERT INTO admin_stats_cache (
        stats_date, 
        total_users, 
        total_predictions, 
        daily_requests,
        cache_hit_rate,
        user_breakdown, 
        model_usage
    )
    VALUES (
        CURRENT_DATE,
        v_total_users,
        v_total_predictions,
        v_daily_requests,
        v_cache_hit_rate,
        v_user_breakdown,
        v_model_usage
    )
    ON CONFLICT (stats_date) DO UPDATE SET
        total_users = v_total_users,
        total_predictions = v_total_predictions,
        daily_requests = v_daily_requests,
        cache_hit_rate = v_cache_hit_rate,
        user_breakdown = v_user_breakdown,
        model_usage = v_model_usage,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. Auto-create subscription on user signup
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO subscriptions (user_id, plan_type, status, daily_limit, monthly_limit)
    VALUES (NEW.id, 'free', 'active', 5, 150);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Update prediction cache stats on insert
CREATE OR REPLACE FUNCTION update_prediction_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh admin stats when new prediction is added
    PERFORM refresh_admin_stats();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Set up triggers
CREATE TRIGGER trigger_new_user_subscription 
    AFTER INSERT ON auth.users 
    FOR EACH ROW EXECUTE FUNCTION create_default_subscription();

CREATE TRIGGER trigger_prediction_stats_update
    AFTER INSERT ON match_predictions
    FOR EACH ROW EXECUTE FUNCTION update_prediction_stats();

-- Scheduled functions (cron jobs - to be set up in Supabase)
-- These would be configured in Supabase dashboard or via pg_cron

-- Daily cleanup (to be run at 03:00 UTC daily)
-- SELECT cleanup_expired_cache();

-- Hourly stats refresh (to be run every hour)
-- SELECT refresh_admin_stats();

-- Utility views for easier querying

-- View: Active subscriptions with user info
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
    s.id,
    s.user_id,
    s.plan_type,
    s.status,
    s.daily_limit,
    s.monthly_limit,
    s.current_period_start,
    s.current_period_end,
    s.created_at,
    u.email,
    u.created_at as user_created_at
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE s.status = 'active';

-- View: Daily usage summary
CREATE OR REPLACE VIEW daily_usage_summary AS
SELECT 
    uu.date,
    uu.plan_type,
    COUNT(*) as user_count,
    SUM(uu.prediction_requests) as total_requests,
    AVG(uu.prediction_requests) as avg_requests_per_user,
    MAX(uu.prediction_requests) as max_requests_per_user
FROM user_usage uu
GROUP BY uu.date, uu.plan_type
ORDER BY uu.date DESC, uu.plan_type;

-- View: Cache efficiency
CREATE OR REPLACE VIEW cache_efficiency AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    source,
    COUNT(*) as prediction_count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY DATE_TRUNC('day', created_at)) as percentage
FROM match_predictions
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), source
ORDER BY date DESC, percentage DESC;

-- View: Provider performance
CREATE OR REPLACE VIEW provider_performance AS
SELECT 
    llm_provider,
    llm_model,
    COUNT(*) as total_predictions,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours') as predictions_last_24h,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as predictions_last_7d,
    AVG(winner_confidence) as avg_confidence,
    MAX(created_at) as last_used
FROM match_predictions
GROUP BY llm_provider, llm_model
ORDER BY total_predictions DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Grant select on views
GRANT SELECT ON active_subscriptions TO authenticated;
GRANT SELECT ON daily_usage_summary TO authenticated;
GRANT SELECT ON cache_efficiency TO authenticated;
GRANT SELECT ON provider_performance TO authenticated;