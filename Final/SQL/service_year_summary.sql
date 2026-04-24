DROP VIEW IF EXISTS services_year_summary;

CREATE VIEW services_year_summary AS (

WITH top_services AS (
    SELECT service_request_type, section, division,
	COUNT(*) AS total_requests
    FROM service_requests
    WHERE year BETWEEN 2020 AND 2026
    	AND service_request_type NOT LIKE '%Ended%'
	  	GROUP BY service_request_type, section, division
    	ORDER BY total_requests DESC
   		LIMIT 100
),
yearly_requests AS (

    SELECT
        service_request_type,
        year, ward, ward_id,
        COUNT(*) AS yearly_requests
    FROM service_requests
    WHERE year BETWEEN 2020 AND 2026
    	AND service_request_type NOT LIKE '%Ended%'
    	GROUP BY service_request_type, year, ward, ward_id
),
top_month AS (

    SELECT *
    FROM (
        SELECT
            year,
            month AS top_month,
            service_request_type,
            
            ROW_NUMBER() OVER (
                PARTITION BY service_request_type, year
                ORDER BY COUNT(*) DESC
            ) AS rank_num

        FROM service_requests
	    WHERE year BETWEEN 2020 AND 2026
    		AND service_request_type NOT LIKE '%Ended%'
        	GROUP BY service_request_type, year, month
    ) ranked
    WHERE rank_num = 1
)
SELECT
    t.service_request_type,
    t.section,
    t.division,

    c.year,
    c.yearly_requests,
	c.ward, c.ward_id,

    m.top_month


FROM top_services t
LEFT JOIN yearly_requests c
    ON t.service_request_type = c.service_request_type

LEFT JOIN top_month m
    ON t.service_request_type = m.service_request_type
    AND c.year = m.year
	);

SELECT * FROM services_year_summary;