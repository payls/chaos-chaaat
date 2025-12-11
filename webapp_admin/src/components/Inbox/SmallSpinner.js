import React from 'react';

export default React.memo(({ style = {} }) => {
  return (
    <div
      style={{
        textAlign: 'center',
        fontFamily: 'PoppinsSemiBold',
        color: '#5A6264',
        marginTop: '20px',
        marginBottom: '20px',
        ...style,
      }}
    >
      <span className="spinner">&nbsp;</span>
    </div>
  );
});
