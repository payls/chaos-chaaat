import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';
import HubSpot from './hubspot';
import HubSpotV2 from './hubspot-v2';
import MindBody from './minbody';
import Salesforce from './salesforce';
import SalesforceV2 from './salesforce-v2';
import WhatsApp from './whatsapp';
import GoogleCalendar from './googlecalendar';
import OutlookCalendar from './outlookcalendar';

export default function IntegrationsForm() {
  const [agencyUser, setAgencyUser] = useState({});
  const [hasMarketingAccess, setHasMarketingAccess] = useState(true);
  const [hubspotIntegrationStatus, setHubspotIntegrationStatus] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [isChaaat, setIsChaaat] = useState(false);
  const [gmailIntegrationStatus, setGmailIntegrationStatus] = useState({});
  const [outlookIntegrationStatus, setOutlookIntegrationStatus] = useState({});
  const [salesForceIntegrationStatus, setSalesForceIntegrationStatus] =
    useState({});
  const [connectionOwners, setConnectionOwners] = useState({});
  const [hubspotDirectIntegrationStatus, setHubspotDirectIntegrationStatus] =
    useState(null);
  const [mindbodyIntegrationStatus, setMindbodyIntegrationStatus] =
    useState(false);
  const [mindbodyIntegrationAPIStatus, setMindbodyIntegrationAPIStatus] =
    useState(constant.API_STATUS.IDLE);
  const [
    salesforceDirectIntegrationStatus,
    setSalesforceDirectIntegrationStatus,
  ] = useState(null);
  const [
    outlookCalDirectIntegrationStatus,
    setOutlookCalDirectIntegrationStatus
  ] = useState(null);
  const [
    gCalendarDirectIntegrationStatus,
    setGCalendarDirectIntegrationStatus
  ] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setHasMarketingAccess(await h.userManagement.hasMarketingAccess());

      setIsSuperAdmin(await h.userManagement.isSuperAdmin());

      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        if (apiRes.data.agencyUser) {
          setAgencyUser(apiRes.data.agencyUser);
          setIsChaaat(
            apiRes?.data?.agencyUser?.user?.email.includes('@yourpave.com') ||
            apiRes?.data?.agencyUser?.user?.email.includes('@chaaat.io'),
          );

          let hubSpotStatus = 'inactive';
          let gmailStatus = 'inactive';
          let outlookStatus = 'inactive';
          let salesForceStatus = 'inactive';
          setHubspotIntegrationStatus(hubSpotStatus);
          setGmailIntegrationStatus(gmailStatus);
          setOutlookIntegrationStatus(outlookStatus);
          setSalesForceIntegrationStatus(salesForceStatus);
          // setConnectionOwners(active_integrations.connectionOwners);
        }
        const agencyId = apiRes.data.agencyUser.agency_fk;
        const getHubspotIntegration =
          await api.integrations.getHubspotActiveIntegration(
            {
              agency_id: agencyId,
            },
            false,
          );

        if (h.cmpStr(getHubspotIntegration.status, 'ok')) {
          const { agency_oauth } = getHubspotIntegration.data;
          setHubspotDirectIntegrationStatus(agency_oauth.status);
        }

        const getSalesforceIntegration =
          await api.integrations.getSalesforceActiveIntegration(
            {
              agency_id: agencyId,
            },
            false,
          );

        if (h.cmpStr(getSalesforceIntegration.status, 'ok')) {
          const { agency_oauth } = getSalesforceIntegration.data;
          setSalesforceDirectIntegrationStatus(agency_oauth.status);
        }

        const getOutlookCalIntegration =
          await api.integrations.getOutlookCalActiveIntegration(
            {
              agency_id: agencyId,
            },
            false,
          );
        const getGcalendarIntegration =
          await api.integrations.getGcalenderActiveIntegration(
            {
              agency_id: agencyId,
            },
            false,
          );
        if (h.cmpStr(getOutlookCalIntegration.status, 'ok')) {
          const { agency_oauth } = getOutlookCalIntegration.data;
          setOutlookCalDirectIntegrationStatus(agency_oauth.status);

          if (h.cmpStr(getGcalendarIntegration.status, 'ok')) {
            const { agency_oauth } = getGcalendarIntegration.data;
            setGCalendarDirectIntegrationStatus(agency_oauth.status);
          }

          setMindbodyIntegrationAPIStatus(constant.API_STATUS.PENDING);
          const mindBodyIntegrationStatusRes =
            await api.integrations.getMindBodyStatus(
              {
                agency_id: agencyId,
              },
              false,
            );

          if (h.cmpStr(mindBodyIntegrationStatusRes.status, 'ok')) {
            const { setting_status } = mindBodyIntegrationStatusRes.data;
            setMindbodyIntegrationStatus(
              setting_status === 'active' ? true : false,
            );
            setMindbodyIntegrationAPIStatus(constant.API_STATUS.FULLFILLED);
          }
        }
        setLoading(false);
      }
    })();
  }, []);

  const getHubspotInstallation = (hasMarketingAccess) => {
    // return (
    //   hasMarketingAccess && (
    //     <HubSpot
    //       connection={hubspotIntegrationStatus}
    //       agencyUserData={agencyUser}
    //       connectionOwners={connectionOwners}
    //       callbackStatusRefresh={(status, connectionOwners) => {
    //         setHubspotIntegrationStatus(status);
    //         setConnectionOwners(connectionOwners);
    //       }}
    //     />
    //   )
    // );
    if (hubspotIntegrationStatus !== 'inactive') {
      return (
        hasMarketingAccess && (
          <HubSpot
            connection={hubspotIntegrationStatus}
            agencyUserData={agencyUser}
            connectionOwners={connectionOwners}
            callbackStatusRefresh={(status, connectionOwners) => {
              setHubspotIntegrationStatus(status);
              setConnectionOwners(connectionOwners);
            }}
          />
        )
      );
    } else {
      return (
        hasMarketingAccess && (
          <HubSpotV2
            connection={hubspotDirectIntegrationStatus}
            agencyUserData={agencyUser}
            connectionOwners={connectionOwners}
            callbackStatusRefresh={(status) => {
              setHubspotDirectIntegrationStatus(status);
            }}
          />
        )
      );
    }
  };

  const getMindBody = (hasMarketingAccess) => {
    return (
      hasMarketingAccess && (
        <MindBody
          connection={hubspotDirectIntegrationStatus}
          agencyUserData={agencyUser}
          connectionOwners={connectionOwners}
          callbackStatusRefresh={(status) => {
            setMindbodyIntegrationStatus(status);
          }}
          integrationStatus={mindbodyIntegrationStatus}
          pending={mindbodyIntegrationAPIStatus}
        />
      )
    );
  };

  const getWhatsApp = (hasMarketingAccess) => {
    return (
      hasMarketingAccess && (
        <WhatsApp
          agencyId={agencyUser?.agency_fk}
          isChaaat={isChaaat}
          isSuperAdmin={isSuperAdmin}
        />
      )
    );
  };

  const getSalesforceInstallation = (hasMarketingAccess) => {
    if (salesForceIntegrationStatus !== 'inactive') {
      return (
        hasMarketingAccess && (
          <Salesforce
            connection={salesForceIntegrationStatus}
            agencyUserData={agencyUser}
            connectionOwners={connectionOwners}
            callbackStatusRefresh={(status, connectionOwners) => {
              setSalesForceIntegrationStatus(status);
              setConnectionOwners(connectionOwners);
            }}
          />
        )
      );
    } else {
      return (
        hasMarketingAccess && (
          <SalesforceV2
            connection={salesforceDirectIntegrationStatus}
            agencyUserData={agencyUser}
            connectionOwners={connectionOwners}
            callbackStatusRefresh={(status) => {
              setSalesforceDirectIntegrationStatus(status);
            }}
          />
        )
      );
    }
  };

  const getGoogleCalendar = (hasMarketingAccess) => {
    return hasMarketingAccess && (
      <GoogleCalendar
        connection={gCalendarDirectIntegrationStatus}
        agencyUserData={agencyUser}
        callbackStatusRefresh={(status) => {
          setGCalendarDirectIntegrationStatus(status);
        }}
      />
    )
  }

  const getOutlookCalendar = (hasMarketingAccess) => {
    return hasMarketingAccess && (
      <OutlookCalendar
        connection={outlookCalDirectIntegrationStatus}
        agencyUserData={agencyUser}
        callbackStatusRefresh={(status) => {
          setOutlookCalDirectIntegrationStatus(status);
        }}
      />
    )
  }

  if (isLoading) return null;

  return (
    <div class="page_body">
      <header class="page-header">
        <div class="row">
          <div
            class="col-12 d-flex align-items-center justify-content-between">
            <div class="sect_heading">
              <h2>Integrations </h2>
            </div>
          </div>
        </div>
      </header>
      <section class="crmSec">
        <div class="row justify-content-start">
          <div class="col-12">
            <div class="sect_heading pb-4">
              <h2>CRMs</h2>
            </div>
          </div>
          <div
            class="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <div class="row g-4 integration_row_list">
              {hasMarketingAccess && getHubspotInstallation(hasMarketingAccess)}
              {hasMarketingAccess &&
                getSalesforceInstallation(hasMarketingAccess)}
              {hasMarketingAccess && getMindBody(hasMarketingAccess)}
            </div>
            <div class="row">
              <div class="col-12 py-4">
                <div class="sect_heading">
                  <h2>Calendars</h2>
                </div>
              </div>
            </div>
            <div class="row g-4 integration_row_list">
              {hasMarketingAccess && getGoogleCalendar(hasMarketingAccess)}
              {/* Temporary hiding Outlook from platform */}
              {/* {hasMarketingAccess && getOutlookCalendar(hasMarketingAccess)} */}
            </div>
            <div class="row">
              <div class="col-12 py-4">
                <div class="sect_heading">
                  <h2>Channels</h2>
                </div>
              </div>
            </div>
            <div class="row g-4 integration_row_list">
              {hasMarketingAccess &&
                h.notEmpty(agencyUser) &&
                getWhatsApp(hasMarketingAccess)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
