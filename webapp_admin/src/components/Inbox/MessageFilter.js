import React, { useRef, useEffect, useState } from 'react';
import moment from 'moment';
import constant from '../../constants/constant.json';

import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import IconWhatsApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWhatsApp';
import IconLineApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconLineApp';
import IconSMS from '../../components/ProposalTemplate/Link/preview/components/Icons/IconSMS';
import IconWeChatApp from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWeChatApp';
import IconComments from '../../components/ProposalTemplate/Link/preview/components/Icons/IconComments';
import IconWeb from '../../components/ProposalTemplate/Link/preview/components/Icons/IconWeb';
import IconMessenger from '../../components/ProposalTemplate/Link/preview/components/Icons/IconMessenger';

export default React.memo(
  ({
    hasAdminAccess,
    contactOwners,
    selectedOwnerOptions,
    setSelectedOwnerOptions,
    handleSelectSort = () => {},
    selectedSort = null,
    selectedPlatforms = [],
    handleSelectPlatform = () => {},
    closeFilter,
    showPlatforms = true,
    showSort = true,
    showQuickReply = true,
    showOnlyWithReply = false,
    showResponsesOnly = true,
    setSetShowResponsesOnly = () => {},
    showAutomationOnly = false,
    setShowAutomationOnly = () => {},
  }) => {
    const filterRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (filterRef.current && !filterRef.current.contains(event.target)) {
          closeFilter();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [filterRef]);

    function getDropdownButtonLabel({ placeholderButtonLabel, value }) {
      if (value.length === 0) {
        return `${placeholderButtonLabel}`;
      } else {
        return `(${value.length}) ${placeholderButtonLabel}`;
      }
    }

    function onChange(value, event) {
      this.setState(value);
    }

    return (
      <section
        className="messages-filter-wrapper "
        style={{
          position: 'absolute',
        }}
        ref={filterRef}
      >
        {/* <ReactMultiSelectCheckboxes
                        options={quickReplies}
                        placeholderButtonLabel={'Quick Reply'}
                        getDropdownButtonLabel={getDropdownButtonLabel}
                        value={selectedOptions}
                        onChange={onChange}
                        setState={setSelectedOptions}
                      /> */}
        <div className={'dropdown-filter'}>
          {hasAdminAccess && (
            <ReactMultiSelectCheckboxes
              options={contactOwners}
              placeholderButtonLabel={'Contact Owner'}
              getDropdownButtonLabel={getDropdownButtonLabel}
              value={selectedOwnerOptions}
              onChange={onChange}
              setState={setSelectedOwnerOptions}
            />
          )}
        </div>

        {showOnlyWithReply && (
          <>
            <label>Messages</label>
            <div className="sort-items">
              <span
                className={`${showResponsesOnly ? 'active' : ''}`}
                onClick={() => {
                  setSetShowResponsesOnly(!showResponsesOnly);
                }}
              >
                Only show with responses
              </span>
              <span
                className={`${!showResponsesOnly ? 'active' : ''}`}
                onClick={() => {
                  setSetShowResponsesOnly(!showResponsesOnly);
                }}
              >
                Show all messages
              </span>
            </div>
            <div className="divider"> </div>
            <label>Automation</label>
            <div className="sort-items">
              <span
                className={`${showAutomationOnly ? 'active' : ''}`}
                onClick={() => {
                  setShowAutomationOnly(!showAutomationOnly);
                }}
              >
                Automation messages only
              </span>
            </div>
            <div className="divider"> </div>
          </>
        )}

        {showSort && (
          <>
            <label>Sort by</label>
            <div className="sort-items">
              <span
                className={`${selectedSort === 'newest' ? 'active' : ''}`}
                onClick={() => {
                  handleSelectSort('newest');
                }}
              >
                Newest First
              </span>
              <span
                className={`${selectedSort === 'oldest' ? 'active' : ''}`}
                onClick={() => {
                  handleSelectSort('oldest');
                }}
              >
                Oldest First
              </span>
            </div>
            <div className="divider"> </div>
          </>
        )}

        {showPlatforms && (
          <>
            <label>Platform</label>
            <div className="sort-items">
              <span
                className={`${
                  selectedPlatforms.includes(constant.INBOX.TYPE.WHATSAPP)
                    ? 'active'
                    : ''
                }`}
                onClick={() => {
                  handleSelectPlatform(constant.INBOX.TYPE.WHATSAPP);
                }}
              >
                <i
                  style={{
                    width: '20px',
                    display: 'inline-block',
                    textAlign: 'center',
                    float: 'right',
                  }}
                >
                  <IconWhatsApp width="15" color={'#4877ff'} />
                </i>
                WhatsApp
              </span>
              {/* <span
                className={`${
                  selectedPlatforms.includes(constant.INBOX.TYPE.LINE)
                    ? 'active'
                    : ''
                }`}
                onClick={() => {
                  handleSelectPlatform(constant.INBOX.TYPE.LINE);
                }}
              >
                <i
                  style={{
                    width: '20px',
                    display: 'inline-block',
                    textAlign: 'center',
                    float: 'right',
                  }}
                >
                  <IconLineApp width="20" color={'#4877ff'} />
                </i>
                Line
              </span> */}
              {/* <span
                className={`${
                  selectedPlatforms.includes(constant.INBOX.TYPE.MESSENGER)
                    ? 'active'
                    : ''
                }`}
                onClick={() => {
                  handleSelectPlatform(constant.INBOX.TYPE.MESSENGER);
                }}
              >
                <i
                  style={{
                    width: '20px',
                    display: 'inline-block',
                    textAlign: 'center',
                    float: 'right',
                  }}
                >
                  <IconMessenger width="20" color={'#2a5245'} />
                </i>
                Messenger
              </span> */}
              <span
                className={`${
                  selectedPlatforms.includes(constant.INBOX.TYPE.LIVECHAT)
                    ? 'active'
                    : ''
                }`}
                onClick={() => {
                  handleSelectPlatform(constant.INBOX.TYPE.LIVECHAT);
                }}
              >
                <i
                  style={{
                    width: '20px',
                    display: 'inline-block',
                    textAlign: 'center',
                    float: 'right',
                  }}
                >
                  <IconWeb width="18" color={'#4877ff'} />
                </i>
                Live Chat
              </span>

              {/* <span
                          className={`${
                            selectedPlatforms.includes(constant.INBOX.TYPE.SMS)
                              ? 'active'
                              : ''
                          }`}
                          onClick={() => {
                            handleSelectPlatform(constant.INBOX.TYPE.SMS);
                          }}
                        >
                          <i
                            style={{
                              width: '20px',
                              display: 'inline-block',
                              textAlign: 'center',
                              float: 'right',
                            }}
                          >
                            <IconSMS width="15" color={'#4877ff'} />
                          </i>
                          SMS
                        </span> */}
              {/* <span
                          className={`${
                            selectedPlatforms.includes(
                              constant.INBOX.TYPE.WECHAT,
                            )
                              ? 'active'
                              : ''
                          }`}
                          onClick={() => {
                            handleSelectPlatform(constant.INBOX.TYPE.WECHAT);
                          }}
                        >
                          <i
                            style={{
                              width: '20px',
                              display: 'inline-block',
                              textAlign: 'center',
                              float: 'right',
                            }}
                          >
                            <IconWeChatApp width="18" color={'#4877ff'} />
                          </i>
                          WeChat
                        </span> */}
            </div>
            {/* <div className="platform-items d-flex">
                        <span
                          className={`wa ${
                            selectedPlatforms.includes(
                              constant.INBOX.TYPE.WHATSAPP,
                            )
                              ? 'active'
                              : ''
                          }`}
                          onClick={() => {
                            handleSelectPlatform(constant.INBOX.TYPE.WHATSAPP);
                          }}
                        >
                          <IconWhatsApp width="18" color={'#fff'} />
                        </span>
                        <span
                          className={`line ${
                            selectedPlatforms.includes(constant.INBOX.TYPE.LINE)
                              ? 'active'
                              : ''
                          }`}
                          onClick={() => {
                            handleSelectPlatform(constant.INBOX.TYPE.LINE);
                          }}
                        >
                          <IconLineApp width="25  " color={'#fff'} />
                        </span>
                      </div> */}
          </>
        )}
      </section>
    );
  },
);
