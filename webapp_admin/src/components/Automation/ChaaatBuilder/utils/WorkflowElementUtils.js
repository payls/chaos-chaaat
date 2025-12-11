import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { h } from '../../../../helpers';

const position = { x: 0, y: 0 };

/**
 * Returns the title and description based on the given type.
 *
 * @param {string} type - The type of the element.
 * @returns {Object} - An object containing the title and description.
 */
const getTitleAndDescription = (type) => {
  const componentMap = {
    message: { title: 'Message', description: 'Send message to contacts.' },
    booking: { title: 'Booking', description: 'Create a bookings.' },
    reminder: { title: 'Reminder', description: 'Create a reminder' },
    waitThenCheck: {
      title: 'Condition',
      description: 'Check behaviour of the Rule',
    },
    end: { title: 'End', description: 'Process ends' },
  };

  return componentMap[type] || { title: '', description: '' };
};

/**
 * Returns the updated elements after adding an action node to the workflow.
 *
 * @param {Object} options - The options for adding the action node.
 * @param {Array} options.elements - The current elements in the workflow.
 * @param {string} options.newNodeId - The ID of the new action node.
 * @param {string} options.targetNodeId - The ID of the target node.
 * @param {Function} options.onAddNodeCallback - The callback function to be called when a node is added.
 * @returns {Array} The updated elements after adding the action node.
 */
const getUpdatedElementsAfterActionNodeAddition = ({
  elements,
  newNodeId,
  targetNodeId,
  onAddNodeCallback,
}) => {
  const clonedElements = _.cloneDeep(elements);
  const newEdge = {
    id: uuidv4(),
    source: newNodeId,
    target: targetNodeId,
    type: 'condition',
    data: { onAddNodeCallback },
  };
  clonedElements.push(newEdge);
  return clonedElements;
};

/**
 * Returns the updated elements after adding a branch conditional label to the workflow.
 *
 * @param {Object} options - The options for updating the elements.
 * @param {Array} options.elements - The current elements in the workflow.
 * @param {string} options.newNodeId - The ID of the new node being added.
 * @param {string} options.targetNodeId - The ID of the target node.
 * @param {Function} options.onAddNodeCallback - The callback function to be called when a node is added.
 * @returns {Array} The updated elements after adding the branch conditional label.
 */
const getUpdatedElementsAfterActionNodeAdditionBranchConditionalLabel = ({
  elements,
  newNodeId,
  targetNodeId,
  onAddNodeCallback,
}) => {
  const endNode = uuidv4();

  const clonedElements = _.cloneDeep(elements);
  const newEdgeSource = {
    id: uuidv4(),
    source: targetNodeId,
    target: newNodeId,
    type: 'default',
    data: { onAddNodeCallback },
  };
  const newEdgeTarget = {
    id: uuidv4(),
    source: newNodeId,
    target: endNode,
    type: 'condition',
    data: { onAddNodeCallback },
  };

  const newEndNode = {
    id: endNode,
    type: 'end',
    data: {
      title: 'End of Automation',
      description:
        'The flow can jump to another node if available, otherwise it will end here',
      stats: {
        completed: 14,
      },
    },
    position,
    height: 70,
  };

  clonedElements.push(newEdgeSource);
  clonedElements.push(newEdgeTarget);
  clonedElements.push(newEndNode);

  return clonedElements;
};

/**
 * Returns the updated elements after adding a new action node to the workflow.
 *
 * @param {Object} options - The options for adding the new action node.
 * @param {Array} options.elements - The array of existing elements in the workflow.
 * @param {string} options.newNodeId - The ID of the new action node.
 * @param {string} options.targetNodeId - The ID of the target node where the new action node will be connected.
 * @param {string} options.sourceNodeId - The ID of the source node where the new action node will be connected.
 * @param {Function} options.onAddNodeCallback - The callback function to be called after adding the new action node.
 * @param {boolean} options.hasSibling - Indicates whether the new action node has a sibling node.
 * @returns {Array} The updated elements after adding the new action node.
 */
const getUpdatedElementsAfterActionNodeAdditionBranch = ({
  elements,
  newNodeId,
  targetNodeId,
  sourceNodeId,
  onAddNodeCallback,
  hasSibling,
}) => {
  const clonedElements = _.cloneDeep(elements);
  if (hasSibling) {
    const endNode = uuidv4();

    const newEdgeSource = {
      id: uuidv4(),
      source: targetNodeId,
      target: newNodeId,
      type: 'condition',
      data: { onAddNodeCallback },
    };
    const newEdgeTarget = {
      id: uuidv4(),
      source: newNodeId,
      target: endNode,
      type: 'condition',
      data: { onAddNodeCallback },
    };

    const newEndNode = {
      id: endNode,
      type: 'end',
      data: {
        title: 'End of Automation',
        description:
          'The flow can jump to another node if available, otherwise it will end here',
      },
    };

    clonedElements.push(newEndNode);
    clonedElements.push(newEdgeSource);
    clonedElements.push(newEdgeTarget);
  } else {
    const newEdge = {
      id: uuidv4(),
      source: newNodeId,
      target: targetNodeId,
      type: 'condition',
      data: { onAddNodeCallback },
    };
    clonedElements.push(newEdge);
  }

  return clonedElements;
};

const getUpdatedElementsAfterEndNodeAddition = () => {};

/**
 * Returns the updated elements after adding a rule node to the workflow.
 *
 * @param {Object} options - The options for updating the elements.
 * @param {Array} options.elements - The array of existing elements.
 * @param {string} options.newNodeId - The ID of the new node being added.
 * @param {string} options.targetNodeId - The ID of the target node.
 * @param {Object} options.existingNodesUnder - The existing nodes under the target node.
 * @param {Function} options.onAddNodeCallback - The callback function for adding a node.
 * @param {Function} options.onDeleteNodeCallback - The callback function for deleting a node.
 * @returns {Array} The updated elements after adding the rule node.
 */
const getUpdatedElementsAfterRuleNodeAdditon = ({
  elements,
  newNodeId,
  targetNodeId,
  existingNodesUnder,
  onAddNodeCallback,
  onDeleteNodeCallback,
}) => {
  const clonedElements = _.cloneDeep(elements);
  const emptyNode1Id = uuidv4();
  const emptyNode2Id = uuidv4();

  const endNode1Id = uuidv4();
  const endNode2Id = uuidv4();

  // Conditional Label Node
  const emptyNode1 = {
    id: emptyNode1Id,
    type: 'conditionLabel',
    data: {
      title: 'Condition 1',
      conditionIndex: 1,
      parent: newNodeId,
      onDeleteNodeCallback,
    },
    position,
    // height: 70,
    // width: 40,
  };

  // Conditional Label Node
  const emptyNode2 = {
    id: emptyNode2Id,
    type: 'conditionLabel',
    data: {
      title: 'Condition 2',
      conditionIndex: 2,
      parent: newNodeId,
      onDeleteNodeCallback,
    },
    position,
    // height: 70,
    onDeleteNodeCallback,
    // width: 40,
  };

  // End Node 1
  const endNode1 = {
    id: endNode1Id,
    type: 'end',
    data: {
      title: 'End of Automation',
      description:
        'The flow can jump to another node if available, otherwise it will end here',
      stats: {
        completed: 14,
      },
    },
    position,
    // height: 70,
    // width: 40,
  };

  // End Node
  const endNode2 = {
    id: endNode2Id,
    type: 'end',
    data: {
      title: 'End of Automation',
      description:
        'The flow can jump to another node if available, otherwise it will end here',
      stats: {
        completed: 14,
      },
    },
    position,
    // height: 70,
    // width: 40,
  };

  // Conditional Label 1 from condition node to condition label
  const ruleNodeToEmptyNodeEdge1 = {
    id: uuidv4(),
    source: newNodeId,
    target: emptyNode1Id,
    type: 'default',
    // animated: true,
    data: { onAddNodeCallback },
  };

  const emptyNode1ToMergeNodeEdge = {
    id: uuidv4(),
    source: emptyNode1Id,
    target: endNode1Id,
    type: 'condition',
    // animated: true,
    data: { onAddNodeCallback },
  };

  // Conditional Label 2 from condition node to condition label
  const ruleNodeToEmptyNodeEdge2 = {
    id: uuidv4(),
    source: newNodeId,
    target: emptyNode2Id,
    type: 'default',
    // animated: true,

    data: { onAddNodeCallback },
  };
  const emptyNode2ToMergeNodeEdge = {
    id: uuidv4(),
    source: emptyNode2Id,
    target: endNode2Id,
    type: 'condition',
    // animated: true,
    data: { onAddNodeCallback },
  };

  if (h.notEmpty(existingNodesUnder)) {
    emptyNode1ToMergeNodeEdge.target = existingNodesUnder?.id;
  }

  clonedElements.push(
    ...[
      emptyNode2,
      emptyNode2ToMergeNodeEdge,
      ruleNodeToEmptyNodeEdge2,
      emptyNode1,
      emptyNode1ToMergeNodeEdge,
      ruleNodeToEmptyNodeEdge1,
      endNode2,
    ],
  );

  if (h.isEmpty(existingNodesUnder)) {
    clonedElements.push(endNode1);
  }

  return clonedElements;
};

/**
 * Adds a reminder node to the workflow element.
 *
 * @param {Object} options - The options for adding the reminder node.
 * @param {Object} options.currentElementState - The current state of the element.
 * @param {number} options.targetEdgeIndex - The index of the target edge.
 * @param {Object} options.targetEdge - The target edge.
 * @param {Array} options.clonedElements - The cloned elements.
 * @param {string} options.newNodeId - The ID of the new node.
 * @param {Object} options.newNode - The new node.
 * @param {string} options.targetNodeId - The ID of the target node.
 * @param {Function} options.onAddNodeCallback - The callback function for adding a node.
 * @returns {Array|Object} - The updated elements after adding the reminder node.
 */
function reminderNodeAddition({
  currentElementState,
  targetEdgeIndex,
  targetEdge,
  clonedElements,
  newNodeId,
  newNode,
  targetNodeId,
  onAddNodeCallback,
}) {
  const el = clonedElements.find((s) => targetEdge.source === s.id);
  const hasSibling = clonedElements.filter(
    (s) => targetEdge.source === s.target && !s.hasOwnProperty('targetHandle'),
  );

  const sourceEdgeIndex = clonedElements.findIndex(
    (x) => x?.source === targetEdge.target,
  );
  const sourceEdge = clonedElements[sourceEdgeIndex];
  const sourceType = clonedElements.find(
    (s) => sourceEdge?.source === s.id,
  )?.type;

  const parentType = getParentType(clonedElements, el?.id);

  if (
    (parentType === 'message' || parentType === 'booking') &&
    sourceType === 'reminder'
  ) {
    if (hasSibling.length < 2) {
      clonedElements[targetEdgeIndex] = {
        ...currentElementState,
        type: 'condition',
      };
    }
    return getUpdatedElementsAfterActionNodeAdditionBranch({
      elements: clonedElements,
      newNodeId,
      targetNodeId: targetEdge.source,
      sourceNodeId: sourceEdge.target,
      onAddNodeCallback,
      hasSibling: hasSibling.length < 2,
    });
  } else {
    return getUpdatedElementsAfterActionNodeAddition({
      elements: clonedElements,
      newNodeId,
      newNode,
      targetNodeId,
      onAddNodeCallback,
    });
  }
}

/**
 * Returns the type of the parent element based on the provided ID.
 *
 * @param {Array} clonedElements - The array of cloned elements.
 * @param {string} id - The ID of the element to find the parent type for.
 * @returns {string|undefined} The type of the parent element, or undefined if not found.
 */
function getParentType(clonedElements, id) {
  const source = clonedElements.find((s) => id === s.id);

  return source?.type;
}

/**
 * Adds a message node to the workflow element.
 *
 * @param {Object} options - The options for adding the message node.
 * @param {Object} options.currentElementState - The current state of the element.
 * @param {number} options.targetEdgeIndex - The index of the target edge.
 * @param {Object} options.targetEdge - The target edge.
 * @param {Array} options.clonedElements - The cloned elements.
 * @param {string} options.newNodeId - The ID of the new node.
 * @param {Object} options.newNode - The new node.
 * @param {string} options.targetNodeId - The ID of the target node.
 * @param {Function} options.onAddNodeCallback - The callback function for adding a node.
 * @returns {Array|Object} - The updated elements after adding the message node.
 */
function messageNodeAddition({
  currentElementState,
  targetEdgeIndex,
  targetEdge,
  clonedElements,
  newNodeId,
  newNode,
  targetNodeId,
  onAddNodeCallback,
}) {
  const el = clonedElements.find((s) => targetEdge.source === s.id);
  const hasSibling = clonedElements.filter(
    (s) => targetEdge.source === s.target && !s.hasOwnProperty('targetHandle'),
  );

  const sourceEdgeIndex = clonedElements.findIndex(
    (x) => x?.source === targetEdge.target,
  );
  const sourceEdge = clonedElements[sourceEdgeIndex];
  const sourceType = clonedElements.find(
    (s) => sourceEdge?.source === s.id,
  )?.type;

  const parentType = getParentType(clonedElements, el?.id);

  if (parentType === 'message' && sourceType === 'message') {
    if (hasSibling.length < 2) {
      clonedElements[targetEdgeIndex] = {
        ...currentElementState,
        type: 'condition',
      };
    }
    return getUpdatedElementsAfterActionNodeAdditionBranch({
      elements: clonedElements,
      newNodeId,
      targetNodeId: targetEdge.source,
      sourceNodeId: sourceEdge.target,
      onAddNodeCallback,
      hasSibling: hasSibling.length < 2,
    });
  } else {
    return getUpdatedElementsAfterActionNodeAddition({
      elements: clonedElements,
      newNodeId,
      newNode,
      targetNodeId,
      onAddNodeCallback,
    });
  }
}

/**
 * Adds a conditional label node to the workflow elements.
 *
 * @param {Object} options - The options for adding the conditional label node.
 * @param {Array} options.clonedElements - The cloned elements array.
 * @param {string} options.newNodeId - The ID of the new node.
 * @param {Object} options.newNode - The new node object.
 * @param {Object} options.targetEdge - The target edge object.
 * @param {number} options.targetEdgeIndex - The index of the target edge.
 * @param {Object} options.currentElementState - The current element state object.
 * @param {string} options.endOfConditionNodeId - The ID of the end of condition node.
 * @param {Function} options.onAddNodeCallback - The callback function for adding a node.
 * @returns {Array} - The updated elements after adding the conditional label node.
 */
function conditionalLabelNodeAddition({
  clonedElements,
  newNodeId,
  newNode,
  targetEdge,
  targetEdgeIndex,
  currentElementState,
  endOfConditionNodeId,
  onAddNodeCallback,
}) {
  const childrenCount = clonedElements.filter(
    (x) => x?.source === targetEdge.source,
  )?.length;

  newNode.data = {
    ...newNode.data,
    title: 'Condition ' + (childrenCount + 1),
    conditionIndex: childrenCount + 1,
    parent: targetEdge.source,
  };
  newNode['height'] = 70;

  clonedElements[targetEdgeIndex] = {
    ...currentElementState,
    type: 'default',
  };

  clonedElements.push(newNode);

  return getUpdatedElementsAfterActionNodeAdditionBranchConditionalLabel({
    elements: clonedElements,
    newNodeId,
    targetNodeId: targetEdge.source,
    sourceNodeId: endOfConditionNodeId,
    onAddNodeCallback,
  });
}

/**
 * Updates the elements after adding a new node.
 *
 * @param {Object} options - The options for updating the elements.
 * @param {Array} options.elements - The array of elements.
 * @param {string} options.targetEdgeId - The ID of the target edge.
 * @param {string} options.type - The type of the new node.
 * @param {string|null} options.endOfConditionNodeId - The ID of the end node of the condition (optional).
 * @param {Function} options.onDeleteNodeCallback - The callback function for deleting a node.
 * @param {Function} options.onNodeClickCallback - The callback function for clicking a node.
 * @param {Function} options.onAddNodeCallback - The callback function for adding a node.
 * @param {Object} options.position - The position of the new node.
 * @returns {Array} The updated elements array.
 */
const getUpdatedElementsAfterNodeAddition = ({
  elements,
  targetEdgeId,
  type,
  endOfConditionNodeId = null,
  onDeleteNodeCallback,
  onNodeClickCallback,
  onAddNodeCallback,
  position,
}) => {
  const newNodeId = uuidv4();
  const { title, description } = getTitleAndDescription(type);
  const newNode = {
    id: newNodeId,
    type,
    data: {
      title,
      flowData: {},
      description,
      onNodeClickCallback,
      onDeleteNodeCallback,
    },
    position,
  };
  const clonedElements = _.cloneDeep(elements);
  const targetEdgeIndex = clonedElements.findIndex(
    (x) => x.id === targetEdgeId,
  );
  const targetEdge = elements[targetEdgeIndex];

  // Check if targetEdge is defined before accessing its properties
  if (targetEdge) {
    const { target: targetNodeId } = targetEdge;
    const currentElementState = clonedElements[targetEdgeIndex];
    const updatedTargetEdge = { ...targetEdge, target: newNodeId };
    clonedElements[targetEdgeIndex] = updatedTargetEdge;

    if (type === 'message' || type === 'booking' || type === 'reminder') {
      const t = getTitleAndDescription(type);
      newNode.data = {
        ...newNode.data,
        flowData: { title: t.title },
      };
    }

    // Skip push to elements for future newNode updates for `conditionLabel` and `waitThenCheck`
    if (type !== 'conditionLabel' && type !== 'waitThenCheck') {
      clonedElements.push(newNode);
    }

    switch (type) {
      case 'end':
        return getUpdatedElementsAfterActionNodeAddition({
          elements: clonedElements,
          newNodeId,
          newNode,
          targetNodeId,
          onAddNodeCallback,
        });

      case 'conditionLabel':
        return conditionalLabelNodeAddition({
          clonedElements,
          newNodeId,
          newNode,
          targetEdge,
          targetEdgeIndex,
          currentElementState,
          endOfConditionNodeId,
          onAddNodeCallback,
        });

      case 'waitThenCheck':
        const existingNodesUnder = elements.find(
          (x) => x.id === targetEdge.target,
        );

        newNode.data = {
          ...newNode.data,
          // Add target id to set target of future new condition
          endOfConditionNodeId: targetNodeId,
        };
        clonedElements.push(newNode);

        return getUpdatedElementsAfterRuleNodeAdditon({
          elements: clonedElements,
          newNodeId,
          targetNodeId,
          existingNodesUnder,
          onAddNodeCallback,
          onDeleteNodeCallback,
        });
      case 'reminder': {
        return reminderNodeAddition({
          targetEdge,
          clonedElements,
          newNodeId,
          onAddNodeCallback,
          targetEdgeIndex,
          currentElementState,
          newNode,
          targetNodeId,
        });
      }
      case 'message': {
        return messageNodeAddition({
          targetEdge,
          clonedElements,
          newNodeId,
          onAddNodeCallback,
          targetEdgeIndex,
          currentElementState,
          newNode,
          targetNodeId,
        });
      }
      default:
        return getUpdatedElementsAfterActionNodeAddition({
          elements: clonedElements,
          newNodeId,
          newNode,
          targetNodeId,
          onAddNodeCallback,
        });
    }
  } else {
    // Handle the case when targetEdge is undefined
    console.error('Target edge is undefined.');
    return elements; // Return the original elements array
  }
};

export { getUpdatedElementsAfterNodeAddition };
