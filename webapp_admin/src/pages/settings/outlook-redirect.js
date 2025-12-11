import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Header, Body, Footer } from "../../components/Layouts/Layout";
import { h } from "../../helpers";
import { api } from "../../api";
import constant from "../../constants/constant.json";

export default function Profile() {
  const [isLoading, setLoading] = useState();
  const router = useRouter();
  const code = router.query.code;

  useEffect(() => {
    if (code) h.auth.isLoggedInElseRedirect();
    (async () => {
      setLoading(true);
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, "ok")) {
        const outlookCalendarResp =
          await api.integrations.integrateOutlookCalIntegration(
            { code: code, agency_id: apiRes.data.agencyUser.agency.agency_id },
            false
          );
        localStorage.setItem(
          constant.DIRECT_INTEGRATION.EVENTS.OUTLOOKCALENDAR_INTEGRATION,
          JSON.stringify(outlookCalendarResp.data)
        );
        window.close();
      }
      setLoading(false);
    })();
  }, [code]);

  return (
    <div className="contacts-root layout-v">
      <Header
        className={
          "container dashboard-contacts-container common-navbar-header mb-3"
        }
      />
      <Body className="overflow-hidden w-100">
        <div className="n-banner">
          <div className="container dashboard-contacts-container contacts-container">
            <div className="mb-2 contacts-title d-flex justify-content-between pt-3 pb-3">
              <div>
                <h1>Connecting to Outlook</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-center h-100">
          <div id="breathing-button" className="m-0">
            <img
              style={{ objectFit: "cover", width: "100%", overflow: "hidden" }}
              src="../../assets/images/outlook.svg"
            ></img>
          </div>
        </div>
      </Body>
      <Footer />
    </div>
  );
}
