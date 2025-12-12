import * as Edge from './edges';

/**
 * Object containing different edge types for the ChaaatBuilder.
 * @typedef {Object} EdgeTypes
 * @property {Edge.Condition} condition - Represents a condition edge.
 * @property {Edge.Default} default - Represents a default edge.
 * @property {Edge.Loop} loop - Represents a loop edge.
 */

/**
 * Object containing different edge types for the ChaaatBuilder.
 * @type {EdgeTypes}
 */
export const edgeTypes = {
  condition: Edge.Condition,
  default: Edge.Default,
  loop: Edge.Loop,
};
