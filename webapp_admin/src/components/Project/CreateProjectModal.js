import {
  faPhoneAlt,
  faTimes,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useMemo, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';
import CommonTable from '../Common/CommonTable';
import { Card } from 'react-bootstrap';
import IconOrangeInternet from '../Icons/IconOrangeInternet';
import IconOrangeInstagram from '../Icons/IconOrangeInstagram';
import IconOrangeLinkedin from '../Icons/IconOrangeLinkedin';
import { config } from '../../configs/config';
import constant from '../../constants/constant.json';

export default function CreateProjectModal(props) {
  const router = useRouter();

  const { onCloseModal, setLoading, formMode } = props;

  const [formStep, setFormStep] = useState(1);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'unset');
  }, []);

  const formFields = {
    name: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Name',
    },
    description: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Description',
    },
    currency_code: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 modal-input-group`,
      label: 'Currency Code',
      options: Object.values(constant.CURRENCY.CODE).map((obj) => ({
        value: obj,
        text: obj.toUpperCase(),
      })),
    },
    location_address_1: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Location Address 1',
    },
    location_address_2: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Location Address 2',
    },
    location_address_3: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Location Address 3',
    },
    location_latitude: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Location Latitude',
    },
    location_longitude: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Location Longitude',
    },
    location_google_map_url: {
      field_type: h.form.FIELD_TYPE.TEXT,
      class_name: `col-12 modal-input-group`,
      label: 'Location Google Map Url',
    },
    status: {
      field_type: h.form.FIELD_TYPE.SELECT,
      class_name: `col-12 modal-input-group`,
      label: 'Status',
      options: Object.values(constant.PROJECT.STATUS).map((obj) => ({
        value: obj,
        text: obj.toUpperCase(),
      })),
    },
  };

  const [fields, setFields] = useState(h.form.initFields(formFields));
  const [propertyForms, setPropertyForms] = useState([]);

  const closeModal = async () => {
    await router.push(h.getRoute(routes.dashboard.products), undefined, {
      shallow: true,
    });
    onCloseModal();
  };

  const addNewPropertyForm = () => {
    if (propertyForms.length === 0) {
      setPropertyForms([{}]);
    } else {
      setPropertyForms([...propertyForms, {}]);
    }
  };

  const removePropertyForm = (formIndex) => {
    return setPropertyForms(
      propertyForms.filter((form, index) => {
        if (index === formIndex) {
          return null;
        }

        return form;
      }),
    );
  };

  const setPropertyFormFields = (fields, formIndex) => {
    return setPropertyForms(
      propertyForms.map((form, index) => {
        if (index === formIndex) {
          return fields;
        }

        return form;
      }),
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    let createdProjectId;

    const createProject = async () => {
      let formData = {};
      formData.name = fields.name.value;
      formData.description = fields.description.value;
      formData.location_address_1 = fields.location_address_1.value;
      formData.location_address_2 = fields.location_address_2.value;
      formData.location_address_3 = fields.location_address_3.value;
      formData.location_latitude = Number(fields.location_latitude.value);
      formData.location_longitude = Number(fields.location_longitude.value);
      formData.location_google_map_url = fields.location_google_map_url.value;
      formData.status = fields.status.value;

      const apiRes = await api.project.create(formData);
      createdProjectId = apiRes.data.project_id;
    };

    const createProperty = async (propertyForm) => {
      let formData = {};
      formData.project_id = createdProjectId;
      formData.unit_type = propertyForm.unit_type.value;
      formData.unit_number = Number(propertyForm.unit_number.value);
      formData.floor = propertyForm.floor.value;
      formData.sqm = Number(propertyForm.sqm.value);
      formData.number_of_bedroom = Number(propertyForm.number_of_bedroom.value);
      formData.number_of_bathroom = Number(
        propertyForm.number_of_bathroom.value,
      );
      formData.number_of_parking_lots =
        propertyForm.number_of_parking_lots.value;
      formData.direction_facing = propertyForm.direction_facing.value;
      formData.currency_code = propertyForm.currency_code.value;
      formData.starting_price = Number(propertyForm.starting_price.value);
      formData.weekly_rent = Number(propertyForm.weekly_rent.value);
      formData.rental_yield = Number(propertyForm.rental_yield.value);
      formData.status = propertyForm.status.value;

      const apiRes = await api.property.create(formData);
      createdProjectId = apiRes.data.project_id;
    };

    await createProject();

    for (const propertyForm of propertyForms) {
      await createProperty(propertyForm);
    }

    setLoading(false);
  };

  const fourthStepTableColumns = useMemo(
    () => [
      {
        Header: 'Unit',
        accessor: '',
        filter: 'text',
        Cell: ({ row: { original } }) => {
          return <span>{original.unit}</span>;
        },
      },
      {
        Header: 'Type',
        accessor: '',
        filter: 'text',
        Cell: ({ row: { original } }) => {
          return <span>{original.type}</span>;
        },
      },
      {
        Header: 'Price',
        accessor: '',
        Cell: ({ row: { original } }) => {
          return <span>{original.price}</span>;
        },
      },
      {
        Header: 'Size',
        accessor: '',
        Cell: ({ row: { original } }) => {
          return <span>{original.size}</span>;
        },
      },
      {
        Header: 'Beds',
        accessor: '',
        Cell: ({ row: { original } }) => {
          return <span>{original.beds}</span>;
        },
      },
      {
        Header: 'Baths',
        accessor: '',
        Cell: ({ row: { original } }) => {
          return <span>{original.baths}</span>;
        },
      },
      {
        Header: 'Direction',
        accessor: '',
        Cell: ({ row: { original } }) => {
          return <span>{original.direction}</span>;
        },
      },
    ],
    [],
  );

  const fourthStepTableData = [
    {
      unit: '1603',
      type: 'A01',
      price: '100,000',
      size: '80',
      beds: '2',
      baths: '2',
      direction: 'West',
    },
  ];

  return (
    <div
      className="modal-root"
      style={{ overflowY: 'unset' }}
      onClick={() => closeModal}
    >
      <div
        className="modal-container"
        style={{ height: '90%', marginTop: 10 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span>Create Project</span>
          <button onClick={closeModal}>
            <FontAwesomeIcon icon={faTimes} color="#fff" size="sm" />
          </button>
        </div>

        <div className="form-steps">
          {[1, 2, 3, 4, 5].map((step) => (
            <div className="step">
              <button
                className={step === formStep ? 'selected' : ''}
                onClick={() => setFormStep(step)}
              >
                {step}
              </button>
            </div>
          ))}
        </div>

        {formStep === 1 && (
          <>
            <div
              className="modal-body"
              style={{ overflowY: 'auto', height: '100%' }}
            >
              <div>
                <h3>Developer</h3>
                <div className="modal-input-group">
                  <label>Name</label>
                  <input placeholder="Name" />
                </div>
                <div className="modal-input-group">
                  <label>Description</label>
                  <input placeholder="Description" />
                </div>
                <button className="common-button">
                  <FontAwesomeIcon icon={faUpload} size="2x" />
                </button>
              </div>

              <div className="mt-4">
                <h3>Development</h3>
                <div className="modal-input-group">
                  <label>Name</label>
                  <input placeholder="Name" />
                </div>
                <div className="modal-input-group">
                  <label>Description</label>
                  <input placeholder="Description" />
                </div>
                <button className="common-button">
                  <FontAwesomeIcon icon={faUpload} size="2x" />
                </button>
              </div>

              <div className="mt-4">
                <h3>Architect</h3>
                <div className="modal-input-group">
                  <label>Name</label>
                  <input placeholder="Name" />
                </div>
                <div className="modal-input-group">
                  <label>Description</label>
                  <input placeholder="Description" />
                </div>
                <button className="common-button">
                  <FontAwesomeIcon icon={faUpload} size="2x" />
                </button>
              </div>

              <div className="mt-4">
                <h3>Builder</h3>
                <div className="modal-input-group">
                  <label>Name</label>
                  <input placeholder="Name" />
                </div>
                <div className="modal-input-group">
                  <label>Description</label>
                  <input placeholder="Description" />
                </div>
                <button className="common-button">
                  <FontAwesomeIcon icon={faUpload} size="2x" />
                </button>

                <div className="modal-input-group mt-4">
                  <label>Google Maps URL</label>
                  <input placeholder="Google Maps URL" />
                </div>

                <iframe
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/search?q=Google%2C%20Amphitheatre%20Parkway%2C%20Mountain%20View%2C%20California%2C%20USA&key=${config.google.apiKey}`}
                ></iframe>
              </div>
            </div>
            <div className="modal-footer mt-4">
              <button
                className="common-button transparent-bg"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="common-button"
                onClick={() => setFormStep(formStep + 1)}
              >
                Next Step
              </button>
            </div>
          </>
        )}

        {formStep === 2 && (
          <>
            <div
              className="modal-body"
              style={{ overflowY: 'auto', height: '100%' }}
            >
              <div>
                <h3>Images</h3>
                <button className="common-button">
                  <FontAwesomeIcon icon={faUpload} size="2x" />
                </button>
                <div className="uploaded-files">
                  <div className="uploaded-file">
                    <div>
                      <img src="" />
                      <span>Filename.jpg</span>
                      <span>Image Title</span>
                    </div>
                    <button>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3>Videos files</h3>
                <button className="common-button">
                  <FontAwesomeIcon icon={faUpload} size="2x" />
                </button>
                <div className="uploaded-files">
                  <div className="uploaded-file">
                    <div>
                      <img src="" />
                      <span>Filename.jpg</span>
                      <span>Image Title</span>
                    </div>
                    <button>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="modal-input-group">
                  <label>YouTube</label>
                  <input placeholder="YouTube URL" />
                </div>
              </div>

              <div className="mt-4">
                <h3>E-Brochure</h3>
                <button className="common-button">
                  <FontAwesomeIcon icon={faUpload} size="2x" />
                </button>
                <div className="uploaded-files">
                  <div className="uploaded-file">
                    <div>
                      <img src="" />
                      <span>Filename.jpg</span>
                      <span>Image Title</span>
                    </div>
                    <button>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer mt-4">
              <button
                className="common-button transparent-bg"
                onClick={() => setFormStep(formStep - 1)}
              >
                Prev Step
              </button>
              <button
                className="common-button"
                onClick={() => setFormStep(formStep + 1)}
              >
                Next Step
              </button>
            </div>
          </>
        )}

        {formStep === 3 && (
          <>
            <div
              className="modal-body"
              style={{ overflowY: 'auto', height: '100%' }}
            >
              <div className="modal-radio-input-group">
                <input type="radio" />
                <label>Swimming pool</label>
              </div>
              <div className="modal-radio-input-group">
                <input type="radio" />
                <label>Co-working space</label>
              </div>
            </div>
            <div className="modal-footer mt-4">
              <button
                className="common-button transparent-bg"
                onClick={() => setFormStep(formStep - 1)}
              >
                Prev Step
              </button>
              <button
                className="common-button"
                onClick={() => setFormStep(formStep + 1)}
              >
                Next Step
              </button>
            </div>
          </>
        )}

        {formStep === 4 && (
          <>
            <div
              className="modal-body"
              style={{ overflowY: 'auto', height: '100%' }}
            >
              <div className="d-flex align-items-center">
                <div
                  style={{ marginBottom: 0 }}
                  className="modal-input-group mr-2"
                >
                  <label style={{ margin: 0 }}></label>
                  <input type="text" />
                </div>
                <button className="common-button">Go</button>
              </div>

              <div className="mt-4">
                <CommonTable
                  columns={fourthStepTableColumns}
                  data={fourthStepTableData}
                />
              </div>
            </div>
            <div className="modal-footer mt-4">
              <button
                className="common-button transparent-bg"
                onClick={() => setFormStep(formStep - 1)}
              >
                Prev Step
              </button>
              <button
                className="common-button"
                onClick={() => setFormStep(formStep + 1)}
              >
                Next Step
              </button>
            </div>
          </>
        )}

        {formStep === 5 && (
          <>
            <div
              className="modal-body"
              style={{ overflowY: 'auto', height: '100%' }}
            >
              <img src="" />
              <p>Good Afternoon Mr Contact Surname</p>

              <p>
                Please find below an overview of our Project name located in
                Project city location
              </p>

              <p>
                Please go ahead and have a look through and let us know if you
                have any questions in the comments section below, one of of
                consultants will respond right away.
              </p>

              <Card
                className="col-12 mt-3"
                style={{
                  borderColor: '',
                  borderRadius: '10px',
                  lineHeight: 1.5,
                }}
              >
                <Card.Body>
                  <Card.Title className="pb-3">
                    About Sample Real Estate Agency
                  </Card.Title>

                  <div className="d-flex flex-row">
                    <div className="mr-2">
                      <img src={''} width="150px" />
                      <div className="d-block d-sm-none d-none d-sm-block d-md-none mt-2">
                        <div className="d-flex flex-column">
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 'bold',
                              color: '#404040',
                            }}
                          >
                            Sample Name
                          </span>
                        </div>
                        <div
                          className="d-flex flex-column align-items-center"
                          style={{ maxWidth: 600 }}
                        >
                          <p
                            className="mt-4 text-left"
                            style={{ color: '#1c1c1c', fontSize: 12 }}
                          >
                            Description
                          </p>
                        </div>
                      </div>
                      <div className="d-flex flex-column mt-3">
                        <div
                          style={{ marginTop: 5 }}
                          className="d-flex flex-row align-items-center mb-2"
                        >
                          <FontAwesomeIcon
                            style={{ width: 12 }}
                            icon={faPhoneAlt}
                            color={'#F2C4AB'}
                            className="mr-2"
                          />{' '}
                          <a
                            href={`tel:000000000`}
                            style={{ color: '#4285F4' }}
                          >
                            000000000
                          </a>
                        </div>
                        <div className="d-flex flex-row align-items-center mb-2">
                          <IconOrangeInternet className="mr-2" />{' '}
                          <a
                            href="#"
                            target="_blank"
                            style={{ color: '#4285F4' }}
                          >
                            website.com
                          </a>
                        </div>
                        <div className="d-flex flex-row align-items-center mb-2">
                          <IconOrangeInstagram className="mr-2" />{' '}
                          <a
                            href="#"
                            target="_blank"
                            style={{ color: '#4285F4' }}
                          >
                            @username
                          </a>
                        </div>
                        <div className="d-flex flex-row align-items-center">
                          <IconOrangeLinkedin className="mr-2" />{' '}
                          <a
                            href="#"
                            target="_blank"
                            style={{ color: '#4285F4' }}
                          >
                            Sample Name
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="pl-3 pr-3 d-none d-lg-block d-none d-md-block d-lg-none d-xl-none d-none d-xl-block">
                      <div className="d-flex flex-column">
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#404040',
                          }}
                        >
                          Sample Name
                        </span>
                      </div>

                      <div
                        className="d-flex flex-column align-items-center"
                        style={{ maxWidth: 600 }}
                      >
                        <p
                          className="mt-4 text-left"
                          style={{ color: '#1c1c1c', fontSize: 12 }}
                        >
                          Description
                        </p>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="modal-footer mt-4">
              <div style={{ flex: 1 }} />
              <button className="common-button" onClick={onCloseModal}>
                Return to project list
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
