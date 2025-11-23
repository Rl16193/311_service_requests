-- Map old request names to new ones

UPDATE parks
-- Map old service requests with the new names

SET service_request_type = CASE
  WHEN service_request_type = 'Gypsy Moth Control Insp' THEN 'Spongy Moth Control Insp'
  WHEN service_request_type = 'Ipm Inspection' THEN 'Integrated Pest Management Inspection'
  WHEN service_request_type IN ('Ravine Inspection', 'Parks Ravine Safety Mtc Fnem') THEN 'Natural Area Maintenance'
  WHEN service_request_type = 'By Law Contravention Invest' THEN 'Unauthorized Tree Injury or Removal'
  WHEN service_request_type = 'Private Tree Inspection' THEN 'Dangerous Private Tree Investigation'
  WHEN service_request_type = 'Storm Clean Up' THEN 'Tree Emergency Clean Up'
  WHEN service_request_type = 'Commercial Tree Storm Clean Up' THEN 'Commercial Tree Emergency Clean Up'
  WHEN service_request_type = 'Stumping' THEN 'Stump Removal'
  WHEN service_request_type = 'Stemming' THEN 'General Pruning'
  WHEN service_request_type = 'Hydro Brush Pick Up' THEN 'Tree Brush Pick Up'
  WHEN service_request_type = 'Planting 11 Plus Trees Fnem' THEN 'Planting 11 Plus Trees'
  ELSE service_request_type
END;


-- Create a weekly requests table/view
DROP VIEW IF EXISTS monthly_requests_parks CASCADE;

CREATE VIEW monthly_requests_parks AS

-- CTE for obtaining daily totals for each category
WITH daily_requests AS (
  SELECT 
    creation_date, ward, sub_section, service_request_type,
    COUNT(*) AS dailyreq
  FROM parks
  GROUP BY creation_date, ward, sub_section, service_request_type
), 
monthly_agg AS (
    
    SELECT
        DATE_TRUNC('month', creation_date)::DATE AS month_start, ward, sub_section, service_request_type,
        SUM(dailyreq) AS monthly_requests -- total requests for the week
    FROM daily_requests
    GROUP BY DATE_TRUNC('month', creation_date), ward, sub_section, service_request_type
    ORDER BY month_start
)

-- Develop weekly lag and rolling sums as features for our prediction model
SELECT month_start::DATE,
	monthly_requests,
	ward, sub_section, service_request_type,
	LAG(monthly_requests,1) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY month_start) AS prevmonth_req,
	LEAD(monthly_requests,1) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY month_start) AS nextmonth_pred,
	(monthly_requests - LAG(monthly_requests,1) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY month_start)) AS request_diff1, -- First Order Diffrence to detect short term surges
	
	-- Lag total requests for 4 and 12 months to capture quarterly and yearly patterns,
	LAG(monthly_requests,4) OVER( PARTITION BY ward, sub_section, service_request_type ORDER BY month_start) as requests_lag4,
	LAG(monthly_requests,12) OVER( PARTITION BY ward, sub_section, service_request_type ORDER BY month_start) as requests_lag12,
	
		-- Rolling sums for total request for 4 and 12 months to capture quarterly and yearly trends
		SUM(monthly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY month_start
			ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING) AS requests_rolling4,
		
		SUM(monthly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY month_start
			ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING) AS requests_rolling12,

		-- Standard deviation of total requests over 4 and 12 months to capture quarterly and yearly volatility
		ROUND(
		STDDEV(monthly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY month_start
			ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS requests_stddev4,
		ROUND(
		STDDEV(monthly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY month_start
			ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS requests_stddev12


	FROM monthly_agg
	ORDER BY month_start;

select * from monthly_requests_parks;