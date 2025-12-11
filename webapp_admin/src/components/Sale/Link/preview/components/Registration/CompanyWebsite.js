import React from 'react';
import {h} from '../../helpers';

export default function CompanyWebsite(props) {
  const buttonStyle = {
    borderRadius: '10px',
    backgroundColor: '#1C1C1C',
    color: '#FFFFFF',
    height: '55px',
  };
  const buttonWrapperClassName = 'text-center login-submit-btn';

  return (
    <div>
      <h.form.GenericForm
        {...props}
        submitButtonStyle={buttonStyle}
        buttonWrapperClassName={buttonWrapperClassName}
        submitButtonVariant="primary3"
      />
    </div>
  );
}
