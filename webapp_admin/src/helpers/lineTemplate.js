import { h } from './index';

export function handleBasicTemplateFormData(
  form,
  template_components,
  sourceUrl,
  sourceThumbnail,
  quickReplyBtns,
) {
  if (!h.isEmpty(form.template_header) && form.template_header !== 'none') {
    template_components.push({
      type: form.template_header,
      originalContentUrl: sourceUrl,
      previewImageUrl: sourceThumbnail,
    });
  }

  const text_content = {
    type: 'text',
    text: form.template_body,
  };

  const nonEmptyQRs = quickReplyBtns.filter((item) => item.value !== '');

  const quickReplyItems = [];
  if (nonEmptyQRs.length > 0) {
    quickReplyBtns.forEach((item) => {
      if (item.value !== '') {
        quickReplyItems.push({
          type: 'action',
          action: {
            type: 'message',
            label: item.value,
            text: item.value,
          },
        });
      }
    });
    if (quickReplyItems.length > 0) {
      text_content.quickReply = {
        items: quickReplyItems,
      };
    }
  }
  template_components.push(text_content);

  return template_components;
}

export function handleConfirmTemplateFormData(
  form,
  template_components,
  quickReplyBtns,
) {
  const confirm_content = {
    type: 'confirm',
    text: form.template_body,
    actions: [],
  };

  const nonEmptyQRs = quickReplyBtns.filter((item) => item.value !== '');

  if (nonEmptyQRs.length > 0) {
    const quickReplies = [];
    quickReplyBtns.forEach((item) => {
      if (item.value !== '') {
        quickReplies.push({
          type: 'message',
          label: item.value,
          text: item.value,
        });
      }
    });
    if (quickReplies.length > 0) {
      confirm_content.actions = quickReplies;
    }
  }
  template_components.template = confirm_content;

  return template_components;
}

export function handleButtonTemplateFormData(
  form,
  template_components,
  sourceUrl,
  sourceThumbnail,
  quickReplyBtns,
) {
  const confirm_content = {
    type: 'confirm',
    text: form.template_body,
    type: 'buttons',
    thumbnailImageUrl: sourceUrl,
    imageAspectRatio: 'rectangle',
    imageSize: 'cover',
    imageBackgroundColor: '#FFFFFF',
    text: form.template_body,
    actions: [],
  };

  if (!h.isEmpty(form.header_title)) {
    confirm_content.title = form.header_title;
  }

  if (!h.isEmpty(form.redirection_url)) {
    confirm_content.defaultAction = {
      type: 'uri',
      label: 'View details',
      uri: form.redirection_url,
    };
  }

  const nonEmptyQRs = quickReplyBtns.filter((item) => item.value !== '');

  if (nonEmptyQRs.length > 0) {
    const quickReplies = [];
    quickReplyBtns.forEach((item) => {
      let action_data = {};
      const actionType = item.action.value;
      if (actionType && actionType.LINK) {
        action_data = {
          type: 'uri',
          label: item.value,
          uri: item.action_value,
          option_type: item.action,
        };
      } else if (actionType && actionType.PHONE) {
        action_data = {
          type: 'uri',
          label: item.value,
          uri: 'tel:' + item.action_value,
          option_type: item.action,
        };
      } else {
        action_data = {
          type: 'message',
          label: item.value,
          text: !h.isEmpty(item.action_value) ? item.action_value : item.value,
          option_type: item.action,
        };
      }
      quickReplies.push(action_data);
    });
    if (quickReplies.length > 0) {
      confirm_content.actions = quickReplies;
    }
  }
  template_components.template = confirm_content;

  return template_components;
}
