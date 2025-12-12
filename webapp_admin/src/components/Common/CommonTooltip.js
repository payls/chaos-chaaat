import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function CommonTooltip(props) {
  const { tooltipText, placement = 'top', children } = props;

  const renderTooltip = (props) => (
    <Tooltip className="tooltip-top" {...props}>
      {tooltipText}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement={placement}
      delay={{ show: 250 }}
      backgroundColor="red"
      overlay={renderTooltip}
    >
      {children}
    </OverlayTrigger>
  );
}
