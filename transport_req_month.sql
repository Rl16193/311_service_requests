-- Create a weekly requests table/view
DROP VIEW IF EXISTS monthly_requests_transport CASCADE;

CREATE VIEW monthly_requests_transport AS

-- CTE for obtaining daily totals for each category
WITH daily_requests AS (
  SELECT 
    creation_date, ward, d.section, service_request_type, d.year,
    COUNT(*) AS dailyreq
  FROM transport_requests AS d
  GROUP BY creation_date, ward, d.section, service_request_type, d.year
), 
-- CTE for aggregating daily data to month

monthly_agg AS (
    
    SELECT
        DATE_TRUNC('month', creation_date)::DATE AS month_start, ward, d.section, service_request_type, d.year,
		
        SUM(dailyreq) AS monthly_requests -- total requests for the month
    FROM daily_requests AS d
    GROUP BY DATE_TRUNC('month', creation_date), ward, d.section, service_request_type, d.year
    ORDER BY month_start
)

-- Develop weekly lag and rolling sums as features for our prediction model
SELECT month_start,
	monthly_requests,
	ward, d.section, service_request_type, d.year,
	LAG(monthly_requests,1) OVER ( PARTITION BY ward, d.section, service_request_type ORDER BY month_start) AS prevmonth_req,
	LEAD(monthly_requests,1) OVER ( PARTITION BY ward, d.section, service_request_type ORDER BY month_start) AS nextmonth_pred,
	(monthly_requests - LAG(monthly_requests,1) OVER ( PARTITION BY ward, d.section, service_request_type ORDER BY month_start)) AS request_diff1, -- First Order Diffrence to detect short term surges
	
	-- Lag total requests for 4 and 12 months to capture quarterly and yearly patterns,
	LAG(monthly_requests,4) OVER( PARTITION BY ward, d.section, service_request_type ORDER BY month_start) as requests_lag4,
	LAG(monthly_requests,12) OVER( PARTITION BY ward, d.section, service_request_type ORDER BY month_start) as requests_lag12,
	
		-- Rolling sums for total request for 4 and 12 months to capture quarterly and yearly trends
		SUM(monthly_requests) OVER ( PARTITION BY ward, d.section, service_request_type ORDER BY month_start
			ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING) AS requests_rolling4,
		
		SUM(monthly_requests) OVER ( PARTITION BY ward, d.section, service_request_type ORDER BY month_start
			ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING) AS requests_rolling12,

		-- Standard deviation of total requests over 4 and 12 months to capture quarterly and yearly volatility
		ROUND(
		STDDEV(monthly_requests) OVER ( PARTITION BY ward, d.section, service_request_type ORDER BY month_start
			ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS requests_stddev4,
		ROUND(
		STDDEV(monthly_requests) OVER ( PARTITION BY ward, d.section, service_request_type ORDER BY month_start
			ROWS BETWEEN 12 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS requests_stddev12

	FROM monthly_agg AS d
	ORDER BY month_start;

SELECT * FROM monthly_requests_transport;

