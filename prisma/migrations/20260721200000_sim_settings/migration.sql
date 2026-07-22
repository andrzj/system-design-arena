-- AlterTable
ALTER TABLE "design_sessions" ADD COLUMN "cache_hit_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.8;
ALTER TABLE "design_sessions" ADD COLUMN "edge_cache_hit_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.9;

-- AlterTable
ALTER TABLE "canvas_nodes" ADD COLUMN "sim_config" JSONB;
