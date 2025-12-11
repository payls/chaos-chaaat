import React, { useState, useEffect, useMem, useCallback } from 'react';
import { cloneDeep } from 'lodash';
import { h } from '../preview/helpers';
import { api } from '../../../../api';
import Toggle from 'react-toggle';

export default function CtaOptions({
  agency,
  templates,
  setTemplates,
  setLoading,
  index,
  componentIndex,
  buttonIndex,
}) {
  const [additionalCTA, setAdditionalCTA] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const ctas = [];
      const availableCTAs = await api.agency.getAvailableAdditionalCTAs(
        { agency_id: agency.agency_id },
        false,
      );
      const fetchCTAs = availableCTAs.data.additional_cta;
      fetchCTAs.map((cta, i) => {
        const cta_id = cta.campaign_additional_cta_id;
        const cta_name = cta.cta_name;
        let cta_1 = [];
        let cta_2 = [];
        let final = '';
        if (!h.isEmpty(cta.cta_1)) {
          cta_1 = JSON.parse(cta.cta_1);
        }
        if (!h.isEmpty(cta.cta_2)) {
          cta_2 = JSON.parse(cta.cta_2);
        }
        if (!h.isEmpty(cta.final_response_body)) {
          final = cta.final;
        }
        ctas.push({
          cta_id: cta_id,
          cta_name: cta_name,
          cta_1: cta_1,
          cta_2: cta_2,
          final: final,
        });
      });
      setAdditionalCTA(ctas);
      setLoading(false);
    })();
  }, [agency, setLoading]);

  const handleSelectedAdditionalCTA = async (
    index,
    componentIndex,
    buttonIndex,
    event,
  ) => {
    const temp_templates = cloneDeep(templates);
    setLoading(true);
    temp_templates[index].components[componentIndex].buttons[
      buttonIndex
    ].selected_additional_cta = event.target.value;
    await setTemplates(temp_templates);
    setLoading(false);
  };

  return (
    <>
      <div className="modal-input-group mt-3">
        <label>Selected Additional CTA*</label>
        <select
          onChange={() =>
            handleSelectedAdditionalCTA(
              index,
              componentIndex,
              buttonIndex,
              event,
            )
          }
        >
          <option value="">Select CTA to use</option>
          {additionalCTA.map((additional, addIndex) => {
            return (
              <option value={additional.cta_id}>{additional.cta_name}</option>
            );
          })}
        </select>
      </div>
    </>
  );
}
