/**
 * Return true/false if condition statement/s count is greater than or equal to 2
 * This is to be use whether to show or hide the delete button of condition
 *
 * @param {edges} Array - list of node edges in workflow
 * @param {id} string - parent id
 */
export const showDeleteBtn = (nodeData, id) => {
  const children = nodeData.filter((f) => f.source === id);

  return children.length > 2;
};
