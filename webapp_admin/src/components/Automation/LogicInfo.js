import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';
import { h } from '../../helpers';
import { api } from '../../api';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default React.memo(({ rule, agency, handleCloseModal }) => {
  const [packages, setPackages] = useState([]);
  const [forms, setForms] = useState(null);
  const [triggers, setTriggers] = useState(null);
  const [whatsAppTemplateList, setWhatsAppTemplateList] = useState([]);

  useEffect(() => {
    (async () => {
      // Get Packages
      const packageRes = await api.automation.getPackages({
        agency_id: agency.agency_id,
      });
      if (h.cmpStr(packageRes.status, 'ok')) {
        setPackages(
          packageRes.data.packages
            .sort(function (a, b) {
              if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0;
            })
            .filter((f) =>
              rule.automation_rule_packages
                .map((m) => m.package_fk)
                .includes(f.package_id),
            ),
        );
      }

      const categoryRes = await api.automation.getCategory(
        rule.automation_category_fk,
      );
      if (h.cmpStr(categoryRes.status, 'ok')) {
        // Get Trigger
        const triggerRes = await api.automation.getTriggers(
          categoryRes.data.category.platform,
        );
        if (h.cmpStr(triggerRes.status, 'ok')) {
          setTriggers(
            triggerRes.data.triggers.find(
              (f) => rule.rule_trigger_fk === f.rule_trigger_id,
            ),
          );
        }
      }

      const apiRes = await api.whatsapp.listTemplates({
        agency_id: agency.agency_id,
        status: 'APPROVED',
      });

      if (h.cmpStr(apiRes.status, 'ok')) {
        setWhatsAppTemplateList(apiRes.data.agency_waba_templates);
      }

      if (rule.automation_rule_form) {
        const formsRes = await api.automation.getForms(agency.agency_id);

        if (h.cmpStr(formsRes.status, 'ok')) {
          setForms(
            formsRes.data.forms.find(
              (f) => rule.automation_rule_form.form_fk === f.hubspot_form_id,
            ),
          );
        }
      }
    })();
  }, [rule]);

  function freq() {
    switch (rule.rule_trigger_setting) {
      case 'immediately':
        return 'Send template immediately after conditions are met.';
      case 'day': {
        let triggerNote = triggers?.description;
        let day = triggerNote.includes('after') ? 'after' : 'before';
        return `Send template ${rule.rule_trigger_setting_count} day/s ${day} conditions are met.`;
      }
      case 'week': {
        let triggerNote = triggers?.description;
        let week = triggerNote.includes('after') ? 'after' : 'before';
        return `Send template ${rule.rule_trigger_setting_count} week/s ${week} conditions are met.`;
      }
    }
  }

  return (
    <div className="modern-modal-wrapper">
      <div className="modern-modal-body sm">
        <div className=" d-flex justify-content-between">
          <h1>Automation Information</h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              onClick={() => handleCloseModal(false)}
              style={{
                cursor: 'pointer',
                fontSize: '1em',
                marginLeft: '3em',
              }}
            >
              <FontAwesomeIcon
                icon={faTimes}
                color="#182327"
                style={{ fontSize: '15px' }}
              />
            </span>
          </div>
        </div>
        <div className=" modern-style mt-4 mdrn-input-form info">
          <label>WhatsApp template to send:</label>
          <span className="info">
            {whatsAppTemplateList
              .filter(
                (f) =>
                  rule.automation_rule_templates[0].template_fk ===
                  f.waba_template_id,
              )
              .map((m) => h.general.sentenceCase(m.template_name))
              .join(', ')}
          </span>
          {packages.length > 0 && (
            <>
              <label>
                {rule.exclude_package === '0'
                  ? 'Send automation for this packages only:'
                  : 'Exclude this packages on automation:'}
              </label>
              <span className="info">
                {packages.map((p) => p.name).join(', ')}
              </span>
            </>
          )}
          {forms && (
            <>
              <label>
                {rule.exclude_package === '0'
                  ? 'Send automation for this forms only:'
                  : 'Exclude this forms on automation:'}
              </label>
              <span className="info">{forms?.form_name}</span>
            </>
          )}

          <label>WhatsApp template sending condition:</label>
          <span className="info">{triggers?.description}</span>
          <label>Automation will send:</label>
          <span className="info">{triggers ? freq() : ''}</span>
        </div>
        <div className="d-flex modern-modal-actions justify-content-between pt-2">
          <div style={{ flex: '50%' }}>
            <button
              type="type"
              className="modern-button fullw"
              onClick={() => handleCloseModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
