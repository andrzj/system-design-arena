import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from './server';

// Types for our database tables
export type Profile = {
  id: string;
  updated_at: string | null;
  avatar_url: string | null;
  subscription_status: 'free' | 'yearly' | 'sbc';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  sbc_member_email: string | null;
  sims_used_today: number;
  last_sim_date: string | null;
  created_at: string;
};

export type Problem = {
  id: number;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  brief: string;
  requirements: string;
  key_considerations: string;
  reference_architecture: string | null;
  order: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type DesignSession = {
  id: number;
  user_id: string | null;
  problem_id: number | null;
  session_uuid: string;
  status: 'in_progress' | 'completed';
  speed_setting: number;
  traffic_setting: number;
  read_write_ratio: number;
  created_at: string;
  updated_at: string;
};

export type CanvasNode = {
  id: number;
  session_id: number;
  node_uuid: string;
  component_type: string;
  label: string | null;
  x: number;
  y: number;
  replicas: number;
  implementation_notes: string | null;
  is_disabled: boolean;
  created_at: string;
  updated_at: string;
};

export type CanvasEdge = {
  id: number;
  session_id: number;
  edge_uuid: string;
  source_node_id: number;
  target_node_id: number;
  label: string | null;
  style: 'solid' | 'dashed';
  created_at: string;
};

export type ChaosLog = {
  id: number;
  session_id: number;
  chaos_event_id: string;
  target_node_id: number | null;
  timestamp: string;
  result: unknown; // JSONB type
};

export type ScoreResult = {
  id: number;
  session_id: number;
  user_id: string | null;
  judge_rigor_score: number | null;
  judge_pragmatism_score: number | null;
  consensus_verdict: 'pass' | 'fail' | 'borderline' | null;
  written_feedback: string | null;
  debate_summary: string | null;
  model_used: string;
  created_at: string;
};

export type Article = {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  is_published: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

// Service class for Supabase operations
class SupabaseService {
  private async getSupabase(): Promise<SupabaseClient> {
    return createSupabaseClient();
  }

  // Profile methods
  async getProfile(userId: string): Promise<Profile | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Problem methods
  async getProblems(): Promise<Problem[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('is_public', true)
      .order('order');

    if (error) throw error;
    return data;
  }

  async getProblemBySlug(slug: string): Promise<Problem | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  // Design session methods
  async createSession(userId: string | null, problemId: number): Promise<DesignSession> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('design_sessions')
      .insert({
        user_id: userId,
        problem_id: problemId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSessionByUuid(sessionUuid: string): Promise<DesignSession | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('design_sessions')
      .select('*')
      .eq('session_uuid', sessionUuid)
      .single();

    if (error) throw error;
    return data;
  }

  async updateSession(sessionId: number, updates: Partial<DesignSession>): Promise<DesignSession> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('design_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Canvas node methods
  async createNodes(nodes: Array<Omit<CanvasNode, 'id' | 'created_at' | 'updated_at'>>): Promise<CanvasNode[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('canvas_nodes')
      .insert(nodes)
      .select();

    if (error) throw error;
    return data;
  }

  async getNodesBySessionId(sessionId: number): Promise<CanvasNode[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('canvas_nodes')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at');

    if (error) throw error;
    return data;
  }

  async updateNode(nodeId: number, updates: Partial<CanvasNode>): Promise<CanvasNode> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('canvas_nodes')
      .update(updates)
      .eq('id', nodeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteNode(nodeId: number): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('canvas_nodes')
      .delete()
      .eq('id', nodeId);

    if (error) throw error;
  }

  async deleteNodesBySessionId(sessionId: number): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('canvas_nodes')
      .delete()
      .eq('session_id', sessionId);

    if (error) throw error;
  }

  // Canvas edge methods
  async createEdges(edges: Array<Omit<CanvasEdge, 'id' | 'created_at'>>): Promise<CanvasEdge[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('canvas_edges')
      .insert(edges)
      .select();

    if (error) throw error;
    return data;
  }

  async getEdgesBySessionId(sessionId: number): Promise<CanvasEdge[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('canvas_edges')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at');

    if (error) throw error;
    return data;
  }

  async updateEdge(edgeId: number, updates: Partial<CanvasEdge>): Promise<CanvasEdge> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('canvas_edges')
      .update(updates)
      .eq('id', edgeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteEdge(edgeId: number): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('canvas_edges')
      .delete()
      .eq('id', edgeId);

    if (error) throw error;
  }

  async deleteEdgesBySessionId(sessionId: number): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('canvas_edges')
      .delete()
      .eq('session_id', sessionId);

    if (error) throw error;
  }

  // Chaos log methods
  async logChaosEvent(sessionId: number, eventId: string, targetNodeId: number | null, result: unknown): Promise<ChaosLog> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('chaos_logs')
      .insert({
        session_id: sessionId,
        chaos_event_id: eventId,
        target_node_id: targetNodeId,
        result: result,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getChaosLogsBySessionId(sessionId: number): Promise<Array<ChaosLog>> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('chaos_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Score result methods
  async createScoreResult(
    sessionId: number,
    userId: string | null,
    scoreData: Omit<ScoreResult, 'id' | 'session_id' | 'user_id' | 'created_at'>
  ): Promise<ScoreResult> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('score_results')
      .insert({
        session_id: sessionId,
        user_id: userId,
        ...scoreData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getScoreResultsBySessionId(sessionId: number): Promise<Array<ScoreResult>> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('score_results')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Article methods
  async getArticles(): Promise<Array<Article>> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('order');

    if (error) throw error;
    return data;
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;