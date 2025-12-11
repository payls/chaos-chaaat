import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconBlackCross from '../../components/Icons/IconBlackCross';
import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';

export default function CreateSaleModal(props) {
  const router = useRouter();

  const { onCloseModal, setLoading, contactId, formMode } = props;
  const [projects, setProjects] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedContact, setSelectedContact] = useState();
  const [projectList, setProjectList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [unitList, setUnitList] = useState([]);

  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    // Retrieve project list
    (async () => {
      if (h.cmpStr(formMode, h.form.FORM_MODE.EDIT)) {
        const selectedContactRes = await api.contact.findById(
          { contact_id: contactId },
          {},
          false,
        );
        setSelectedContact(selectedContactRes.data.contact);
      }

      let projectApiRes = await api.project.contentFindAll({}, {}, false);
      if (h.cmpStr(projectApiRes.status, 'ok')) {
        if (
          projectApiRes.data.projects &&
          projectApiRes.data.projects.length > 0
        ) {
          let projects = handleProjectOptionList(projectApiRes.data.projects);
          setProjects(projectApiRes.data.projects);
          setProjectList(projects);
        }
      }

      if (h.cmpStr(formMode, h.form.FORM_MODE.ADD)) {
        let contactApiRes = await api.contact.findAll({}, {}, false);
        if (h.cmpStr(contactApiRes.status, 'ok')) {
          if (
            contactApiRes.data.contacts &&
            contactApiRes.data.contacts.length > 0
          ) {
            let contacts = handleContactOptionList(contactApiRes.data.contacts);
            setContactList(contacts);
          }
        }
      }
    })();

    return () => (document.body.style.overflow = 'unset');
  }, []);

  useEffect(() => {
    (async () => {
      if (selectedContact) {
        let projectApiRes = await api.project.contentFindAll({}, {}, false);
        if (h.cmpStr(projectApiRes.status, 'ok')) {
          if (
            projectApiRes.data.projects &&
            projectApiRes.data.projects.length > 0
          ) {
            handleProjectOptionList(projectApiRes.data.projects);
          }
        }

        handleContactOptionList([]);
        handleUnitOptionList([]);
      }
    })();
  }, [selectedContact]);

  const formFields = {
    contact_id: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 modal-input-group`,
      label: 'Contact',
      value: contactId,
      options: contactList,
    },
    project_id: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 modal-input-group`,
      label: 'Project',
      options: projectList,
    },
    unit_id: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 modal-input-group`,
      label: 'Unit',
      options: unitList,
    },
  };
  const [fields, setFields] = useState(h.form.initFields(formFields));

  useEffect(() => {
    let selectedProject = projects.find(
      (project) => project.project_id === String(fields.project_id.value),
    );
    if (selectedProject) {
      selectedProject.project_properties.forEach((p) => {
        p.currency_code = selectedProject.currency_code;
      });
      setUnits(selectedProject.project_properties);
      setUnitList(handleUnitOptionList(selectedProject.project_properties));
      if (
        !selectedProjects.find(
          (project) => project.project_id === selectedProject.project_id,
        )
      ) {
        setSelectedProjects([...selectedProjects, selectedProject]);
      }
    }
  }, [fields.project_id]);

  useEffect(() => {
    const selectedUnit = units.find(
      (unit) => unit.project_property_id === String(fields.unit_id.value),
    );
    if (selectedUnit) {
      if (
        !selectedUnits.find(
          (unit) =>
            unit.project_property_id === selectedUnit.project_property_id,
        )
      ) {
        setSelectedUnits([...selectedUnits, selectedUnit]);
      }
    }
  }, [fields.unit_id]);

  const handleProjectOptionList = (projects) => {
    let options = [{ text: 'Select project', value: '' }];

    projects.forEach((project) => {
      let details = {};
      details.value = project.project_id;
      details.text = project.name;
      options.push(details);
    });

    if (selectedContact) {
      setProjects(projects);

      setProjectList(options);

      if (
        !h.isEmpty(selectedContact.shortlisted_properties) &&
        !h.isEmpty(selectedContact.shortlisted_properties[0]) &&
        !h.isEmpty(selectedContact.shortlisted_properties[0].unit) &&
        !h.isEmpty(selectedContact.shortlisted_properties[0].unit.project) &&
        !h.isEmpty(
          selectedContact.shortlisted_properties[0].unit.project.project_id,
        )
      ) {
        setFields({
          ...fields,
          project_id: {
            ...fields.project_id,
            value: String(
              selectedContact.shortlisted_properties[0].unit.project.project_id,
            ),
          },
        });
      }
    }

    return options;
  };

  const handleContactOptionList = (contacts) => {
    let options = [{ text: 'Select contact', value: '' }];

    if (selectedContact) {
      options.push({
        value: contactId,
        text: `${h.user.formatFullName(selectedContact)}`,
      });
      setContactList(options);
    }

    contacts.forEach((contact) => {
      if (
        h.isEmpty(contact.permalink) &&
        h.notEmpty(contact.agency_fk) &&
        h.notEmpty(contact.agency_user_fk)
      ) {
        let details = {};
        details.value = contact.contact_id;
        details.text = `${h.user.formatFullName(contact)}`;
        options.push(details);
      }
    });
    return options;
  };

  const handleUnitOptionList = (units) => {
    let options = [{ text: 'Select unit', value: '' }];

    if (selectedContact) {
      let tempSelectedUnits = [];
      selectedContact.shortlisted_properties.map((property) => {
        if (property) {
          tempSelectedUnits.push({
            ...property,
            project_property_id: property.project_property_fk,
          });
        }
      });
      setSelectedUnits(tempSelectedUnits);
    }

    units.forEach((unit) => {
      let details = {};
      details.value = unit.project_property_id;
      details.text = `#${unit.unit_number} | ${unit.number_of_bedroom} bed | ${
        unit.number_of_bathroom
      } bath | ${h.currency.format(unit.starting_price)} ${unit.currency_code}`;
      options.push(details);
    });
    return options;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    let formData = {};
    formData.contact_id = fields.contact_id.value;
    formData.autogenerate_permalink = true;

    formData.unit_ids = selectedUnits.map((selectedUnit) => {
      return selectedUnit.project_property_id;
    });

    if (h.cmpStr(formMode, h.form.FORM_MODE.ADD)) {
      const apiRes = await api.contactLink.create(formData);
      if (h.cmpStr(apiRes.status, 'ok')) {
        await closeModal();
      }
    } else {
      const apiRes = await api.contactLink.update(formData);
      if (h.cmpStr(apiRes.status, 'ok')) {
        await closeModal();
      }
    }

    setLoading(false);
  };

  const closeModal = async () => {
    await router.push(h.getRoute(routes.dashboard.sales), undefined, {
      shallow: true,
    });
    onCloseModal();
  };

  const unselectProject = (project_id) => {
    setSelectedProjects(
      selectedProjects.filter((project) => project.project_id !== project_id),
    );
  };

  const unselectUnit = (unit_id) => {
    setSelectedUnits(
      selectedUnits.filter((unit) => unit.project_property_id !== unit_id),
    );
  };

  const isSubmitButtonActive =
    !h.isEmpty(fields.contact_id.value) &&
    selectedProjects.length > 0 &&
    selectedUnits.length > 0;

  return (
    <div className="modal-root" onClick={() => closeModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span>{h.isEmpty(contactId) ? 'Add' : 'Edit'} Link</span>
          <button onClick={closeModal}>
            <FontAwesomeIcon icon={faTimes} color="#fff" size="sm" />
          </button>
        </div>
        <div className="modal-body contact-modal-body">
          <span>Start by selecting contacts, projects, units, etc.</span>
          <h.form.GenericForm
            className="text-left"
            formFields={formFields}
            formMode={h.form.FORM_MODE.ADD}
            setLoading={setLoading}
            fields={fields}
            setFields={setFields}
            showCancelButton={false}
            showSubmitButton={false}
          />
          <ul className="list-group">
            <span>Selected projects:</span>
            {selectedProjects.map((project) => (
              <li className="list-group-item">
                <span>{project.name}</span>
                <button
                  className="btn ml-2"
                  onClick={() => unselectProject(project.project_id)}
                >
                  <IconBlackCross style={{ height: 16 }} />
                </button>
              </li>
            ))}
          </ul>
          <ul className="list-group mt-4">
            <span>Selected units:</span>
            {selectedUnits.map((unit) => {
              let tempUnit = null;
              if (unit && unit.unit && unit.unit.unit)
                tempUnit = unit.unit.unit;
              else if (unit && unit.unit) tempUnit = unit.unit;
              else if (unit) tempUnit = unit;
              return (
                <li className="list-group-item">
                  {h.notEmpty(tempUnit) && (
                    <span>
                      #{tempUnit.unit_number || 0} |{' '}
                      {tempUnit.number_of_bedroom || 0} bed |{' '}
                      {tempUnit.number_of_bathroom || 0} bath |{' '}
                      {h.currency.format(tempUnit.starting_price)}{' '}
                      {tempUnit.currency_code}
                    </span>
                  )}
                  <button
                    className="btn ml-2"
                    onClick={() => unselectUnit(unit.project_property_id)}
                  >
                    <IconBlackCross style={{ height: 16 }} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="modal-footer mt-4">
          <button className="common-button transparent-bg" onClick={closeModal}>
            Cancel
          </button>
          <button
            className="common-button"
            style={{ cursor: isSubmitButtonActive ? 'pointer' : 'default' }}
            onClick={isSubmitButtonActive && handleSubmit}
          >
            {h.cmpStr(formMode, h.form.FORM_MODE.ADD) ? 'Create' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
}
