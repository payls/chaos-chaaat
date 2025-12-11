import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle
} from 'react';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';
import ReactFlow, {
  ReactFlowProvider,
  useReactFlow,
  useEdgesState,
  useNodesState,
  useNodes,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from 'react-flow-renderer';
import { nodeTypes } from './ChaaatBuilder/nodes/index';
import { edgeTypes } from './ChaaatBuilder/edges/index';
import { getLayoutedElements } from './ChaaatBuilder/utils/WorkflowLayoutUtils';
import Message from './ChaaatBuilder/sidebar/message';
import Condition from './ChaaatBuilder/sidebar/condition';
import Booking from './ChaaatBuilder/sidebar/booking';
import Reminder from './ChaaatBuilder/sidebar/reminder';
import End from './ChaaatBuilder/sidebar/end';

// STORE
import useSideBarStore from './ChaaatBuilder/store';
import { getNodeData } from './ChaaatBuilder/store/functions';

export default React.memo(
  forwardRef(({
    props,
    agency,
    wabaNumber,
    onAddNodeCallback,
    onAddNodeToJump,
    onRemoveNodeToJump,
    reactFlowWrapper,
    reactFlowInstance,
    setReactFlowInstance,
    toRestoreData = false,
    setLatestFlowData,
    isSidebarVisible,
    showSideBar,
    saveBookingWhatsappFlow,
  }, ref) => {
    const elements = props;
    const {
      nodeData,
      nodeEdges,
      setNodeData,
      setNodeEdges,
      setSelectedNodeStore,
      setPreview,
      setEdgesDisableOption,
    } = useSideBarStore();

    const [isToRestore, setIsToRestore] = useState(toRestoreData);
    const [layoutElements, setLayoutElements] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

    const layoutNodes = layoutElements.filter((x) => x.position);
    const layoutEdges = layoutElements.filter((x) => !x.position);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

    /**
    * This useEffect updates layout elements based on the provided elements and node data.
    */
    useEffect(() => {
      const clonedElements = preserveData(elements, nodeData);

      let $els;
      if (isToRestore) {
        $els = clonedElements;
      } else {
        $els = getLayoutedElements(
          clonedElements.map(
            ({ position, width, height, positionAbsolute, ...rest }) => rest,
          ),
        );
      }

      setIsToRestore(false);
      setLayoutElements($els);
      setNodeData($els);
      const updatedNodes = $els.filter((x) => x.position);
      const updatedEdges = $els.filter((x) => !x.position);
      // Booking already exists disable Create a booking option in edge menu
      const hasBooking = !!updatedNodes.find((n) => n.type === 'booking');
      setEdgesDisableOption('createBooking', hasBooking);
      setLatestFlowData({
        nodes: updatedNodes,
        edges: updatedEdges,
      });
      // debugger;
    }, [elements]);

    // This useEffect helps to update "not approved" flag on node once it is approved
    useEffect(() => {
      setLayoutElements(nodeData)
    }, [nodeData])

    // This useEffect helps to update and set the latest flow data based on nodeData
    useEffect(() => {
      const updatedNodes = nodeData.filter((x) => x.position);
      const updatedEdges = nodeData.filter((x) => !x.position);

      setLatestFlowData({
        nodes: updatedNodes,
        edges: updatedEdges,
      });

      if (arraysAreDifferent(layoutNodes, updatedNodes)) {
        setNodes(layoutNodes);
      }
      if (arraysAreDifferent(layoutEdges, updatedEdges)) {
        setEdges(layoutEdges);
      }
    }, [nodeData]);

    useEffect(() => {
      if (arraysAreDifferent(layoutNodes, nodes)) {
        setNodes(layoutNodes);
      }
      if (arraysAreDifferent(layoutEdges, edges)) {
        setEdges(layoutEdges);
      }
      
    }, [layoutNodes, layoutEdges, setNodes, setEdges]);

    useEffect(() => {
      setSelectedNodeStore(selectedNode);
      setPreview(false);
    }, [selectedNode]);

    // allows parent to call these functions
    useImperativeHandle(ref, () => ({

      crmSettingSaved({ latestFlowData, crm_settings_id, whatsapp_flow_id, flow_id }) {
        const bookingNode = nodes.findIndex(n => n.type === 'booking');
        if (bookingNode < 0) {
          return { nodes: latestFlowData.nodes, edges };
        }
        const clone = [...latestFlowData.nodes];
        clone[bookingNode] = {
          ...clone[bookingNode],
          data: {
            ...clone[bookingNode].data,
            crm_settings_id,
            whatsapp_flow_id,
            waba_flow_id: flow_id,
            flowData: {
              ...clone[bookingNode].data.flowData,
              crm_settings_id,
              whatsapp_flow_id,
              waba_flow_id: flow_id,
            }
          }
        };
        setNodes(clone);
        return {
          nodes: clone,
          edges,
        }
      },
    }));

    /**
     * Preserves data for the given elements based on the provided node data.
     *
     * @param {Array} $els - The elements to preserve data for.
     * @param {Array} $nodeData - The node data to retrieve data from.
     * @returns {Array} - The cloned elements with preserved data.
     */
    function preserveData($els, $nodeData) {
      const clonedElements = [...$els];
      if ($nodeData.length > 0) {
        for (let i = 0; i < clonedElements.length; i++) {
          const node = getNodeData($nodeData, clonedElements[i].id);
          if (h.notEmpty(node?.data?.flowData)) {
            clonedElements[i].data = node?.data;
          }
        }
      }
      return clonedElements;
    }

    /**
     * Checks if two arrays are different.
     *
     * @param {Array} arr1 - The first array.
     * @param {Array} arr2 - The second array.
     * @returns {boolean} Returns true if the arrays are different, false otherwise.
     */
    function arraysAreDifferent(arr1, arr2) {
      return JSON.stringify(arr1) !== JSON.stringify(arr2);
    }

    /**
     * Handles the connection event.
     *
     * @param {Object} params - The parameters for the connection event.
     */
    const onConnect = useCallback(
      (params) => setEdges((eds) => eds.concat(params)), // Modified: Concatenate edges
      [setEdges],
    );

    let id = 0;
    const getId = () => `dndnode_${id++}`;

    /**
     * Handles the drop event when an element is dropped onto the react flow.
     *
     * @param {Event} event - The drop event.
     */
    const onDrop = useCallback(
      (event) => {
        event.preventDefault();

        const reactFlowBounds =
          reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');

        // check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        const newNode = {
          id: getId(),
          type,
          position,
          data: { label: `${type} node` },
        };

        setNodes((nds) => nds.concat(newNode));
      },
      [reactFlowInstance, setNodes],
    );

    /**
     * Handles the drag over event when an element is dragged over the react flow.
     *
     * @param {Event} event - The drag over event.
     */
    const onDragOver = useCallback((event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);

    /**
     * Handles the click event on a node.
     *
     * @param {Event} event - The click event.
     * @param {Object} node - The clicked node.
     */
    const onNodeClick = useCallback((event, node) => {
      event.preventDefault();
      setSelectedNode(node);
      showSideBar();
    }, []);

    /**
     * Handles the close event on the sidebar.
     *
     * @param {Event} event - The close event.
     * @param {Object} node - The selected node.
     */
    const onSideBarClose = useCallback((event, node) => {
      event.preventDefault();
      setSelectedNode(null);
    }, []);

    /**
     * Renders the sidebar settings component based on the selected node type.
     *
     * @returns {React.ReactNode} The rendered sidebar settings component or null if no node is selected.
     */
    const SidebarSettings = useCallback(() => {
      if (h.notEmpty(selectedNode)) {
        const { type } = selectedNode;
        const baseProps = {
          agency,
          wabaNumber,
          onClose: onSideBarClose,
          node: selectedNode,
          elements,
        };

        const componentMap = {
          message: { component: Message, extraProps: { onAddNodeCallback } },
          booking: { component: Booking, extraProps: { onSaveInitialPage: saveBookingWhatsappFlow } },
          reminder: { component: Reminder, extraProps: {} },
          waitThenCheck: {
            component: Condition,
            extraProps: { onAddNodeCallback },
          },
          end: {
            component: End,
            extraProps: { onAddNodeToJump, onRemoveNodeToJump },
          },
        };

        const { component: Component, extraProps } = componentMap[type] || {};
        return Component ? <Component {...baseProps} {...extraProps} /> : null;
      }
    }, [selectedNode]);

    return (
      <div>
        <ReactFlowProvider>
          <div
            ref={reactFlowWrapper}
            className="reactflow-wrapper AutomationCanvas"
            style={{
              height: 'calc(100vh - 81px)',
              background: '#fdfdfd',
              border: '1 solid black',
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onConnect={onConnect}
              fitView
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
            >
              <Background
                color="#E4EDFB"
                variant={BackgroundVariant.Dots}
                size={3}
                gap={60}
              />
              <Controls className="Controls" />
              <MiniMap />
            </ReactFlow>
          </div>
          {h.notEmpty(selectedNode) && isSidebarVisible && <SidebarSettings node={selectedNode} />}
        </ReactFlowProvider>
      </div>
    );
  },
));
