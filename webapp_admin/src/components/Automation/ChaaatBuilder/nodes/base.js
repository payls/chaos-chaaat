/* eslint-disable default-case */
import * as colors from "@contactlab/ds-tokens/constants/colors";
import { useCallback, useState } from "react";

import IconStartNode from "../../../Icons/automationIcons/IconStartNode";
import IconTrash from "../../../Icons/automationIcons/IconTrash";
import IconMessaging from "../../../Icons/automationIcons/IconMessaging";
import IconBooking from "../../../Icons/automationIcons/IconBooking";
import IconCreateReminder from "../../../Icons/automationIcons/IconCreateReminder";
import IconCondition from "../../../Icons/automationIcons/IconCondition";
import IconEndNode from "../../../Icons/automationIcons/IconEndNode";
import styles from "../builder.module.scss";

import useSideBarStore from "../store";
import { showDeleteBtn } from "./functions";
import InfoRed from "../../../FlowBuilder/Icons/InfoRed";
import { h } from "../../../../helpers";

/**
 * BaseNode component represents a base node in the ChaaatBuilder.
 *
 * @param {Object} props - The props for the BaseNode component.
 * @param {string} props.type - The type of the node.
 * @param {Object} props.data - The data associated with the node.
 * @param {boolean} props.selected - Indicates whether the node is selected.
 * @param {boolean} props.disabled - Indicates whether the node is disabled.
 * @param {Function} props.onNodeClick - The callback function for when the node is clicked.
 * @param {Function} props.onCloseIconClick - The callback function for when the close icon is clicked.
 * @param {string} props.additionalClassName - Additional CSS class name for the node.
 * @returns {JSX.Element} The rendered BaseNode component.
 */
export const BaseNode = (props) => {
  const {
    type,
    data,
    selected,
    disabled,
    onNodeClick,
    onCloseIconClick,
    additionalClassName,
  } = props;
  const approved = isApproved(data, type)
  const content = (
    <>
      <div className={styles.NodeContent}>
        <div>
          <div className={styles.NodeTitleBar}>
            <span className={`${styles.NodeIcon} ${!approved ? styles.NodeNotApproved : ""}`}>{getIconSrc(type)}</span>
            <div className={styles.NodeTitle}>{data.title}</div>
          </div>
          <p className={styles.NodeDesc}>{data.description}</p>
        </div>
        {!approved && (
          <div className={styles.NodeNotApprovedIndicator}>
            <InfoRed />
            <div className={styles.NodeNotApprovedIndicatorLabel}>
              not approved
            </div>
          </div>
        )}
      </div>
    </>
  );
  return (
    <div
      data-selected={selected}
      aria-disabled={disabled}
      className={`${styles.NodeInnerWrapper} ${additionalClassName} ${!approved ? styles.NodeNotApproved : ""}`}
      // {...(onNodeClick && { onClick: () => onNodeClick(type, data) })}
    >
      {content}
      {type !== "source" && type !== "end" && (
        <span className={styles.closeIcon} onClick={onCloseIconClick}>
          <IconTrash />
        </span>
      )}
    </div>
  );
};

/**
 * Renders an empty base node.
 * @component
 * @returns {JSX.Element} The rendered empty base node.
 */
export const EmptyBaseNode = ({}) => {
  return <div className={styles.EmptyNodeInnerWrapper}></div>;
};

/**
 * Renders a conditional label node.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.data - The data for the node.
 * @param {Function} props.onCloseIconClick - The callback function for when the close icon is clicked.
 * @returns {JSX.Element} The rendered component.
 */
export const ConditionalLabelNode = ({ data, onCloseIconClick }) => {
  const { nodeData } = useSideBarStore();

  /**
   * Determines if the condition can be deleted.
   *
   * @function
   * @name canDelete
   * @memberof ConditionalLabelNode
   * @returns {boolean} Returns true if the condition can be deleted, otherwise false.
   */
  const canDelete = useCallback(() => {
    return showDeleteBtn(nodeData, data.parent);
  }, [nodeData, data.parent]);

  return (
    <div className={styles.ConditionalLabelWrapper}>
      {data?.title}
      {canDelete() && (
        <span className={styles.closeIcon} onClick={onCloseIconClick}>
          <IconTrash />
        </span>
      )}
    </div>
  );
};

/**
 * Get the color based on the given type.
 * @param {string} type - The type of the node.
 * @returns {string} The color associated with the type.
 */
export const getColor = (type) => {
  const colorMap = {
    source: colors.success,
    message: colors.accent,
    booking: colors.accent,
    waitThenCheck: colors.warning,
    end: colors.base,
  };

  return colorMap[type] || colors.base;
};

/**
 * Retrieves the source icon component based on the given type.
 * @param {string} type - The type of the icon.
 * @param {object} options - Additional options for the icon component.
 * @returns {JSX.Element|null} The icon component or null if the type is not found.
 */
export const getIconSrc = (type, options = {}) => {
  const color = getColor(type);
  const iconMap = {
    source: IconStartNode,
    message: IconMessaging,
    booking: IconBooking,
    reminder: IconCreateReminder,
    waitThenCheck: IconCondition,
    end: IconEndNode,
  };

  const IconComponent = iconMap[type];
  return IconComponent ? (
    <IconComponent style={{ color }} {...options} />
  ) : null;
};

export const isApproved = (nodeData, type) => {
  if (["source", "end", "waitThenCheck", "reminder"].includes(type)) {
    return true;
  }
  if (h.cmpStr(type, "message")) {
    if (
      h.cmpStr(nodeData?.flowData?.method, "custom") &&
      !h.cmpStr(nodeData?.flowData?.status, "APPROVED") &&
      !h.cmpStr(nodeData?.flowData?.customSelected, "simple-text")
    ) {
      return false;
    } else {
      return true;
    }
  }
  if (
    h.cmpStr(type, "booking") &&
    h.cmpStr(nodeData?.flowData?.status, "published")
  ) {
    return true;
  }
  return false;
};