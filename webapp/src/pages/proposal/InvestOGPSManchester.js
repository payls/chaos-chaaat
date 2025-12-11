import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import 'animate.css';

import { h } from '../../helpers';
import { api } from '../../api';
import constant from '../../constants/constant.json';

export default React.memo(
  ({
    agencyUser,
    shortlistedProject,
    translate,
    setLoading,
    contact,
    shouldTrackActivity,
    reloadShortlistedProjects,
  }) => {
    const [registered, setRegistered] = useState(null);
    const [hasCampaign, setHasCampaign] = useState(false);

    const handleCTA = async () => {
      if (shortlistedProject.is_enquired) return;
      setLoading(true);
      const apiRes = await api.contact.clickCTA1(
        {
          agency_id: agencyUser.agency_fk,
          contact_id: contact.contact_id,
        },
        false,
      );
      setLoading(false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        await checkCampaign();
        h.general.alert('success', {
          message: 'Thank you for your registration!',
        });
      }
    };

    useEffect(() => {
      (async () => {
        await checkCampaign();
      })();
    }, []);

    const checkCampaign = async () => {
      const apiRes = await api.contact.getCheckIfBtnClicked(
        { contact_id: contact.contact_id },
        false,
      );
      if (h.cmpStr(apiRes.status, 'ok')) {
        setHasCampaign(apiRes.data.hasCampaign);
        setRegistered(apiRes.data.clicked);
      }
    };

    const handleTracker = async (activity, metaData) => {
      let meta = {
        ...metaData,
        shortlisted_project_id: shortlistedProject.shortlisted_project_id,
      };
      if (shouldTrackActivity)
        await api.contactActivity.create(
          {
            contact_fk: contact.contact_id,
            activity_type: activity,
            activity_meta: JSON.stringify(meta),
          },
          false,
        );
    };

    const handleSendMoreOptions = async () => {
      if (shortlistedProject.is_enquired) return;
      setLoading(true);

      const apiRes = await api.contact.getCheckIfBtnClicked(
        { contact_id: contact.contact_id },
        false,
      );

      setLoading(false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        reloadShortlistedProjects();
        h.general.alert('success', {
          message:
            'Thank you for your interest, you will hear back from the agent shortly!',
        });
      }
    };

    return (
      <main id="invest-ogps-expat-root">
        <section>
          <div style={{ background: '#000' }}>
            <div className="d-flex justify-content-center container">
              <img
                src={
                  'https://invest.ogpsglobal.com/hs-fs/hubfs/Hubspot%20Headers%20(4).png?upscale=true&width=2392&upscale=true&name=Hubspot%20Headers%20(4).png'
                }
                alt="Pave"
                width={'100%'}
              />
            </div>
          </div>
          <section>
            <h3 className="heading-2 mt-2">
              MANCHESTER APARTMENTS & HOUSES COLLECTION
            </h3>
            <p className="heading-p-2">曼徹斯特公寓及房屋系列</p>

            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Mortgage%20Seminar%2013%20August%202023_General.jpg?upscale=true&width=2392&upscale=true&name=Mortgage%20Seminar%2013%20August%202023_General.jpg`}
              width={'100%'}
            />

            <h3 className="heading-2 mt-2">
              EXHIBITION MANCHESTER APARTMENTS & HOUSES COLLECTION
            </h3>
            <p className="heading-p-2">曼徹斯特公寓及房屋展銷會</p>

            <p className="heading-p-2">
              Date: <span>Friday & Saturday, 25th - 26th August 2023</span>{' '}
              <br />
              Time: <span>11AM to 6PM</span>
            </p>

            <p className="heading-p-2">
              Seminar: Investing in Manchester
              <br />
              <span>Friday 25th August 1PM</span>
              <br />
              <span>Saturday 26th August 2.30PM</span>
              <br />
            </p>

            <p className="heading-p-2">
              Location:{' '}
              <span>
                Room 802, Jubilee Centre, 8 /F 18 Fenwick St, Wan Chai
              </span>
            </p>
          </section>
          <div className="center-body">
            <hr
              style={{
                width: '300px',
                height: '5px',
                background: '#000',
              }}
            />
          </div>
          <h3 className="heading-2 mt-2">
            WHY THE SMART MONEY IS IN MANCHESTER?
          </h3>
          <p className="heading-p-2">為什麼明智的投資都流向曼徹斯特？</p>
          <p
            className="simple-p pl-2 pr-2"
            style={{
              lineHeight: '175%',
              textAlign: 'justify',
              fontSize: '15px',
            }}
          >
            Manchester is often referred to as the UK’s second city – the
            ‘Northern Powerhouse’ boasts exceptional career opportunities, a
            bustling nightlife and esteemed universities. Because of this, it’s
            no surprise Manchester has become a key investment area,
            establishing itself as a lucrative market with rising property
            prices.
            <br />
            曼徹斯特常被稱為英國的第二大城市 -
            曼徹斯特擁有卓越的職業機會、繁華的夜生活和備受推崇的大學。因此，曼徹斯特成為一個重要的投資區域並不令人驚訝，它已經建立起一個利潤豐厚的市場，房地產價格也在逐漸上升。
            <ul>
              <li>
                Fastest economic growth of any UK city outside of London in last
                20 years (ONS)
              </li>
              <li>Greater Manchester’s GVA £71bn (ONS)</li>
              <li>
                Rental growth is forecast to hit 16.5% between 2021-25 (Savills)
              </li>
              <li>51% graduate retention rate (Centre for cities)</li>
              <li>
                More 25 - 29-year-olds in the region than any other area of the
                UK (ONS)
              </li>
              <li>
                Over 190 direct routes from Manchester airport and 29.4 million
                journeys in 2019 (CAA)
              </li>
              <li>
                過去20年來，曼徹斯特是英國倫敦以外增長最快的城市之一（ONS）。
              </li>
              <li>大曼徹斯特的總生產價值（GVA）為710億英鎊（ONS）。</li>
              <li>
                預測曼徹斯特的租金增長率在2021年至2025年間將達到16.5%（Savills）。
              </li>
              <li>畢業生留在曼徹斯特的比例為51%（城市中心）。</li>
              <li>曼徹斯特地區的25至29歲人口比英國其他地區更多（ONS）。</li>
              <li>
                曼徹斯特機場有超過190條直達航線，2019年旅客數達到2940萬（CAA）。
              </li>
            </ul>
            Manchester is also enjoying a renaissance with regeneration projects
            reshaping the city, and with rapid employment growth underway. The
            high graduate retention rate means the city benefits from an
            ambitious talent pool with a high level of qualifications. This
            continues to bring more opportunities for Manchester to fulfill its
            ‘Our Manchester Strategy’; to become an ever more inclusive,
            sustainable, affordable, and world-class city.
            <br />
            曼徹斯特正在經歷一個復興時期，透過城市再生項目重新塑造城市面貌，並且正迅速實現就業增長。
          </p>
          <div
            style={{
              textAlign: 'center',
              paddingBottom: '30px',
            }}
          >
            <button
              type="button"
              className="btn-submit"
              style={{
                cursor: 'pointer',
                background: ' #a68561',
                border: 'none',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '5px',
                fontWeight: '900',
                fontFamily: 'Verdana',
              }}
              onClick={() => {
                if (!registered) {
                  handleCTA();
                }
              }}
            >
              {registered
                ? hasCampaign
                  ? 'Registered, see you there!'
                  : 'Thanks, we will be in touch!'
                : 'Register Interest'}
            </button>
          </div>
          <img
            src={`https://invest.ogpsglobal.com/hs-fs/hubfs/Untitled%20design.jpg?upscale=true&width=2392&upscale=true&name=Untitled%20design.jpg`}
            width={'100%'}
          />
          <div className="center-body">
            <hr
              style={{
                width: '300px',
                height: '5px',
                background: '#000',
              }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <img
              src={`https://marketing.ogpsglobal.com/hs-fs/hubfs/G-icon_Gold.png?upscale=true&width=200&upscale=true&name=G-icon_Gold.png`}
              width={'100px'}
            />
          </div>
          <h3 className="heading-2 mt-2">
            SPEAK WITH OUR TEAM TO FIND OUT MORE
          </h3>
          <h3 className="heading-2s mt-2">HONG KONG</h3>
          <p className="ppp">
            One Global Property Services (Hong Kong) Limited
            <br />
            BA Registration No.: 69941304-000
            <br />
            T:{' '}
            <a href="https://api.whatsapp.com/send?phone=85259752233&text=Hi%21%20I%27m%20interested%20in....&utm_campaign=%5BHK%5D%20%7C%20UK%20%7C%20Manchester%20Collection%20%7C%20General&utm_source=hs_email&utm_medium=email&_hsenc=p2ANqtz--u2v_v7zSYiskfQp3FyPLqIJO3cRTl03bG6MakaCcIUMxfpiGtRHXqidKSPs4i3tJXST-H">
              (+852) 5975 2233
            </a>{' '}
            <br />
            E:{' '}
            <a href="mailto:saleshk@ogpsglobal.com">saleshk@ogpsglobal.com</a>
          </p>{' '}
          <div className="center-body">
            <hr
              style={{
                width: '300px',
                height: '5px',
                background: '#000',
              }}
            />
          </div>
          <h3 className="heading-2 mt-2">DEVELOPERS</h3>
          <div className="d-flex justify-content-between align-items-center p-2">
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/OH_logo_500x260-1.png?upscale=true&width=520&upscale=true&name=OH_logo_500x260-1.png`}
              style={{ height: 'auto', width: '100px' }}
            />
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/persimmon-logo-2022-2.png?upscale=true&width=520&upscale=true&name=persimmon-logo-2022-2.png`}
              style={{ height: 'auto', width: '100px' }}
            />
            <img
              src={`https://invest.ogpsglobal.com/hs-fs/hubfs/salboylogobig.webp?upscale=true&width=520&upscale=true&name=salboylogobig.webp`}
              style={{ height: 'auto', width: '100px' }}
            />
          </div>
          <section
            className=" container pt-1"
            style={{
              backgroundColor: '#000',
            }}
          >
            <p
              style={{
                fontSize: '9px',
                textAlign: 'justify',
                lineHeight: 1,
              }}
            >
              <div className="center-body">
                <img
                  src={`https://invest.ogpsglobal.com/hs-fs/hubfs/HubSpot%20banners%20(1920%20%C3%97%20720px)%20(7).png?upscale=true&width=1600&upscale=true&name=HubSpot%20banners%20(1920%20%C3%97%20720px)%20(7).png`}
                  style={{ height: 'auto', width: '80%' }}
                />
              </div>
              <span
                style={{
                  fontFamily: 'Tahoma, Arial, Helvetica, sans-serif',
                  color: '#eeeeee',
                  lineHeight: '175%',
                  textAlign: 'justify',
                  fontWeight: 'normal',
                }}
              >
                Disclaimer: Oakhurst Village: Approved Planning Application:
                PL/2018/02731/MAJFOT. The Pressworks: Approved Planning
                Application No.: 2020/07705/PA granted by Birmingham City
                Council.*Prices and details correct at time of issue and subject
                to changes. Journey times are approximate and sourced from
                Google Maps and tfl.gov.uk / railmaps.com.au. Computer generated
                images are indicative only. **Rental yields are for general
                reference only and not guaranteed. This document has been
                prepared by One Global Property Services (Singapore) Pte Ltd,
                One Global Property Services (Hong Kong) Limited, One Global
                Property Services (Malaysia) & One Global Property Services (UK)
                Limited for advertising and general reference only. One Global
                Property Services makes no guarantees, representations or
                warranties of any kind, expressed or implied regarding the
                information including, but not limited to, warranties of
                content, accuracy and reliability. The particulars are compiled
                with care to give a fair description but are not guaranteed for
                their completeness, accuracy or timeliness and they do not
                constitute an offer or contract. Any interested party should
                undertake their own research and due diligence as to the
                accuracy of the information. One Global Property Services
                excludes unequivocally all inferred or implied terms, conditions
                and warranties arising out of this document and excludes all
                liability or loss and damages arising there from. This
                publication is the copyrighted property of One Global Property
                Services and/or its licensor(s). One Global Property Services
                (Hong Kong) Ltd and our representatives only work in relation to
                real estate located outside Hong Kong. Neither One Global
                Property Services nor its representatives is licensed under the
                Estate Agents Ordinance (Cap. 511 of the Laws of Hong Kong) to
                deal with Hong Kong real estate (nor are we required to be so
                licensed). Neither One Global Property Services nor its
                representatives hold them out to perform any regulated
                activities in Hong Kong under the corporate brand of One Global
                Property Services such as advising on dealing or advising on
                securities or providing asset management services or any other
                incidental regulated activities. Advisory Message: All overseas
                investments carry additional financial, regulatory and legal
                risks. Investors are advised to do necessary checks and research
                on the investment beforehand. ©2023 One Global Property
                Services. All rights reserved.
              </span>
            </p>

            <section className="iconss d-flex justify-content-center">
              <a
                href="https://www.facebook.com/ogpsglobal?utm_campaign=%5BOGExpat%5D%20UK%20%7C%20Sutton%20Coldfield%20%7C%20The%20Old%20Art%20School%20%7C%20General&amp;utm_source=hs_email&amp;utm_medium=email&amp;_hsenc=p2ANqtz-9oEja_tlgAvOWcgoEzK94KTnNE_vg0WAoK5ppiVVAcR3VTymYqNwKotRBgjb7Dev0kaiAe"
                data-hs-link-id="0"
                target="_blank"
              >
                <img
                  src="https://marketing.ogpsglobal.com/hs/hsstatic/TemplateAssets/static-1.114/img/hs_default_template_images/modules/Follow+Me+-+Email/facebook_circle_black.png"
                  alt="Facebook"
                  height="25"
                  valign="middle"
                />
              </a>
              <a
                href="https://www.linkedin.com/company/18816557?utm_campaign=%5BOGExpat%5D%20UK%20%7C%20Sutton%20Coldfield%20%7C%20The%20Old%20Art%20School%20%7C%20General&amp;utm_source=hs_email&amp;utm_medium=email&amp;_hsenc=p2ANqtz-9oEja_tlgAvOWcgoEzK94KTnNE_vg0WAoK5ppiVVAcR3VTymYqNwKotRBgjb7Dev0kaiAe"
                data-hs-link-id="0"
                target="_blank"
              >
                <img
                  src="https://marketing.ogpsglobal.com/hs/hsstatic/TemplateAssets/static-1.114/img/hs_default_template_images/modules/Follow+Me+-+Email/linkedin_circle_black.png"
                  alt="LinkedIn"
                  height="25"
                  valign="middle"
                />
              </a>
              <a
                href="https://www.instagram.com/ogpsglobal/?utm_campaign=%5BOGExpat%5D%20UK%20%7C%20Sutton%20Coldfield%20%7C%20The%20Old%20Art%20School%20%7C%20General&amp;utm_source=hs_email&amp;utm_medium=email&amp;_hsenc=p2ANqtz-9oEja_tlgAvOWcgoEzK94KTnNE_vg0WAoK5ppiVVAcR3VTymYqNwKotRBgjb7Dev0kaiAe"
                data-hs-link-id="0"
                target="_blank"
              >
                <img
                  src="https://marketing.ogpsglobal.com/hs/hsstatic/TemplateAssets/static-1.114/img/hs_default_template_images/modules/Follow+Me+-+Email/instagram_circle_black.png"
                  alt="Instagram"
                  height="25"
                  valign="middle"
                />
              </a>
            </section>
          </section>
        </section>
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            fontWeight: 'normal',
            textDecoration: 'none',
            fontStyle: 'normal',
            color: '#23496d',
            direction: 'lrt',
            padding: '30px',
          }}
        >
          One Global Group (SG), 127 Devonshire Road, Singapore, Singapore
          239885
        </p>
      </main>
    );
  },
);
