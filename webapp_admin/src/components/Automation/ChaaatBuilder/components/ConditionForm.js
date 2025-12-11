import React, { useMemo, useState, useEffect } from 'react';
import { h } from '../../../../helpers';
import styles from '../styles/styles.module.scss';

// COMPONENTS
import ChevronDownSelect from '../../../FlowBuilder/Icons/ChevronDownSelect';
import CommonSelect from '../../../Common/CommonSelect';
import ConditionField from './ConditionField';

// UI
import CirclePlus from '../../../FlowBuilder/Icons/CirclePlus';

export default React.memo((props = {}) => {
  const {
    onAddNodeCallback,
    node: { id, data },
    elements,
    onSaveData = () => {},
  } = props;
  const [form, setForm] = useState(
    props?.node?.data?.flowData?.conditonal_array ?? [],
  );

  const getConditionCount = (id, elements) => {
    const totalConditions = elements.filter((ele) => ele?.source === id)
    return totalConditions.length
  }
  
  const [conditionCount, setConditionCount] = useState(
    getConditionCount(id, elements)
  );

  useEffect(() => {
    onSaveData('conditonal_array', form);
  }, [form]);

  /**
   * Represents the extra conditions for the ChaaatBuilder component.
   * @type {React.ReactNode[]}
   */
  const extraConditions = useMemo(() => {
    const el = [];
    for (let i = 0; i < conditionCount; i++) {
      el.push(
        <div key={i}>
          <div className="d-flex justify-content-center ">
            <button
              type="button"
              className={`${styles.orLabel} mb-3`}
              style={{ display: i === 0 ? 'none' : 'block' }}
            >
              <span>Or</span>
            </button>
          </div>
          <ConditionField
            index={i}
            onSave={handleSaveCondition}
            data={form[i]?.data}
          />
        </div>,
      );
    }

    return el;
  }, [conditionCount, form]);

  /**
   * The function `handleSaveCondition` updates or adds a condition in a form based on the index
   * provided.
   * @param conditionalform - form data of condition object
   * @param index - condition index number
   */
  function handleSaveCondition(conditionalform, index) {
    const f = Array.from(form);

    const fIndex = f.findIndex((ff) => ff.index === index);

    if (fIndex === -1) {
      // Push new condition
      f.push({ index, data: conditionalform });
    } else {
      // Update exsiting condition
      f[fIndex].data = conditionalform;
    }

    setForm(f);
  }

  /**
   * Add new condition option
   */
  function handleAddCondition() {
    setConditionCount((prev) => prev + 1);
    handleAddBranchNode();
  }

  /**
   * Add new condition branch node to workflow
   */
  function handleAddBranchNode() {
    const source = elements.find((f) => f.source === id);

    onAddNodeCallback({
      id: source.id,
      type: 'conditionLabel',
      endOfConditionNodeId: data.endOfConditionNodeId,
    });
  }

  return (
    <div className={styles.sidebarWrapperBodySection}>
      {extraConditions}

      <div className={`${styles.helperText} mb-3`}>
        Moment a condition is fulfilled other conditions won't run
      </div>

      <button
        type="button"
        className={`${styles.sidebarWrapperBodySectionLink} ${styles.sidebarWrapperBodySectionLinkM} mb-3 `}
        onClick={handleAddCondition}
      >
        <span>
          <CirclePlus style={{ marginRight: '10px' }} /> Add condition
        </span>
      </button>
    </div>
  );
});
