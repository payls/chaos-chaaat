import React, { useState, useEffect } from 'react';
import { h } from '../../../helpers';
import { async } from 'pdfjs-dist';

// Components
import ProjectTableList from './ProjectTableList';
import PropertyTableList from './PropertyTableList';

function Navigation({
  selectedShortlistedProject,
  proposalProject,
  contact,
  shouldTrackActivity,
  setSelectedShortlistedProject,
  proposalProperties,
  elementRef,
  customStyle,
  translate,
  shortlistedProjects,
  getProjectById = () => {},
  setProjectData,
}) {
  const [navigationValue, setNavigationValue] = useState('projects');

  useEffect(() => {
    if (proposalProject) {
      setNavigationValue(
        proposalProject.length === 1 ? 'properties' : 'projects',
      );
    }
  }, [proposalProject]);

  const handleClicRowkProject = async ({ index, original: { project_fk } }) => {
    const proposalProjectIndex = proposalProject.findIndex(
      (i) => i.project_fk === project_fk,
    );
    if (
      selectedShortlistedProject &&
      selectedShortlistedProject?.project?.project_fk !== project_fk
    ) {
      const isProjectExist = shortlistedProjects.filter(
        (f) => f.project_id === project_fk,
      );

      // Check if project already
      if (isProjectExist.length > 0) {
        setSelectedShortlistedProject({
          project: proposalProject[proposalProjectIndex],
          index,
        });

        const shortlistedProjectIndex = shortlistedProjects.findIndex(
          (i) => i.project_id === project_fk,
        );
        setProjectData(shortlistedProjects[shortlistedProjectIndex]);
      } else {
        // Call new project
        const newProject = await getProjectById(project_fk);

        setSelectedShortlistedProject({
          project: proposalProject[proposalProjectIndex],
          index,
        });
        setProjectData(newProject);
      }
    }

    setTimeout(() => {
      elementRef.projectRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 25);
  };

  const handleClicRowkProperty = async ({ original: project_property }) => {
    const project_fk = project_property?.project_property?.project_fk;
    const proposalProjectIndex = proposalProject.findIndex(
      (i) => i.project_fk === project_fk,
    );
    const projectIndex = proposalProject.findIndex(
      (x) => x.project_fk === project_fk,
    );
    if (
      selectedShortlistedProject &&
      selectedShortlistedProject?.project?.project_fk !== project_fk
    ) {
      const isProjectExist = shortlistedProjects.filter(
        (f) => f.project_id === project_fk,
      );
      // Check if project already
      if (isProjectExist.length > 0) {
        setSelectedShortlistedProject({
          project: proposalProject[proposalProjectIndex],
          index: projectIndex,
        });

        const shortlistedProjectIndex = shortlistedProjects.findIndex(
          (i) => i.project_id === project_fk,
        );
        setProjectData(shortlistedProjects[shortlistedProjectIndex]);
      } else {
        // Call new project
        const newProject = await getProjectById(project_fk);

        setSelectedShortlistedProject({
          project: proposalProject[proposalProjectIndex],
          index: projectIndex,
        });
        setProjectData(newProject);
      }
    }

    setTimeout(() => {
      elementRef.propertyRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  return (
    <>
      <div className="navigation-wrapper d-flex justify-content-center my-4">
        <div
          className="navigation-items pos-rlt"
          style={{
            background: customStyle?.table?.navigationWrapper,
          }}
        >
          <span
            className={
              'movingBg ' +
              (navigationValue === 'projects' ? 'leftside' : 'rightside') +
              ' ' +
              (proposalProperties.length === 0 ? 'no-prop' : '') +
              ' ' +
              (proposalProject.length === 1 ? 'single-proj' : '')
            }
            style={{ background: customStyle?.table?.movingBg }}
          ></span>
          <div className="d-flex justify-content-center align-items-center">
            {proposalProject.length > 1 && (
              <span
                className={
                  'navigation-item ' +
                  (navigationValue === 'projects' ? 'selected' : '')
                }
                style={{ ...customStyle?.table?.nav }}
                onClick={() => {
                  setNavigationValue('projects');
                }}
              >
                {h.translate.localize('projectList', translate)}
              </span>
            )}
            {proposalProperties.length > 0 && (
              <span
                className={
                  'navigation-item ' +
                  (navigationValue === 'properties' ? 'selected' : '')
                }
                style={{ ...customStyle?.table?.nav }}
                onClick={() => {
                  setNavigationValue('properties');
                }}
              >
                {h.translate.localize('shortlistedProperties', translate)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {proposalProject.length > 1 && navigationValue === 'projects' && (
          <div className="projects-table animate-fadeIn">
            <ProjectTableList
              selected={selectedShortlistedProject}
              projects={proposalProject}
              customStyle={customStyle}
              translate={translate}
              contact_id={contact.contact_id}
              reloadShortlistedProjects={() => {}}
              shouldTrackActivity={shouldTrackActivity}
              handleClick={async (e) => {
                await handleClicRowkProject(e);
              }}
            />
          </div>
        )}
        {proposalProperties.length > 0 && navigationValue === 'properties' && (
          <div className="properties-table animate-fadeIn">
            <PropertyTableList
              selected={selectedShortlistedProject}
              projects={proposalProject}
              properties={proposalProperties}
              customStyle={customStyle}
              translate={translate}
              contact_id={contact.contact_id}
              reloadShortlistedProjects={() => {}}
              shouldTrackActivity={shouldTrackActivity}
              handleClick={async (e) => {
                await handleClicRowkProperty(e);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default React.memo(Navigation);
