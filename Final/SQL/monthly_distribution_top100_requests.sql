DROP VIEW IF EXISTS monthly_distribution;

CREATE VIEW monthly_distribution AS (

/* =========================================================
   STEP 1: BASE DATA
   - Includes 2019 for YoY baseline
   ========================================================= */
WITH base AS (
    SELECT 
        TRIM(month) AS month,
        year,
        service_request_type,
        section,
        COUNT(*) AS monthly_requests
    FROM service_requests
    WHERE year BETWEEN 2019 AND 2026
      AND service_request_type NOT LIKE '%Ended%'
    GROUP BY month, year, service_request_type, section
),

/* =========================================================
   STEP 2: Top 100 request types (filter layer only)
   ========================================================= */
top_requests AS (
    SELECT service_request_type, section
    FROM service_requests
    WHERE year BETWEEN 2020 AND 2026
      AND service_request_type NOT LIKE '%Ended%'
    GROUP BY service_request_type, section
    ORDER BY COUNT(*) DESC
    LIMIT 100
),

/* =========================================================
   STEP 3: Month ordering
   ========================================================= */
month_ordered AS (
    SELECT *,
        CASE month
            WHEN 'January' THEN 1
            WHEN 'February' THEN 2
            WHEN 'March' THEN 3
            WHEN 'April' THEN 4
            WHEN 'May' THEN 5
            WHEN 'June' THEN 6
            WHEN 'July' THEN 7
            WHEN 'August' THEN 8
            WHEN 'September' THEN 9
            WHEN 'October' THEN 10
            WHEN 'November' THEN 11
            WHEN 'December' THEN 12
        END AS month_num
    FROM base
),

/* =========================================================
   STEP 4: YTD
   ========================================================= */
ytd_calc AS (
    SELECT
        *,
        SUM(monthly_requests) OVER (
            PARTITION BY year, service_request_type, section
            ORDER BY month_num
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS ytd_requests
    FROM month_ordered
),

/* =========================================================
   STEP 5: Yearly totals
   ========================================================= */
yearly_totals AS (
    SELECT
        service_request_type,
        section,
        year,
        SUM(monthly_requests) AS yearly_requests
    FROM base
    GROUP BY 1,2,3
),

/* =========================================================
   STEP 6: Join metrics
   ========================================================= */
joined AS (
    SELECT
        y.*,
        yt.yearly_requests,
        prev_yt.yearly_requests AS prev_year_total,
        prev_ytd.ytd_requests AS prev_year_ytd

    FROM ytd_calc y

    LEFT JOIN yearly_totals yt
        ON y.service_request_type = yt.service_request_type
        AND y.section = yt.section
        AND y.year = yt.year

    LEFT JOIN yearly_totals prev_yt
        ON y.service_request_type = prev_yt.service_request_type
        AND y.section = prev_yt.section
        AND y.year = prev_yt.year + 1

    LEFT JOIN ytd_calc prev_ytd
        ON y.service_request_type = prev_ytd.service_request_type
        AND y.section = prev_ytd.section
        AND y.month_num = prev_ytd.month_num
        AND y.year = prev_ytd.year + 1
),

/* =========================================================
   STEP 7: Final calculations
   ========================================================= */
final AS (
    SELECT
        month,
        year,
        service_request_type,
        section,

        monthly_requests,
        yearly_requests,
        ytd_requests,

        CASE 
            WHEN year = 2026 THEN prev_year_ytd
            ELSE prev_year_total
        END AS prev_year_requests,

        CASE 
            WHEN year = 2026 
            THEN ROUND((ytd_requests - prev_year_ytd) * 100.0 / prev_year_ytd,2)

            WHEN year < 2026 
            THEN ROUND((yearly_requests - prev_year_total) * 100.0 / prev_year_total,2)
        END AS yoy_growth,

		ROUND(monthly_requests * 100.0 / yearly_requests,2) AS pct_contribution

    FROM joined
)

/* =========================================================
   FINAL STEP: APPLY TOP 100 FILTER HERE
   ========================================================= */
SELECT f.*
FROM final f
JOIN top_requests t
    ON f.service_request_type = t.service_request_type
    AND f.section = t.section
WHERE f.year BETWEEN 2020 AND 2026

);

SELECT * FROM monthly_distribution;