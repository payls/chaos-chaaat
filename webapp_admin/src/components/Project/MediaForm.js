import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../api';
import { h } from '../../helpers';
import constant from '../../constants/constant.json';

export default function MediaForm({ onChangeFields }) {
  const imageUploadInputRef = useRef();

  const [mediaType, setMediaType] = useState('youtube');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  useEffect(() => {
    onChangeFields({ mediaType, uploadedImageUrl, mediaUrl });
  }, [mediaType, uploadedImageUrl, mediaUrl]);

  const handleImageUpload = () => {
    imageUploadInputRef.current.click();
  };

  const handleFilePickerChange = async (e) => {
    let uploadFiles = [...e.target.files];
    if (h.notEmpty(uploadFiles)) {
      const targetFile = uploadFiles[0];
      const formData = new FormData();
      formData.append('file', targetFile);
      const uploadResponse = await api.upload.upload(
        formData,
        constant.UPLOAD.TYPE.PROJECT_PROPERTY_MEDIA_IMAGE,
        false,
      );
      if (h.cmpStr(uploadResponse.status, 'ok')) {
        setUploadedImageUrl(uploadResponse.data.file.full_file_url);
      }
    }
  };

  return (
    <div className="mt-4">
      <div className="col-12 modal-input-group">
        <label>Media Type</label>
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
        >
          <option value="youtube">YouTube</option>
          <option value="image">Image</option>
        </select>
      </div>

      {mediaType === 'youtube' && (
        <div className="col-12 modal-input-group">
          <label>YouTube URL</label>
          <input
            placeholder="YouTube URL"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />
        </div>
      )}

      {mediaType === 'image' && (
        <div className="col-12">
          <button className="common-button mb-4" onClick={handleImageUpload}>
            Upload Image
          </button>
        </div>
      )}

      <input
        ref={imageUploadInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFilePickerChange}
      />
    </div>
  );
}
