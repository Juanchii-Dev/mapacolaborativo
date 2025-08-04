-- Function to get reports within a radius (in meters)
CREATE OR REPLACE FUNCTION get_reports_near_location(
  center_lat DECIMAL,
  center_lng DECIMAL,
  radius_meters INTEGER DEFAULT 1000
)
RETURNS TABLE (
  id UUID,
  type problem_type,
  address TEXT,
  description TEXT,
  image_url TEXT,
  reporter_name VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  votes INTEGER,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.type,
    r.address,
    r.description,
    r.image_url,
    r.reporter_name,
    r.latitude,
    r.longitude,
    r.votes,
    r.status,
    r.created_at,
    ST_Distance(
      r.location,
      ST_Point(center_lng, center_lat)::geography
    ) as distance_meters
  FROM reports r
  WHERE ST_DWithin(
    r.location,
    ST_Point(center_lng, center_lat)::geography,
    radius_meters
  )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Function to get report statistics
CREATE OR REPLACE FUNCTION get_report_statistics()
RETURNS TABLE (
  total_reports BIGINT,
  pending_reports BIGINT,
  in_progress_reports BIGINT,
  resolved_reports BIGINT,
  total_votes BIGINT,
  reports_by_type JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_reports,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_reports,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_reports,
    SUM(votes) as total_votes,
    json_object_agg(type, type_count) as reports_by_type
  FROM (
    SELECT 
      type,
      COUNT(*) as type_count
    FROM reports
    GROUP BY type
  ) type_stats,
  reports;
END;
$$ LANGUAGE plpgsql;

-- Function to add a vote to a report (with duplicate prevention)
CREATE OR REPLACE FUNCTION add_vote_to_report(
  report_uuid UUID,
  voter_ip_address INET DEFAULT NULL,
  voter_fingerprint_hash TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  vote_added BOOLEAN := FALSE;
BEGIN
  -- Try to insert the vote
  INSERT INTO report_votes (report_id, voter_ip, voter_fingerprint)
  VALUES (report_uuid, voter_ip_address, voter_fingerprint_hash)
  ON CONFLICT (report_id, voter_ip, voter_fingerprint) DO NOTHING;
  
  -- Check if the vote was actually inserted
  GET DIAGNOSTICS vote_added = ROW_COUNT;
  
  RETURN vote_added > 0;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending reports (most voted in last 7 days)
CREATE OR REPLACE FUNCTION get_trending_reports(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  type problem_type,
  address TEXT,
  description TEXT,
  image_url TEXT,
  reporter_name VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  votes INTEGER,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.type,
    r.address,
    r.description,
    r.image_url,
    r.reporter_name,
    r.latitude,
    r.longitude,
    r.votes,
    r.status,
    r.created_at
  FROM reports r
  WHERE r.created_at >= NOW() - INTERVAL '7 days'
  ORDER BY r.votes DESC, r.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
