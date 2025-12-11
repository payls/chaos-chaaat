import React, { useState, useEffect, useRef } from 'react';
import { h } from '../../../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFile } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import constant from '../../../constants/constant.json';
import CommonModalAttachment from '../../Common/CommonModalAttachment';

export default function ProjectMediaForm({
  projectMediaId,
  url,
  title,
  filename,
  type,
  units,
  unitsSelected,
  tags,
  onUpdate,
  onDelete,
  showTitle = true,
  showSelect = true,
  projectCurrencyCode,
  heroImageMediaId = '',
  setHeroImageMediaId = () => {},
}) {
  const [selectOptions, setSelectOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const deduplicateReducer = (prev, curr) => {
    if (!prev.includes(curr)) {
      prev.push(curr);
    }
    return prev;
  };

  const getImageTagOptions = () => {
    let imageTags = [];
    for (const tag in constant.PROPERTY.MEDIA.TAG) {
      // skipping on project tag, replaced with 'show on project level?' tickbox
      if (h.cmpStr(tag, constant.PROPERTY.MEDIA.TAG.PROJECT)) continue;
      let imageTagOption = {};
      imageTagOption.value = constant.PROPERTY.MEDIA.TAG[tag];
      imageTagOption.label = h.general.prettifyConstant(imageTagOption.value);
      imageTags.push(imageTagOption);
    }
    return imageTags;
  };

  const imageTagsOptions = getImageTagOptions();

  const handleShowOnProject = () => {
    let newTags;
    if (tags.includes(constant.PROPERTY.MEDIA.TAG.PROJECT)) {
      newTags = tags.filter(
        (tag) => tag !== constant.PROPERTY.MEDIA.TAG.PROJECT,
      );
    } else {
      newTags = [...tags, constant.PROPERTY.MEDIA.TAG.PROJECT];
    }

    onUpdate({
      projectMediaId,
      url,
      title,
      filename,
      type,
      unitsSelected,
      tags: newTags,
    });
  };

  const handleHeroImage = () => {
    let isHeroImage = false;
    if (h.cmpStr(heroImageMediaId, projectMediaId)) {
      setHeroImageMediaId('');
    } else {
      setHeroImageMediaId(projectMediaId);
      isHeroImage = true;
    }

    onUpdate({
      projectMediaId,
      url,
      title,
      filename,
      type,
      unitsSelected,
      tags,
      isHeroImage,
    });
  };

  useEffect(() => {
    const availableUnits = units.map((unit) => {
      const label = `#${unit.unit} | 
      ${unit.type ? unit.type + ' |' : ''}
      ${unit.beds || '-'} bed | 
      ${unit.baths || '-'} bath | 
      ${projectCurrencyCode} ${
        unit.price ? h.currency.format(unit.price) : '-'
      }`;
      return {
        value: unit.project_property_id,
        label,
        selected: h.notEmpty(unitsSelected)
          ? unitsSelected.find(
              (unitSelected) => unitSelected === unit.project_property_id,
            )
          : false,
      };
    });

    const selectAll = {
      value: 'select-all',
      label: 'All properties',
      isDisabled:
        availableUnits &&
        availableUnits.length > 0 &&
        unitsSelected &&
        availableUnits.length === unitsSelected.length,
    };
    availableUnits.splice(0, 0, selectAll);
    setSelectOptions(availableUnits);
  }, [units, unitsSelected]);

  const handleModal = () => {
    setShowModal(!showModal);
  };

  const changeLabel = (tag) => {
    if (tag === 'factsheet') {
      return 'Fact Sheet';
    }
    return h.general.prettifyConstant(tag);
  };

  return (
    <div className="mt-2 mb-4">
      <div className="row">
        <div className="col-12 col-sm-3">
          {type === constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE && (
            <>
              <img
                className="w-100"
                src={url}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setShowModal(true);
                }}
              />
              <CommonModalAttachment
                key={`modal-${projectMediaId}`}
                attachment={{ attachment_url: url, attachment_title: title }}
                show={showModal}
                handleModal={handleModal}
                downloadable={false}
              />
            </>
          )}
          {type === constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO && (
            <video className="w-100" controls>
              <source src={url} type="video/mp4" />
            </video>
          )}
          {(type === constant.UPLOAD.TYPE.PROJECT_MEDIA_RENDER_3D ||
            type === constant.UPLOAD.TYPE.PROJECT_MEDIA_YOUTUBE ||
            type === constant.UPLOAD.TYPE.PROJECT_MEDIA_VIMEO) && (
            <iframe
              src={url}
              className="w-100"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
          {type === constant.UPLOAD.TYPE.PROJECT_MEDIA_WISTIA && (
            <span>
              <iframe
                src={url}
                className="w-100"
                style={{ width: '100%' }}
                allowtransparency="true"
                frameborder="0"
                scrolling="no"
                class="wistia_embed"
                name="wistia_embed"
                allowfullscreen
                mozallowfullscreen
                webkitallowfullscreen
                oallowfullscreen
                msallowfullscreen
              ></iframe>
              <script
                src="//fast.wistia.net/assets/external/E-v1.js"
                async
              ></script>
            </span>
          )}
          {type === constant.UPLOAD.TYPE.PROJECT_BROCHURE && (
            <iframe src={url} className="w-100" />
          )}
          {type !== constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE &&
            type !== constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO &&
            type !== constant.UPLOAD.TYPE.PROJECT_BROCHURE &&
            type !== constant.UPLOAD.TYPE.PROJECT_MEDIA_YOUTUBE &&
            type !== constant.UPLOAD.TYPE.PROJECT_MEDIA_RENDER_3D &&
            type !== constant.UPLOAD.TYPE.PROJECT_MEDIA_VIMEO &&
            type !== constant.UPLOAD.TYPE.PROJECT_MEDIA_WISTIA && (
              <FontAwesomeIcon icon={faFile} size="4x" />
            )}
        </div>
        <div className="col-12 col-sm-9">
          <div
            className="text-danger"
            style={{
              cursor: 'pointer',
              position: 'absolute',
              right: '17px',
              top: '27px',
            }}
            onClick={() => {
              h.general.prompt(
                {
                  message: `Are you sure you want to delete this ${getPromptText(
                    type,
                  )}?`,
                },
                (status) => {
                  if (status)
                    onDelete({
                      projectMediaId,
                      url,
                      title: '',
                      filename,
                      type,
                    });
                },
              );
            }}
          >
            <FontAwesomeIcon icon={faTrash} />
            &nbsp;&nbsp;<small>Remove</small>
          </div>
          <small className="text-muted">Filename</small>
          <div>{filename}</div>
          {showTitle && <small className="text-muted">Title</small>}
          {showTitle && (
            <div>
              <input
                className="w-100"
                style={{
                  borderRadius: 4,
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: 'hsl(0, 0%, 80%)',
                  backgroundColor: 'hsl(0, 0%, 100%)',
                  minHeight: 38,
                  outline: 'none',
                  padding: '8px 10px 8px 10px',
                }}
                type="text"
                value={title}
                placeholder="Enter title"
                onChange={(e) => {
                  onUpdate({
                    projectMediaId,
                    url,
                    title: e.target.value,
                    filename,
                    type,
                    unitsSelected,
                    tags,
                  });
                }}
              />
            </div>
          )}
          {showSelect && (
            <small className="text-muted">
              Where would you like it displayed?
            </small>
          )}
          {showSelect && (
            <div>
              <Select
                value={
                  h.notEmpty(selectOptions)
                    ? selectOptions.filter(
                        (selectOption) => selectOption.selected,
                      )
                    : []
                }
                isMulti
                name="colors"
                options={selectOptions}
                closeMenuOnSelect={false}
                classNamePrefix="select"
                onChange={(inSelectedUnits) => {
                  onUpdate({
                    projectMediaId,
                    url,
                    title,
                    filename,
                    type,
                    unitsSelected: inSelectedUnits.find(
                      (selectedUnit) => selectedUnit.value === 'select-all',
                    )
                      ? selectOptions
                          .filter((option) => option.value !== 'select-all')
                          .map((option) => option.value)
                      : inSelectedUnits.map(
                          (inSelectedUnit) => inSelectedUnit.value,
                        ),
                    tags,
                  });
                }}
                placeholder="Select location"
              />
            </div>
          )}
          {type === constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE && (
            <>
              <small className="text-muted">Tags</small>
              <div>
                <Select
                  isMulti
                  options={imageTagsOptions}
                  value={
                    h.general.notEmpty(tags)
                      ? tags
                          .reduce(deduplicateReducer, [])
                          .filter(
                            (tag) =>
                              tag !== constant.PROPERTY.MEDIA.TAG.PROJECT,
                          )
                          .map((tag) => ({
                            label: changeLabel(tag),
                            value: tag,
                          }))
                      : []
                  }
                  closeMenuOnSelect={false}
                  classNamePrefix="select"
                  onChange={(e) => {
                    const tags = e.map((object) => object.value);
                    onUpdate({
                      projectMediaId,
                      url,
                      title,
                      filename,
                      type,
                      unitsSelected,
                      tags,
                    });
                  }}
                  placeholder="Select tags"
                  noOptionsMessage={() => 'All tags have been selected'}
                />
              </div>
            </>
          )}
          <div class="d-flex flex-wrap mb-3" style={{ gap: '2em' }}>
            {[
              constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE,
              constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO,
              constant.UPLOAD.TYPE.PROJECT_MEDIA_YOUTUBE,
              constant.UPLOAD.TYPE.PROJECT_MEDIA_RENDER_3D,
              constant.UPLOAD.TYPE.PROJECT_MEDIA_WISTIA,
              constant.UPLOAD.TYPE.PROJECT_MEDIA_VIMEO,
            ].includes(type) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '0.5em 0 0 0',
                }}
              >
                <label
                  style={{ margin: '0 0.5em 0 0' }}
                  class="cb-container-normal less-pl"
                >
                  Show on project level?
                  <input
                    style={{ width: '1.5em', height: '1.5em' }}
                    type="checkbox"
                    checked={tags.includes(constant.PROPERTY.MEDIA.TAG.PROJECT)}
                    onChange={handleShowOnProject}
                  />
                  <span class="checkmark"></span>
                </label>
              </div>
            )}

            {tags.includes(constant.PROPERTY.MEDIA.TAG.PROJECT) &&
              [constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE].includes(type) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '0.5em 0 0 0',
                  }}
                >
                  <label
                    style={{ margin: '0 0.5em 0 0' }}
                    class="cb-container-normal less-pl"
                  >
                    Show as hero image?
                    <input
                      style={{ width: '1.5em', height: '1.5em' }}
                      type="checkbox"
                      checked={h.cmpStr(heroImageMediaId, projectMediaId)}
                      onChange={handleHeroImage}
                    />
                    <span class="checkmark"></span>
                  </label>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

const getPromptText = (mediaType) => {
  switch (mediaType) {
    case constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE:
      return 'image';
    case constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO:
    case constant.UPLOAD.TYPE.PROJECT_MEDIA_YOUTUBE:
    case constant.UPLOAD.TYPE.PROJECT_MEDIA_WISTIA:
    case constant.UPLOAD.TYPE.PROJECT_MEDIA_VIMEO:
      return 'video';
    case constant.UPLOAD.TYPE.PROJECT_BROCHURE:
      return 'brochure';
    default:
      return mediaType;
  }
};
