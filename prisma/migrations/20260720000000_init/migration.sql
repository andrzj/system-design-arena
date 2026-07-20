-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "avatar_url" TEXT,
    "subscription_tier" TEXT NOT NULL DEFAULT 'free',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "sbc_member_email" TEXT,
    "sims_used_today" INTEGER NOT NULL DEFAULT 0,
    "last_sim_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "tags" TEXT[],
    "brief" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "key_considerations" TEXT NOT NULL,
    "reference_architecture" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" UUID,
    "problem_id" INTEGER NOT NULL,
    "session_uuid" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "speed_setting" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "traffic_setting" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "read_write_ratio" DOUBLE PRECISION NOT NULL DEFAULT 0.92,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canvas_nodes" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "node_uuid" TEXT NOT NULL,
    "component_type" TEXT NOT NULL,
    "label" TEXT,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "replicas" INTEGER NOT NULL DEFAULT 1,
    "implementation_notes" TEXT,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canvas_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canvas_edges" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "edge_uuid" TEXT NOT NULL,
    "source_node_id" INTEGER NOT NULL,
    "target_node_id" INTEGER NOT NULL,
    "label" TEXT,
    "style" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canvas_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chaos_logs" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "chaos_event_id" TEXT NOT NULL,
    "target_node_id" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" JSONB,

    CONSTRAINT "chaos_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_results" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "user_id" UUID,
    "judge_rigor_score" INTEGER,
    "judge_pragmatism_score" INTEGER,
    "consensus_verdict" TEXT,
    "written_feedback" TEXT,
    "debate_summary" TEXT,
    "model_used" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "related_problem_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_stripe_customer_id_key" ON "profiles"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "problems_slug_key" ON "problems"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "design_sessions_session_uuid_key" ON "design_sessions"("session_uuid");

-- CreateIndex
CREATE INDEX "design_sessions_user_id_idx" ON "design_sessions"("user_id");

-- CreateIndex
CREATE INDEX "design_sessions_problem_id_idx" ON "design_sessions"("problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "canvas_nodes_node_uuid_key" ON "canvas_nodes"("node_uuid");

-- CreateIndex
CREATE INDEX "canvas_nodes_session_id_idx" ON "canvas_nodes"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "canvas_edges_edge_uuid_key" ON "canvas_edges"("edge_uuid");

-- CreateIndex
CREATE INDEX "canvas_edges_session_id_idx" ON "canvas_edges"("session_id");

-- CreateIndex
CREATE INDEX "chaos_logs_session_id_idx" ON "chaos_logs"("session_id");

-- CreateIndex
CREATE INDEX "score_results_session_id_idx" ON "score_results"("session_id");

-- CreateIndex
CREATE INDEX "score_results_user_id_idx" ON "score_results"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- AddForeignKey
ALTER TABLE "design_sessions" ADD CONSTRAINT "design_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design_sessions" ADD CONSTRAINT "design_sessions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canvas_nodes" ADD CONSTRAINT "canvas_nodes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "design_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canvas_edges" ADD CONSTRAINT "canvas_edges_source_node_id_fkey" FOREIGN KEY ("source_node_id") REFERENCES "canvas_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canvas_edges" ADD CONSTRAINT "canvas_edges_target_node_id_fkey" FOREIGN KEY ("target_node_id") REFERENCES "canvas_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canvas_edges" ADD CONSTRAINT "canvas_edges_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "design_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chaos_logs" ADD CONSTRAINT "chaos_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "design_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chaos_logs" ADD CONSTRAINT "chaos_logs_target_node_id_fkey" FOREIGN KEY ("target_node_id") REFERENCES "canvas_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_results" ADD CONSTRAINT "score_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "design_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_results" ADD CONSTRAINT "score_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Optional RLS on profiles (Supabase Auth defense-in-depth)
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON "profiles" FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON "profiles" FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON "profiles" FOR UPDATE
  USING (auth.uid() = id);
