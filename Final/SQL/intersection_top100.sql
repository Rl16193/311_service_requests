DROP VIEW IF EXISTS intersection_top100;

CREATE VIEW intersection_top100 AS 

WITH top_services AS (
    
    SELECT
        service_request_type,
        section,
        COUNT(*) AS total_requests
    FROM service_requests
	WHERE year BETWEEN 2020 AND 2026
    AND service_request_type NOT LIKE '%Ended%'
    GROUP BY service_request_type, section
    ORDER BY total_requests DESC
    LIMIT 100
)
	SELECT 
		ward, ward_id,
		service_request_type, 
		year, 
		intersection_street_1, 
		intersection_street_2, 
		COUNT(*) AS yearly_requests
	FROM service_requests
	WHERE year >=2020 AND service_request_type IN (SELECT service_request_type FROM top_services)
		AND
	(intersection_street_1 IS NOT NULL OR intersection_street_2 IS NOT NULL)
	GROUP BY ward, ward_id, service_request_type, year, intersection_street_1, intersection_street_2
	ORDER BY yearly_requests DESC


