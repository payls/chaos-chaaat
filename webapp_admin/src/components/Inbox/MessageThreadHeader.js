import React from 'react';
import constant from '../../constants/constant.json';
import { h } from '../../helpers';

import IconActive from '../ProposalTemplate/Link/preview/components/Icons/IconActive';
import IconInactive from '../ProposalTemplate/Link/preview/components/Icons/IconInactive';
import IconArchived from '../ProposalTemplate/Link/preview/components/Icons/IconArchived';
import IconOutsider from '../ProposalTemplate/Link/preview/components/Icons/IconOutsider';

export default React.memo(({ contact }) => {
  return (
    <>
      <div className="inbox-body-contact-header">
        <span>
          {h.user.combineFirstNLastName(
            contact?.first_name,
            contact?.last_name,
            ' ',
          )}
        </span>
        {!h.cmpStr(contact?.status, 'outsider') ? (
          <span style={{
            marginLeft: 'auto',
            order: 2,
            fontFamily: 'PoppinsExtraLight',
            fontWeight: '100',
            fontSize: '12px'
          }}>
            {contact?.status.charAt(0).toUpperCase() + contact?.status.slice(1)}
          </span>
        ) : (
          <span style={{
            marginLeft: 'auto',
            order: 2,
            fontFamily: 'PoppinsExtraLight',
            fontWeight: '100',
            fontSize: '12px'
          }}>
            Unknown Contact
          </span>
        )}
        <span style={{
          order: 3,
          fontFamily: 'PoppinsExtraLight',
          fontWeight: '100',
          fontSize: '12px',
          marginLeft: '5px'
        }}>
          {h.cmpStr(contact?.status, 'active') && (
            <IconActive width="15px" />
          )}
          {h.cmpStr(contact?.status, 'inactive') && (
            <IconInactive width="15px" />
          )}
          {h.cmpStr(contact?.status, 'archived') && (
            <IconArchived width="15px" />
          )}
          {h.cmpStr(contact?.status, 'outsider') && (
            <IconOutsider width="15px" />
          )}
        </span>
      </div>
    </>
  );
});
