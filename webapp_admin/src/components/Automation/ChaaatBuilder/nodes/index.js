import * as Node from './nodes';

/**
 * Defines the available node types for the ChaaatBuilder.
 * Each node type is associated with a specific action or condition.
 */
export const nodeTypes = {
  source: Node.Source,
  message: Node.Action,
  booking: Node.Action,
  waitThenCheck: Node.Condition,
  reminder: Node.Action,
  end: Node.End,
  empty: Node.Empty,
  conditionLabel: Node.ConditionLabel,
};
