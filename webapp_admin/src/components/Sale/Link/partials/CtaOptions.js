import React, { useState, useEffect, useMem, useCallback } from 'react';
import { cloneDeep } from 'lodash';
import { h } from '../preview/helpers';
import { api } from '../preview/api';
import Toggle from 'react-toggle';
import CtaOptionContent from './CtaOptionContent';

export default function CtaOptions({
  agency,
  ctaOptions,
  setCtaOptions,
  templates,
  setTemplates,
  setLoading,
  index,
  componentIndex,
  buttonIndex,
  button,
  openCtaOptions,
}) {
  const handleCTAOption = async (index, componentIndex, buttonIndex) => {
    const temp_templates = cloneDeep(templates);
    setLoading(true);
    const trigger_option = openCtaOptions ? !openCtaOptions : true;
    temp_templates[index].components[componentIndex].buttons[
      buttonIndex
    ].show_cta11 = trigger_option;
    await setTemplates(temp_templates);
    setLoading(false);
  };

  return (
    <>
      <div
        className="col-md-12  mt-3"
        style={{ display: h.cmpInt(buttonIndex, 0) ? 'block' : 'none' }}
      >
        <label className="whatsapp-toggle d-flex align-items-center">
          <Toggle
            icons={false}
            defaultChecked={false}
            className="whatsapp-toggle"
            onClick={() => handleCTAOption(index, componentIndex, buttonIndex)}
          />
          <h3 className="modal-sub-title-item mt-2">Enable Additional CTAs</h3>
        </label>
        {h.cmpBool(openCtaOptions, true) ? (
          <>
            <CtaOptionContent
              agency={agency}
              templates={templates}
              setTemplates={setTemplates}
              setLoading={setLoading}
              index={index}
              componentIndex={componentIndex}
              buttonIndex={buttonIndex}
            ></CtaOptionContent>
          </>
        ) : (
          ''
        )}
      </div>
    </>
  );
}
