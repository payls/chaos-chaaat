import React from 'react';

export default React.memo((props) => {
  return (
    <svg
      width="54"
      height="54"
      viewBox="0 0 54 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="27" cy="27" r="26.5" stroke="#4877FF" strokeOpacity="0.1" />
      <circle cx="27" cy="27" r="22" fill="#4877FF" fillOpacity="0.2" />
    </svg>
  );
});
