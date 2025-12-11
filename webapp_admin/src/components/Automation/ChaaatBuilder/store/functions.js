/**
 * Get node object
 *
 * @function
 * @name getNodeIndex
 * @kind function
 * @param {any} nodeData
 * @param {any} id
 * @returns {any}
 * @exports
 */
export function getNodeData(nodeData, id) {
  const nodeIndex = nodeData.find((f) => f.id === id);
  return nodeIndex;
}

/**
 * Get store node index
 *
 * @function
 * @name getNodeIndex
 * @kind function
 * @param {any} nodeData
 * @param {any} id
 * @returns {any}
 * @exports
 */
export function getNodeIndex(nodeData, id) {
  const nodeIndex = nodeData.findIndex((f) => f.id === id);
  return nodeIndex;
}

/**
 * Get store node index
 *
 * @function
 * @name getNodeIndex
 * @kind function
 * @param {any} nodeData
 * @param {any} id
 * @returns {any}
 * @exports
 */
export function getUpdatedNodeData(nodeData, id, key, value) {
  const clone = [...nodeData];
  if (clone[id]?.data?.flowData) {
    clone[id].data.flowData = { ...clone[id]?.data?.flowData, [key]: value };

    if (clone[id] && clone[id].type === 'message' && key === 'title') {
      clone[id].data.title = value
    }
  }

  return clone;
}

/**
 * Get all node for quick replies
 *
 * @function
 * @name getAllButtonCapableNodes
 * @kind function
 * @param {any} nodeData
 * @param {any} id
 * @returns {{ label: any; value: any; }[]}
 * @exports
 */
export function getAllButtonCapableNodes(nodeData, id) {
  return (
    [...nodeData]
      // Filter not equal to current node
      .filter((f) => f.id !== id)
      // Filter for correct node typex
      .filter((f) => ['message', 'booking'].includes(f.type))
      .map((m) => ({ label: m?.data?.flowData?.title, value: m.id }))
  );
}

/**
 * Get all node for looping
 *
 * @function
 * @name getAllNodeCapableForLoop
 * @kind function
 * @param {any} nodeData
 * @param {any} id
 * @returns {{ label: any; value: any; }[]}
 * @exports
 */
export function getAllNodeCapableForLoop(nodeData) {
  return (
    [...nodeData]
      // Filter for correct node typex
      .filter((f) => ['message', 'booking'].includes(f.type))
      .map((m) => ({ label: m?.data?.flowData?.title, value: m.id }))
  );
}
