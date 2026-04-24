WITH top_services AS (
    
    SELECT
        service_request_type,
        section,
        COUNT(*) AS total_requests
    FROM service_requests
	WHERE service_request_type IN (SELECT service_request_type FROM monthly_distribution)
    GROUP BY service_request_type, section
    ORDER BY total_requests DESC
    LIMIT 100
), intersection_count AS (


	SELECT 
		service_request_type, 
		section, 
		COUNT(*) AS requestswiinter
	FROM service_requests
	WHERE year >=2020 AND 
	(intersection_street_1 IS NOT NULL OR intersection_street_2 IS NOT NULL)
	GROUP BY service_request_type, section
)
	SELECT t.service_request_type,
		t.section,
		t.total_requests,
		i.requestswiinter

	FROM top_services t

	LEFT JOIN intersection_count i ON 
	t.service_request_type = i.service_request_type
	AND t.section = i.section
	ORDER BY service_request_type DESC