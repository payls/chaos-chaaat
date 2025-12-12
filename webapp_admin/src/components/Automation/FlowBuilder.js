import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  useNodesState,
  useEdgesState,
  MarkerType,
  useUpdateNodeInternals,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TemplateSelect from './FlowBuilder/TemplateSelect';
import QuickButton from './FlowBuilder/QuickButton';
import RuleTrigger from './FlowBuilder/RuleTrigger';
import ReplyNode from './FlowBuilder/ReplyNode';
import FlowEnd from './FlowBuilder/FlowEnd';
import { h } from '../../helpers';
import ConditionalResponse from './FlowBuilder/ConditionalResponse';
import ElseConditionalResponse from './FlowBuilder/ElseConditionalResponse';
import useFlowBuilderStore from './store';
import { faMagic } from '@fortawesome/free-solid-svg-icons';

const yPosNum = 450;
const defaultViewport = { x: 300, y: 50, zoom: 0.9 };
const edgeType = 'smoothstep';

const sfdcFields = [
  {
    label: 'First Name',
    value: 'first_name',
  },
  {
    label: 'Last Name',
    value: 'last_name',
  },
  {
    label: 'Email Address',
    value: 'email',
  },
  {
    label: 'Phone Number',
    value: 'mobile_number',
  },
  {
    label: 'Lead Source',
    value: 'lead_source',
  },
  {
    label: 'Lead Source Lv1',
    value: 'lead_source_lv1',
  },
  {
    label: 'Lead Source Lv2',
    value: 'lead_source_lv2',
  },
  {
    label: 'Marketing Email',
    value: 'marketing',
  },
  {
    label: 'Interested Product',
    value: 'product',
  },
  {
    label: 'City Code',
    value: 'city',
  },
  {
    label: 'Consent Date',
    value: 'consent_date',
  },
  {
    label: 'Language',
    value: 'language',
  },
  {
    label: 'Comments',
    value: 'comments',
  },
];

export default React.memo(
  ({
    templates = [],
    messageChannel = '',
    toRestoreData = null,
    onSubmit = () => {},
    formMode,
    triggers,
  }) => {
    const yPos = useRef(0);
    const actionNumber = useRef(1);
    const [rfInstance, setRfInstance] = useState(null);
    const { setViewport } = useReactFlow();
    const { updateNodes, updateEdges, updateKeySelected, keysSelected } =
      useFlowBuilderStore();
    const updateNodeInternals = useUpdateNodeInternals();
    const [nodeStat, setNodeStat] = useState({});
    const [onDrag, setOnDrag] = useState(false);
    const [edges, setEdges, onEdgesChange] = useEdgesState([
      {
        id: 'e1-2',
        type: edgeType,
        source: 'ruleTrigger',
        target: 'parentTemplate',
        sourceHandle: 'initialFlowSource',
      },
      // {
      //   id: 'e1-4',
      //   type: edgeType,
      //   source: 'parentTemplate',
      //   target: 'flowEnd',
      // },
    ]);

    const [nodes, setNodes] = useState([
      {
        id: 'ruleTrigger',
        nodeId: 'ruleTrigger',
        type: 'ruleTrigger',
        position: { x: 0, y: 0 },
        data: {
          nodeId: 'ruleTrigger',
          value: null,
          is_end: false,
          canJump: false,
        },
      },
      {
        id: 'parentTemplate',
        nodeId: 'parentTemplate',
        type: 'textUpdater',
        position: { x: 0, y: 150 },
        data: {
          nodeId: 'parentTemplate',
          value: null,
          to_salesforce: null,
          is_end: true,
          actionNumber: 1,
          actionValue: null,
          canJump: true,
        },
      },
      // {
      //   id: 'flowEnd',
      //   nodeId: 'flowEnd',
      //   type: 'flowEnd',
      //   position: { x: 0, y: 300 },
      //   data: {
      //     nodeId: 'flowEnd',
      //     value: null,
      //     edges: edges,
      //     nodes: [],
      //   },
      // },
    ]);

    const [nodeTypes, setNodeTypes] = useState({
      ruleTrigger: (props) => (
        <RuleTrigger
          {...props}
          onSelectTrigger={handleChangeTrigger}
          triggers={triggers}
          formMode={formMode}
          messageChannel={messageChannel}
        />
      ),
      textUpdater: (props) => (
        <TemplateSelect
          {...props}
          onSelectTemplate={handleSelectTemplate}
          onAddReply={handleAddReply}
          onPushSFData={handlePushDataToSf}
          onSelectEnd={handleJumpToNode}
          templates={templates}
          formMode={formMode}
          messageChannel={messageChannel}
          sfdcFields={sfdcFields}
        />
      ),
      quickButton: (props) => (
        <QuickButton
          {...props}
          onSelectChange={handleToggleFollowUpMessage}
          onSelectTemplate={handleSelectTemplate}
          onAddValue={handleTextResponse}
          onAddReply={handleAddReply}
          onPushSFData={handlePushDataToSf}
          onSelectEnd={handleJumpToNode}
          templates={templates}
          formMode={formMode}
          messageChannel={messageChannel}
          sfdcFields={sfdcFields}
        />
      ),
      replyNode: (props) => (
        <ReplyNode
          {...props}
          onSelectChange={handleToggleFollowUpMessage}
          onSelectTemplate={handleSelectTemplate}
          onAddValue={handleTextResponse}
          onAddReply={handleAddReply}
          onAddNode={handleAddNode}
          onPushSFData={handlePushDataToSf}
          onSelectConditionalResponse={handleChangeConditionalResponse}
          onSelectEnd={handleJumpToNode}
          templates={templates}
          formMode={formMode}
          messageChannel={messageChannel}
          sfdcFields={sfdcFields}
        />
      ),

      conditionalNode: (props) => (
        <ConditionalResponse
          {...props}
          onAddValue={handleTextResponse}
          onAddReply={handleAddReply}
          onConditionChange={handleConditionChange}
          templates={templates}
          formMode={formMode}
          messageChannel={messageChannel}
        />
      ),

      elseConditionalNode: (props) => (
        <ElseConditionalResponse
          {...props}
          onAddValue={handleTextResponse}
          onAddReply={handleAddReply}
          onConditionChange={handleConditionChange}
          templates={templates}
          formMode={formMode}
          messageChannel={messageChannel}
        />
      ),
      flowEnd: (props) => <FlowEnd {...props} />,
    });

    useEffect(() => {
      updateNodes(nodes);
    }, [nodes]);

    useEffect(() => {
      const n = [...nodes];
      if (h.notEmpty(n) && h.notEmpty(nodeStat)) {
        const i = n.findIndex((f) => f.id === nodeStat[0]?.id);
        if (
          h.notEmpty(i) &&
          nodeStat[0]?.type === 'position' &&
          h.notEmpty(nodeStat[0]?.position)
        ) {
          n[i].position = nodeStat[0]?.position;
          setNodes(n);
        }
      }
    }, [nodeStat]);

    useEffect(() => {
      updateEdges(edges);
    }, [edges]);

    useEffect(() => {
      if (formMode === 'view' || formMode === 'edit') {
        const c = JSON.parse(toRestoreData);
        localStorage.setItem('key', JSON.stringify(c));
        onRestore();

        actionNumber.current = c.nodes.reduce((max, obj) => {
          return Math.max(max, obj.data.actionNumber ?? 0);
        }, -Infinity);

        yPos.current = c.edges.length * yPosNum;
      } else {
        yPos.current = 80;
      }
    }, []);

    function onNodesChange(e) {
      if (h.cmpBool(onDrag, true)) {
        setNodeStat(e);
      }
    }

    function onNodeDragStart() {
      setOnDrag(true);
    }

    function onNodeDragStop() {
      setOnDrag(false);
    }

    function generateQuickButtonNodes(
      parentId,
      parentNodeId,
      content,
      parentNode,
    ) {
      const buttonNodes = [];
      const buttonEdges = [];
      const templateContent = JSON.parse(content);

      let buttons = [];

      switch (messageChannel) {
        case 'whatsapp':
          const quickReplyButtons = templateContent.components.find(
            (f) => f.type === 'BUTTONS',
          );
          buttons = quickReplyButtons?.buttons.filter(
            (f) => f.type === 'QUICK_REPLY',
          );
          break;
        case 'line':
          if (
            templateContent?.type === 'template' &&
            templateContent?.template?.type === 'confirm'
          ) {
            buttons = templateContent?.template?.actions ?? [];
          } else if (
            templateContent?.type === 'template' &&
            templateContent?.template?.type === 'buttons'
          ) {
            buttons = [];
          } else {
            const textObj = templateContent.find((f) => f.type === 'text');
            buttons = textObj?.quickReply?.items ?? [];
          }

          break;
      }

      if (h.notEmpty(buttons)) {
        yPos.current = parentNode.position.y + yPosNum;
        let x = 0 + parentNode.position.x;

        // switch (buttons.length) {
        //   case 2:
        //     x = -235;
        //     break;
        //   case 3:
        //     x = -465;
        //     break;
        //   case 4:
        //     x = -695;
        //     break;
        //   case 5:
        //     x = -930;
        //     break;
        // }
        for (const i of buttons) {
          actionNumber.current++;
          const rand = Math.floor(Math.random() * 10000);
          const nodeChildId = parentNodeId + '-child' + rand;

          buttonNodes.push({
            id: nodeChildId,
            nodeId: nodeChildId,
            parent: parentNodeId,
            type: 'quickButton',
            position: { x, y: yPos.current },
            data: {
              value: null,
              button: i,
              nodeId: nodeChildId,
              enabled: false,
              is_end: true,
              actionNumber: actionNumber.current,
              actionValue: null,
              canJump: true,
            },
          });
          x += 465;
          buttonEdges.push({
            type: edgeType,
            id: 'edges-' + rand,
            source: parentId,
            target: nodeChildId,
            sourceHandle: 'source-' + rand,
          });
        }

        return { buttonNodes, buttonEdges };
      }

      return [];
    }

    function generateReplyNode(parentId, parentNodeId, parentNode) {
      const buttonNodes = [];
      const buttonEdges = [];

      const rand = Math.floor(Math.random() * 10000);
      const nodeChildId = parentNodeId + '-child' + rand;
      actionNumber.current++;
      buttonNodes.push({
        id: nodeChildId,
        nodeId: nodeChildId,
        parent: parentNodeId,
        type: 'replyNode',
        position: {
          x: parentNode.position.x,
          y: yPosNum + parentNode.position.y,
        },
        data: {
          value: null,
          nodeId: nodeChildId,
          enabled: false,
          conditional: false,
          is_end: true,
          actionNumber: actionNumber.current,
          actionValue: null,
          canJump: true,
        },
      });

      buttonEdges.push({
        type: edgeType,
        id: 'edges-' + rand,
        source: parentId,
        target: nodeChildId,
        sourceHandle: 'source-' + rand,
      });

      return { buttonNodes, buttonEdges };
    }

    function handleToggleFollowUpMessage(uNodes, uEdges, nodeId, v) {
      const nodeIndex = uNodes.findIndex((i) => i.nodeId === nodeId);
      if (nodeIndex > -1) {
        let cNode = Array.from(uNodes);
        let cEdge = Array.from(uEdges);
        cNode[nodeIndex].data.enabled = v.target.checked;
        cNode[nodeIndex].data.value = null;
        cNode[nodeIndex].data.actionValue = null;

        if (!v.target.checked) {
          cNode[nodeIndex].data.is_end = true;

          // Remove Child if existing
          cNode = cNode.filter(
            (f) =>
              !f.nodeId.startsWith(nodeId + '-child') ||
              !f.nodeId.startsWith('parentTemplate'),
          );

          // Remove Child if existing
          cEdge = cEdge.filter((f) => f.source !== cNode[nodeIndex].id);
        }

        setNodes(cNode);
        setEdges(cEdge);
      }
    }

    function handleJumpToNode(uNodes, uEdges, nodeId, v) {
      const newId = 'id-' + Math.floor(Math.random() * 10000);
      const newTargetId = 'id-' + Math.floor(Math.random() * 10000);
      const nodeIndex = uNodes.findIndex((i) => i.nodeId === nodeId);
      let cNode = Array.from(uNodes);

      if (typeof v.value === 'string') {
        const mEdges = Array.from(uEdges).filter(
          (f) => f.source !== uNodes[nodeIndex].id,
        );

        cNode[nodeIndex].data.actionValue = null;
        setEdges(mEdges);
      } else {
        const targetIndex = cNode.findIndex(
          (i) => i.data.actionNumber === v.value.data.actionNumber,
        );

        if (nodeIndex > -1) {
          let cNode = Array.from(uNodes);
          let oldId = cNode[nodeIndex].id;
          let oldTargetId = cNode[targetIndex].id;
          cNode[nodeIndex].data.actionValue = v;
          cNode[nodeIndex].id = newId;

          cNode[targetIndex].id =
            targetIndex !== nodeIndex ? newTargetId : cNode[targetIndex].id;

          let mEdges = Array.from(uEdges)
            .filter((f) => f.source !== oldId)
            .map((me) => ({
              ...me,
              source: oldId === me.source ? newId : me.source,
              target: oldId === me.target ? newId : me.target,
            }));

          mEdges = mEdges.map((me) => ({
            ...me,
            source: oldTargetId === me.source ? newTargetId : me.source,
            target: oldTargetId === me.target ? newTargetId : me.target,
          }));

          const position =
            cNode[targetIndex].position.x < cNode[nodeIndex].position.x
              ? 'right'
              : 'left';

          setEdges([
            ...mEdges,
            {
              type: edgeType,
              id: 'edges-loop-anchor-' + newId,
              source: newId,
              position,
              targetHandle: 'target-' + newId,
              target:
                targetIndex !== nodeIndex ? newTargetId : cNode[targetIndex].id,
              sourceHandle: 'source-' + newId,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#4C75FD',
              },
              style: {
                strokeWidth: 2,
                stroke: '#4C75FD',
              },
              animated: true,
            },
          ]);
        }
      }
      setNodes(cNode);
    }

    function handlePushDataToSf(uNodes, uEdges, nodeId, v) {
      const nodeIndex = uNodes.findIndex((i) => i.nodeId === nodeId);
      if (nodeIndex > -1) {
        let cNode = Array.from(uNodes);
        cNode[nodeIndex].data.to_salesforce = v;

        setNodes(cNode);
      }
    }

    function handleSelectTemplate(uNodes, uEdges, nodeId, template) {
      const fNode = uNodes.length === 0 ? nodes : uNodes;
      const fEdges = uEdges.length === 0 ? edges : uEdges;
      const nodeIndex = fNode.findIndex((i) => i.nodeId === nodeId);
      const newId = 'id-' + Math.floor(Math.random() * 10000);
      let oldId = '';

      if (nodeIndex > -1) {
        // Remove Child if existing
        let cNode = Array.from(fNode).filter(
          (f) =>
            !f.nodeId.startsWith(nodeId + '-child') ||
            !f.nodeId.startsWith('parentTemplate'),
        );

        if (fNode.length !== cNode.length) {
          yPos.current = cNode.length * yPosNum;
        }

        let cEdge = Array.from(fEdges);
        oldId = cNode[nodeIndex].id;
        cNode[nodeIndex].data.value = template;
        cNode[nodeIndex].id = newId;

        const templateContent = generateQuickButtonNodes(
          newId,
          cNode[nodeIndex].nodeId,
          template.value.content,
          cNode[nodeIndex],
        );
        //  With Quick Reply Buttons
        if (h.notEmpty(templateContent)) {
          cNode[nodeIndex].data.is_end = false;

          const { buttonNodes, buttonEdges } = templateContent;
          let updatedEdges = [...cEdge, ...buttonEdges];

          updatedEdges = updatedEdges.map((m) => {
            return {
              ...m,
              target: m.target === oldId ? newId : m.target,
            };
          });

          setNodes([...cNode, ...buttonNodes]);
          setEdges(updatedEdges);

          //  Without Quick Reply Buttons
        } else {
          cNode[nodeIndex].data.is_end = true;
          setNodes(cNode);
          setEdges(
            cEdge.map((m) => {
              return {
                ...m,
                target: m.target === oldId ? newId : m.target,
              };
            }),
          );
        }
      }
    }

    function handleAddNode(uNodes, uEdges, parentId) {
      const newId = 'id-' + Math.floor(Math.random() * 10000);
      const fNode = [...uNodes];
      const fEdges = [...uEdges];

      const parentIndex = fNode.findIndex((f) => f.id === parentId);
      const parentChildSourceCount = fEdges.filter(
        (f) => f.source === parentId,
      );

      const rand = Math.floor(Math.random() * 10000);
      const buttonNodes = [];

      const childNodeX =
        parentChildSourceCount.length > 0
          ? parentChildSourceCount.length * 465
          : 0;
      const childNodeY = fNode[parentIndex]?.position?.y + yPosNum;
      const nodeChildId = fNode[parentIndex].nodeId + '-child' + rand;
      actionNumber.current++;
      buttonNodes.push({
        id: nodeChildId,
        nodeId: nodeChildId,
        parent: fNode[parentIndex].nodeId,
        type: 'conditionalNode',
        position: { x: childNodeX, y: childNodeY },
        data: {
          value: null,
          nodeId: nodeChildId,
          enabled: false,
          conditional: true,
          nodeType: 'node',
          is_end: true,
          actionNumber: actionNumber.current,
          actionValue: null,
          canJump: false,
        },
      });

      fEdges.push({
        type: edgeType,
        id: 'edges-' + rand,
        source: newId,
        target: nodeChildId,
        sourceHandle: 'source-' + rand,
      });

      const cNode = [...buttonNodes, ...fNode].map((m) => {
        return {
          ...m,
          id: parentId === m.id ? newId : m.id,
        };
      });

      const mEdges = fEdges.map((me) => ({
        ...me,
        source: parentId === me.source ? newId : me.source,
        target: parentId === me.target ? newId : me.target,
      }));

      setNodes(cNode);
      setEdges(mEdges);
    }

    function handleChangeConditionalResponse(uNodes, uEdges, nodeId, v) {
      const nodeIndex = uNodes.findIndex((i) => i.nodeId === nodeId);

      if (nodeIndex > -1) {
        let cNode = Array.from(uNodes);
        let mEdges = Array.from(uEdges);

        const newId = 'id-' + Math.floor(Math.random() * 10000);
        const oldId = cNode[nodeIndex].id;

        cNode[nodeIndex].data.conditional = v.target.checked;
        cNode[nodeIndex].data.is_end = false;

        if (v.target.checked) {
          const rand = Math.floor(Math.random() * 10000);
          const rand2 = Math.floor(Math.random() * 10000);
          const parentIdNode = cNode[nodeIndex].nodeId;
          const childIdNode = parentIdNode + '-child' + rand;
          const childIdNode2 = parentIdNode + '-child' + rand2;
          const buttonNodes = [
            {
              id: childIdNode,
              nodeId: childIdNode,
              parent: parentIdNode,
              type: 'conditionalNode',
              position: {
                x: 0 + cNode[nodeIndex]?.position?.x,
                y: cNode[nodeIndex]?.position?.y + yPosNum,
              },
              data: {
                value: null,
                nodeId: childIdNode,
                enabled: false,
                conditional: true,
                nodeType: 'node',
                is_end: true,
                canJump: false,
              },
            },
            {
              id: childIdNode2,
              nodeId: childIdNode2,
              parent: parentIdNode,
              type: 'elseConditionalNode',
              position: {
                x: 465 + cNode[nodeIndex]?.position?.x,
                y: cNode[nodeIndex]?.position?.y + yPosNum,
              },
              data: {
                value: 'else',
                nodeId: childIdNode2,
                enabled: false,
                conditional: true,
                nodeType: 'node',
                is_end: true,
                canJump: false,
              },
            },
          ];

          const buttonEdges = [
            {
              type: edgeType,
              id: 'edges-' + rand,
              source: newId,
              target: childIdNode,
              sourceHandle: 'source-' + rand,
            },
            {
              type: edgeType,
              id: 'edges-' + rand2,
              source: newId,
              target: childIdNode2,
              sourceHandle: 'source-' + rand2,
            },
          ];

          cNode = [...buttonNodes, ...cNode].map((m) => {
            return {
              ...m,
              id: oldId === m.id ? newId : m.id,
              data: {
                ...m.data,
              },
            };
          });

          mEdges = [...buttonEdges, ...mEdges].map((me) => ({
            ...me,
            target: oldId === me.target ? newId : me.target,
            // source: oldId === me.source ? newId : me.source,
          }));

          setNodes(cNode);
          setEdges(mEdges);
        } else {
          cNode = Array.from(uNodes).filter(
            (f) =>
              !f.nodeId.startsWith(nodeId + '-child') ||
              !f.nodeId.startsWith('parentTemplate'),
          );

          mEdges = mEdges.filter((me) =>
            cNode.map((m) => m.id).includes(me.target),
          );
          setNodes(cNode);
          setEdges(mEdges);
        }
      }
    }

    function handleAddReply(uNodes, uEdges, nodeId) {
      const fNode = uNodes.length === 0 ? nodes : uNodes;
      const fEdges = uEdges.length === 0 ? edges : uEdges;
      const nodeIndex = fNode.findIndex((i) => i.nodeId === nodeId);
      const newId = 'id-' + Math.floor(Math.random() * 10000);
      let oldId = '';
      if (nodeIndex > -1) {
        let cEdge = Array.from(fEdges);
        oldId = fNode[nodeIndex].id;
        fNode[nodeIndex].id = newId;
        fNode[nodeIndex].data.is_end = false;
        fNode[nodeIndex].data.actionValue = null;

        yPos.current = yPos.current + yPosNum;

        const templateContent = generateReplyNode(
          newId,
          fNode[nodeIndex].nodeId,
          fNode[nodeIndex],
        );

        //  With Quick Reply Buttons
        const { buttonNodes, buttonEdges } = templateContent;
        let updatedEdges = [...cEdge, ...buttonEdges];

        updatedEdges = updatedEdges.map((m) => {
          return {
            ...m,
            target: m.target === oldId ? newId : m.target,
          };
        });

        const mNodes = [...fNode, ...buttonNodes].map((m) => ({
          ...m,
          data: {
            ...m.data,
            nodeType: 'reply',
          },
        }));

        setNodes(mNodes);
        setEdges(updatedEdges);
      }
    }

    function handleChangeTrigger(uNodes, uEdges, nodeId, value) {
      const fNode = uNodes.length === 0 ? nodes : uNodes;
      const nodeIndex = fNode.findIndex((i) => i.nodeId === nodeId);
      if (nodeIndex > -1) {
        let cNode = Array.from(fNode);
        fNode[nodeIndex].data.value = value;

        setNodes(cNode);
      }
    }

    function handleTextResponse(
      uNodes,
      uEdges,
      nodeId,
      value,
      conditional = false,
    ) {
      const fNode = uNodes.length === 0 ? nodes : uNodes;
      const fEdges = uEdges.length === 0 ? edges : uEdges;
      const nodeIndex = fNode.findIndex((i) => i.nodeId === nodeId);
      if (nodeIndex > -1) {
        let cEdge = Array.from(fEdges);
        let cNode = Array.from(uNodes);
        cNode[nodeIndex].data.value = conditional
          ? { ...cNode[nodeIndex].data.value, string: value }
          : value;

        setNodes(cNode);
        setEdges(cEdge);
      }
    }

    function handleConditionChange(uNodes, uEdges, nodeId, value) {
      const fNode = uNodes.length === 0 ? nodes : uNodes;
      const fEdges = uEdges.length === 0 ? edges : uEdges;
      const nodeIndex = fNode.findIndex((i) => i.nodeId === nodeId);
      const newId = 'id-' + Math.floor(Math.random() * 10000);
      let oldId = '';
      if (nodeIndex > -1) {
        let cEdge = Array.from(fEdges);
        let cNode = Array.from(uNodes);
        oldId = cNode[nodeIndex].id;
        cNode[nodeIndex].data.value = {
          ...cNode[nodeIndex].data.value,
          condition: value,
        };
        cNode[nodeIndex].id = newId;

        const nEdge = cEdge.map((m) => {
          return {
            ...m,
            target: m.target === oldId ? newId : m.target,
          };
        });

        setNodes(cNode);
        setEdges(nEdge);
      }
    }

    // const onNodesChange = useCallback(
    //   (changes) => {
    //     return setNodes((nds) => applyNodeChanges(changes, nds));
    //   },
    //   [setNodes],
    // );

    // const onEdgesChange = useCallback(
    //   (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    //   [setEdges],
    // );

    const onSave = useCallback(() => {
      if (rfInstance) {
        const flow = rfInstance.toObject();
        localStorage.setItem('key', JSON.stringify(flow));
      }
    }, [rfInstance]);

    const onRestore = useCallback(() => {
      const restoreFlow = async () => {
        const flow = JSON.parse(localStorage.getItem('key'));

        if (flow) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport;

          yPos.current = yPos.current + flow.nodes.length * yPosNum;
          setNodes(flow.nodes || []);
          setEdges(flow.edges || []);
          setViewport({ x, y, zoom });
        }
      };

      restoreFlow();
    }, [setNodes, setViewport]);

    return (
      <div style={{ height: '600px' }} className="flow-builder">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onEdgesChange={onEdgesChange}
          defaultViewport={defaultViewport}
          style={{ backgroundColor: '#f2f2f2', borderRadius: '10px' }}
          onInit={setRfInstance}
          nodesDraggable={formMode !== 'view'}
          nodesConnectable={formMode !== 'view'}
          elementsSelectable={formMode !== 'view'}
          dis
        >
          <Background />

          {/* <button
            className="common-button-2 text-normal m-3 nodrag"
            type="button"
            onClick={onRestore}
            style={{ zIndex: 10, position: 'absolute', right: '80px' }}
          >
            RESTORE
          </button> */}
          {formMode !== 'view' && (
            <button
              className="common-button-2 text-normal m-3 nodrag"
              type="button"
              onClick={() => {
                setEdges([
                  {
                    id: 'e1-2',
                    source: 'ruleTrigger',
                    target: 'parentTemplate',
                    sourceHandle: 'initialFlowSource',
                  },
                ]);
                setNodes([
                  {
                    id: 'ruleTrigger',
                    nodeId: 'ruleTrigger',
                    type: 'ruleTrigger',
                    position: { x: 0, y: 0 },
                    data: {
                      nodeId: 'ruleTrigger',
                      value: null,
                      edges: [],
                      nodes: [],
                    },
                  },
                  {
                    id: 'parentTemplate',
                    nodeId: 'parentTemplate',
                    type: 'textUpdater',
                    position: { x: 0, y: yPosNum },
                    data: {
                      nodeId: 'parentTemplate',
                      value: null,
                      edges: [],
                      nodes: [],
                    },
                  },
                ]);

                yPos.current = 0;
              }}
              style={{ zIndex: 10, position: 'absolute', right: '0px' }}
            >
              RESET
            </button>
          )}
          <Controls />
        </ReactFlow>
        {formMode !== 'view' && (
          <button
            className="common-button-2 text-normal mt-3"
            type="button"
            onClick={() => {
              onSave();
              onSubmit();
            }}
          >
            {formMode === 'edit' ? 'Update' : 'Create'}
          </button>
        )}
      </div>
    );
  },
);
