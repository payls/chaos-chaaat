import React, { useEffect, useState } from 'react';
import { h } from '../helpers';
import { Header, PreviewHeader } from '../components/Layouts/Layout';

export default function Preview() {
  const [permalink, setPermalink] = useState();
  const [selectedPreview, setSelectedPreview] = useState('desktop-preview');

  useEffect(() => {
    const inPermalink = h.general.findGetParameter('permalink');
    if (h.notEmpty(inPermalink)) setPermalink(inPermalink);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <PreviewHeader
        selectedPreview={selectedPreview}
        setSelectedPreview={setSelectedPreview}
      />

      <Header showHeaderContent={false} />
      {permalink && (
        <div id={'preview-div'} className={'d-flex justify-content-center '}>
          <iframe
            src={permalink + '/?should_track_activity=false'} // in order to make sure the contactActivity isn't fired
            className={` ${selectedPreview}`}
            style={{
              minHeight: '92vh',
            }}
          />
        </div>
      )}
    </div>
  );
}
