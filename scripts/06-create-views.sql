-- View for public report data (excludes sensitive info)
CREATE OR REPLACE VIEW public_reports AS
SELECT 
  id,
  type,
  address,
  description,
  image_url,
  reporter_name,
  latitude,
  longitude,
  votes,
  status,
  created_at,
  updated_at
FROM reports
WHERE status != 'rejected';

-- View for report statistics by type
CREATE OR REPLACE VIEW report_stats_by_type AS
SELECT 
  type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
  AVG(votes) as avg_votes,
  MAX(votes) as max_votes,
  MIN(created_at) as oldest_report,
  MAX(created_at) as newest_report
FROM reports
GROUP BY type;

-- View for recent activity
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
  'report' as activity_type,
  r.id as item_id,
  r.type as problem_type,
  r.address,
  r.description,
  r.reporter_name as actor_name,
  r.created_at
FROM reports r
WHERE r.created_at >= NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'vote' as activity_type,
  rv.report_id as item_id,
  r.type as problem_type,
  r.address,
  'Nuevo voto recibido' as description,
  NULL as actor_name,
  rv.created_at
FROM report_votes rv
JOIN reports r ON rv.report_id = r.id
WHERE rv.created_at >= NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'comment' as activity_type,
  rc.report_id as item_id,
  r.type as problem_type,
  r.address,
  rc.comment as description,
  rc.commenter_name as actor_name,
  rc.created_at
FROM report_comments rc
JOIN reports r ON rc.report_id = r.id
WHERE rc.created_at >= NOW() - INTERVAL '24 hours'

ORDER BY created_at DESC;

-- Create a view for reports with aggregated data (e.g., vote count)
CREATE OR REPLACE VIEW public.reports_with_details AS
SELECT
    r.id,
    r.type,
    r.address,
    r.description,
    r.image_url,
    r.latitude,
    r.longitude,
    r.status,
    r.created_at,
    r.reporter_name,
    r.user_id,
    COUNT(rv.id) AS votes
FROM
    public.reports r
LEFT JOIN
    public.report_votes rv ON r.id = rv.report_id
GROUP BY
    r.id, r.type, r.address, r.description, r.image_url, r.latitude, r.longitude, r.status, r.created_at, r.reporter_name, r.user_id
ORDER BY
    r.created_at DESC;

-- No complex views currently, but this file is a placeholder for future use.
