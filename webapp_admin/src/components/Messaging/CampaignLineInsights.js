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
import CommonTooltip from '../../components/Common/CommonTooltip';
import constant from '../../constants/constant.json';
import TableLoading from '../Sale/Link/preview/components/Common/CommonLoading/TableLoading';

export default function CampaignInsights({
  tracker: {
    agency_fk,
    tracker_ref_name,
    batch_count,
    total_read,
    template_count,
  },
  handleCloseModal,
}) {
  const [insight, setInsight] = useState(null);
  const readCount = insight?.read;
  const [status, setStatus] = useState(constant.API_STATUS.IDLE);

  useEffect(() => {
    (async () => {
      setStatus(constant.API_STATUS.PENDING);

      const apiRes = await api.agency.getLineCampaignInsights(
        {
          agency_fk,
          tracker_ref_name,
        },
        {},
        false,
      );
      if (h.cmpStr(apiRes.status, 'ok')) {
        setInsight(apiRes.data.agency_performance);
      }
      setStatus(constant.API_STATUS.FULLFILLED);
    })();
  }, []);

  const getPercentageWtemplateCount = (
    value,
    batch_count,
    template_count = 1,
  ) => {
    let newValue = value;
    if (template_count > 1) {
      newValue = value / template_count;
    }
    let total = (newValue * 100) / batch_count;

    return Math.ceil(total);
  };

  const getPercentage = (num1, num2) => {
    const p = (num1 * 100) / num2;
    return p >= 0 ? p.toFixed(1) : 0;
  };
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
            Campaign Insights
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
                Recipients{' '}
                <CommonTooltip tooltipText="Total Campaign Recipient Count">
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
                  {insight?.batch_count}
                  {/* <span>
                    {getPercentage(insight?.sent, insight?.batch_count)}%
                    <CommonTooltip tooltipText="Percentage based on the Sent count compared to Batch count">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        color="#bcc2c7"
                        size=""
                      />
                    </CommonTooltip>
                  </span> */}
                </div>
              )}
            </div>
            <div className="insigth-items">
              <h2>
                Sent{' '}
                <CommonTooltip tooltipText="Total Sent Count">
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
                  {insight?.sent}
                  <span>
                    {getPercentage(insight?.sent, insight?.batch_count)}%
                    <CommonTooltip tooltipText="Percentage based on the Sent count compared to Batch count">
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
                <CommonTooltip tooltipText="Total Delivered Message Count">
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
                  {insight?.delivered}
                  <span>
                    {getPercentage(insight?.delivered, insight?.sent)}%{' '}
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
                <CommonTooltip tooltipText="Total Failed Message Count (Unprocessed and Sending Failed)">
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
                  {insight?.failed}
                  <span>
                    {getPercentage(insight?.failed, insight?.batch_count)}%
                    <CommonTooltip tooltipText="Percentage based on the Failed count compared to Batch count">
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
            {insight &&
              insight?.cta &&
              insight?.cta[0] &&
              !h.cmpStr(insight?.cta[0].name, 'CTA Not Available') && (
                <div className="insigth-items">
                  <h2>
                    {insight?.cta[0].name}{' '}
                    <CommonTooltip tooltipText="Number of recipients with CTA 1 response">
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
                      {insight?.cta[0].value}
                      <span>
                        {getPercentage(insight?.cta[0].value, readCount)}%{' '}
                        <CommonTooltip tooltipText="Percentage based on the CTA count compared to Read count">
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
              )}
            {insight &&
              insight?.cta &&
              insight?.cta[1] &&
              !h.cmpStr(insight?.cta[1].name, 'CTA Not Available') && (
                <div className="insigth-items">
                  <h2>
                    {insight?.cta[1].name}{' '}
                    <CommonTooltip tooltipText="Number of recipients with CTA 2 response">
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
                      {insight?.cta[1].value}
                      <span>
                        {getPercentage(insight?.cta[1].value, readCount)}%{' '}
                        <CommonTooltip tooltipText="Percentage based on the CTA count compared to Read count">
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
              )}
            {insight &&
              insight?.cta &&
              insight?.cta[2] &&
              !h.cmpStr(insight?.cta[2].name, 'CTA Not Available') && (
                <div className="insigth-items">
                  <h2>
                    {insight?.cta[2].name}{' '}
                    <CommonTooltip tooltipText="Number of recipients with CTA 3 response">
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
                      {insight?.cta[2].value}
                      <span>
                        {getPercentage(insight?.cta[2].value, readCount)}%{' '}
                        <CommonTooltip tooltipText="Percentage based on the CTA count compared to Read count">
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
              )}
            {insight &&
              insight?.cta &&
              insight?.cta[3] &&
              !h.cmpStr(insight?.cta[3].name, 'CTA Not Available') && (
                <div className="insigth-items">
                  <h2>
                    {insight?.cta[3].name}{' '}
                    <CommonTooltip tooltipText="Number of recipients with CTA 4 response">
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
                      {insight?.cta[3].value}
                      <span>
                        {getPercentage(insight?.cta[3].value, readCount)}%{' '}
                        <CommonTooltip tooltipText="Percentage based on the CTA count compared to Read count">
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
              )}
            {insight &&
              insight?.cta &&
              insight?.cta[4] &&
              !h.cmpStr(insight?.cta[4].name, 'CTA Not Available') && (
                <div className="insigth-items">
                  <h2>
                    {insight?.cta[4].name}{' '}
                    <CommonTooltip tooltipText="Number of recipients with CTA 5 response">
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
                      {insight?.cta[4].value}
                      <span>
                        {getPercentage(insight?.cta[4].value, readCount)}%{' '}
                        <CommonTooltip tooltipText="Percentage based on the CTA count compared to Read count">
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
              )}
            <div className="insigth-items">
              <h2>
                Read{' '}
                <CommonTooltip tooltipText="Line Message Read Count">
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
                  {readCount}
                  <span>
                    {getPercentage(readCount, insight?.delivered)}%{' '}
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
                Replied{' '}
                <CommonTooltip tooltipText="Number of Recipients who replied">
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
                  {insight?.replied}
                  <span>
                    {getPercentage(insight?.replied, readCount)}%{' '}
                    <CommonTooltip tooltipText="Percentage based on the Replied count compared to Read count">
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
            {/* <div className="insigth-items">
              <h2>
                With Manual Replies{' '}
                <CommonTooltip tooltipText="Number of Recipients who sent text replies">
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
                  {insight?.manual_replies}
                  <span>
                    {getPercentage(insight?.manual_replies, readCount)}%{' '}
                    <CommonTooltip tooltipText="Percentage based on the With Manual Reply count compared to Read count">
                      <FontAwesomeIcon
                        icon={faInfoCircle}
                        color="#bcc2c7"
                        size=""
                      />
                    </CommonTooltip>
                  </span>
                </div>
              )}
            </div> */}
            {/* <div className="insigth-items">
              <h2>Proposal Opened</h2>
              {status === constant.API_STATUS.PENDING ? (
                <TableLoading className={{}} width="100%" />
              ) : (
                <div>
                  {insight?.proposal_opened}
                  <span>
                    {getPercentage(insight?.proposal_opened, readCount)}%
                  </span>
                </div>
              )}
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
