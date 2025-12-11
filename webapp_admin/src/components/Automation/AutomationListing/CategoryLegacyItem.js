import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { h } from '../../../helpers';
import { api } from '../../../api';
import constant from '../../../constants/constant.json';
import { routes } from '../../../configs/routes';

import TextLoading from '../../Sale/Link/preview/components/Common/CommonLoading/TextLoading';
import AutomationInsigths from '../../Inbox/AutomationInsights';
import AutomationHistory from '../../Inbox/AutomationHistory';
import { faInfo, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconTimePast from '../../ProposalTemplate/Link/preview/components/Icons/IconTimePast';
import CommonDrodownAction from '../../Common/CommonDrodownAction';


export default React.memo(({ agency = null }) => {
  const router = useRouter();

  const [value, setValue] = useState("");
  const [rulesResStatus, setRulesResStatus] = useState(constant.API_STATUS.PENDING);
  const [listLegacyRules, setListLegacyRules] = useState([]);
  const [recipientsShow, setRecipientsShow] = useState(false);
  const [showLogic, setShowLogic] = useState(null);
  const [rule, setRule] = useState(null);
  const [showInsights, setInsights] = useState(false);
  const platform = 'platform';

  useEffect(() => {
    (async () => {
      await getAutomations();
    })();
  }, []);

  /* Get all automation by agency */
  async function getAutomations() {
    setRulesResStatus(constant.API_STATUS.PENDING);
    const rulesRes = await api.automation.getAllAutomations({
      agency_id: agency?.agency_id
    });

    if (h.cmpStr(rulesRes.status, 'ok')) {
      setListLegacyRules(rulesRes.data.rules);
    }
    setRulesResStatus(constant.API_STATUS.FULLFILLED);
  }

  /**
  * Updates the status of an automation identified by its ID with the provided data.
  * 
  * @param {string} id - The ID of the item to update.
  * @param {object} data - The data to update the item's status with.
  */ 
  async function updateStatus(id, data) {
    h.general.prompt(
      {
      message: `Are you sure you want to set this to ${data.status}?`,
      },

      async (status) => {
        if (status) {
          const updateRes = await api.automation.updateRuleStatus(
            id,
            data,
            true,
            true,
          );

          if (h.cmpStr(updateRes.status, 'ok')) {
            h.general.alert('success', {
              message: 'Successfully updated status!',
              autoCloseInSecs: 2,
            });

            await getAutomations();
          }
        }
      },
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
            await getAutomations();
          }
        }
      },
    );
  }

  async function showHistory(rule) {
    setRecipientsShow(true);
  }

  // This dropdown menu generates an array of action objects for rule management
  function downdropActions(item) {
    const { automation_rule_id, status } = item;

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
          updateStatus(automation_rule_id, { status: 'active' });
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

    actions.push({
      label: 'Duplicate',
      icon: false,
      action: () => {},
    });

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

  const handleChange = (event) => {
    setValue(event.target.value);
  }

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
          listLegacyRules.map((item, index) => (
          item.automation_category?.[platform] !== 'CHAAATBUILDER' && (
            <div className="category-items-box" key={index}>
              <div className="d-flex justify-content-between">
                <div className="category-tags-wrapper d-flex align-items-center">
                  <span className="category-tags message">Legacy</span>
                  {item.automation_category?.[platform] === 'MINDBODY' && (
                    <span className="category-tags used_crm_tags">
                      <img src="../../assets/images/automations/mindbody.svg" width="18" alt="Mindbody"/>
                    </span>
                  )}
                  {item.automation_category?.[platform] === 'HUBSPOT' && (
                    <span className="category-tags used_crm_tags">
                      <img src="../../assets/images/automations/hubspot.svg" width="19" />
                    </span>
                  )}
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
                        onChange={handleChange}
                        // readOnly={handleChange(item.automation_rule_id, item.status)}
                        checked={item.status === 'active'? true : false} 
                      />
                      <label htmlFor = {item.automation_rule_id}>Toggle</label>
                    </div>
                  </div>
              </div>
            </div>
          )
        ))}
      </div>

      {rulesResStatus === constant.API_STATUS.FULLFILLED &&
        listLegacyRules.length === 0 && (
          <div className="no-messages-found">
            <span>
              <FontAwesomeIcon
                icon={faInfo}
                color="#DEE1E0"
                style={{ fontSize: '40px' }}
              />
            </span>
            <br />
            No rules found
          </div>
        )
      }
    </div>
  )
  }
);
