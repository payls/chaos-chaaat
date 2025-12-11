import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import constant from '../../../constants/constant.json';
import { h } from '../../../helpers';
import { api } from '../../../api';
import { routes } from '../../../configs/routes';

import TextLoading from '../../Sale/Link/preview/components/Common/CommonLoading/TextLoading';
import { faInfo, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconTimePast from '../../ProposalTemplate/Link/preview/components/Icons/IconTimePast';
import CommonDrodownAction from '../../Common/CommonDrodownAction';
import AutomationInsigths from '../../Inbox/AutomationInsights';
import AutomationHistory from '../../Inbox/AutomationHistory';
import { getActiveAutomationCountForWaba } from '../../../api/automation';

export default React.memo(({ 
  getRules = [],
  rulesResStatus = null,
  filteredListRules = [],
  agency = null,
  setLoading,
  setFilteredListRules,
}) => {
  const router = useRouter();

  const [value, setValue] = useState("");
  const [rule, setRule] = useState(null);
  const [recipientsShow, setRecipientsShow] = useState(false);
  const [showInsights, setInsights] = useState(false);
  const [showLogic, setShowLogic] = useState(null);

  // This dropdown menu generates an array of action objects for rule management
  function downdropActions(item) {
    const { automation_rule_id, status, automation_rule_templates } = item;
    const business_account = automation_rule_templates?.[0]?.business_account || ''
    const actions = [];

    if (status === 'active') {
      actions.push({
        label: 'Set as Inactive',
        icon: false,
        action: () => {
          updateStatus(automation_rule_id, { status: 'inactive' });
        },
        className: ``,
      });
    } else {
      actions.push({
        label: 'Set as Active',
        icon: false,
        action: () => {
          updateStatus(automation_rule_id, { status: 'active', business_account });
        },
        className: ``,
      });
    }

    actions.push({
      label: 'Edit',
      icon: false,
      action: () => {
        router.push(
          h.getRoute(routes.automation.form_edit, {
            ruleId: automation_rule_id,
          }),
          undefined,
          {
            shallow: true,
          },
        );
      },
    });

    // actions.push({
    //   label: 'Duplicate',
    //   icon: false,
    //   action: () => {},
    // });

    actions.push({
      label: 'View Insights',
      icon: false,
      action: () => {
        setRule(item);
        setInsights(true);
      },
    });

    actions.push({
      label: 'View History',
      icon: false,
      action: () => {
        setRule(item);
        showHistory(item);
      },
    });

    actions.push({
      label: 'Delete',
      icon: false,
      action: () => {
        deleteRule(automation_rule_id);
      },
      className: `info-red b-top`,
    });

    return actions;
  }

  /**
  * Updates the status of an automation identified by its ID with the provided data.
  * 
  * @param {string} id - The ID of the item to update.
  * @param {object} data - The data to update the item's status with.
  */
  async function updateStatus(id, data) {
    let message = `Are you sure you want to set this to ${data.status}?`
    if (data.status === "active") {
      const response = await getActiveAutomationCountForWaba({
        business_account: data.business_account,
      });
      if(response && response?.data?.activeAutomationRuleCount >= 1) {
        if (response.data?.wabaNumber) {
          message = `An automation is already active for this WABA phone number (${response.data?.wabaNumber}), which may cause conflicts. Do you want to continue?`
        } else {
          message = 'An automation is already active for this WABA phone number, which may cause conflicts. Do you want to continue?'
        }
      }
    }
    h.general.prompt(
      {
        message,
      },

      async (status) => {
        setLoading(true);
        if (status) {
          const updateRes = await api.automation.updateRuleStatus(
            id,
            {status: data.status},
            true,
            false,
          );

          if (h.cmpStr(updateRes.status, "ok")) {
            h.general.alert("success", {
              message: "Successfully updated status!",
              autoCloseInSecs: 2,
            });

            await getRules;

            const updatedListRules = filteredListRules.map((rule) => {
              if (rule.automation_rule_id === id) {
                return {
                  ...rule,
                  status: data.status,
                };
              }

              return rule;
            });

            setFilteredListRules(updatedListRules);
          }
        }

        setLoading(false);
      }
    );
  }

  /**
  * Deletes a rule identified by its ID.
  * 
  * @param {string} id - The ID of the rule to delete.
  */
  async function deleteRule(id) {
    h.general.prompt(
      {
        message: `Are you sure you want to delete this rule?`,
      },

      async (status) => {
        if (status) {
          const updateRes = await api.automation.deleteRule(id, true);

          if (h.cmpStr(updateRes.status, 'ok')) {
            await getRules();
          }
        }
      },
    );
  }

  async function showHistory(rule) {
    setRecipientsShow(true);
  }

  const handleChange = async (event, item) => {
    const business_account = item?.automation_rule_templates?.[0]?.business_account || ''
    const newValue = {
      status: item.status === 'active' ? 'inactive' : 'active',
      business_account
    }
    setValue(event.target.value);
    await updateStatus(item.automation_rule_id, newValue);
  }

  /* Function for which CRM is used in the automation */
  const crmType = (item, searchType) => {
    // Parsing the message_flow_data JSON string
    const messageFlowData = JSON.parse(item);

    const crmKeys = {
      google: 'GOOGLE',
      outlook: 'OUTLOOK'
    };

    // Get the CRM key for the searchType
    const crmKey = crmKeys[searchType.toLowerCase()];

    if (messageFlowData && Array.isArray(messageFlowData.nodes)) {
      if (crmKey) {
        // Check for if any node of type 'booking' has the specified CRM key
        return messageFlowData.nodes.some(node =>
          node.type === 'booking' &&
          node.data?.flowData?.crm?.key === crmKey
        );
      }
      return false;
    }
  };
  
  /* Function for tag's label. Check for node type message & booking */
  const builderType = (item, searchType) => {
    // Parsing the message_flow_data JSON string
    const messageFlowData = JSON.parse(item);

    if (messageFlowData && Array.isArray(messageFlowData.nodes)) {
      if (searchType === 'message') {
        return messageFlowData.nodes.some(node => node.type === 'message');
      } else if (searchType === 'custom') {
        // Check if any node's bookingOption is 'custom'
        return messageFlowData.nodes.some(node => node.data && node.data.flowData && node.data.flowData.bookingOption === 'custom');
      } else if (searchType === 'book-appointment') {
        // Check if any node's bookingOption is 'book-appointment'
        return messageFlowData.nodes.some(node => node.data && node.data.flowData && node.data.flowData.bookingOption === 'book-appointment');
      }
    }
  };

  return (
    <div className="category-item">
      {recipientsShow && (
        <AutomationHistory
          agency_id={agency?.agency_id}
          rule={rule}
          handleCloseModal={() => {
            setRecipientsShow(false);
          }}
        />
      )}

      {showInsights && agency && (
        <AutomationInsigths
          agency_id={agency?.agency_id}
          rule={rule}
          handleCloseModal={() => {
            setShowLogic(null);
            setInsights(false);
          }}
        />
      )}

      <div className="category-items">
        {rulesResStatus === constant.API_STATUS.PENDING && (
          <>
            {[...Array(6)].map((e, i) => (
              <div className="category-items-box" key={i}>
                <div className="d-flex justify-content-between">
                  <span>
                    <TextLoading className="" height="20px" width="50px" />
                  </span>
                </div>
                <h3>
                  <TextLoading className="" height="14px" width="70%" />
                </h3>
                <p>
                  <TextLoading className="" height="12px" width="100%" />
                  <TextLoading className="" height="12px" width="100%" />
                </p>
              </div>
            ))}
          </>
        )}

        {rulesResStatus === constant.API_STATUS.FULLFILLED &&
          filteredListRules.map((item, index) => (
            <div className="category-items-box" key={index}>
              <div className="d-flex justify-content-between">
                <div className="category-tags-wrapper d-flex align-items-center">
                  {builderType(item.automation_rule_templates[0]?.message_flow_data, 'message') &&
                    <span className="category-tags message">Message</span>
                  } 
                  {builderType(item.automation_rule_templates[0]?.message_flow_data, 'book-appointment') &&
                    <span className="category-tags appointment">Appointment</span>
                  }
                  {/* <span className="category-tags reservation">Reservation</span> */}
                  {builderType(item.automation_rule_templates[0]?.message_flow_data, 'custom') &&
                    <span className="category-tags custombooking">Custom Booking</span>
                  }
                  {crmType(item.automation_rule_templates[0]?.message_flow_data, 'google') &&
                    <span className="category-tags used_crm_tags">
                      <img src="../../assets/images/automations/google_calendar.svg" width="17" />
                    </span>
                  }
                  {crmType(item.automation_rule_templates[0]?.message_flow_data, 'outlook') &&
                    <span className="category-tags used_crm_tags">
                      <img src="../../assets/images/automations/outlook.svg" width="18" />
                    </span>
                  }
                </div>
                <CommonDrodownAction 
                  items={downdropActions(item)} 
                  icon={false} 
                  html={<FontAwesomeIcon color="#424242" icon={faChevronDown} style={{ fontSize: '15px' }} />}
                />
              </div>
              <h3
                onClick={() => {
                  router.push(
                    h.getRoute(routes.automation.form_view, {
                      ruleId: item?.automation_rule_id,
                    }),
                    undefined,
                    {
                      shallow: true,
                    },
                  );
                }}
              >
                {item.name}
              </h3>
              <p>{item.description}</p>
              <div className="d-flex align-items-center justify-content-between category_status_details">
                <div className="d-flex align-items-center category-time-details">
                  <IconTimePast color="#red" width="20px" />
                  {item.updated_date_time_ago}
                </div>
                <div className={`d-flex align-items-center ${
                      item.status === 'active' ? 'active' : 'inactive'
                    }`}>
                  <span className="status">{item.status}</span>
                  <div className="onoffswitch d-flex">
                    <input type="checkbox" 
                      id = {item.automation_rule_id}
                      onChange={(ev) => handleChange(ev, item)}
                      // readOnly={handleChange(item.automation_rule_id, item.status)}
                      checked={item.status === 'active'? true : false} 
                    />
                    <label htmlFor = {item.automation_rule_id}>Toggle</label>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {(rulesResStatus === null || rulesResStatus === constant.API_STATUS.FULLFILLED) &&
        filteredListRules.length === 0 && (
          <div
              className="d-flex w-100 align-items-center justify-content-center flex-column"
              style={{ gap: '2em', marginTop: '100px' }}
            >
              <img
                style={{ width: '40%' }}
                width="100%"
                src="https://cdn.yourpave.com/assets/empty-data-2x.png"
                alt={'profile picture'}
              />
              No automation rules found.
          </div>
        )
      }
    </div>
  );
});