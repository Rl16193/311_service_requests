DROP VIEW IF EXISTS lagrollweathermonths;

CREATE VIEW lagrollweathermonths AS
WITH monthly_weather AS (

	SELECT
    DATE_TRUNC('month',date)::DATE AS month_start,
	ROUND(AVG(max_temperature)::NUMERIC,2) AS avgtemp_month,
	ROUND(AVG(avg_dew_point)::NUMERIC,2) AS avgdew_month,
	ROUND(SUM(rain)::NUMERIC,2) AS totalrain_month,
	ROUND(SUM(snow)::NUMERIC,2) AS totalsnow_month,
	ROUND(SUM(snow_on_ground)::NUMERIC,2) AS totalsnowgr_month,
	ROUND(AVG(daylight)::NUMERIC,2) AS avgdaylight_month,
	ROUND(AVG (max_wind_speed)::NUMERIC,2) AS avgwspeed_month,
	ROUND(AVG (max_wind_gust)::NUMERIC,2) AS avggust_month,
	ROUND(AVG (avg_visibility)::NUMERIC,2) AS avgvisi_month,
	ROUND(AVG (min_windchill)::NUMERIC,2) AS avgwindchill_month,
	SUM(is_snow::INT) AS snow_days,
	ROUND(AVG(ABS(days_since_snow))::NUMERIC) AS avgdayssincesnow

	FROM daily_weather
	GROUP BY month_start
	ORDER BY month_start
)
-- Obtain lag features for weather data (1,4 and 12 months)
	SELECT month_start, 

	-- Lag Snow Days
	LAG(snow_days,1) OVER (ORDER BY month_start) AS lagsnowdays,
	LAG(avgdayssincesnow,1) OVER (ORDER BY month_start) AS lagavgdaysincesnow,

	-- SELECT Max value pf days_since_snow
	-- Lag Temperatures
	LAG(avgtemp_month,1) OVER (ORDER BY month_start) AS lagtemp1,
	LAG(avgtemp_month,4) OVER (ORDER BY month_start) AS lagtemp4,
	LAG(avgtemp_month,12) OVER (ORDER BY month_start) AS lagtemp12,
	
	-- Lag Daylight
	LAG(avgdaylight_month,1) OVER (ORDER BY month_start) AS lagdaylight1,
	LAG(avgdaylight_month,4) OVER (ORDER BY month_start) AS lagdaylight4,
	LAG(avgdaylight_month,12) OVER (ORDER BY month_start) AS lagdaylight12,
	
	--Lag Dew Point
	LAG(avgdew_month,1) OVER (ORDER BY month_start) AS lagdewpoint1,
	LAG(avgdew_month,4) OVER (ORDER BY month_start) AS lagdewpoint4,
	LAG(avgdew_month,12) OVER (ORDER BY month_start) AS lagdewpoint12,
	
	--Lag Precipitation
	LAG(totalrain_month,1) OVER (ORDER BY month_start) AS lagrain1,
	LAG(totalrain_month,4) OVER (ORDER BY month_start) AS lagrain4,
	LAG(totalrain_month,12) OVER (ORDER BY month_start) AS lagrain12,

	--Lag Snow
	LAG(totalsnow_month,1) OVER (ORDER BY month_start) AS lagsnow1,
	LAG(totalsnow_month,4) OVER (ORDER BY month_start) AS lagsnow4,
	LAG(totalsnow_month,12) OVER (ORDER BY month_start) AS lagsnow12,

	--Lag Snow on Ground
	LAG(totalsnowgr_month,1) OVER (ORDER BY month_start) AS lagsnowgr1,
	LAG(totalsnowgr_month,4) OVER (ORDER BY month_start) AS lagsnowgr4,
	LAG(totalsnowgr_month,12) OVER (ORDER BY month_start) AS lagsnowgr12,

	--Aggregate climate indicators over 2 and 4 months
	
	-- Precipitation (Rain)
	ROUND(SUM(totalrain_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumrain2,

	ROUND(SUM(totalrain_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumrain4,

	-- Precipitation (Snow)
	ROUND(SUM(totalsnow_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumsnow4,

	ROUND(SUM(totalsnow_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumsnow2,

	-- Precipitation (Rain)
	ROUND(SUM(totalsnowgr_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumsnowgr4,

	ROUND(SUM(totalsnowgr_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumsnowgr2,

	-- Dew Point (Average)
	ROUND(AVG(avgdew_month) OVER (ORDER BY month_start 
	ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgdewpoint4,
		
	ROUND(AVG(avgdew_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgdewpoint2,

	-- Daylight (Average)
	ROUND(AVG(avgdaylight_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgdaylight4,

	ROUND(AVG(avgdaylight_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgdaylight2,
			
	--Windspeed (Maximum)
	ROUND(AVG(avgwspeed_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgwspeed4,

	ROUND(AVG(avgwspeed_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgwspeed2,

	--Wind Gust (Average)
	ROUND(AVG(avggust_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avggust4,

	ROUND(AVG(avggust_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avggust2,

	-- Wind Chill (Average)
	ROUND(AVG(avgwindchill_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgwindchill4,
		
	ROUND(AVG(avgwindchill_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgwindchill2,

	-- Calculate Standard Deviations

	ROUND(STDDEV(avgwindchill_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdwindchill2,

	ROUND(STDDEV(avgtemp_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdtemp2,

	ROUND(STDDEV(avgdew_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stddew2,

	ROUND(STDDEV(totalrain_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdrain2,

	ROUND(STDDEV(totalsnow_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdsnow2,

	ROUND(STDDEV(totalsnowgr_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdsnowgr2,

	ROUND(STDDEV(avgdaylight_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stddaylight2,

	ROUND(STDDEV(avgwspeed_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdwspeed2,
		
	ROUND(STDDEV(avggust_month) OVER (ORDER BY month_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdgust2,

		ROUND(STDDEV(avgwindchill_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdwindchill4,

	ROUND(STDDEV(avgtemp_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdtemp4,

	ROUND(STDDEV(avgdew_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stddew4,

	ROUND(STDDEV(totalrain_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdrain4,

	ROUND(STDDEV(totalsnow_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdsnow4,

	ROUND(STDDEV(totalsnowgr_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdsnowgr4,

	ROUND(STDDEV(avgdaylight_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stddaylight4,

	ROUND(STDDEV(avgwspeed_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdwspeed4,
		
	ROUND(STDDEV(avggust_month) OVER (ORDER BY month_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdgust4
		
	FROM monthly_weather;


SELECT * FROM lagrollweathermonths;
