-- Map old request names to new ones

UPDATE parks
-- Map old service requests with the new names

SET service_request_type = CASE
  WHEN service_request_type = 'Gypsy Moth Control Inspection' THEN 'Spongy Moth Control Inspection'
  WHEN service_request_type = 'IPM Inspection' THEN 'Integrated Pest Management Inspection'
  WHEN service_request_type IN ('Ravine Inspection', 'Parks Ravine Safety Mtc FNEM') THEN 'Natural Area Maintenance'
  WHEN service_request_type = 'By Law Contravention Invest' THEN 'Unauthorized Tree Injury or Removal'
  WHEN service_request_type = 'Private Tree Inspection' THEN 'Dangerous Private Tree Investigation'
  WHEN service_request_type = 'Storm Clean Up' THEN 'Tree Emergency Clean Up'
  WHEN service_request_type = 'Commercial Tree Storm Clean Up' THEN 'Commercial Tree Emergency Clean Up'
  WHEN service_request_type = 'Stumping' THEN 'Stump Removal'
  WHEN service_request_type = 'Stemming' THEN 'General Pruning'
  WHEN service_request_type = 'Hydro Brush Pick Up' THEN 'Tree Brush Pick Up'
  ELSE service_request_type
END;


-- Create a weekly requests table/view
DROP VIEW IF EXISTS weekly_requests_parks;

CREATE VIEW weekly_requests_parks AS

-- CTE for obtaining mean and standard deviation over 30 days
WITH daily_requests AS (
  SELECT 
    creation_date, ward, sub_section, service_request_type,
    COUNT(*) AS total_requests,
    CASE 
      WHEN ROW_NUMBER() OVER (PARTITION BY ward, sub_section, service_request_type ORDER BY creation_date) > 30
      THEN ROUND(AVG(COUNT(*)) OVER (PARTITION BY ward, sub_section, service_request_type ORDER BY creation_date ROWS BETWEEN 31 PRECEDING AND 1 PRECEDING), 2)
      ELSE 0
    END AS mean30,
    CASE 
      WHEN ROW_NUMBER() OVER (PARTITION BY ward, sub_section, service_request_type ORDER BY creation_date) > 30
      THEN ROUND(STDDEV(COUNT(*)) OVER (PARTITION BY ward, sub_section, service_request_type ORDER BY creation_date ROWS BETWEEN 31 PRECEDING AND 1 PRECEDING), 2)
      ELSE 0
    END AS std30
  FROM parks
  GROUP BY creation_date, ward, sub_section, service_request_type
), 
-- CTE To obtain z-scores and flag anomalies
daily_with_z AS (

	SELECT creation_date, total_requests, mean30, std30, ward, sub_section, service_request_type,
        -- Z-score
        CASE 
            WHEN std30 IS NULL OR std30 = 0 THEN NULL
            ELSE (total_requests - mean30) / std30
        END AS z_score,
        -- Anomaly flag: 1 if abs(z) > 3, else 0
        CASE 
            WHEN std30 IS NULL OR std30 = 0 THEN 0
            WHEN ABS((total_requests - mean30) / std30) > 3 THEN 1
            ELSE 0
        END AS is_anomaly
    FROM daily_requests
),
-- CTE for aggregating daily data to weeks

weekly_agg AS (
    
    SELECT
        DATE_TRUNC('week', creation_date)::DATE AS week_start, ward, sub_section, service_request_type,
		
        SUM(total_requests) AS weekly_requests, -- total requests for the week
        SUM(is_anomaly) AS weekly_anomalies, -- total anomalies recorded in this week (based on previous day means)
        ROUND(AVG(z_score)::NUMERIC,2) AS avg_weekly_z, -- average Z-score
		ROUND(AVG(mean30)::NUMERIC,2) AS avgmean30, -- Average mean of requests over 31 days for this week
		ROUND(AVG(std30)::NUMERIC,2) AS avgstd30 -- Average standard deviation of requests over 31 days for this week
    FROM daily_with_z
    GROUP BY DATE_TRUNC('week', creation_date), ward, sub_section, service_request_type
    ORDER BY week_start
)

-- Develop weekly lag and rolling sums as features for our prediction model
SELECT week_start,
	weekly_requests,
	weekly_anomalies,
	avg_weekly_z, ward, sub_section, service_request_type, avgmean30, avgstd30,
	LAG(weekly_requests,1) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY week_start) AS prevweek_req,
	(weekly_requests - LAG(weekly_requests,1) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY week_start)) AS request_diff1, -- First Order Diffrence to detect short term surges


	-- Lag total requests for 4,12,52 weeks to capture weekly patterns,
	LAG(weekly_requests,4) OVER( PARTITION BY ward, sub_section, service_request_type ORDER BY week_start) as requests_lag4,
	LAG(weekly_requests,12) OVER( PARTITION BY ward, sub_section, service_request_type ORDER BY week_start) as requests_lag12,
	
		-- Rolling sums for total request for 4,12 and 26 weeks to capture trends
		SUM(weekly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY week_start
			ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING) AS requests_rolling4,
		
		SUM(weekly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY week_start
			ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING) AS requests_rolling12,
			
		SUM(weekly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY week_start
			ROWS BETWEEN 26 PRECEDING AND 1 PRECEDING) AS requests_rolling26,

		-- Standard deviation of total requests over 4, 12 and 26 weeks to capture volatility
		ROUND(
		STDDEV(weekly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY week_start
			ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS requests_stddev4,
		ROUND(
		STDDEV(weekly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY week_start
			ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS requests_stddev12,
		ROUND(
		STDDEV(weekly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type ORDER BY week_start
			ROWS BETWEEN 26 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS requests_stddev26,

		-- Create features recording 2 week, 4 week totals of weekly requests (future requests)
		SUM(weekly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type
		  ORDER BY week_start
		  ROWS BETWEEN 1 FOLLOWING AND 2 FOLLOWING
		  ) AS biweekly_pred,

		SUM(weekly_requests) OVER ( PARTITION BY ward, sub_section, service_request_type
		ORDER BY week_start
		ROWS BETWEEN 1 FOLLOWING AND 4 FOLLOWING
		) AS month_pred
		
	FROM weekly_agg
	GROUP BY week_start, weekly_requests, weekly_anomalies, avg_weekly_z, ward, sub_section, service_request_type, avgmean30, avgstd30
	ORDER BY week_start;

SELECT * FROM weekly_requests_parks;

