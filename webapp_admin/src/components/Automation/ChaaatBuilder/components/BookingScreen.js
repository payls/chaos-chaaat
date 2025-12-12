import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { h } from '../../../../helpers';
import mainStyle from '../styles/styles.module.scss';
import moment from 'moment';
import { unescapeData } from '../../../../helpers/general';

// COMPONENTS
import CommonSelect from '../../../Common/CommonSelect';
import ChevronDownSelect from '../../../FlowBuilder/Icons/ChevronDownSelect';
import Confirm from './Confirm';
import CommonCheckboxToggle from '../../../Common/CommonCheckboxToggle';

// UI
import Trash from '../../../FlowBuilder/Icons/Trash';
import CirclePlus from '../../../FlowBuilder/Icons/CirclePlus';
import ChevronLeft from '../../../FlowBuilder/Icons/ChevronLeft';
import ChevronRight from '../../../FlowBuilder/Icons/ChevronRight';
import InfoRed from '../../../FlowBuilder/Icons/InfoRed';
import CTAButton from './CTAButton';
import AddElement from './AddElement';

// STORE
import useSideBarStore from '../store';
import { getUpdatedNodeData } from '../store/functions';

const SCREEN_MAX_LIMIT = 3;

export default React.memo((props) => {
  const { nodeDataIndex, storedNodeData, isPublished } = props;
  const {
    setBookingMode,
    crm,
    screens,
    setScreens,
    currentScreenIndex,
    setCurrentScreenIndex,
    bookingOption,
  } = useSideBarStore();

  const [elem,SetElem] = useState([]);
  const [maxField,setMaxField] = useState(0);

  useEffect(() => {
    // check and fix.
    console.log("useEffect", screens)
    if (h.notEmpty(crm)) {

      const screenElements = screens[currentScreenIndex].elements;
      if(screenElements && screenElements.length > 0) {
        updateElements(screenElements);
      } else {
        updateElements([]);
      }
    }
  }, [crm, currentScreenIndex,screens]);

  const isRequired = (ele) => {
    const screenTwoFields = ["date", "duration", "select_time"]
    if (bookingOption !== "custom" && screenTwoFields.includes(ele.name)) {
      return true;
    }
    if (crm && crm.key === "GOOGLE" && ["phone"].includes(ele.name)) {
      return true
    }
    if (crm && crm.key === "OUTLOOK" && ["email"].includes(ele.name)) {
      return true
    }
    return false
  }

  const updateElements = (screenElements) => {
    const elements = [];
      unescapeData(screenElements)
      .map((element, i) => {
        switch (element.type) {
          case 'text':
            elements.push(
              <div className={`${mainStyle.templateBodyInputWrapper} mb-3`}>
                <input
                  type="text"
                  className={`${mainStyle.templateBodyInput}`}
                  value={element.value}
                  onChange={(e) => onChange(e.target.value, element.name)}
                  disabled={true}
                  placeholder={element.placeholder}
                  name={element.name}
                />
                {isRequired(element) ? (
                  <InfoRed />
                ) : (
                  <Confirm
                    onConfirm={() => handleRemoveField(element.name)}
                    icon={<Trash />}
                    message={`Are you sure you want to 
                    delete this field?`}
                    confirmLabel={`Delete`}
                    disabled={isPublished}
                  />
                )}
              </div>,
            );
            break;
          case 'dropdown':
            elements.push(
              <div className={`${mainStyle.templateBodyInputWrapper} mb-3`}>
                <input
                  type="dropdown"
                  className={`${mainStyle.templateBodyInput}`}
                  value={element.value}
                  onChange={(e) => onChange(e.target.value, element.name)}
                  disabled={true}
                  placeholder={element.placeholder}
                  name={element.name}
                />
                {isRequired(element) ? (
                  <InfoRed />
                ) : (
                  <Confirm
                    onConfirm={() => handleRemoveField(element.name)}
                    icon={<Trash />}
                    message={`Are you sure you want to 
                    delete this field?`}
                    confirmLabel={`Delete`}
                    disabled={isPublished}
                  />
                )}
              </div>,
            );
            break;
          case 'textarea':
            elements.push(
              <div className={`${mainStyle.templateBodyInputWrapper} mb-3`}>
                <textarea
                  className={`${mainStyle.templateBodyTextArea}`}
                  placeholder={element.placeholder}
                  value={element.value}
                  onChange={(e) => onChange(e.target.value, element.name)}
                  disabled={true}
                />
                {isRequired(element) ? (
                  <InfoRed />
                ) : (
                  <Confirm
                    onConfirm={() => handleRemoveField(element.name)}
                    icon={<Trash />}
                    message={`Are you sure you want to 
                    delete this field?`}
                    confirmLabel={`Delete`}
                    disabled={isPublished}
                  />
                )}
              </div>,
            );
            break;
          default:
            break;
        }
      });
    SetElem(elements);
    let fieldCount = 0;
    screens.forEach((screen) => {
      screen?.elements.forEach((key) => {
        fieldCount++;
      });
    })
    setMaxField(fieldCount)
  }

  console.log("maxFieldCount", maxField)

  /**
   * Moves to the next screen in the booking process.
   */
  function nextScreen() {
    const screenCount = screens.length;
    if (screenCount - 1 === currentScreenIndex) {
      return;
    }
    setCurrentScreenIndex(currentScreenIndex + 1);
  }

  /**
   * Go to the previous screen.
   */
  function prevScreen() {
    if (currentScreenIndex === 0) {
      return;
    }
    setCurrentScreenIndex(currentScreenIndex - 1);
  }

  /**
   * Adds a new screen to the screens array.
   * If the maximum limit of screens has been reached, the function does nothing.
   */
  function addScreen() {
    if (screens.length === SCREEN_MAX_LIMIT) {
      return;
    }
    setScreens([
      ...screens,
      {
        title: 'Step ' + (screens.length + 1),
        elements: [],
      },
    ]);
    setCurrentScreenIndex(screens.length);
  }

  /**
   * Updates the CTA label for a specific screen.
   *
   * @param {string} label - The new CTA label.
   * @param {number} i - The index of the screen to update.
   */
  function handleUpdateCTA(label, i) {
    const s = [...screens];
    s[i].cta_label = label;

    setScreens(s);
  }

  /**
   * Adds an element to the current screen.
   *
   * @param {Object} el - The element to be added.
   */
  function handleAddElement(el) {
    console.log("el", el)
    const s = [...screens];
    s[currentScreenIndex].elements.push({ ...el, value: el.value, name: el.name });
    setScreens(s);
    updateElements(s[currentScreenIndex]?.elements);
  }

  /**
   * Removes a field of the specified type from the current screen.
   *
   * @param {string} fieldType - The type of field to be removed.
   */
  function handleRemoveField(name) {
    const s = [...screens];
    const index = s[currentScreenIndex]?.elements.findIndex((f) => f.name === name);
    s[currentScreenIndex]?.elements.splice(index, 1);
    updateElements(s[currentScreenIndex]?.elements);
    console.log("ddd",s)
    setScreens(s);
    console.log(screens)
  }

  /**
   * Handles the change event for a specific field type.
   * @param {Event} e - The change event object.
   * @param {string} fieldType - The type of the field being changed.
   */
  function onChange(e, name) {
    const s = [...screens];
    const elements = s[currentScreenIndex]?.elements;

    const index = elements.findIndex((f) => f.name === name);
    elements[index].value = e;

    s[currentScreenIndex].elements = elements;

    setScreens(s);
  }

  /**
   * Checks if the current screen is the last screen.
   * @returns {boolean} - True if the current screen is the last screen, false otherwise.
   */
  const isScreenEnd = useMemo(() => {
    return currentScreenIndex === screens.length - 1;
  }, [currentScreenIndex]);

  /**
   * Checks if the current screen is the first screen.
   * @returns {boolean} - True if the current screen is the first screen, false otherwise.
   */
  const isScreenStart = useMemo(() => {
    return currentScreenIndex === 0;
  }, [currentScreenIndex]);

  /**
   * Checks if the maximum limit of screens has been reached.
   * @returns {boolean} - True if the maximum limit of screens has been reached, false otherwise.
   */
  const isMaxLimit = useMemo(() => {
    return screens.length === SCREEN_MAX_LIMIT;
  }, [screens]);

  return (
    <>
      <div className={mainStyle.sidebarWrapperBodySection}>
        <label>{screens[currentScreenIndex].title}</label>
        {elem.map((t) => t)}

        {/* <div className="mb-3">
          <CommonCheckboxToggle
            onToggle={() => {}}
            title="Expose this field to others"
          />
        </div> */}

        <AddElement
          currentScreenIndex={currentScreenIndex}
          onAdd={handleAddElement}
          screens={screens}
          selectedCrm={crm?.key}
          disabled={isPublished}
          bookingOption={bookingOption}
        />
        <CTAButton
          currentScreenIndex={currentScreenIndex}
          screens={unescapeData(screens)}
          onUpdate={handleUpdateCTA}
          disabled={isPublished}
        />
        <div className={mainStyle.arrowsScreenWrapper}>
          <span>{isScreenStart ? '' : `Screen ${currentScreenIndex}`}</span>

          <ChevronLeft
            onClick={prevScreen}
            fillOpacity={isScreenStart ? '0.5' : '1'}
            style={{ pointerEvents: isScreenStart ? 'none' : 'auto' }}
          />
          <ChevronRight
            onClick={nextScreen}
            fillOpacity={isScreenEnd ? '0.5' : '1'}
            style={{ pointerEvents: isScreenEnd ? 'none' : 'auto' }}
          />
          <span>{isScreenEnd ? '' : `Screen ${currentScreenIndex + 2}`}</span>
        </div>
        {
          bookingOption === 'custom' && <button
            type="button"
            className={`${mainStyle.sidebarWrapperBodySectionLink} ${mainStyle.sidebarWrapperBodySectionLinkM} mb-3 `}
            onClick={addScreen}
            disabled={isMaxLimit || maxField == 7 || isPublished}
          >
            <span>
              <CirclePlus style={{ marginRight: '10px' }} /> Add screen
            </span>
          </button>
        }
        
        <div
          className={mainStyle.arrowsScreenPrev}
          onClick={() => {
            setBookingMode(false);
            setCurrentScreenIndex(0);
          }}
        >
          <ChevronLeft />
          <span>Previous</span>
        </div>
      </div>
    </>
  );
});
