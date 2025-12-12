import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import ProjectMediaForm from './ProjectMediaForm';
import { h } from '../../../helpers';
import { api } from '../../../api';
import { useDropzone } from 'react-dropzone';
import constant from '../../../constants/constant.json';
import { Dashboard } from '@uppy/react';

const paveCommon = { config: { constant } };
export default function ProjectWizardMediaUpload(props) {
  const {
    title = 'Medias',
    hintText = '(Only media files will be accepted)',
    mediaType, // constant.UPLOAD.TYPE
    acceptedFileTypes, // ['image/png, image/gif, image/jpeg']
    projectMedias, // Current medias in project
    setProjectMedias, // setState function for current medias in project
    setDeleteProjectMedias, // setState function to add project medias for deletion
    projectProperties, // Current project's properties
    projectCurrencyCode,
    projectMediasImagesUppy,
    projectMediasEbrochuresUppy,
    maxFilesAllowed = 0,
    setLoading = () => {}, // Enable/disable loading spinner
    heroImageMediaId = '',
    setHeroImageMediaId = () => {},
  } = props;

  /**
   * Determines whether there are any existing media file already uploaded
   * @returns {boolean}
   */
  const hasExistingFile = () => {
    return (
      projectMedias &&
      projectMedias.length > 0 &&
      projectMedias.find((projectMedia) => projectMedia.type === mediaType)
    );
  };

  /**
   * Button upload
   */
  const uploadInputRef = useRef();
  const handleUpload = () => {
    uploadInputRef.current.click();
  };
  const handleFilePickerChange = async (e) => {
    setLoading(true);
    let filesToUpload = [...e.target.files];
    if (h.notEmpty(filesToUpload)) {
      const uploadedFiles = await uploadFiles(filesToUpload, mediaType);
      setProjectMedias((projectMedias) => [...projectMedias, ...uploadedFiles]);
    }
    setLoading(false);
  };

  /**
   * Drag and drop upload
   */
  const onDrop = useCallback((acceptedFiles) => {
    if (h.notEmpty(acceptedFiles)) {
      (async () => {
        setLoading(true);
        const uploadedFiles = await uploadFiles(acceptedFiles, mediaType);
        setProjectMedias((projectMedias) => [
          ...projectMedias,
          ...uploadedFiles,
        ]);
        setLoading(false);
      })();
    }
  }, []);
  const mediaDragAndDrop = useDropzone({
    accept: acceptedFileTypes,
    onDrop,
  });

  return (
    <div>
      <h3>{title}</h3>
      {mediaType ===
        paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE && (
        <Dashboard
          uppy={projectMediasImagesUppy}
          className="mb-3"
          width="100%"
          height="400px"
          showProgressDetails={true}
          proudlyDisplayPoweredByUppy={false}
        />
      )}

      {mediaType ===
        paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_VIDEO && (
        <Dashboard
          uppy={projectMediasImagesUppy}
          className="mb-3"
          width="100%"
          height="400px"
          showProgressDetails={true}
          proudlyDisplayPoweredByUppy={false}
        />
      )}

      {mediaType ===
        paveCommon.config.constant.UPLOAD.TYPE.PROJECT_BROCHURE && (
        <Dashboard
          uppy={projectMediasEbrochuresUppy}
          className="mb-3"
          width="100%"
          height="400px"
          showProgressDetails={true}
          proudlyDisplayPoweredByUppy={false}
          locale={{
            strings: {
              dropPasteFiles: 'Drop file here or %{browseFiles}',
              browseFiles: 'browse file',
            },
          }}
        />
      )}

      {(!mediaType ===
        paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE ||
        !mediaType ===
          paveCommon.config.constant.UPLOAD.TYPE.PROJECT_BROCHURE) &&
        !(maxFilesAllowed === 1 && hasExistingFile()) && (
          <>
            <div
              {...mediaDragAndDrop.getRootProps({
                className: 'dropzone mb-2',
                maxFiles: maxFilesAllowed,
              })}
            >
              <input
                {...mediaDragAndDrop.getInputProps({
                  multiple: maxFilesAllowed === 1 ? false : true,
                })}
              />
              {mediaDragAndDrop.isDragActive ? (
                <p>Drop the file{maxFilesAllowed === 1 ? '' : 's'} here ...</p>
              ) : (
                <p>
                  Drag and drop some file{maxFilesAllowed === 1 ? '' : 's'}{' '}
                  here, or click to select file
                  {maxFilesAllowed === 1 ? '' : 's'}
                </p>
              )}
              <em>({hintText})</em>
            </div>

            <button className="common-button" onClick={handleUpload}>
              <FontAwesomeIcon icon={faUpload} size="2x" />
            </button>
            <input
              ref={uploadInputRef}
              type="file"
              multiple={maxFilesAllowed === 1 ? false : true}
              accept={acceptedFileTypes}
              style={{ display: 'none' }}
              onChange={(e) =>
                handleFilePickerChange(e, 'project_medias_images')
              }
            />
          </>
        )}

      <div>
        <ReactSortable list={projectMedias} setList={setProjectMedias} swap>
          {projectMedias
            .filter((media) => media.type === mediaType)
            .map((media) => (
              <ProjectMediaForm
                key={media.display_order}
                projectMediaId={media.project_media_id}
                url={media.url}
                title={media.title}
                filename={media.filename}
                type={media.type}
                projectCurrencyCode={projectCurrencyCode}
                onUpdate={(updated) => {
                  setProjectMedias((projectMedias) =>
                    projectMedias.map((i) => {
                      if (
                        updated.projectMediaId &&
                        i.project_media_id === updated.projectMediaId
                      ) {
                        // This is for existing media in project
                        return {
                          ...i,
                          title: updated.title,
                          unitsSelected: updated.unitsSelected,
                          tags: updated.tags,
                        };
                      } else if (
                        // This is for new media that hasn't been saved in project yet
                        !updated.projectMediaId &&
                        i.url === updated.url &&
                        i.type === updated.type
                      ) {
                        return {
                          ...i,
                          title: updated.title,
                          unitsSelected: updated.unitsSelected,
                          tags: updated.tags,
                        };
                      } else {
                        return { ...i };
                      }
                    }),
                  );
                }}
                onDelete={(deleted) => {
                  setProjectMedias((projectMedias) => {
                    if (deleted.projectMediaId) {
                      // This is existing media in project
                      return projectMedias.filter(
                        (projectMedia) =>
                          projectMedia.project_media_id !==
                          deleted.projectMediaId,
                      );
                    } else {
                      // This is new media that hasn't been saved into project yet
                      const deletedIndex = projectMedias.findIndex(
                        (projectMedia) =>
                          projectMedia.type === mediaType &&
                          projectMedia.url === deleted.url,
                      );
                      if (deletedIndex > -1) {
                        projectMedias.splice(deletedIndex, 1);
                      }
                      return projectMedias;
                    }
                  });
                  setDeleteProjectMedias((deleteProjectMedias) => [
                    ...deleteProjectMedias,
                    ...projectMedias.filter(
                      (projectMedia) =>
                        projectMedia.project_media_id ===
                        deleted.projectMediaId,
                    ),
                  ]);
                }}
                units={projectProperties}
                unitsSelected={media.unitsSelected}
                tags={media.tags}
                heroImageMediaId={heroImageMediaId}
                setHeroImageMediaId={setHeroImageMediaId}
              />
            ))}
        </ReactSortable>
      </div>
    </div>
  );
}

const uploadFiles = async (files, mediaType) => {
  const uploadResponses = await Promise.all(
    files.map((targetFile) => {
      // eslint-disable-next-line no-undef
      const formData = new FormData();
      formData.append('file', targetFile);
      return api.upload.upload(formData, mediaType, false);
    }),
  );
  let additionalUploadedFiles = [];
  const uploadedFiles = uploadResponses
    .filter((uploadResponse) => uploadResponse.status === 'ok')
    .map((uploadResponse) => {
      if (
        uploadResponse.data.additional_files &&
        uploadResponse.data.additional_files.length > 0
      ) {
        additionalUploadedFiles = [
          ...additionalUploadedFiles,
          ...uploadResponse.data.additional_files.map((file) => {
            return {
              url: file.full_file_url,
              filename: file.file_name,
              type: paveCommon.config.constant.UPLOAD.TYPE.PROJECT_MEDIA_IMAGE,
              tags: [paveCommon.config.constant.PROPERTY.MEDIA.TAG.BROCHURE],
            };
          }),
        ];
      }
      return {
        url: uploadResponse.data.file.full_file_url,
        filename: uploadResponse.data.file.file_name,
        type: mediaType,
        tags: [],
      };
    });
  return [...uploadedFiles, ...additionalUploadedFiles];
};
