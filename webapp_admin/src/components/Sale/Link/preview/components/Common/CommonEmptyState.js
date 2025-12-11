import React from 'react';

export default function CommonEmptyState(props) {
  const {imageUrl, invalidText} = props;

  return (
    <div style={{backgroundColor: '#ede6dd', height: '100vh'}}>
      <div className="container text-center">
        <img
          src={imageUrl}
          alt="Property Sold"
          style={{maxWidth: '400px', height: 'auto'}}
        />
        <h3 className="text-color1">{invalidText}</h3>
      </div>
    </div>
  );
}
