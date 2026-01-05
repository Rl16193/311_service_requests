DROP VIEW IF EXISTS parks_monthly_splits;

CREATE VIEW parks_monthly_splits AS 
WITH training_data AS (
    -- Filter the data to the training period and prepare the keys
    SELECT
        EXTRACT(MONTH FROM month_start) AS month_num, -- Extracts the numeric month
        ward,
        sub_section,
        service_request_type,
        monthly_requests
    FROM
        monthly_requests_parks
    WHERE
        month_start < '2024-08-01'
),

service_counts AS (
    -- Calculate the service count (Numerator) for each unique segment combination
    SELECT
        month_num,
        ward,
        sub_section,
        service_request_type,
        SUM(monthly_requests) AS service_counts
    FROM
        training_data
    GROUP BY
        month_num, ward, sub_section, service_request_type
)

-- 3. Calculate the Final Split using a Window Function
SELECT
    sc.month_num,
    sc.ward,
    sc.sub_section,
    sc.service_request_type,
    sc.service_counts,
    
    -- Calculate the total monthly requests for the segment (Denominator)
    SUM(sc.service_counts) OVER (
        PARTITION BY 
            sc.month_num, 
            sc.ward, 
            sc.sub_section
    ) AS monthly_totals,
    
    -- Calculate the final split percentage (Service Count / Monthly Total)
    ROUND(sc.service_counts * 1.0 / NULLIF(
        SUM(sc.service_counts) OVER (
            PARTITION BY 
                sc.month_num, 
                sc.ward, 
                sc.sub_section
        ), 
        0
    )::NUMERIC,2) AS service_split
FROM
    service_counts sc
ORDER BY
    sc.month_num, sc.ward, sc.sub_section;

SELECT * FROM parks_monthly_splits;