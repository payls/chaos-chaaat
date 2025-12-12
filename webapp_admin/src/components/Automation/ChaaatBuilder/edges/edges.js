import EdgeAddButton from '../buttons/edgeAddButton/edgeAddButton';

import {
  getEdgeCenter,
  getSmoothStepPath,
  getMarkerEnd,
} from 'react-flow-renderer';

import useSideBarStore from '../store';

const [buttonWidth, buttonHeight] = [46, 46];

/**
 * Renders a condition edge component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.id - The unique identifier of the edge.
 * @param {number} props.sourceX - The x-coordinate of the source node.
 * @param {number} props.sourceY - The y-coordinate of the source node.
 * @param {number} props.targetX - The x-coordinate of the target node.
 * @param {number} props.targetY - The y-coordinate of the target node.
 * @param {string} props.sourcePosition - The position of the source node.
 * @param {string} props.targetPosition - The position of the target node.
 * @param {string} props.arrowHeadType - The type of arrow head for the edge.
 * @param {string} props.markerEndId - The id of the marker end for the edge.
 * @param {Object} props.data - Additional data for the edge.
 * @param {boolean} props.data.isAddButtonHidden - Indicates whether the add button is hidden.
 * @returns {JSX.Element} The rendered condition edge component.
 */
export const Condition = (props) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    arrowHeadType,
    markerEndId,
    data,
  } = props;
  const {
    edgesDisableOption,
  } = useSideBarStore();
  const edgePath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { isAddButtonHidden } = data;

  const updatedProps = {
    ...props,
    disableOption: edgesDisableOption,
  }

  return (
    <>
      <path
        id={id}
        d={edgePath}
        markerEnd={markerEnd}
        className="react-flow__edge-path"
      />
      {isAddButtonHidden ? null : (
        <>
          <foreignObject
            width={buttonWidth}
            height={buttonHeight}
            x={edgeCenterX - buttonWidth / 2}
            y={edgeCenterY - buttonHeight / 2}
            requiredExtensions="http://www.w3.org/1999/xhtml"
            style={{ zIndex: 10000 }}
          >
            <EdgeAddButton
              {...updatedProps}
              onClick={() => console.log('clicked')}
              style={{
                width: buttonWidth,
                height: buttonHeight,
                // display: 'grid',
                // placeItems: 'center',
                zIndex: 10000,
              }}
            />
          </foreignObject>
        </>
      )}
    </>
  );
};

/**
 * Renders the default edge component.
 *
 * @param {Object} props - The props for the component.
 * @param {string} props.id - The unique identifier for the edge.
 * @param {number} props.sourceX - The x-coordinate of the source node.
 * @param {number} props.sourceY - The y-coordinate of the source node.
 * @param {number} props.targetX - The x-coordinate of the target node.
 * @param {number} props.targetY - The y-coordinate of the target node.
 * @param {string} props.sourcePosition - The position of the source node.
 * @param {string} props.targetPosition - The position of the target node.
 * @param {string} props.arrowHeadType - The type of arrow head for the edge.
 * @param {string} props.markerEndId - The id of the marker end for the edge.
 * @param {Object} props.data - Additional data for the edge.
 * @param {boolean} props.data.isAddButtonHidden - Flag indicating whether the add button is hidden.
 * @returns {JSX.Element} The rendered edge component.
 */
export const Default = (props) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    arrowHeadType,
    markerEndId,
    data,
  } = props;
  const edgePath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { isAddButtonHidden } = data;

  return (
    <>
      <path
        id={id}
        d={edgePath}
        markerEnd={markerEnd}
        className="react-flow__edge-path"
      />
      {isAddButtonHidden ? null : (
        <>
          <foreignObject
            width={buttonWidth}
            height={buttonHeight}
            x={edgeCenterX - buttonWidth / 2}
            y={edgeCenterY - buttonHeight / 2}
            requiredExtensions="http://www.w3.org/1999/xhtml"
          />
        </>
      )}
    </>
  );
};

/**
 * Represents a loop edge in the ChaaatBuilder component.
 *
 * @param {Object} props - The props for the Loop component.
 * @param {string} props.id - The unique identifier for the edge.
 * @param {number} props.sourceX - The x-coordinate of the source node.
 * @param {number} props.sourceY - The y-coordinate of the source node.
 * @param {number} props.targetX - The x-coordinate of the target node.
 * @param {number} props.targetY - The y-coordinate of the target node.
 * @param {string} props.sourcePosition - The position of the source node.
 * @param {string} props.targetPosition - The position of the target node.
 * @param {string} props.arrowHeadType - The type of arrow head for the edge.
 * @param {string} props.markerEndId - The id of the marker end for the edge.
 * @param {Object} props.data - Additional data for the edge.
 * @returns {JSX.Element} The rendered Loop component.
 */
export const Loop = (props) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    arrowHeadType,
    markerEndId,
    data,
  } = props;
  const edgePath = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  const [edgeCenterX, edgeCenterY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <path
        id={id}
        d={edgePath}
        markerEnd={markerEnd}
        className="react-flow__edge-path"
      />
    </>
  );
};
