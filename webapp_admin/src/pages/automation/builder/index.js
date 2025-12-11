import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';

import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../../components/Layouts/Layout';
import { h } from '../../../helpers';
import { api } from '../../../api';
import { routes } from '../../../configs/routes';
import { v4 as uuidv4 } from 'uuid';
import ChaaatBuilder from '../../../components/Automation/ChaaatBuilder';
import { initialElements } from '../../../components/Automation/ChaaatBuilder/data/Elements1';
import { getUpdatedElementsAfterNodeAddition } from '../../../components/Automation/ChaaatBuilder/utils/WorkflowElementUtils';
import { cloneDeep } from 'lodash';
import constant from '../../../constants/constant.json';

// UI
import Eye from '../../../components/FlowBuilder/Icons/Eye';

// Store
import useSideBarStore from '../../../components/Automation/ChaaatBuilder/store';
import { getNodeIndex } from '../../../components/Automation/ChaaatBuilder/store/functions';
import { MarkerType, Position, getRectOfNodes } from 'react-flow-renderer';
import { sendWorkflowForApproval } from '../../../api/workflow';

const initialWhatsappFlowJson = {
  "version": "3.1",
  "data_api_version": "3.0",
  "routing_model": {},
  "screens": []
}

const dropDownDataObject = {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string"
      },
      "title": {
        "type": "string"
      }
    }
  },
  "__example__": [
    {
      "id": "200",
      "title": "Shopping & Groceries"
    }
  ]
}

const textDataObject = {
  "type": "string",
  "__example__": "Phone"
}

const screenIndex = ['one', 'two', 'three', 'four']

export default function AutomationCreateBuilder() {
  const {
    screens,
    currentScreenIndex,
    crm,
    setCRM,
    setScreens,
    setNodeData,
    nodeData,
    nodeEdges,
    setPreview,
    selectedNodeStore,
    showPreview,
    setCRMDataStatusByType,
    setSelectedWhatsappFlow,
    setEdgesDisableOption,
    setWhatsappFlowSelected,
    setNodeDataBackup,
    bookingOption,
    cachedBookingOption,
    defaultForBookingScreen,
  } = useSideBarStore();

  const router = useRouter();
  const reactFlowWrapper = useRef(null);
  const childRef = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [toRestoreData, setToRestoreData] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [formMode, setFormMode] = useState('');

  const [elements, setElements] = useState([]);
  const [hasMarketingAccess, setHasMarketingAccess] = useState(true);
  const [agency, setAgency] = useState(null);
  const [automationRuleId, setAutomationRuleId] = useState(null);
  const [automationRuleTemplateId, setAutomationRuleTemplateId] = useState(null);
  const [ruleInfo, setRuleInfo] = useState(null);
  const [triggers, setTriggers] = useState([]);
  const [ruleTriggerId, setRuleTriggerId] = useState(null);
  const [currentTrigger, setCurrentTrigger] = useState(null);
  const [automationCategoryId, setAutomationCategoryId] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [initMessageFlowData, setInitMessageFlowData] = useState(null);
  const [latestFlowData, setLatestFlowData] = useState(null);
  const [agencyWhatsappConfig, setAgencyWhatsappConfigId] = useState(null);
  const [wabaCredentials, setWabaCredentials] = useState([]);
  const [crmSetting, setCrmSetting] = useState(null);
  const [whatsappFlowId, setWhatsappFlowId] = useState(null);
  const [currentSelectedCrm, setCurrentSelectedCrm] = useState(null);
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const elementsRef = useRef(elements);
  const [integrations, setIntegrations] = useState(
    constant.INTEGRATIONS.map((m, i) => ({
      value: m,
      key: Object.keys(m)[0],
      label: Object.values(m),
      connect: 1, // temp. for display only
    })),
  );

  useEffect(() => {
    // Sync the ref with the latest elements state
    elementsRef.current = elements;
  }, [elements]);

  useEffect(() => {
    const { form_mode, ruleId } = router.query;
    setFormMode(form_mode);
    setAutomationRuleId(ruleId);
  }, [router]);

  useEffect(() => {
    setCurrentSelectedCrm(crm);
  }, [crm]);

  // clear state when component unmount
  useEffect(() => {
    return () => {
      setNodeData([])
      setLatestFlowData([])
    }
  },[])

  useEffect(() => {
    (async () => {
      if (!automationRuleId) return;

      const res = await api.automation.getRule(automationRuleId, false);
      if (h.cmpStr(res.status, 'ok')) {
        setRuleInfo(res.data);
        setAutomationCategoryId(res.data?.rule?.automation_category_fk);
        setPlatform(res.data?.rule?.automation_category?.platform);
        setRuleTriggerId(res?.data?.rule?.rule_trigger_fk);
      }

      const templates = res?.data?.rule?.automation_rule_templates;

      if (h.cmpStr(res.status, 'ok') && templates && Array.isArray(templates) && templates.length > 0) {
        setInitMessageFlowData(JSON.parse(templates[0].message_flow_data));
        setAutomationRuleTemplateId(templates[0].automation_rule_template_id);
      }
    })();
  }, [automationRuleId]);

  useEffect(() => {
    (async () => {
      if (platform) {
        const triggerRes = await api.automation.getTriggers(platform);
        setTriggers(
          triggerRes.data.triggers.map((item) => ({
            label: item.description,
            value: item,
          })),
        );
      }
    })();
  }, [platform]);

  useEffect(() => {
    if (triggers && triggers.length > 0 && !currentTrigger) {
      const trigger = triggers.find((val) => val?.value?.rule_trigger_id === ruleTriggerId);
      setCurrentTrigger(trigger);
    }
  }, [triggers, currentTrigger, ruleTriggerId]);

  useEffect(() => {
    (async () => {
      if (!agency || !agency.agency) return;

      const getOutlookCalIntegration =
        await api.integrations.getOutlookCalActiveIntegration(
          {
            agency_id: agency.agency.agency_id,
          },
          false,
        );
      const getGcalendarIntegration =
        await api.integrations.getGcalenderActiveIntegration(
          {
            agency_id: agency.agency.agency_id,
          },
          false,
        );
      // setCRMDataStatusByType
      if (getGcalendarIntegration.status === 'ok') {
        setCRMDataStatusByType('GOOGLE', getGcalendarIntegration.data.agency_oauth.status);
      }
      if (getOutlookCalIntegration.status === 'ok') {
        setCRMDataStatusByType('OUTLOOK', getOutlookCalIntegration.data.agency_oauth.status);
      }
    })();
  }, [agency]);

  useEffect(() => {
    (async () => {
      let credentials;
      if (agency?.agency?.agency_id) {
        credentials = await api.whatsapp.getAgencyWhatsAppConfigurations(
          agency.agency.agency_id,
          false,
        );
      }

      if (credentials && credentials.status === 'ok' && credentials.data) {
        setWabaCredentials(credentials.data.agency_whatsapp_config);
      }
    })();
  }, [agency]);

  useEffect(() => {
    let automationRuleTemplates = [];
    let selectedBusinessAccount;
    let businessAccount;
    if (wabaCredentials && wabaCredentials.length > 0 && ruleInfo) {
      automationRuleTemplates = ruleInfo?.rule?.automation_rule_templates || [];
    }

    if (automationRuleTemplates.length > 0) {
      selectedBusinessAccount = automationRuleTemplates[0].business_account;
    }

    if (selectedBusinessAccount) {
      businessAccount = wabaCredentials.find(c => c.agency_whatsapp_config_id === selectedBusinessAccount);
    }

    if (businessAccount) {
      setWabaCredentials(businessAccount);
    }
  }, [wabaCredentials, ruleInfo]);

  useEffect(() => {
    if (!elements && elements.length < 1) return;
    const booking = elements.find(e => e.type === 'booking');
    const whatsapp_flow_id = booking?.data?.whatsapp_flow_id;
    if (whatsapp_flow_id) {
      setWhatsappFlowId(whatsapp_flow_id);
    }
  }, [elements]);

  const getCrmSetting = async (agency_fk, automation_rule_template_id) => {
    try {
      const apiRes = await api.crmSetting.getCrmSetting({
        agency_id: agency_fk,
        automation_rule_template_id: automation_rule_template_id,
      }, false);
      if (apiRes.data.screens_data) {
        const screens_data = JSON.parse(apiRes.data.screens_data);
        setScreens(screens_data)
        setCrmSetting(apiRes.data);

        return apiRes.data;
      } else {
        setCrmSetting(null);
      }
    } catch (err) {
      setScreens(defaultForBookingScreen);
      // if no crm yet, ignore
    }
  }

  const getCrmSettingById = useCallback(async (crm_setting_id) => {
    try {
      const apiRes = await api.crmSetting.getCrmSettingById(crm_setting_id, false);
      if (apiRes.data.screens_data) {
        const screens_data = JSON.parse(apiRes.data.screens_data);
        setScreens(screens_data)
        setCrmSetting(apiRes.data);
        return apiRes.data;
      } else {
        setCrmSetting(null);
      }
    } catch (err) {
      // if no crm yet, ignore
    }
  }, [cachedBookingOption, bookingOption]);

  /**
   * Callback function triggered when a node is added.
   *
   * @param {Object} params - The parameters for the callback.
   * @param {string} params.id - The ID of the added node.
   * @param {string} params.type - The type of the added node.
   * @param {string} params.endOfConditionNodeId - The ID of the node at the end of the condition.
   */
  const onAddNodeCallback = ({ id, type, endOfConditionNodeId }) => {
    setElements((elements) =>
      getUpdatedElementsAfterNodeAddition({
        elements,
        targetEdgeId: id,
        type,
        endOfConditionNodeId,
        onDeleteNodeCallback,
        onNodeClickCallback,
        onAddNodeCallback,
      }),
    );
  };

  const onAddNodeToJump = ({ id, target }) => {
    // setElements((elements) => {
    //   const clonedElements = [...elements];
    //   const targetNode = nodeData.find((f) => f.id === target);
    //   const sourceNode = nodeData.find((f) => f.id === id);
    //   const tPosition =
    //     targetNode.position.x <= sourceNode.position.x
    //       ? Position.Right
    //       : Position.Left;
    //   const sPosition =
    //     targetNode.position.x >= sourceNode.position.x
    //       ? Position.Right
    //       : Position.Left;
    //   const newEdge = {
    //     id: uuidv4() + '-edge',
    //     source: id,
    //     target,
    //     type: 'loop',
    //     targetHandle: id + '-' + tPosition,
    //     sourceHandle: id + '-' + tPosition,
    //     sourcePos: tPosition,
    //     targetPos: tPosition,
    //     animated: true,
    //   };
    //   clonedElements.push(newEdge);
    //   return clonedElements;
    // });
  };

  /**
   * Removes a node to jump from the elements array.
   *
   * @param {Object} params - The parameters for removing the node.
   * @param {string} params.id - The ID of the node to remove.
   * @param {string} params.target - The target of the node to remove.
   */
  const onRemoveNodeToJump = ({ id, target }) => {
    setElements((elements) => {
      const clonedElements = [...elements];
      const outGoing = clonedElements.find(
        (f) => f.source === id && f.target === target,
      );

      return clonedElements.filter((f) => f.id !== outGoing?.id);
    });
  };

  /**
   * Retrieves all descendants of a given node in a tree-like structure.
   *
   * @param {string} nodeId - The ID of the node to find descendants for.
   * @param {Array} clonedElements - The array of cloned elements representing the tree.
   * @returns {Array} - An array containing all the descendants of the specified node.
   */
  const getAllDescendants = (nodeId, clonedElements) => {
    let descendants = [];

    const findDescendants = (id) => {
      const children = clonedElements
        .filter((element) => element.source === id && element.type !== 'loop')
        .map((element) => element.target);
      descendants = [...descendants, ...children];
      children.forEach((childId) => findDescendants(childId));
    };

    findDescendants(nodeId);

    return descendants;
  };

  /**
   * Filters the cloned elements based on certain conditions.
   *
   * @param {Object} options - The options object.
   * @param {Array} options.clonedElements - The array of cloned elements.
   * @param {Array} options.incomingEdges - The array of incoming edges.
   * @param {Array} options.outgoingEdges - The array of outgoing edges.
   * @param {Array} options.loopHandle - The array of loop handles.
   * @param {string} options.id - The ID of the element to exclude from the filtered elements.
   * @returns {Array} - The filtered array of cloned elements.
   */
  function getFilteredElements({
    clonedElements,
    incomingEdges,
    outgoingEdges,
    loopHandle,
    id,
  }) {
    return clonedElements.filter((x) => {
      const isTargetMatch = x.target !== incomingEdges[0].target;
      const isSourceMatch = x.source !== outgoingEdges[0].source;
      const isNotLoopEdge = !loopHandle.includes(x.id);
      return x.id !== id && isTargetMatch && isSourceMatch && isNotLoopEdge;
    });
  }

  /**
   * Deletes a node from the elements array and updates the edges accordingly.
   *
   * @param {Array} elements - The array of elements.
   * @param {string} id - The ID of the node to be deleted.
   * @returns {Array} - The updated array of elements after deleting the node.
   */
  function normalDeleteNode(elements, id) {
    const clonedElements = cloneDeep(elements);
    const incomingEdges = clonedElements.filter((x) => x.target === id);
    const outgoingEdges = clonedElements.filter((x) => x.source === id);
    const updatedIncomingEdges = incomingEdges
      .filter((x) => x.type !== 'loop')
      .map((x) => ({
        ...x,
        target: outgoingEdges[0].target,
      }));

    const loopHandle = clonedElements
      .filter((x) => x.target === id && x.type === 'loop')
      .map((m) => m.id);

    let filteredElements = getFilteredElements({
      clonedElements,
      incomingEdges,
      outgoingEdges,
      loopHandle,
      id,
    });

    const el = clonedElements.findIndex((s) => id === s.target);
    const hasSibling = clonedElements.filter(
      (s) => s.source === clonedElements[el].source,
    );

    if (hasSibling.length === 1) {
      filteredElements.push(...updatedIncomingEdges);
    }

    return filteredElements;
  }

  /**
   * Deletes a branch node from the elements array and returns the updated array.
   *
   * @param {Array} elements - The array of elements.
   * @param {string} id - The id of the branch node to be deleted.
   * @returns {Array} - The updated array of elements after deleting the branch node.
   */
  function branchDeleteNode(elements, id) {
    const newEndNodeId = uuidv4();

    const clonedElements = [...elements];
    const incomingEdges = clonedElements.filter((x) => x.target === id);
    const outgoingEdges = clonedElements.filter((x) => x.source === id);
    const updatedIncomingEdges = incomingEdges.map((x) => ({
      ...x,
      target: newEndNodeId,
    }));

    const children = getAllDescendants(id, elements);
    const loopChildren = elements
      .filter((f) => f.hasOwnProperty('targetHandle'))
      .filter((f) => children.includes(f.target) || children.includes(f.source))
      .map((m) => m.id);
    const outGoing = [id, ...children, ...loopChildren];

    const newElements = clonedElements.filter(
      (x) =>
        !outGoing.includes(x.id) &&
        !outGoing.includes(x.source) &&
        !outGoing.includes(x.target),
    );

    newElements.push({
      id: newEndNodeId,
      type: 'end',
      data: {
        title: 'End of Automation',
        description:
          'The flow can jump to another node if available, otherwise it will end here',
      },
    });

    newElements.push(...updatedIncomingEdges);
    return newElements;
  }

  /**
   * Deletes a branch node and its descendants from an array of elements.
   *
   * @param {Array} elements - The array of elements to delete from.
   * @param {string} id - The ID of the branch node to delete.
   * @returns {Array} - The updated array of elements after deletion.
   */
  function directBranchDeleteNode(elements, id) {
    const clonedElements = [...elements];

    const children = getAllDescendants(id, elements);
    const outGoing = [id, ...children];

    const newElements = clonedElements.filter(
      (x) =>
        !outGoing.includes(x.id) &&
        !outGoing.includes(x.source) &&
        !outGoing.includes(x.target),
    );

    return newElements;
  }
  /**
   * Callback function for deleting a node.
   *
   * @param {string} id - The ID of the node to be deleted.
   */
  const deleteNodeOnceConfirmed = (id) => {
    setElements((elements) => {
      const node = elements.find((x) => x.id === id);
      const hasBranchUnder = elements.filter((x) => x.source === id).length > 1;
      const hasSibling = hasSiblingNode(elements, id);

      if (isWaitThenCheckWithBranch(node, hasBranchUnder)) {
        return branchDeleteNode(elements, id);
      } else if (isDirectBranchDelete(node, hasSibling)) {
        return directBranchDeleteNode(elements, id);
      } else if (isBranchDelete(node, hasBranchUnder)) {
        return branchDeleteNode(elements, id);
      } else {
        return normalDeleteNode(elements, id);
      }
    });
    setSidebarVisible(false);
  }

  /**
   * Callback function to show warning before deleting node.
   *
   * @param {string} id - The ID of the node to be deleted.
   */
  const onDeleteNodeCallback = (id) => {
    const _elements = elementsRef?.current || []
    const hasBranchUnder = _elements.filter((x) => x.source === id).length > 1;
    const hasSibling = hasSiblingNode(_elements, id);

    if(hasBranchUnder || hasSibling) {
      h.general.prompt(
        {
          message:
            "Deleting this node will also remove its childeren nodes, if any exist. Are you sure you want to proceed?",
        },
        async (status) => {
          if (status) {
            deleteNodeOnceConfirmed(id);
          }
        }
      );
    } else {
      deleteNodeOnceConfirmed(id);
    }
  };

  /**
   * Checks if an element has a sibling node with the specified id.
   *
   * @param {Array} elements - The array of elements to search.
   * @param {string} id - The id of the target element.
   * @returns {boolean} - True if the element has a sibling node with the specified id, false otherwise.
   */
  function hasSiblingNode(elements, id) {
    const targetElement = elements.find((s) => s.target === id);
    return (
      targetElement &&
      elements.filter((s) => s.source === targetElement.source).length > 1
    );
  }

  /**
   * Checks if a node is of type 'waitThenCheck' and has a branch underneath.
   *
   * @param {Object} node - The node to check.
   * @param {boolean} hasBranchUnder - Indicates if the node has a branch underneath.
   * @returns {boolean} - Returns true if the node is of type 'waitThenCheck' and has a branch underneath, otherwise returns false.
   */
  function isWaitThenCheckWithBranch(node, hasBranchUnder) {
    return node.type === 'waitThenCheck' && hasBranchUnder;
  }

  /**
   * Checks if a node represents a direct branch delete.
   *
   * @param {Object} node - The node to check.
   * @param {boolean} hasSibling - Indicates if the node has a sibling.
   * @returns {boolean} - Returns true if the node represents a direct branch delete, false otherwise.
   */
  function isDirectBranchDelete(node, hasSibling) {
    return (
      (node.type !== 'conditionLabel' && hasSibling) ||
      node.type === 'conditionLabel'
    );
  }

  /**
   * Checks if a node is of type 'message' or 'booking' and has a branch underneath.
   *
   * @param {Object} node - The node to check.
   * @param {boolean} hasBranchUnder - Indicates if the node has a branch underneath.
   * @returns {boolean} - Returns true if the node is of type 'message' or 'booking' and has a branch underneath, otherwise returns false.
   */
  function isBranchDelete(node, hasBranchUnder) {
    return (
      (node.type === 'message' || node.type === 'booking') && hasBranchUnder
    );
  }

  /**
   * Callback function triggered when a node is clicked.
   *
   * @param {string} id - The ID of the clicked node.
   * @returns {void}
   */
  const onNodeClickCallback = (id) => {
    setElements((elements) => {
      const currentNode = elements.find((x) => x.id === id);
      const nodes = elements.filter((x) => x.position);
      const edges = elements.filter((x) => !x.position);

      return elements;
    });
    alert(`You clicked the "${id}" node`);
  };

  function setInitialTrigger(trigger, initialElements = []) {
    const [firstItem, ...restOfArray] = initialElements;
    return [
      {
        ...firstItem,
        data: {
          ...trigger?.value,
          title: 'Start',
          description: trigger?.value?.description,
          stats: {
            started: 0,
          },
        }
      },
      ...restOfArray
    ]
  }

  useEffect(() => {
    (async () => {
      const { form_mode } = router.query;
      setFormMode(form_mode);

      /**
       * @TODO
       * CHANGE THIS TO THE FUNCTION THAT WILL RETRIEVE THE DATA FROM THE API
       */
      const existingFlowData = JSON.parse(localStorage.getItem('workflow-data'));

      const $els = initMessageFlowData && initMessageFlowData.nodes && initMessageFlowData.edges
        ? [...initMessageFlowData.nodes, ...initMessageFlowData.edges]
        : setInitialTrigger(currentTrigger, initialElements);

      const nodes = $els
        .filter((x) => !x.target)
        .map((x) => ({
          ...x,
          data: { ...x.data, onDeleteNodeCallback },
        }));

      const edges = $els
        .filter((x) => x.target)
        .map((x) => ({
          ...x,
          data: { ...x.data, onAddNodeCallback },
        }));

      setElements([...nodes, ...edges]);
      // createNodeBackup
      setNodeDataBackup(nodes);

      h.auth.isLoggedInElseRedirect();
      setHasMarketingAccess(await h.userManagement.hasMarketingAccess());
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgency(apiRes.data.agencyUser);
        if (apiRes.data.agencyUser.agency_fk != '' && automationRuleTemplateId) {
          await getCrmSetting(apiRes.data.agencyUser.agency_fk, automationRuleTemplateId);
        }
      }

      // aslo need to load crm setting here.
      // update this in the future to support multiple booking.
      const bookingCrm = nodes.find(n => n.type === 'booking');
      if (bookingCrm) {
        setCRM(bookingCrm.data?.flowData?.crm)
      }
    })();
  }, [router, currentTrigger, initMessageFlowData, automationRuleTemplateId]);

  useEffect(() => {
    // update crm_settings
    if (!latestFlowData?.nodes || latestFlowData.nodes.length < 1) return;
    const bookingCrm = latestFlowData.nodes.find(n => n.type === 'booking');
    setEdgesDisableOption('createBooking', !!bookingCrm)
    if (!bookingCrm) return;

    if (!bookingCrm?.data?.flowData?.crm && crmSetting) {
      const savedCrm = integrations.find(v => {
        let type = crmSetting.crm_type;
        if (type === 'GCALENDAR') type = 'GOOGLE';
        return type.indexOf(v.key) > -1
      });
      setCRM(savedCrm);
    }
  }, [latestFlowData, crmSetting]);

  useEffect(() => {
    (async () => {
      if (!latestFlowData?.nodes || latestFlowData.nodes.length < 1) return;
      const bookingCrm = latestFlowData.nodes.find(n => n.type === 'booking');
      const whatsappFlowId = bookingCrm?.data?.whatsapp_flow_id;

      if (bookingCrm?.data?.flowData?.crm) {
        const flowDataCrm = bookingCrm?.data?.flowData?.crm;
        setCRM(flowDataCrm);
      }

      const apiRes = await api.whatsapp.getWhatsappFlowById(whatsappFlowId);
      if (!h.cmpStr(apiRes?.status, 'ok')) {
        return;
      }

      const whatsappFlow = apiRes?.data?.whatsappFlow;
      if (whatsappFlow) {
        setSelectedWhatsappFlow(whatsappFlow);
      }

    })();
  }, [latestFlowData]);

  // useEffect(() => {
  //   if (!whatsappFlowId) return null;
  //   (async () => {
  //     const apiRes = await api.whatsapp.getWhatsappFlowById(whatsappFlowId);
  //     if (!h.cmpStr(apiRes?.status, 'ok')) {
  //       return;
  //     }

  //     const whatsappFlow = apiRes?.data?.whatsappFlow;
  //     if (whatsappFlow) {
  //       setSelectedWhatsappFlow(whatsappFlow);
  //     }
  //   })();
  // }, [whatsappFlowId])

  const saveData = async (fromBookingPage, _crm, _crmSetting, _activeScreens) => {
    setLoading(true);
    try {
      if (!automationRuleId || !automationRuleTemplateId) {
        return setLoading(false);
      }
      const flowData = await saveBookingData(fromBookingPage, _crm, _crmSetting, _activeScreens);

      let flowToSave = flowData || latestFlowData;
      if (!flowToSave) {
        return setLoading(false);
      }
      await api.automation.saveRuleTemplateFlowData({
        automation_rule_id: automationRuleId,
        automation_rule_template_id: automationRuleTemplateId,
      }, flowToSave, true);
      setNodeDataBackup(flowToSave.nodes);
      setLatestFlowData({
        nodes: flowToSave.nodes,
        edges: flowToSave.edges
      })
    } catch (err) {
      console.log(err);
      return h.general.alert('error', {
        message: 'An Error ocurred when saving flow data',
      });
    }
    setLoading(false);
  };

  const saveBookingData = async (fromBookingPage, _crm, _crmSetting, _activeScreens) => {
    try {
      initialWhatsappFlowJson.screens = await prepareScreens();
      const allScreens = prepareLastScreenData(initialWhatsappFlowJson);
      const bookingDetails = latestFlowData && latestFlowData?.nodes.find(v => v.type === 'booking');

      if (wabaCredentials) {
        await api.whatsapp.registerWhastappFlowKey(wabaCredentials.agency_whatsapp_config_id);
      }
      if (bookingDetails) {
        const { whatsapp_flow_id, flow_id } = (await storeWhatsappJsonFlow(allScreens, fromBookingPage, _crm, _crmSetting, bookingDetails)) || {}; // required before saving crmSettings
        const flowData = await storeCRMSettings({ whatsapp_flow_id, flow_id, _crm, _activeScreens});

        const apiRes = await api.whatsapp.getWhatsappFlowById(whatsapp_flow_id);
        if (!h.cmpStr(apiRes?.status, 'ok')) {
          return flowData;
        }

        const whatsappFlow = apiRes?.data?.whatsappFlow;
        if (whatsappFlow) {
          setSelectedWhatsappFlow(whatsappFlow);
        }

        return flowData;
      }

      if (crmSetting) {
        // delete whatsapp flow by crm
        await api.whatsapp.deleteWhatsappFlowByCrmId(crmSetting.crm_settings_id, {
          waba_id: wabaCredentials.agency_whatsapp_config_id,
        });

        setWhatsappFlowId(null);
        setSelectedWhatsappFlow(null);
      }

      return latestFlowData;
    } catch (err) {
      console.log(err);
    }
  }


  const storeCRMSettings = async ({ whatsapp_flow_id, flow_id, _crm, _activeScreens }) => { // <--- check this one
    let hasCrm = _crm;
    if (!hasCrm) hasCrm = currentSelectedCrm;
    if (!hasCrm || !hasCrm.key) {
      return h.general.alert('error', {
        message: 'Please select CRM.',
      });
    }
    const crm_type
      = hasCrm.key && hasCrm.key.indexOf('GOOGLE') > -1 ? 'GCALENDAR'
        : hasCrm.key && hasCrm.key.indexOf('OUTLOOK') > -1 ? 'OUTLOOKCALENDAR'
          : 'no-crm';

    let _screens = _activeScreens ? _activeScreens : screens;
    const apiRes = await api.crmSetting.postCrmSetting({
      screens_data: _screens,
      agency_id: agency.agency_fk,
      agency_user_id: agency.agency_user_id,
      automation_rule_template_id: automationRuleTemplateId, // we use the automationRuleId because the automation_rule_template_id is not constant
      crm_type,
    });

    // also update crm settings
    if (h.cmpStr(apiRes.status, 'ok')) {
      const crm_settings_id = apiRes.data?.crm_settings_id;

      await getCrmSettingById(crm_settings_id);

      return childRef.current.crmSettingSaved({
        latestFlowData,
        crm_settings_id,
        whatsapp_flow_id,
        flow_id,
      });
    }
  };

  const storeWhatsappJsonFlow = useCallback(async (initialWhatsappFlowJson, fromBookingPage, _crm, _crmSetting, bookingDetails) => {
    const defaultReturnValue = {
      flow_id: bookingDetails?.data?.waba_flow_id,
      whatsapp_flow_id: bookingDetails?.data?.whatsapp_flow_id,
    };

    let hasCrm = _crm;
    if (!hasCrm) hasCrm = currentSelectedCrm;
    if (!hasCrm) {
      return defaultReturnValue;
    }

    if (wabaCredentials) {
      const crm_type
        = hasCrm.key && hasCrm.key.indexOf('GOOGLE') > -1 ? 'GCALENDAR'
          : hasCrm.key && hasCrm.key.indexOf('OUTLOOK') > -1 ? 'OUTLOOKCALENDAR'
            : 'no-crm';

      let apiRes;

      if (!_crmSetting) _crmSetting = crmSetting;

      if (!_crmSetting) return defaultReturnValue;

      if (fromBookingPage) return defaultReturnValue;

      const _whatsappFlowId = bookingDetails?.data?.flowData?.whatsapp_flow_id || null
      const isPublished = bookingDetails?.data?.flowData?.status === "published"
      const createdFlowId = _whatsappFlowId || whatsappFlowId

      if (h.cmpBool(isPublished, false)) {
        if (!createdFlowId) {
          apiRes = await api.whatsapp.createWhatsappFlow({ // <--- check this one
            waba_id: wabaCredentials.agency_whatsapp_config_id,
            crm_type,
            json: initialWhatsappFlowJson,
            is_draft: true,
            crm_settings_fk: _crmSetting.crm_settings_id,
          });

          setWhatsappFlowId(apiRes?.data?.whatsapp_flow_id)
        } else {
          apiRes = await api.whatsapp.updateWhatsappFlow(createdFlowId, {
            waba_id: wabaCredentials.agency_whatsapp_config_id,
            crm_type,
            json: initialWhatsappFlowJson,
            is_draft: true,
            crm_settings_fk: _crmSetting.crm_settings_id,
          });
        }
      }

      setWhatsappFlowSelected({
        whatsappFlowId: apiRes.data.whatsapp_flow_id
      });

      return {
        whatsapp_flow_id: apiRes.data.whatsapp_flow_id,
        flow_id: apiRes.data.flow_id
      };
    }
  }, [currentSelectedCrm, wabaCredentials, whatsappFlowId]);

  const prepareScreens = async () => {
    let parentScreen = [];
    for (let [index, screen] of screens.entries()) {
      const id = `STEP_${screenIndex[index]}`;
      let screenData = {
        "id": id,
        "title": screen.title,
        "data": {},
        "layout": {
          "type": "SingleColumnLayout",
          "children": [
            {
              "type": "Form",
              "name": `form_${id}`,
              "children": []
            }
          ]
        }
      }
      let footerChild = {
        "type": "Footer",
        "label": "Continue",
        "on-click-action": {
          "name": "data_exchange",
          "payload": {}
        }
      }
      for (let element of screen.elements) {
        const layoutElement = {
          "type": element.fieldType,
          "name": element.name,
          "label": element.placeholder
        };
        if (element.fieldType == 'DatePicker') {
          layoutElement['min-date'] = Date.now().toString();
        }
        if (element.fieldType == 'TextInput') {
          layoutElement['input-type'] = 'text';
        }
        if (element.fieldType == 'TextInput' || element.fieldType == 'TextArea') {
          layoutElement['helper-text'] = element.placeholder;
          // PREPAIRE DATA OBJECT
          screenData['data'][element.name] = textDataObject;
        }
        if (element.fieldType == 'Dropdown') {
          // PREPAIRE DATA OBJECT
          layoutElement["data-source"] = "${data." + element.name + "}";
          layoutElement["on-select-action"] = {
            "name": "data_exchange",
            "payload": {
              "trigger": element.name + "_selected",
              "duration": "${form.duration}",
              "dateofday": "${form.date}"
            }
          }
          screenData['data'][element.name] = dropDownDataObject;
        }
        if (element.required) {
          layoutElement.required = true;
        }
        screenData.layout.children[0].children.push(layoutElement);
        // CONSTRUCT FOOTER CHILDREN
        footerChild['on-click-action']['payload'][element.name] = "${form." + element.name + "}";
      }
      // ADD ROUTING
      initialWhatsappFlowJson.routing_model[id] = [`STEP_${(screenIndex[index + 1])}`];
      // ADD FOOTER CHILDREN OF NEXT SCREEN IN CURRENT SCREEN
      if (index + 1 < screens.length) {
        addNextScreenElementToCurrentScreen(index + 1, footerChild)
      }
      // ADD PREVIOUS SCREEN ELEMENTS IN DATA OBJECT AND FOOTER CHILDREN IN CURRENT SCREEN
      if (index < screens.length && index > 0) {
        addPreviousScreenElementsInDataObjectAndFooter(parentScreen[index - 1].data, screenData.data, footerChild);
      }
      screenData.layout.children[0].children.push(footerChild);
      parentScreen.push(screenData);
    }
    return parentScreen;
  }

  const addNextScreenElementToCurrentScreen = (nextScreenIndex, footerChild) => {
    for (let elem of screens[nextScreenIndex].elements) {
      if (elem.fieldType != "DatePicker") {
        footerChild['on-click-action']['payload'][elem.name] = "";
      }
    }
  }

  const addPreviousScreenElementsInDataObjectAndFooter = (previousScreenDataObject, currentDataObject, footerChild) => {
    for (let key in previousScreenDataObject) {
      currentDataObject[key] = {
        "type": "string",
        "__example__": key
      }
      footerChild['on-click-action']['payload'][key] = "${data." + key + "}";
    }
  }

  const prepareLastScreenData = (whatsappFlowJson) => {
    const currentScreenLength = whatsappFlowJson.screens.length;
    const id = `STEP_${screenIndex[currentScreenLength]}`;
    whatsappFlowJson.routing_model[id] = [];
    let screenData = {
      "id": id,
      "title": `Confirmation`,
      "data": {},
      "terminal": true,
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Form",
            "name": `form_${id}`,
            "children": [
              {
                "type": "TextSubheading",
                "text": "Booking information",
                "visible": true
              },
              {
                "type": "TextBody",
                "text": "${data.summary_details}",
                "visible": true
              },
              {
                "type": "TextSubheading",
                "text": "User Details",
                "visible": true
              },
              {
                "type": "TextBody",
                "text": "${data.user_details}",
                "visible": true
              }]
          }
        ]
      }
    }
    const index = whatsappFlowJson.screens[currentScreenLength - 1]['layout']['children'][0]['children'].length - 1;
    const payload = whatsappFlowJson.screens[currentScreenLength - 1]['layout']['children'][0]['children'][index]['on-click-action']['payload'];
    let childFooter = {
      "type": "Footer",
      "label": "Done",
      "on-click-action": {
        "name": "complete",
        "payload": {}
      }
    }
    let data = {};
    for (var payloadProp in payload) {
      childFooter['on-click-action']['payload'][payloadProp] = "${data." + payloadProp + "}";
      data[payloadProp] = {
        "type": "string",
        "__example__": "Example"
      }
    }
    childFooter['on-click-action']['payload']['summary_details'] = "${data.summary_details}";
    childFooter['on-click-action']['payload']['user_details'] = "${data.user_details}";
    data["summary_details"] = {
      "type": "string",
      "__example__": "Example"
    }
    data["user_details"] = {
      "type": "string",
      "__example__": "Example"
    }
    screenData.data = data;
    screenData.layout.children[0].children.push(childFooter);
    whatsappFlowJson.screens.push(screenData)
    return whatsappFlowJson
  }

  const submitForApproval = async () => {
    try {
      setLoading(true);
      const payload = {
        nodes: latestFlowData.nodes,
        edges: latestFlowData.edges,
        automation_rule_id: automationRuleId,
        waba_config_id: wabaCredentials.agency_whatsapp_config_id
      }
      const res = await sendWorkflowForApproval(payload, true)
      if (h.cmpStr(res.status, "ok")) {
        setLatestFlowData({
          nodes: res.data.nodes,
          edges: res.data.edges
        });

        const _nodes = res.data.nodes
          .filter((x) => !x.target)
          .map((x) => ({
            ...x,
            data: { ...x.data, onDeleteNodeCallback },
          }));

        const _edges = res.data.edges
          .filter((x) => x.target)
          .map((x) => ({
            ...x,
            data: { ...x.data, onAddNodeCallback },
          }));

        setNodeData([..._nodes, ..._edges])
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      h.general.alert('error', { message: "Unable to send for approval" });
    }
  }

  const showApprovalBtn = (latestFlowData) => {
    const messages =
      latestFlowData?.nodes?.filter(
        (ele) =>
          ele.type === "message" &&
          ele.data?.flowData?.method === "custom" &&
          ele.data?.flowData?.customSelected !== "simple-text"
      ) || [];
    const bookings =
      latestFlowData?.nodes?.filter((ele) => ele.type === "booking") || [];

    if (!messages.length && !bookings.length) {
      return false;
    }

    const areAllMessageFieldsFilled = messages.every(
      (node) =>
        h.notEmpty(node.data.flowData?.template_name) &&
        h.notEmpty(node.data.flowData?.template_body) &&
        h.notEmpty(node.data.flowData?.template_category?.value) &&
        h.notEmpty(node.data.flowData?.template_language?.value)
    );

    const areAllMessageApproved = messages.every((node) =>
      h.cmpStr(node.data.flowData?.status, "APPROVED")
    );

    const areAllBookingFieldsFilled = bookings.every((node) =>
      h.notEmpty(node.data.flowData?.waba_flow_id)
    );
    const areAllBookingPublished = bookings.every((node) =>
      h.cmpStr(node.data.flowData?.status, "published")
    );

    // If there are messages and any message field is missing, return false
    if (messages.length && !areAllMessageFieldsFilled) {
      return false;
    }

    // If there are bookings and any booking field is missing, return false
    if (bookings.length && !areAllBookingFieldsFilled) {
      return false;
    }

    if (areAllMessageApproved && areAllBookingPublished) {
      return false
    }

    // If all mandatory fields are present, return true
    return true;
  };

  /**
   * The selected node.
   *
   * @type {any} The selected node object.
   */
  const selectedNode = useMemo(() => {
    return selectedNodeStore;
  }, [selectedNodeStore]);

  /**
   * Handles the save action for the workflow.
   * @function handleSave
   */
  const handleSave = useCallback(() => {
    h.general.prompt(
      { message: 'Are you sure to save workflow?' },
      async (status) => {
        if (!status) return;
        if (reactFlowInstance) {
          const flow = reactFlowInstance.toObject();
          // localStorage.setItem('workflow-data', JSON.stringify(flow));

          const data = {
            workflow_data: JSON.stringify(flow),
          };

          const apiRes = await api.automation.saveWorkflow(
            agency?.agency_id,
            data,
          );
          if (h.cmpStr(apiRes.status, 'ok')) {
            h.general.alert('success', {
              message: 'Workflow saved successfully',
            });

            /**
             * @TODO
             * Redirect to the automation index page
             */
          }
        }
      },
    );
  }, [reactFlowInstance]);

  /**
   * Handles the submission of the workflow for review.
   * @returns {Promise<void>} A promise that resolves when the workflow is submitted successfully.
   */
  const handleSubmit = async () => {
    h.general.prompt(
      {
        message: `Are you sure you want submit workflow for approval?`,
      },

      async (status) => {
        if (!status) return;
        const flow = reactFlowInstance.toObject();
        const data = {
          workflow_data: JSON.stringify(flow),
        };

        const apiRes = await api.automation.submitWorkflow(
          agency?.agency_id,
          data,
        );
        if (h.cmpStr(apiRes.status, 'ok')) {
          h.general.alert('success', {
            message: 'Workflow successfully submitted for approval',
          });

          /**
           * @TODO
           * Redirect to the automation index page
           */
        }
      },
    );
  };

  /**
   * Determines whether to show the preview button.
   *
   * @type {boolean}
   */
  const showPreviewbtn = useMemo(() => {
    return (
      h.notEmpty(selectedNode) &&
      ['message', 'booking'].includes(selectedNode?.type)
    );
  }, [selectedNode]);

  return (
    <>
      <div className="contacts-root layout-v">
        <Header
          className={
            'container dashboard-contacts-container common-navbar-header mb-3'
          }
        />
        <Body isLoading={isLoading}>
          <div className="n-banner">
            <div className="container dashboard-contacts-container contacts-container">
              <div className="contacts-title d-flex justify-content-between pt-3 pb-3">
                <div>
                  <h1 style={{ textTransform: 'capitalize' }}>
                    {formMode} Automation
                  </h1>
                </div>
                <div className="d-flex center-body" style={{ gap: '25px' }}>
                  {showPreviewbtn && (
                    <button
                      className="chaaat-lgtBlue-button more-round"
                      onClick={() => setPreview(!showPreview)}
                    >
                      <Eye width={30} height={30} />
                      Preview
                    </button>
                  )}
                  <button
                    className="chaaat-lgtBlue-button"
                    type="button"
                    onClick={() => { saveData(false, currentSelectedCrm, crmSetting) }}
                  >
                    Save
                  </button>
                  {
                    showApprovalBtn(latestFlowData) &&
                    <button className="chaaat-common-button" type="button" onClick={() => {
                      submitForApproval()
                    }}>
                      Submit for Approval
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
          <div className="projects-list-container modern-style no-oxs">
            {h.notEmpty(agency) && h.notEmpty(wabaCredentials) && (
              <ChaaatBuilder
                props={elements}
                agency={agency.agency}
                wabaNumber={wabaCredentials.waba_number}
                onAddNodeCallback={onAddNodeCallback}
                onAddNodeToJump={onAddNodeToJump}
                onRemoveNodeToJump={onRemoveNodeToJump}
                reactFlowWrapper={reactFlowWrapper}
                reactFlowInstance={reactFlowInstance}
                setReactFlowInstance={setReactFlowInstance}
                setLatestFlowData={setLatestFlowData}
                isSidebarVisible={isSidebarVisible}
                showSideBar={() => setSidebarVisible(true)}
                toRestoreData={toRestoreData}
                saveBookingWhatsappFlow={(_crm, _activeScreens) => saveData(true, _crm, null, _activeScreens)}
                ref={childRef}
              />
            )}
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
}
