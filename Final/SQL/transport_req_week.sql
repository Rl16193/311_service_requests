DROP VIEW IF EXISTS weekly_requests_transport;

CREATE VIEW weekly_requests_transport AS

WITH daily_requests AS (
SELECT 
	creation_date, t.section, ward, service_request_type,
	COUNT(*) AS total_requests
	FROM transport_requests AS t
	GROUP BY creation_date, t.section, ward, service_request_type
	ORDER BY creation_date
),weekly_agg AS (
    -- Aggregate daily data to weekly level
    SELECT
        DATE_TRUNC('week', creation_date)::DATE AS week_start, d.section, service_request_type, ward,
		
        SUM(total_requests) AS weekly_requests
		FROM daily_requests as d
    GROUP BY DATE_TRUNC('week', creation_date), d.section, service_request_type, ward
    ORDER BY week_start
)
SELECT week_start,
	weekly_requests, w.section, ward, service_request_type,
	(weekly_requests - LAG(weekly_requests,1) OVER (PARTITION BY w.section, service_request_type, ward ORDER BY week_start)) AS request_diff1, -- First Order Diffrence to detect short term surges
	LEAD(weekly_requests,1) OVER(PARTITION BY w.section, service_request_type, ward ORDER BY week_start) as nextweek_pred,

	-- Lag total requests for 4,12,52 weeks to capture weekly patterns
	LAG(weekly_requests,1) OVER(PARTITION BY w.section, service_request_type, ward ORDER BY week_start) as requests_lag1,
	LAG(weekly_requests,4) OVER(PARTITION BY w.section, service_request_type, ward ORDER BY week_start) as requests_lag4,
	LAG(weekly_requests,12) OVER(PARTITION BY w.section, service_request_type, ward ORDER BY week_start) as requests_lag12,
	
		-- Rolling sums for total request for 4,12 and 26 weeks to capture trends
		SUM(weekly_requests) OVER (PARTITION BY w.section, service_request_type, ward ORDER BY week_start
			ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING) AS requests_rolling4,
		
		SUM(weekly_requests) OVER (PARTITION BY w.section, service_request_type, ward ORDER BY week_start
			ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING) AS requests_rolling12,
			
		SUM(weekly_requests) OVER (PARTITION BY w.section, service_request_type, ward ORDER BY week_start
			ROWS BETWEEN 26 PRECEDING AND 1 PRECEDING) AS requests_rolling26,

		-- Standard deviation of total requests over 4, 12 and 26 weeks to capture volatility
		ROUND(
		STDDEV(weekly_requests) OVER (PARTITION BY w.section, service_request_type, ward ORDER BY week_start
			ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS requests_stddev4,
		ROUND(
		STDDEV(weekly_requests) OVER (PARTITION BY w.section, service_request_type, ward ORDER BY week_start
			ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS requests_stddev12,
		ROUND(
		STDDEV(weekly_requests) OVER (PARTITION BY w.section, service_request_type, ward ORDER BY week_start
			ROWS BETWEEN 26 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS requests_stddev26
	FROM weekly_agg AS w
	ORDER BY week_start;

SELECT * FROM weekly_requests_transport;
