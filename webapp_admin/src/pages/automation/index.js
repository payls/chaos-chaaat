import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Header, Body, Footer } from '../../components/Layouts/Layout';
import { h } from '../../helpers';
import { api } from '../../api';
import { api as api2 } from '../../components/Sale/Link/preview/api';
import constant from '../../constants/constant.json';
import { routes } from '../../configs/routes';
import Link from 'next/link';
import Swal from 'sweetalert2';
// ICON
import {
  faPlus,
  faRedo,
  faInfoCircle,
  faEdit,
  faEye,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import CategoryList from '../../components/Automation/CategoryList';
import CategoryItems from '../../components/Automation/CategoryItems';

export default function CampaignTemplateList() {
  const router = useRouter();

  const [isLoading, setLoading] = useState(false);
  const [agency, setAgency] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [platform, setPlatform] = useState(null);

  const [categoryResStatus, setCategoryResStatus] = useState(
    constant.API_STATUS.PENDING,
  );
  const [categories, setCategories] = useState([]);
  const [isCategoryListVisible, setIsCategoryListVisible] = useState(true);
  const [ruleCount, setRuleCount] = useState("");

  useEffect(() => {
    const { b } = router.query;
    if (h.notEmpty(b)) {
      setPlatform(b);
    } else {
      setPlatform(constant.AUTOMATION_PLATFORM.CHAAATBUILDER);
    }
  }, [router]);

  useEffect(() => {
    h.auth.isLoggedInElseRedirect();
    (async () => {
      await h.userManagement.hasAdminAccessElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgency({}, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        const agency = apiRes.data.agencyUser.agency;
        setAgency(agency);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (h.notEmpty(agency)) {
        await getCategories(true);
      }
    })();
  }, [agency, platform]);

  async function getCategories(setNew = false) {
    setCategoryResStatus(constant.API_STATUS.PENDING);
    const categoryRes = await api.automation.getCategories({
      agency_id: agency?.agency_id,
      platform,
    });
    if (h.cmpStr(categoryRes.status, 'ok')) {
      const categoriesData = h.general.unescapeData(categoryRes.data.categories);
      if (
        (h.isEmpty(selectedCategory) || setNew) &&
        categoriesData.length !== 0
      ) {
        setSelectedCategory(categoriesData[0]);
      }
      setCategories(categoriesData);
    }
    setCategoryResStatus(constant.API_STATUS.FULLFILLED);
  }

  return (
    <>
      <div className="contacts-root layout-v">
        <Header
          className={
            'container dashboard-contacts-container common-navbar-header mb-3'
          }
        />
        <Body isLoading={isLoading}>
          <div className="n-banner">
            <div className="container dashboard-contacts-container contacts-container">
              <div className="mb-2 contacts-title d-flex justify-content-between pt-3 pb-3">
                <div>
                  <h1>Automations</h1>
                </div>
              </div>
            </div>
          </div>
          <div className="projects-list-container modern-style no-oxs automations-container">
            <div className="container dashboard-contacts-container modern-style">
              <div className="messaging-container modern-style">
                <div
                  className="message-body"
                  style={{
                    width: '100%',
                    paddingLeft: '0px',
                    paddingRight: '0px',
                    paddingTop: '10px',
                    overflow: 'auto',
                    paddingBottom: '100px',
                  }}
                >
                  <div className="">
                    <div className="tab-body d-flex automation-list-wrapper">
                      {isCategoryListVisible &&
                        <CategoryList
                          loading={categoryResStatus}
                          data={categories}
                          agency={agency}
                          selected={selectedCategory}
                          status={categoryResStatus}
                          setSelected={setSelectedCategory}
                          reloadCategories={async () => {
                            setSelectedCategory(null);
                            await getCategories(true);
                          }}
                          platform={platform}
                          ruleCount={ruleCount}
                        />
                      }
                      <CategoryItems
                        setLoading={setLoading}
                        category={selectedCategory ?? null}
                        agency={agency}
                        reloadCategories={async () => {
                          setSelectedCategory(null);
                          await getCategories(true);
                        }}
                        platform={platform}
                        setIsCategoryListVisible={setIsCategoryListVisible}
                        setRuleCount={setRuleCount}
                      />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </Body>
        <Footer />
      </div>
    </>
  );
}
