import React, {useEffect, useState} from 'react';
import {Tabs, Tab} from 'react-bootstrap';
import {api} from '../../api';
import SavedPropertyCards from './SavedPropertyCards';

/**
 * Saved properties tabs
 * @returns {JSX.Element}
 * @constructor
 */
export default function SavedPropertyTabs(props) {
  const [savedProperties, setSavedProperties] = useState([]);

  useEffect(() => {
    async function fetchProperties() {
      const apiResponse = await api.userSavedProperty.getAll();
      setSavedProperties(apiResponse.data.savedProperties);
    }

    fetchProperties();
  }, []);

  return (
    <div className="saved-properties-main-tab">
      <Tabs defaultActiveKey="saved-favourites">
        <Tab
          eventKey="saved-favourites"
          title={`Favourites (${savedProperties.length})`}
        >
          <SavedPropertyCards savedProperties={savedProperties}/>
        </Tab>
        <Tab eventKey="saved-not-interested" title="Not Interested (0)">
          <div></div>
        </Tab>
      </Tabs>
    </div>
  );
}
