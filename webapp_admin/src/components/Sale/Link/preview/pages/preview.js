import React, { useState } from 'react';
import { Header, PreviewHeader } from '../components/Layouts/Layout';
import Permalink from './permalink';

export default function Preview(props) {
  const { permalink, setSettingsData, settingsData } = props;
  const [selectedPreview, setSelectedPreview] = useState('desktop-preview');

  return (
    <div style={{ position: 'relative', margin: 'inherit' }}>
      <PreviewHeader
        selectedPreview={selectedPreview}
        setSelectedPreview={setSelectedPreview}
        key="preview-proposal"
      />

      <Header showHeaderContent={false} />

      <div id={'preview-div'} className={'d-flex justify-content-center '}>
        <div
          className={` ${selectedPreview}`}
          style={{
            minHeight: '92vh',
          }}
        >
          <Permalink
            inPermalink={permalink}
            shouldTrackActivity={false}
            setSettingsData={setSettingsData}
            settingsData={settingsData}
          />
          {/*in order to make sure the contactActivity isn't fired*/}
        </div>{' '}
      </div>
    </div>
  );
}
