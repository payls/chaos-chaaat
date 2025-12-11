import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/styles.module.scss';
import { h } from '../../../../helpers';

// COMPONENTS
import TemplatePreview from '../../../WhatsApp/TemplateCreatePreview';
import Minus from '../../../FlowBuilder/Icons/Minus';
import CommonTooltip from '../../../Common/CommonTooltip';

// UI
import Share from '../../../FlowBuilder/Icons/Share';
import Eye from '../../../FlowBuilder/Icons/Eye';

// Store
import useSideBarStore from '../store';
import { unescapeData } from '../../../../helpers/general';

export default function SideBarTemplatePreview({ type, nodeDataIndex }) {
  const { nodeData, templateDetails, setPreview, selectedWhatsappFlow } = useSideBarStore();

  function previewAvailable () {
    return !!(selectedWhatsappFlow && selectedWhatsappFlow.preview_link);
  }

  const getFormattedBody = (template_body = '') => {
    let formatted = template_body;
    const fValues = templateDetails?.body_variables;
    if (
      typeof fValues === 'object' &&
      fValues !== null &&
      Object.keys(fValues).length !== 0
    ) {
      for (const i of Object.keys(fValues)) {
        formatted = formatted.replace(i, fValues[i].length ? fValues[i] : i);
      }
    }
    
    return formatted
  }

  const flowData = nodeData[nodeDataIndex]?.data?.flowData
  const method = flowData?.method;

  const mapQuickReplies = (data) => {
    return data?.map((m) => ({
      value: m.text,
    })) ?? [];
  };

  const extractValue = (data) =>
    data?.map ? data.map((item) => ({ value: item.value })) : data ? [{ value: data.value }] : [];

  return (
    <div className={styles.sidebarPreview}>
      <div className={styles.sidebarPreviewContent}>
        <div className={styles.sidebarPreviewContentBodyHeader}>
          <span>
            {type === 'message' ? 'Automation Preview' : 'Preview Booking'}
          </span>
          <span
            onClick={() => {
              setPreview(false);
            }}
            style={{ cursor: 'pointer' }}
          >
            <Minus color={'#fff'} />
          </span>
        </div>
        <div className={styles.sidebarPreviewContentBody}>
          {type === 'message' && (
            <div>
              { method !== 'custom' && (
                <TemplatePreview
                  items={unescapeData(
                    [
                      {
                        data: templateDetails,
                        quickReplies: mapQuickReplies(templateDetails?.quick_replies),
                        cta: extractValue(templateDetails?.cta_btn),
                        header: h.general.isImageOrVideo(templateDetails?.header_image),
                        isFormatted: true,
                        formattedBody: getFormattedBody(templateDetails?.template_body),
                        image: templateDetails?.header_image,
                      },
                    ]
                  )}
                />
              )}
              { method === 'custom' && (
                <TemplatePreview
                  items={unescapeData(
                    [
                      {
                        data: flowData,
                        quickReplies: mapQuickReplies(flowData?.quick_replies),
                        cta: extractValue(flowData?.cta_btn),
                        header: h.general.isImageOrVideo(flowData?.image),
                        isFormatted: true,
                        formattedBody: getFormattedBody(flowData?.formattedBody),
                        image: flowData?.image
                      }
                    ]
                  )}
                />
              )}
            </div>
          )}

          {/* add href link */}
          {type === 'booking' && (
            <CommonTooltip tooltipText={previewAvailable() ? 'Click to see preview' : 'Save The Flow to see Preview'}>
              <a href={selectedWhatsappFlow && selectedWhatsappFlow.preview_link} target="_blank"> 
                <button
                  className="chaaat-lgtBlue-button more-round"
                  onClick={() => {}}
                  disabled={!previewAvailable()}
                >
                  <Eye style={{ marginRight: 10 }} />
                  View Preview
                </button>
              </a>
            </CommonTooltip>
          )}
        </div>
      </div>
    </div>
  );
}
