import React, { useRef, useState } from 'react';
import { h } from '../../helpers';
import CommonTooltip from '../../../../../Common/CommonTooltip';
// Components
import CommonExpandCollapse from '../Common/CommonExpandCollapse';

// UI
import IconShowVector from '../Icons/IconShowVector';
import IconHideVector from '../Icons/IconHideVector';

export default function ToolbarSet(props) {
  const { title, body, hidden, setSetting, customStyle } = props;

  const toolRef = useRef();
  const [hovered, setHovered] = useState(false);
  return (
    <div className="pos-rlt">
      <div
        className="toolbar-set-wrapper"
        onMouseOver={() => {
          if (toolRef) {
            toolRef.current.classList.add('active');
            setHovered(true);
          }
        }}
        onMouseLeave={() => {
          if (toolRef) {
            toolRef.current.classList.remove('active');
            setHovered(false);
          }
        }}
        ref={toolRef}
      >
        {hovered && (
          <CommonTooltip tooltipText={!hidden ? 'Info Hidden' : 'Info Visible'}>
            <span
              className="toolbar-set-item visibility-toggle"
              onClick={() => {
                setSetting(!hidden);
              }}
            >
              {!hidden ? (
                <IconHideVector width="26px" height="26px" className="pt-1" />
              ) : (
                <IconShowVector width="30px" height="30px" />
              )}
            </span>
          </CommonTooltip>
        )}
        <CommonExpandCollapse
          customStyle={customStyle}
          title={title}
          body={body}
          hidden={!hidden}
        ></CommonExpandCollapse>
      </div>
    </div>
  );
}
