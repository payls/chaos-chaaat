import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import {
  faTimes,
  faDownload,
  faAngleLeft,
  faAngleRight,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommonTooltip from '../Common/CommonTooltip';
import constant from '../../constants/constant.json';
import TableLoading from '../Sale/Link/preview/components/Common/CommonLoading/TableLoading';

export default function AutomationInsigths({
  agency_id,
  rule,
  handleCloseModal,
}) {
  const [insight, setInsight] = useState(null);
  const readCount = insight?.read;
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);

  useEffect(() => {
    (async () => {
      setStatus(constant.API_STATUS.PENDING);
      const apiRes = await api.automation.geInsights(
        {
          agency_id,
          automation_rule_id: rule.automation_rule_id,
        },
        {},
        false,
      );
      if (h.cmpStr(apiRes.status, 'ok')) {
        setInsight(apiRes.data.insight);
      }
      setStatus(constant.API_STATUS.FULLFILLED);
    })();
  }, []);

  return (
    <div className="common-modal-attachment-background">
      <div
        className="common-modal-attachment-container"
        style={{
          position: 'relative',
          width: '700px',
        }}
      >
        <div className="common-modal-attachment-header btlr-10 btrr-10 insight-header p-3">
          <h1
            style={{
              color: '#182327',
              fontFamily: 'PoppinsRegular',
              fontSize: '20px',
            }}
          >
            Automation Insights
          </h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              onClick={handleCloseModal}
              style={{
                cursor: 'pointer',
                fontSize: '1em',
                marginLeft: '3em',
              }}
            >
              <FontAwesomeIcon icon={faTimes} color="#182327" size="2x" />
            </span>
          </div>
        </div>
        <div className="common-modal-attachment-body bblr-10 bbrr-10 bg-white">
          <div className="insight-wrapper d-flex">
            <div className="insigth-items">
              <h2>
                Trigger Count{' '}
                <CommonTooltip tooltipText="No. of times automation is triggered">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    color="#08453d"
                    size=""
                  />
                </CommonTooltip>
              </h2>
              {status === constant.API_STATUS.PENDING ? (
                <TableLoading className={{}} width="100%" />
              ) : (
                <div>{insight?.triggered_count}</div>
              )}
            </div>
            <div className="insigth-items">
              <h2>
                Sent{' '}
                <CommonTooltip tooltipText="Total Automation Message Sent Count">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    color="#08453d"
                    size=""
                  />
                </CommonTooltip>
              </h2>
              {status === constant.API_STATUS.PENDING ? (
                <TableLoading className={{}} width="100%" />
              ) : (
                <div>
                  {insight?.sent_count}
                  <span>
                    {insight?.sent_percentage?.toFixed(2)}%
                    <CommonTooltip tooltipText="Percentage based on the Sent count compared to Trigger count">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        color="#bcc2c7"
                        size=""
                      />
                    </CommonTooltip>
                  </span>
                </div>
              )}
            </div>
            <div className="insigth-items">
              <h2>
                Delivered{' '}
                <CommonTooltip tooltipText="Total Automation Message Delivered Count">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    color="#08453d"
                    size=""
                  />
                </CommonTooltip>
              </h2>
              {status === constant.API_STATUS.PENDING ? (
                <TableLoading className={{}} width="100%" />
              ) : (
                <div>
                  {insight?.delivered_count}
                  <span>
                    {insight?.delivered_percentage?.toFixed(2)}%
                    <CommonTooltip tooltipText="Percentage based on the Delivered count compared to Sent count">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        color="#bcc2c7"
                        size=""
                      />
                    </CommonTooltip>
                  </span>
                </div>
              )}
            </div>
            <div className="insigth-items">
              <h2>
                Failed{' '}
                <CommonTooltip tooltipText="Total Automation Message Failed Count">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    color="#08453d"
                    size=""
                  />
                </CommonTooltip>
              </h2>
              {status === constant.API_STATUS.PENDING ? (
                <TableLoading className={{}} width="100%" />
              ) : (
                <div>
                  {insight?.failed_count}
                  <span>
                    {insight?.failed_percentage?.toFixed(2)}%
                    <CommonTooltip tooltipText="Percentage based on the Failed count compared to Triggered count">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        color="#bcc2c7"
                        size=""
                      />
                    </CommonTooltip>
                  </span>
                </div>
              )}
            </div>
            <div className="insigth-items">
              <h2>
                Read{' '}
                <CommonTooltip tooltipText="Total Automation Message Read Count">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    color="#08453d"
                    size=""
                  />
                </CommonTooltip>
              </h2>
              {status === constant.API_STATUS.PENDING ? (
                <TableLoading className={{}} width="100%" />
              ) : (
                <div>
                  {insight?.read_count}
                  <span>
                    {insight?.read_percentage?.toFixed(2)}%
                    <CommonTooltip tooltipText="Percentage based on the Read count compared to Delivered count">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        color="#bcc2c7"
                        size=""
                      />
                    </CommonTooltip>
                  </span>
                </div>
              )}
            </div>
            <div className="insigth-items">
              <h2>
                Replies{' '}
                <CommonTooltip tooltipText="Total Automation Message Replied Count">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    color="#08453d"
                    size=""
                  />
                </CommonTooltip>
              </h2>
              {status === constant.API_STATUS.PENDING ? (
                <TableLoading className={{}} width="100%" />
              ) : (
                <div>
                  {insight?.with_reply_count}
                  <span>
                    {insight?.replied_percentage?.toFixed(2)}%
                    <CommonTooltip tooltipText="Percentage based on the Reply count compared to Read count">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        color="#bcc2c7"
                        size=""
                      />
                    </CommonTooltip>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
