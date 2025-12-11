import React, { useEffect, useState } from 'react';
import moment from 'moment';
import * as he from 'he';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { h } from '../../helpers';

import {
  faImage,
  faChevronLeft,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconArrowSquareUp from '../ProposalTemplate/Link/preview/components/Icons/IconArrowSquareUp';
import IconVideo from '../ProposalTemplate/Link/preview/components/Icons/IconVideo';
import IconPhone from '../ProposalTemplate/Link/preview/components/Icons/IconPhone';
import IconPlus from '../ProposalTemplate/Link/preview/components/Icons/IconPlus';
import IconChevronLeft from '../ProposalTemplate/Link/preview/components/Icons/IconChevronLeft';

export default React.memo(({ items = [] }) => {
  function formalBodyMsg(content) {
    const formatted =  h.template.formatBodyMsg(content);

    const encoded =  he.escape(formatted);

    const selectivelyEncodedContent = encoded
      .replace(/&lt;b&gt;/g, '<b>')
      .replace(/&lt;i&gt;/g, '<i>')
      .replace(/&lt;s&gt;/g, '<s>')
      .replace(/&lt;\/b&gt;/g, '</b>')
      .replace(/&lt;\/i&gt;/g, '</i>')
      .replace(/&lt;\/s&gt;/g, '</s>');

    return selectivelyEncodedContent;
  }

  function getTime() {
    const dateTime = h.date.convertUTCDateToLocalDate(
      moment().utc(false).format('DD MMM YYYY hh:mm a') + ' GMT',
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      'en-AU',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      },
    );

    return dateTime;
  }
  return (
    <div className="iphone-frame">
      <span className="iphone-time">12:00</span>
      <img
        src="https://pave-prd.s3.ap-southeast-1.amazonaws.com/assets/iphone-top-right.png"
        className="iphone-swb"
      />
      <div
        className="iphone-user d-flex justify-content-between align-items-center p-2"
        style={{
          position: 'absolute',
          width: ' calc(100% - 55px)',
          top: '45px',
        }}
      >
        <span className="d-flex align-items-center">
          <IconChevronLeft color="#007fd0" width="20px" />
          <span
            style={{
              display: 'inline-block',
              width: '30px',
              height: '30px',
              borderRadius: '30px',
              background: '#e6e6e6',
              marginLeft: '30px',
            }}
          ></span>
        </span>
        <span>
          <IconVideo color="#b9b9b9" width="38px" className="mr-2" />
          <IconPhone color="#b9b9b9" width="26px" />
        </span>
      </div>
      <Scrollbars style={{ height: '540px' }} universal={true}>
        <div className="iphone-frame-body">
          <div className="template-preview-wrapper">
            {items.length > 0 &&
              items.map((item, index) => {
                const {
                  data,
                  quickReplies,
                  cta,
                  header,
                  image = null,
                  formattedBody = '',
                  isFormatted,
                } = item;
                return (
                  <>
                    <div key={index}>
                      {header !== 'none' && (
                        <div className="template-image-banner">
                          {h.isEmpty(image) && (
                            <div className="template-image-banner-preview">
                              <FontAwesomeIcon
                                icon={faImage}
                                color="#c5c5c5"
                                size="3x"
                              />
                            </div>
                          )}
                          {h.notEmpty(image) && h.cmpStr(header, 'image') && (
                            <img src={image || undefined} width={'100%'} />
                          )}
                          {h.notEmpty(image) && h.cmpStr(header, 'video') && (
                            <video style={{ width: '100%', marginTop: '30px' }} controls src={image || undefined}></video>
                          )}
                        </div>
                      )}
                      {h.notEmpty(data.template_body) && (
                        <div
                          className={`template-msg ${
                            h.notEmpty(cta) ? 'w-cta' : ''
                          } ${header !== 'none' ? 'w-image' : ''}`}
                          dangerouslySetInnerHTML={{
                            __html: formalBodyMsg(
                              isFormatted ? formattedBody : data.template_body,
                            ),
                          }}
                        ></div>
                      )}
                      {h.notEmpty(data.template_body) && (
                        <small>{getTime()}</small>
                      )}
                      {h.notEmpty(cta) &&
                        cta
                          .filter((f) => h.notEmpty(f.value))
                          .map((ctaBtn, i) => (
                            <div className="template-cta-btn" key={i}>
                              <IconArrowSquareUp /> {ctaBtn.value}
                            </div>
                          ))}
                    </div>

                    <div className="d-flex template-quick-btn-wrapper">
                      {quickReplies
                        .filter((f) => h.notEmpty(f.value))
                        .map((qBtns, i) => (
                          <div className="template-quick-btn" key={i}>
                            {qBtns.value}
                          </div>
                        ))}
                    </div>
                  </>
                );
              })}
          </div>
        </div>
      </Scrollbars>
      <div className="d-flex justify-content-center iphone-etext align-items-center">
        <IconPlus
          color="#007fd0"
          width="20px"
          style={{ marginRight: '10px' }}
        />
        <span> </span>
      </div>
    </div>
  );
});
