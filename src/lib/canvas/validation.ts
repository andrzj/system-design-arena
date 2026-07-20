import type { Connection } from '@xyflow/react';

export function isValidConnection(connection: Connection): boolean {
  if (!connection.source || !connection.target) return false;
  if (connection.source === connection.target) return false;
  return connection.sourceHandle === 'source' && connection.targetHandle === 'target';
}
