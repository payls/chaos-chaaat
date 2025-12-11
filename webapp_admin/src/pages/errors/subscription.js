import React, { useEffect, useState } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { config } from '../../configs/config';
import { routes } from '../../configs/routes';
import { useRouter } from 'next/router';
import ModalTiers from '../../components/Billing/ModalTiers';
import { Header, Body, Footer } from '../../components/Layouts/Layout';

function Error() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState('');
  const [userName, setUserName] = useState('user');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [billingModal, setBillingModal] = useState(false);
  const [hasMarketingAccess, setHasMarketingAccess] = useState(true);

  useEffect(() => {
    (async () => {
      const isAuthenticated = h.auth.isAuthenticated();
      if (!(await h.userManagement.hasMarketingAccess())) {
        setHasMarketingAccess(false);
      }
      if (isAuthenticated) {
        setIsLoggedIn(isAuthenticated);
        const user = h.auth.getUserInfo();
        setUserName(h.user.formatFullName(user));
        setFirstname(user.first_name);
        setLastname(user.last_name);
        setUserProfilePic(user.profile_picture_url);
        h.paveChat.init({
          container: '#__next', // Main root content wrapper
          agency_id: '08012e63-a6ce-4cb1-abdf-89b592955729', // Agent ID
          user: {
            first_name: user.first_name,
            last_name: user.last_name,
            email_address: user.email,
            phone: user.mobile_number,
          },
        });
      }
    })();
  }, []);

  return (
    <>
      {billingModal && (
        <ModalTiers handleCloseModal={() => setBillingModal(false)} />
      )}

      <Header className="common-navbar-header" showHeaderContent={false} />
      <Body className="container">
        <div className="error-page-subscription">
          <div align="center" className="mb-5">
            <img
              style={{ width: '40%' }}
              className={'error-image'}
              src="https://cdn.yourpave.com/assets/empty-data-2x.png"
              alt={'profile picture'}
            />
          </div>
          <div align="center">
            <h3 style={{ fontFamily: 'PoppinsBold', color: '#182327' }}>
              Uh oh. Something went wrong.
            </h3>
            <p
              style={{
                fontFamily: 'PoppinsRegular',
                color: '#182327',
                paddingLeft: '10%',
                paddingRight: '10%',
                fontSize: '18px',
              }}
            >
              We would like to bring to your attention that your organization is
              currently unsubscribed to{' '}
              <b
                style={{
                  fontFamily: 'PoppinsBold',
                }}
              >
                PAVE
              </b>{' '}
              platform.
              <br /> We kindly request that you reach out to our support team
              for further assistance.
              <br /> Thank you for your understanding.
            </p>
            {hasMarketingAccess && (
              <>
                <span
                  onClick={() => {
                    setBillingModal(true);
                  }}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'PoppinsBold',
                    color: '#fe5959',
                    cursor: 'pointer',
                  }}
                >
                  SUBSCRIPTION
                </span>
                <span style={{ padding: '0px 20px' }}>|</span>
              </>
            )}
            <span
              onClick={async (e) => {
                e.preventDefault();
                await router.push(h.getRoute(routes.login));
              }}
              style={{
                fontSize: '12px',
                fontFamily: 'PoppinsBold',
                color: '#182327',
                cursor: 'pointer',
              }}
            >
              LOGOUT
            </span>
            <br />
            <br />
            <img
              alt="Pave"
              width={100}
              src="https://cdn.yourpave.com/agency/78c91b971c3138213bb440db69666cc500a5e08abb6f9967fdd502609a907960f5af77026a6d8b946fce33be14a83d692988f12ede5362849216916df14204b7.png"
            />
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
}

export default Error;
