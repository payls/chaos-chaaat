import React, { useEffect } from 'react';
import ProjectAvailableUnitsDetails from './ProjectAvailableUnitDetails';
import { Tabs, Tab, TabContent } from 'react-bootstrap';
import { h } from '../../helpers';

export default function ProjectAvailableUnits(props) {
  const { project, data } = props;
  const tabItems = [];

  data.forEach((unit) => {
    if (!tabItems.find((tabItem) => tabItem.unit_type === unit.unit_type)) {
      tabItems.push({ bed: unit.bed, unit_type: unit.unit_type });
    }
    return;
  });
  // Sort array in ascending order (no. of beds)
  if (tabItems.length > 0) {
    tabItems.sort((a, b) => {
      return a - b;
    });
  }

  return (
    <div>
      {h.notEmpty(tabItems) && (
        <Tabs
          className="pt-2"
          defaultActiveKey={tabItems[0].unit}
          id="bedroom-selection"
        >
          {tabItems.map((tabItem, index) => {
            return (
              <Tab
                key={index}
                eventKey={tabItem.unit_type}
                title={h.general.ucFirst(tabItem.unit_type)}
                tabClassName="available-units-tab"
              >
                <TabContent>
                  <ProjectAvailableUnitsDetails
                    project={project}
                    bed={tabItem.bed}
                    units={data.filter(
                      (unit) => unit.unit_type === tabItem.unit_type,
                    )}
                  />
                </TabContent>
              </Tab>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
