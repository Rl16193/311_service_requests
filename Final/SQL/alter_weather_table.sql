ALTER TABLE daily_weather
DROP COLUMN is_freeze_thaw CASCADE,
DROP COLUMN consecutive_snow CASCADE;

ALTER TABLE daily_weather
ADD COLUMN is_freeze_thaw INTEGER,
ADD COLUMN consecutive_snow INTEGER;


-- Add marker for freeze-thaw cycles (temperature varies from -ve to + ve)

UPDATE daily_weather
SET is_freeze_thaw =
    CASE
        WHEN min_temperature < 0 AND max_temperature > 0 THEN 1
        ELSE 0
    END;

-- Categorize snow fall days into groups (group changes when the snow fall marker changes)
WITH snow_groups AS (
    SELECT
        date,
        SUM(
            CASE WHEN is_snow = false THEN 1 ELSE 0 END
        ) OVER (ORDER BY date) AS snow_group
    FROM daily_weather
),

-- Sum days when snow fall marker is true and reset the counter when it is false to obtain consecutive snow days
snow_streaks AS (
    SELECT
        date,
        CASE
            WHEN is_snow = true THEN
                SUM(
                    CASE WHEN is_snow = true THEN snow ELSE 0 END
                ) OVER (
                    PARTITION BY snow_group
                    ORDER BY date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                )
            ELSE 0
        END AS consecutive_snow
    FROM daily_weather
    JOIN snow_groups USING (date)
)
UPDATE daily_weather d
SET consecutive_snow = s.consecutive_snow
FROM snow_streaks s
WHERE d.date = s.date;

SELECT * FROM daily_weather;
