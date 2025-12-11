import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useRouter } from 'next/router';

import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';

import {
  faTimes,
  faUserSlash,
  faUsers,
  slash,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default React.memo(({ oldContactId, agencyId, handleCloseModal }) => {
  const [automations, setAutomations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await getAutomations();
    })();
  }, []);

  async function getAutomations() {
    const rulesRes = await api.automation.getAllAutomations({
      status: 'active',
    });

    if (h.cmpStr(rulesRes.status, 'ok')) {
      setAutomations(rulesRes.data.rules);
    }
  }

  return (
    <div className="campaign-schedule-wrapper input-search">
      <div className="campaign-schedule-body" style={{ width: '800px' }}>
        <div className="d-flex justify-content-between">
          <h1>Automations</h1>
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
        <br />
        {automations.length !== 0 && (
          <div
            style={{
              overflow: 'auto',
              height: '380px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1em',
            }}
          >
            {automations.map((automation, i) => (
              <div className="automation-list" key={i}>
                <h3
                  onClick={() => {
                    router.push(
                      h.getRoute(routes.automation.form_view, {
                        ruleId: automation?.automation_rule_id,
                      }),
                      undefined,
                      {
                        shallow: true,
                      },
                    );
                  }}
                >
                  {automation.name}
                </h3>
                <h2>{automation.automation_category.title}</h2>
              </div>
            ))}
          </div>
        )}

        <div>
          {automations.length === 0 && (
            <div className="no-messages-found">
              <br />
              No Automation enabled for this contact
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
