import React from 'react';
import { Tooltip } from 'react-tooltip';

export default function CommonReactTooltip(props) {
  const { tooltipText, children, options = {}, place = 'top' } = props;
  const rand = Math.floor(Math.random() * 10000);

  return (
    <>
      <span
        data-tooltip-id={'tooltip-' + rand}
        data-tooltip-content={tooltipText}
      >
        {children}
      </span>

      <Tooltip id={'tooltip-' + rand} {...options} place={place} />
    </>
  );
}
