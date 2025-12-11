import React from 'react';
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
  }) => {
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
      await handleTracker(
        constant.CONTACT.ACTIVITY.TYPE.MORE_PROPERTY_REQUESTED,
        {},
      );

      const apiRes = await api.shortlistedProject.enquireShortlistedProject(
        {
          shortlisted_project_id: shortlistedProject.shortlisted_project_id,
        },
        false,
      );
      setLoading(false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        h.general.alert('success', {
          message:
            'Thank you for your interest, you will hear back from the agent shortly!',
        });
      }
    };

    return (
      <main id="colliers-root">
        <div className="d-flex justify-content-center p-4">
          {h.notEmpty(agencyUser?.agency?.agency_logo_url) ? (
            <Image
              src={'https://cdn.yourpave.com/agency/tower535.png'}
              alt="Pave"
              objectFit={'contain'}
              width={200}
              height={70}
            />
          ) : (
            <span
              className="rounded-circle comment-profile-picture profile-picture"
              style={{
                cursor: 'default',
                width: '150px',
                height: '150px',
                fontSize: '30px',
              }}
            >
              C
            </span>
          )}
        </div>
        <section className="header-1 bg-photo">
          <div className="container p-3 ">
            <h1 className="animate__animated animate__fadeInDown animate__faster">
              Own an iconic part of Hong Kong’s skyline
            </h1>
            <p>
              Designed by Skidmore, Owings &amp; Merrill LLP (SOM), Tower 535 is
              one of Hong Kong’s landmark buildings in a core commercial
              district. It hails an unparalleled standard of quality, shapes
              Hong Kong’s iconic skyline and is setting the standard in how to
              operate a mixed-use commercial building, and is up for purchase.
            </p>
            {shortlistedProject && (
              <div className="d-flex justify-content-center py-4">
                <button
                  className={
                    !shortlistedProject.is_enquired
                      ? 'send-options-button'
                      : 'send-options-button send-options-button-pending'
                  }
                  onClick={async () => {
                    handleSendMoreOptions();
                  }}
                  style={{
                    border: `2px solid #000`,
                    background: shortlistedProject.is_enquired
                      ? '#fff'
                      : '#000',
                    color: shortlistedProject.is_enquired ? '#000' : '#fff',
                  }}
                  disabled={shortlistedProject.is_enquired ? true : false}
                >
                  {!shortlistedProject.is_enquired
                    ? 'Register Interest'
                    : 'Thanks, we will be in touch!'}
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="header-1 invest py-3 gray-bg">
          <div className="container py-5 d-flex flex-row gap-10">
            <div className="">
              <h1 className="color-black text-left ">Invest in your future</h1>
              <p className="color-black">
                Operating with industry-low vacancy rates, Tower 535 has a
                high-profile tenant mix backed by an excellent track record.
                This provides a high-level of confidence when looking to secure
                returns, and the way the building has been marketed position the
                building as a clear opportunity to accelerate your success.
              </p>
            </div>
            <div className="w">
              <iframe
                width="515"
                height="315"
                src="https://www.youtube.com/embed/DWkT1Rch1io"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        <section className=" py-3">
          <div className="container features d-flex pt-3">
            <div className="item animate__animated animate__fadeInDown animate__faster">
              <h2>Rare</h2>
              <p className="color-black">
                Once-in-a- lifetime investment opportunity for a sizable Grade A
                commercial building, with 999 Land Tenure from June 1843
              </p>
            </div>
            <div className="item animate__animated animate__fadeInDown animate__faster">
              <h2>Prime</h2>
              <p className="color-black">
                Location in the heart of Causeway Bay within 2 minutes of the
                MTR, SOGO, close to HKLand’s redevelopment of No.281 Gloucester
                Road
              </p>
            </div>
            <div className="item animate__animated animate__fadeInDown animate__faster">
              <h2>View</h2>
              <p className="color-black">
                Overlooking Victoria Harbour with upper floors enjoying a
                panoramic sea view
              </p>
            </div>
            <div className="item animate__animated animate__fadeInDown animate__faster">
              <h2>Visible</h2>
              <p className="color-black">
                Rooftop signage which can be seen along Victoria Harbour,
                offering high advertising value
              </p>
            </div>
          </div>
        </section>

        <hr />

        <section className=" watch py-3">
          <h1> Let’s take a look</h1>
          <iframe
            width="100%"
            height="600"
            src="https://new.8prop.com/zh-CHT/mod/dcxMMjGNasL"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </section>

        <section className="header-1 awards mt-3">
          <div className="container py-5 d-flex flex-row gap-10">
            <div className="">
              <ul>
                <li className="animate__animated animate__fadeInDown animate__faster">
                  International Property Awards 2017
                </li>
                <li className="animate__animated animate__fadeInDown animate__faster">
                  Asia Pacific Property Awards 2017
                </li>
                <li className="animate__animated animate__fadeInDown animate__faster">
                  China Excellent Property Award 2015
                </li>
              </ul>
            </div>
            <div className="">
              <h1 className="text-left color-black">
                Invest in an award-winning asset
              </h1>
              <p className="color-black">
                Tower 535 is an award-winning commercial landmark on Hong Kong
                Island that elevates its office, retail, dining and lifestyle
                occupiers. This is your opportunity to buy into Causeway Bay’s
                leading mixed used development.
              </p>
            </div>
          </div>
        </section>

        <section className="header-1 contact mt-3 gray-bg">
          <div className="container py-5 d-flex flex-row gap-10">
            <div className="">
              <h1 className="text-left color-black">Want to know more?</h1>
              <p className="color-black">
                Tower 535 will be sold by Public Tender. If you would like
                <br />
                to know more about the asset, process or timeline, contact the
                <br />
                lead broker below:
                <br />
                <br />
                Thomas Chak | Andrew Ng
              </p>
            </div>
            <div className="">
              <div className="d-flex justify-content-center p-5">
                {h.notEmpty(agencyUser?.agency?.agency_logo_url) ? (
                  <Image
                    src={'https://cdn.yourpave.com/agency/tower535.png'}
                    alt="Pave"
                    objectFit={'contain'}
                    width={300}
                    height={100}
                  />
                ) : (
                  <span
                    className="rounded-circle comment-profile-picture profile-picture"
                    style={{
                      cursor: 'default',
                      width: '150px',
                      height: '150px',
                      fontSize: '30px',
                    }}
                  >
                    C
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  },
);
