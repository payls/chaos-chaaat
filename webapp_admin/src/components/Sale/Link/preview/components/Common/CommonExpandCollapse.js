import React, { useState } from 'react';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconChevronDownVector from '../Icons/IconChevronDownVector';
import IconChevronUpVector from '../Icons/IconChevronUpVector';

export default function CommonExpandCollapse(props) {
  const { title, body, hidden, customStyle } = props;

  const [showContent, setShowContent] = useState(false);
  return (
    <div
      className="common-expand-collapse-container"
      style={{ ...customStyle?.projectInfo.separator }}
      onClick={() => {
        setShowContent(!showContent);
      }}
    >
      <div
        className="common-expand-collapse-title"
        style={{ color: customStyle?.projectInfo.title }}
      >
        <span className={hidden ? 'blur' : ''}>{title}</span>
        <span>
          {showContent ? (
            <IconChevronUpVector
              fillColor={customStyle?.projectInfo?.chevron}
            />
          ) : (
            <IconChevronDownVector
              fillColor={customStyle?.projectInfo?.chevron}
            />
          )}
        </span>
      </div>
      <div
        className="common-expand-collapse-content"
        style={{
          display: showContent ? 'block' : 'none',
          color: customStyle?.projectInfo.content,
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: body,
          }}
        ></div>
      </div>
    </div>
  );
}
