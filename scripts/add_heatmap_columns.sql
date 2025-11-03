-- Add Heatmap Control parameters to Players table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE "Players"
ADD COLUMN IF NOT EXISTS "Saturation" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "Amplitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "Lacunarity" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "Grain" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "Warp Strength" DOUBLE PRECISION;

-- Optional: Add comments to describe each column
COMMENT ON COLUMN "Players"."Saturation" IS 'Heatmap Control - Saturation parameter';
COMMENT ON COLUMN "Players"."Amplitude" IS 'Heatmap Control - Amplitude parameter';
COMMENT ON COLUMN "Players"."Lacunarity" IS 'Heatmap Control - Lacunarity parameter';
COMMENT ON COLUMN "Players"."Grain" IS 'Heatmap Control - Grain parameter';
COMMENT ON COLUMN "Players"."Warp Strength" IS 'Heatmap Control - Warp Strength parameter';
