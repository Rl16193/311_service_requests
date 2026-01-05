DROP VIEW IF EXISTS lagrollweatherweeks;

CREATE VIEW lagrollweatherweeks AS
WITH weekly_weather AS (

	SELECT
    DATE_TRUNC('Week',date) AS week_start,
	ROUND(AVG(max_temperature)::NUMERIC,2) AS avgtemp_week,
	ROUND(AVG(avg_dew_point)::NUMERIC,2) AS avgdew_week,
	ROUND(SUM(rain)::NUMERIC,2) AS totalrain_week,
	ROUND(SUM(snow)::NUMERIC,2) AS totalsnow_week,
	ROUND(SUM(snow_on_ground)::NUMERIC,2) AS totalsnowgr_week,
	ROUND(AVG(daylight)::NUMERIC,2) AS avgdaylight_week,
	ROUND(AVG (max_wind_speed)::NUMERIC,2) AS avgwspeed_week,
	ROUND(AVG (max_wind_gust)::NUMERIC,2) AS avggust_week,
	ROUND(AVG (avg_visibility)::NUMERIC,2) AS avgvisi_week,
	ROUND(AVG (min_windchill)::NUMERIC,2) AS avgwindchill_week,
	SUM(is_snow::INT) AS snow_days	
	FROM daily_weather
	GROUP BY week_start
	ORDER BY week_start
)
	SELECT week_start,
	-- Lag Temperatures
	LAG(avgtemp_week,2) OVER (ORDER BY week_start) AS lagtemp2,
	LAG(avgtemp_week,4) OVER (ORDER BY week_start) AS lagtemp4,
	LAG(avgtemp_week,12) OVER (ORDER BY week_start) AS lagtemp12,
	
	-- Lag Daylight
	LAG(avgdaylight_week,2) OVER (ORDER BY week_start) AS lagdaylight2,
	LAG(avgdaylight_week,4) OVER (ORDER BY week_start) AS lagdaylight4,
	LAG(avgdaylight_week,12) OVER (ORDER BY week_start) AS lagdaylight12,
	
	--Lag Dew Point
	LAG(avgdew_week,2) OVER (ORDER BY week_start) AS lagdewpoint2,
	LAG(avgdew_week,4) OVER (ORDER BY week_start) AS lagdewpoint4,
	LAG(avgdew_week,12) OVER (ORDER BY week_start) AS lagdewpoint12,
	
	--Lag Precipitation
	LAG(totalrain_week,2) OVER (ORDER BY week_start) AS lagrain2,
	LAG(totalrain_week,4) OVER (ORDER BY week_start) AS lagrain4,
	LAG(totalrain_week,12) OVER (ORDER BY week_start) AS lagrain12,

	--Lag Snow
	LAG(totalsnow_week,2) OVER (ORDER BY week_start) AS lagsnow2,
	LAG(totalsnow_week,4) OVER (ORDER BY week_start) AS lagsnow4,
	LAG(totalsnow_week,12) OVER (ORDER BY week_start) AS lagsnow12,

	--Lag Snow on Ground
	LAG(totalsnowgr_week,2) OVER (ORDER BY week_start) AS lagsnowgr2,
	LAG(totalsnowgr_week,4) OVER (ORDER BY week_start) AS lagsnowgr4,
	LAG(totalsnowgr_week,12) OVER (ORDER BY week_start) AS lagsnowgr12,

	--Aggregate climate indicators over 1,4 and 52 weeks
	
	-- Precipitation (Rain)
	ROUND(SUM(totalrain_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumrain2,

	ROUND(SUM(totalrain_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumrain4,

	-- Precipitation (Snow)
	ROUND(SUM(totalsnow_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumsnow4,

	ROUND(SUM(totalsnow_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumsnow2,

	-- Precipitation (Rain)
	ROUND(SUM(totalsnowgr_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumsnowgr4,

	ROUND(SUM(totalsnowgr_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS sumsnowgr2,

	-- Dew Point (Average)
	ROUND(AVG(avgdew_week) OVER (ORDER BY week_start 
	ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgdewpoint4,
		
	ROUND(AVG(avgdew_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgdewpoint2,

	-- Daylight (Average)
	ROUND(AVG(avgdaylight_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgdaylight4,

	ROUND(AVG(avgdaylight_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgdaylight2,
			
	--Windspeed (Maximum)
	ROUND(AVG(avgwspeed_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgwspeed4,

	ROUND(AVG(avgwspeed_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgwspeed2,

	--Wind Gust (Average)
	ROUND(AVG(avggust_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avggust4,

	ROUND(AVG(avggust_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avggust2,

	-- Wind Chill (Average)
	ROUND(AVG(avgwindchill_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgwindchill4,
		
	ROUND(AVG(avgwindchill_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS avgwindchill2,

	-- Calculate Standard Deviations

	ROUND(STDDEV(avgwindchill_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdwindchill2,

	ROUND(STDDEV(avgtemp_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdtemp2,

	ROUND(STDDEV(avgdew_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stddew2,

	ROUND(STDDEV(totalrain_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdrain2,

	ROUND(STDDEV(totalsnow_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdsnow2,

	ROUND(STDDEV(totalsnowgr_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdsnowgr2,

	ROUND(STDDEV(avgdaylight_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stddaylight2,

	ROUND(STDDEV(avgwspeed_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdwspeed2,
		
	ROUND(STDDEV(avggust_week) OVER (ORDER BY week_start
		ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdgust2,

		ROUND(STDDEV(avgwindchill_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdwindchill4,

	ROUND(STDDEV(avgtemp_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdtemp4,

	ROUND(STDDEV(avgdew_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stddew4,

	ROUND(STDDEV(totalrain_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdrain4,

	ROUND(STDDEV(totalsnow_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdsnow4,

	ROUND(STDDEV(totalsnowgr_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdsnowgr4,

	ROUND(STDDEV(avgdaylight_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stddaylight4,

	ROUND(STDDEV(avgwspeed_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdwspeed4,
		
	ROUND(STDDEV(avggust_week) OVER (ORDER BY week_start
		ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING)::NUMERIC,2) AS stdgust4
		
	FROM weekly_weather;


SELECT * FROM lagrollweatherweeks;