import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { h } from '../../../../helpers';
import { api } from '../../../../api';
import constant from '../../../../constants/constant.json';
import moment from 'moment';

// CSS
import styles from '../styles/select-crm.module.scss';
import mainStyle from '../styles/styles.module.scss';
import templateStyle from '../styles/template-form.module.scss';

// UI
import ChevronDownSelect from '../../../FlowBuilder/Icons/ChevronDownSelect';
import Upload from '../../../FlowBuilder/Icons/Upload';

// COMPONENTS
import CommonSelect from '../../../Common/CommonSelect';
import TemplateBodyTextArea from '../../../../components/WhatsApp/TemplateBodyTextArea';
import TemplateBodyTextAreaEditView from '../../../../components/WhatsApp/TemplateBodyTextAreaEditView';
import TemplateButtons from './TemplateButtons';
import CommonToggle from '../../../Common/CommonToggle';

// STORE
import useSideBarStore from '../store';
import { getUpdatedNodeData } from '../store/functions';

export default React.memo((props) => {
  const {
    template_name: templateName,
    business_account,
    showCustomOption = true,
    existingTemplateData = null,
    nodeDataIndex,
    id,
    templateViewMethod,
    resetTemplateRef,
    resetTemplateData
  } = props;

  const { setTemplateDetails, nodeData, setNodeData, nodeDataBackup } = useSideBarStore();
  const headerImageRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [templateForm, setTemplateForm] = useState({});
  const [quick_replies, setQuickReplyBtns] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.quick_replies ?? [],
  );
  const [cta_btn, setCTABtns] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.cta_btn ?? [],
  );
  const [templateHeaderImage, setTemplateHeaderImage] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.templateHeaderImage ?? null,
  );
  const [templateButtons, setTemplateButtons] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.templateButtons ?? [],
  );
  const [isBodyWithVariable, setIsBodyWithVariable] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.isBodyWithVariable ?? false,
  );
  const [formattedBody, setFormattedBody] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.formattedBody ?? null,
  );
  const [body_variables, setBodyVariables] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.body_variables ?? {},
  );
  const [customSelected, setCustomSelected] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.customSelected ?? 'new-template',
  );
  const [uploadURL, setUploadURL] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.uploadURL ?? '',
  );
  const [image, setImage] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.image ?? null,
  );
  const [isLoading, setLoading] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.isLoading ?? false,
  );
  const [fieldEnabled, setFieldEnabled] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.fieldEnabled ?? false,
  );
  const [template_name, setTemplateName] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.template_name ?? '',
  );
  const [template_id, setTemplateId] = useState(
    nodeData[nodeDataIndex]?.data?.flowData?.template_id
  );

  function resetTemplate() {
    // @jevin, @payal this is temporary solution to clear custom.
    setTemplateId(null);
    setTemplateName('');
    setImage(null);
    setBodyVariables({});
    setCTABtns([]);
    setQuickReplyBtns([]);
    setFieldEnabled(true);
    setTemplateForm({})
    setTemplateDetails({})
  }

  useEffect(() => {
    if (resetTemplateRef) {
      resetTemplateRef.current = resetTemplate
    }
  },[resetTemplateRef])

  useEffect(() => {
    setTemplateDetails(templateForm);
  }, [templateForm]);

  useEffect(() => {
    const flowData = nodeData[nodeDataIndex]?.data?.flowData;
    if (flowData) {
      const exampleObj = nodeData[nodeDataIndex]?.data?.flowData?.body_variables;
      setBodyVariables(exampleObj);
      setIsBodyWithVariable(true);
      setFormattedBody(nodeData[nodeDataIndex]?.data?.flowData?.formattedBody);
      if (flowData.method === "custom") {
        setImage(nodeData[nodeDataIndex]?.data?.flowData?.image);
      } else {
        setImage(nodeData[nodeDataIndex]?.data?.flowData?.header_image);
      }
      setTemplateForm((e) => (
        h.general.unescapeData({
        ...e,
        template_name: templateName,
        business_account,
        template_category:
          nodeData[nodeDataIndex]?.data?.flowData?.template_category ?? null,
        template_language:
          nodeData[nodeDataIndex]?.data?.flowData?.template_language ?? null,
        template_body:
          nodeData[nodeDataIndex]?.data?.flowData?.template_body ?? null,
        quick_replies: nodeData[nodeDataIndex]?.data?.flowData?.quick_replies,
        body_variables: nodeData[nodeDataIndex]?.data?.flowData?.body_variables,
        body_variables_type: nodeData[nodeDataIndex]?.data?.flowData?.body_variables_type,
        cta_btn: nodeData[nodeDataIndex]?.data?.flowData?.cta_btn,
        template_button: nodeData[nodeDataIndex]?.data?.flowData?.template_button,
        header_image: nodeData[nodeDataIndex]?.data?.flowData?.header_image,
        template_id: nodeData[nodeDataIndex]?.data?.flowData?.template_id,
        image: nodeData[nodeDataIndex]?.data?.flowData?.image,
      })));
      if (existingTemplateData) {
        setEnableFields(existingTemplateData.value)
      }
      if(flowData.method === "custom") {
        setFieldEnabled(true)
      }
    }
  }, [nodeDataIndex, existingTemplateData]);

  function onChange(v, key) {
    setTemplateForm((prev) => ({ ...prev, [key]: v }));
    setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, key, v));
  }

  function updateFormatBody(newBody) {
    setFormattedBody(newBody);
    setNodeData(
      getUpdatedNodeData(nodeData, nodeDataIndex, 'formattedBody', newBody),
    );

    setIsBodyWithVariable(true);
    setNodeData(
      getUpdatedNodeData(nodeData, nodeDataIndex, 'isBodyWithVariable', true),
    );
  }

  function updateBodyVariables(newVariables) {
    setBodyVariables(newVariables);
    setNodeData(
      getUpdatedNodeData(
        nodeData,
        nodeDataIndex,
        'body_variables',
        newVariables,
      ),
    );
    setTemplateForm({
      ...templateForm,
      body_variables: newVariables
    })
  }

  function setEnableFields(form) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentDate = new Date();
    const currentUtcDate = new Date(
      currentDate.getTime() + currentDate.getTimezoneOffset() * 60000,
    );
    // Get the time zone offset in milliseconds
    const timeZoneOffsetMin = new Date().getTimezoneOffset();
    // Convert the offset to milliseconds
    const timeZoneOffsetMs = timeZoneOffsetMin * 60 * 1000;
    // Convert the UTC date and time to the local time zone
    const currentLocalDate = new Date(
      currentUtcDate.getTime() - timeZoneOffsetMs,
    );
    if (!h.isEmpty(form.last_edit_date)) {
      // Convert the msg created date to the local time zone
      const editDate = h.date.convertUTCDateToLocalDate(
        form.last_edit_date_raw,
        timeZone,
      );
      const date1 = new Date(currentLocalDate);
      const date2 = new Date(editDate);

      const timeDifference = date1 - date2;
      let hoursDifference = timeDifference / (1000 * 60 * 60);
      hoursDifference = Math.round(hoursDifference);

      if (hoursDifference >= 24) {
        setFieldEnabled(true);
      } else {
        setFieldEnabled(false);
      }
    } else {
      setFieldEnabled(true);
    }
  }

  /**
   * The `async function handleOnChangeFile(e)` is an asynchronous function that handles the file upload process when a file
   * input element's value changes. Here is a breakdown of what the function does:
   * Check file size - allowable size is 5mb
   *
   * @async
   * @function
   * @name handleOnChangeFile
   * @kind function
   * @memberof default.React.memo() callback
   * @param {any} e
   * @returns {Promise<void>}
   */
  async function handleOnChangeFile(e) {
    if (isLoading) {
      return;
    }
    const files = e.target.files;

    // Check file size (in bytes)
    const imageOrVideoSize = h.general.isImageOrVideo(files[0].name) === 'image' ? 5 : 16;
    let fileType = h.general.isImageOrVideo(files[0].name); 
    fileType = fileType.charAt(0).toUpperCase() + fileType.slice(1);
    const maxSizeInBytes = imageOrVideoSize * 1024 * 1024; // 5 MB in bytes
    if (files && files[0].size > maxSizeInBytes) {
      h.general.alert('error', {
        message: `${fileType} file size limit exceeds to ${imageOrVideoSize}MB`,
        autoCloseInSecs: 2,
      });
      headerImageRef.current.value = '';
      return;
    }

    setLoading(true);
    let uploadFiles = [...files];
    let newlyUploadFiles = [];
    if (h.notEmpty(uploadFiles)) {
      for (let i = 0; i < uploadFiles.length; i++) {
        const targetFile = uploadFiles[i];
        const formData = new FormData();
        formData.append('file', targetFile);
        const uploadResponse = await api.upload.upload(
          formData,
          constant.UPLOAD.TYPE.MESSAGE_MEDIA,
          false,
        );
        if (h.cmpStr(uploadResponse.status, 'ok')) {
          newlyUploadFiles.push({
            full_file_url: uploadResponse.data.file.full_file_url,
            file_url: uploadResponse.data.file.file_url,
            file_name: uploadResponse.data.file.file_name,
          });
        }
      }
    }
    if (!h.isEmpty(newlyUploadFiles)) {
      setUploadURL(newlyUploadFiles[0].full_file_url);
      setImage(newlyUploadFiles[0].full_file_url);

      setNodeData(
        getUpdatedNodeData(
          nodeData,
          nodeDataIndex,
          'uploadURL',
          newlyUploadFiles[0].full_file_url,
        ),
      );

      setNodeData(
        getUpdatedNodeData(
          nodeData,
          nodeDataIndex,
          h.general.isImageOrVideo(files[0].name),
          newlyUploadFiles[0].full_file_url,
        ),
      );
    } else {
      setUploadURL('');
      setImage(null);

      setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'uploadURL', ''));

      setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'image', null));
    }
    setLoading(false);
  }

  // Reset the file input if no file is selected
  function handleFileClick(e) {
    e.target.value = ''
  }

  function handleChangeCustomMethod(value) {
    setCustomSelected(value);
    setNodeData(
      getUpdatedNodeData(nodeData, nodeDataIndex, 'customSelected', value),
    );
    if (resetTemplateData && typeof resetTemplateData === "function") {
      resetTemplateData()
    }
  }

  function handleQuickButtonsUpdate(value) {
    setQuickReplyBtns(value);
    setNodeData(
      getUpdatedNodeData(nodeData, nodeDataIndex, 'quick_replies', value),
    );
  }

  function handleCTAUpdate(value) {
    setCTABtns(value);
    setNodeData(getUpdatedNodeData(nodeData, nodeDataIndex, 'cta_btn', value));
  }

  function formatTemplateName(name) {
    let newStr = name.replace(/_/g, ' ');
    
    return newStr.charAt(0).toUpperCase() + newStr.slice(1);
  }

  function handleOnTemplateNameChange(e) {
    const value = e.target.value.toLowerCase()
    let newStr = value.replace(/ /g, '_');
    setTemplateName(newStr);
    setNodeData(
      getUpdatedNodeData(nodeData, nodeDataIndex, 'template_name', newStr)
    );
  }

  return (
    <div className={templateStyle.templateForm}>
      {showCustomOption && (
        <div className="mb-3 mt-3">
          <CommonToggle
            onToggle={(e) => {
              handleChangeCustomMethod(e.value);
            }}
            options={[
              {
                title: 'New template',
                toggled:
                  nodeData[nodeDataIndex]?.data?.flowData?.customSelected ===
                    'new-template' ||
                  !nodeData[nodeDataIndex]?.data?.flowData?.customSelected,
                value: 'new-template',
              },
              {
                title: 'Simple text',
                toggled:
                  nodeData[nodeDataIndex]?.data?.flowData?.customSelected ===
                  'simple-text',
                value: 'simple-text',
              },
            ]}
          />
        </div>
      )}
      {customSelected === 'new-template' && (
        
        <div className={mainStyle.flowForm}>
          {
            templateViewMethod === 'custom' && (
              <div>
                <label>Template name</label>
                <div
                      className={` mb-3`}
                    >
                      <input
                        type="text"
                        className={`${mainStyle.templateBodyInput}`}
                        value={formatTemplateName(h.general.unescapeData(template_name))}
                        onChange={handleOnTemplateNameChange}
                      />
                    </div>
              </div>
            )
          }
          <label>Category</label>
          <CommonSelect
            id={`category`}
            options={[
              ...constant.WHATSAPP.CATEGORY.map((m) => ({
                value: m,
                label: Object.values(m),
              })),
            ]}
            value={templateForm.template_category}
            isSearchable={false}
            placeholder="Select category"
            className=" select-template mb-3"
            onChange={(v) => onChange(v, 'template_category')}
            iconComponent={<ChevronDownSelect />}
            disabled={!(fieldEnabled && templateViewMethod === 'custom')}
          />

          <label>Language</label>
          <CommonSelect
            id={`lang`}
            options={[
              ...constant.WHATSAPP.SUPPORTED_LANGUAGE.map((m) => ({
                value: m,
                label: Object.values(m),
              })),
            ]}
            value={templateForm.template_language}
            isSearchable={true}
            placeholder="Select language"
            className=" select-template mb-3"
            onChange={(v) => onChange(v, 'template_language')}
            iconComponent={<ChevronDownSelect />}
            disabled={!(fieldEnabled && templateViewMethod === 'custom')}
          />
          <label>Image/Video Header</label>
          <div className={`${templateStyle.templateFormMedia} mb-3 `}>
            <div
              onClick={() => {
                if (fieldEnabled && templateViewMethod === 'custom') {
                  headerImageRef.current.click();
                }
              }}
            >
              {h.isEmpty(image) && (
                <>
                  <Upload disabled={!(fieldEnabled && templateViewMethod === 'custom')} />
                  {(fieldEnabled && templateViewMethod === 'custom') && (
                    <span>
                      {!isLoading ? 'Upload media file' : 'Uploading media...'}
                    </span>
                  )}
                </>
              )}
              
              {h.notEmpty(image) && h.general.isImageOrVideo(image) === 'image' && (
                <>
                  <img
                    src={image}
                    alt="header image"
                    height={'100px'}
                    className={templateStyle.templateFormMediaImage}
                  />
                  {!(fieldEnabled && templateViewMethod === 'custom') && (
                    <span>
                      {!isLoading
                        ? 'Click to upload other media file'
                        : 'Uploading media...'}
                    </span>
                  )}
                </>
              )}

              {h.notEmpty(image) && h.general.isImageOrVideo(image) === 'video' && (
                <>
                  <video className={templateStyle.templateFormMediaImage} style={{ height: '90px', width: '100%' }} alt="video header" controls src={image}></video>
                  {!(fieldEnabled && templateViewMethod === 'custom') && (
                    <span>
                      {!isLoading
                        ? 'Click to upload other media file'
                        : 'Uploading media...'}
                    </span>
                  )}
                </>
              )}
            </div>
            <input
              type={'file'}
              id={'csvFileInput'}
              accept={'image/png,image/jpeg,image/jpg,video/mp4,video/3gp'}
              onChange={handleOnChangeFile}
              onClick={handleFileClick}
              ref={headerImageRef}
              style={{ display: 'none' }}
            />
          </div>
          <label>Body</label>
          <div className={`${templateStyle.bodyMessageWrapper} q-wrapper mb-3`}>
            <TemplateBodyTextAreaEditView
              onChange={onChange}
              form={templateForm}
              setTemplateForm={setTemplateForm}
              formattedBody={formattedBody}
              callbackForUpdateBody={updateFormatBody}
              callbackForUpdateVariables={updateBodyVariables}
              className={`${mainStyle.templateBodyTextArea} mb-3`}
              disabled={!(fieldEnabled && templateViewMethod === 'custom')}
              nodeDataIndex={nodeDataIndex}
              moduleType="automation"
            />
          </div>

          <TemplateButtons
            form={templateForm}
            quickBtnCallback={handleQuickButtonsUpdate}
            ctaBtnCallback={handleCTAUpdate}
            disabled={!(fieldEnabled && templateViewMethod === 'custom')}
            nodeDataIndex={nodeDataIndex}
            existingTemplateData={existingTemplateData}
            templateViewMethod={templateViewMethod}
            id={id}
          />

          {selected?.value?.status === 'DRAFT' && (
            <button
              type="button"
              className={`${mainStyle.gradientBtn} `}
              onClick={() => {}}
            >
              <span>Confirm</span>
            </button>
          )}
        </div>
      )}
      {customSelected === 'simple-text' && (
        <div className={mainStyle.flowForm}>
          <label>Message</label>
          <textarea
            value={templateForm?.template_body ?? ''}
            className={`${mainStyle.templateBodyTextArea} mb-3`}
            onChange={({ target }) => {
              onChange(target?.value, "template_body");
              setNodeData(
                getUpdatedNodeData(
                  nodeData,
                  nodeDataIndex,
                  "formattedBody",
                  target?.value
                )
              );
            }}
          />
        </div>
      )}
    </div>
  );
});
