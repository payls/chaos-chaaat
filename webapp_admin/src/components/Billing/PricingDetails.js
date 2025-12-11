import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';
import moment from 'moment';
import QRCode from 'react-qr-code';

export default function PricingDetails({isLoading, setLoading, subscription}) {
  const [isModal, setModal] = useState();
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [agencyUser, setAgencyUser] = useState(null);
  const [pricing, setPricing] = useState([
    {
      title: 'Starter',
      amount: '29',
      stripe_price: process.env.NEXT_PUBLIC_STARTER_PRICE,
      channels: '3',
      users: '3',
      ra: '3',
      contacts: '2000',
      ca: '5',
      me: '10000',
      mostPopular: false,
      fee: 20,
    },
    {
      title: 'Pro',
      amount: '199',
      stripe_price: process.env.NEXT_PUBLIC_PRO_PRICE,
      channels: '10',
      users: '10',
      ra: '10',
      contacts: '20000',
      ca: 'Unlimited',
      me: 'Unlimited',
      mostPopular: true,
      fee: 15,
    },
    {
      title: 'Enterprise',
      amount: 'Custom',
      stripe_price: null,
      channels: 'Unlimited',
      users: 'Unlimited',
      ra: 'Unlimited',
      contacts: 'Unlimited',
      ca: 'Unlimited',
      me: 'Unlimited',
      mostPopular: false,
    },
  ]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      h.auth.isLoggedInElseRedirect();
      const matrixRes = await api.agency.getProductMatrix(false);
      if (h.cmpStr(matrixRes.status, 'ok')) {
        processMatrix(matrixRes?.data?.data);
      }
      const apiRes = await api.agencyUser.getCurrentUserAgencyNoRedirect(
        {},
        false,
      );
      if (h.cmpStr(apiRes.status, 'ok')) {
        setAgencyUser(apiRes.data.agencyUser);
      }
      setLoading(false);
    })();
  }, []);

  async function subscribeToPlan(selectedPrice) {
    console.log(subscription);
    if (h.notEmpty(subscription)) {
      h.general.prompt(
        {
          message:
            `Your previous subscription will be canceled when you subscribe to a new plan. Would you like to continue?`,
        },

        async (confirmAction) => {
          if (confirmAction) {
            await generatePaymentLink(selectedPrice);
          }
        },
      );
    } else {
      await generatePaymentLink(selectedPrice);
    }
    
  }

  async function generatePaymentLink(selectedPrice) {
    setLoading(true);
    const stripe_price_id = pricing[selectedPrice].stripe_price;
    const apiRes = await api.agency.generateCustomerPaymentLink(agencyUser.agency_fk, stripe_price_id, false);

    if (h.cmpStr(apiRes.status, 'ok')) {
      setLoading(false);
      let paymentLinkURL = apiRes.data.payment_link_url;
      if (!paymentLinkURL.startsWith('http')) {
        paymentLinkURL = `https://${paymentLinkURL}`;
      }
      window.location.replace(paymentLinkURL);
    }
  }

  async function handleEnterpriseEmail() {
    const subject = encodeURIComponent(`${agencyUser?.agency.agency_name}: Enterprise Plan Enquiry`);
    const mailtoLink = `mailto:support@chaaat.io?subject=${subject}`;
    
    // Open mail client
    window.open(mailtoLink);
  };

  const togglePlanFeatures = (event, index) => {
    const buttonTarget = event.currentTarget;
    const currentText = buttonTarget.textContent;
    let display;
    if (h.cmpStr(currentText, "Show Details")) {
      buttonTarget.textContent = "Hide Details";
    } else {
      buttonTarget.textContent = "Show Details";
    }
    const detailsElements = document.querySelectorAll(`.feature-${index}`);
    
    detailsElements.forEach((detailsDiv) => {
      // Toggle visibility
      const isVisible = detailsDiv.style.display === 'block';
      detailsDiv.style.display = isVisible ? 'none' : 'block';
    });
  };

  /**
   * Description
   * Get pricing matrix data in database
   * @function
   * @name processMatrix
   * @kind function
   * @memberof PricingDetails
   * @param {any} matrixData
   * @returns {void}
   */
  function processMatrix(matrixData) {
    const filteredData = matrixData
    .filter(item => ["Starter", "Pro", "Enterprise"].includes(item.product_name))
    .sort((a, b) => {
      const order = ["Starter", "Pro", "Enterprise"];
      return order.indexOf(a.product_name) - order.indexOf(b.product_name);
    })
    .map(item => {
      // Create a copy of the item to avoid mutating original data
      const updatedItem = { ...item };
      // Loop through all keys in the item
      for (const key in updatedItem) {
          if (typeof updatedItem[key] === "string") {
              // Change "unlimited" to "Unlimited"
              if (updatedItem[key] === "unlimited") {
                  updatedItem[key] = "Unlimited";
              }
              if (updatedItem[key] === "custom") {
                updatedItem[key] = "Custom";
              }
              // Remove ".00" from "product_price"
              if (key === "product_price" && updatedItem[key].endsWith(".00")) {
                  updatedItem[key] = updatedItem[key].slice(0, -3);
              }
          }
      }
      return updatedItem;
    });
    const newMatrix = [];
    const matrixStripePriceID = [process.env.NEXT_PUBLIC_STARTER_PRICE, process.env.NEXT_PUBLIC_PRO_PRICE, null];
    const matrixFees = [20, 15, null];
    const matrixPopular = [false, true, false];
    if (h.notEmpty(filteredData)) {
      for (let index = 0; index < filteredData.length; index++) {
        const record = {
          title: filteredData[index].product_name,
          amount: filteredData[index].product_price,
          stripe_price: matrixStripePriceID[index],
          channels: filteredData[index].allowed_channels,
          users: filteredData[index].allowed_users,
          ra: filteredData[index].allowed_automations,
          contacts: filteredData[index].allowed_contacts,
          ca: filteredData[index].allowed_campaigns,
          me: filteredData[index].allowed_outgoing_messages,
          mostPopular: matrixPopular[index],
          fee: matrixFees[index],
        };
        newMatrix.push(record);
      }
      setPricing(newMatrix);
    }
  }

  return (
    <>
      <div className="pricing-wrapper mt-5 mb-5">
        <h3>Subscription Plans</h3>
      </div>
      <div className="pricing-wrapper">
        <div className="d-flex justify-content-center">
          <div key={10000} className="pricing-content reach-out normal mr-4">
            <div className="d-flex">
              <div className="pricing-details">
                <h2>
                  Not Sure<br/>
                  What Bundle<br/>
                  Is Best For<br/>
                  You?
                </h2>
                Connect with us!
                <br/>
                Scan and Reach Out Today!
                <div style={{
                  marginTop: '10px',
                  background: 'linear-gradient(55.47deg, #29F2BC -3.41%, #4877FF 51.36%, #F945B3 106.13%)', 
                  textAlign: 'center', 
                  boxShadow: '0px 4px 8px 5px rgba(221, 221, 221, 0.25)',
                  width: '70%', 
                  borderRadius: '10px',
                  padding: '10px',
                }}>
                  <QRCode
                    size={150}
                    value='https://wa.me/85268793050'
                    viewBox={`10 10 200 200`}
                    level={'L'}
                  />
                </div>
                <br/>
                <a href={`https://web.whatsapp.com/send/?phone=85268793050&text&type=phone_number&app_absent=0`} target="_blank">
                  WhatsApp Web
                </a>
                <br/>
                <a href={`https://wa.me/85268793050`} target="_blank">
                  WhatsApp Desktop App
                </a>
                <br/>
                <a href={`mailto:support@chaaat.io?subject=${encodeURIComponent(`${agencyUser?.agency.agency_name}: Subscription Plan Enquiry`)}`} target="_blank">
                  Email us @ support@chaaat.io
                </a>
              </div>
            </div>
          </div>
          {pricing.map((price, i) => (
            <div
              key={i}
              className={`pricing-content item ${
                price.mostPopular ? 'popular' : ''
              }`}
            >
              <div className="d-flex mt-4 pt-3">
                <div className="pricing-details">
                  <h2>{price.title}</h2>
                  <div className="connections">{price.channels} {h.cmpStr(price.channels, 'unlimited') ? '' : 'Available'} Connections</div>
                  {!h.cmpStr(price.title, 'Enterprise') ? (
                    <div className="pricing-price">
                      <small>Starts at</small>
                      <span><sup>$</sup>{price.amount}<sub>USD</sub></span>
                      <small>/ month</small>
                      <small>per month</small>
                    </div>
                  ) : (
                    <div className="pricing-price custom">
                      <span>{price.amount}</span>
                    </div>
                  )}
                  <div className={`pricing-features feature-${i} message-fee justify-content-center`}>
                    {(i !== 2) && (
                    <ul>
                      <li>$0.28 per Business-initiated conversation</li>
                      <li>
                        $0.11 per Business-initiated conversation
                        <br/>
                        (&gt;20k Business-initiated conversations a month)
                      </li>
                    </ul>
                    )}
                  </div>
                  
                  <div className="d-flex justify-content-center" style={{ margin: '0 auto'}}>
                    <button
                      type="button"
                      className="modern-button common mb-4"
                      onClick={() => {
                        if (i === 2) {
                          handleEnterpriseEmail();
                        } else {
                          subscribeToPlan(i);
                        }
                      }}
                      style={{ width: '230px', padding: '15px', margin: '0 auto' }}
                    >
                      {i == 2 ? 'CHAAAT with Us' : 'Get Started'}
                    </button>
                  </div>
                  <div className="d-flex justify-content-center" style={{ margin: '0 auto'}}>
                    <button
                      type="button"
                      className="modern-button details-btn common mb-4"
                      style={{ width: '230px', padding: '15px', margin: '0 auto' }}
                      onClick={(event) => {
                        togglePlanFeatures(event, i);
                      }}
                    >
                      Show Details
                    </button>
                  </div>

                  <div className={`pricing-features feature-${i} limitations justify-content-center`}>
                    <span>Features</span>
                    <ul style={{marginTop: '10px'}}>
                      <li>{price.channels} Channels </li>
                      <li>{price.users} Users</li>
                      <li>{price.ra} Automations </li>
                      <li>{price.ca} Campaigns per Month </li>
                      <li>{price.me} Messages per Month </li>
                      <li>{price.contacts} Contacts </li>
                    </ul>
                  </div>

                  <div className={`pricing-features feature-${i} integrations justify-content-center`}>
                    <span>Integrations</span>
                    <ul style={{marginTop: '10px'}}>
                    {i == 2 ? (<li>Contact Us</li>) :
                     (
                      <>
                        <li>CRM Integration</li>
                        <li>Google Calendar</li>
                        <li>MindBody</li>
                        <li>Outlook</li>
                        {i == 1 && (
                          <>
                            <li className="inactive-integration">SevenRooms</li>
                            <li className="inactive-integration">OpenTable</li>
                            <li className="inactive-integration">Timely</li>
                            <li className="inactive-integration">Fresha</li>
                            <li className="inactive-integration">Chope</li>
                            <li className="inactive-integration">GloFox</li>
                          </>
                        )}
                        <li>CRM Contact Sync</li>
                        <li>CRM Calendar Sync</li>
                        <li>CRM Data Mapping</li>
                      </>
                    )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div key={10000} className="pricing-content reach-out minified mt-4 mb-4">
            <div className="d-flex">
              <div className="pricing-details minified">
                <h2>
                  Not Sure What Bundle Is Best For You?
                </h2>
                Connect with us! Scan and Reach Out Today!
                <div style={{
                  marginTop: '10px',
                  background: 'linear-gradient(55.47deg, #29F2BC -3.41%, #4877FF 51.36%, #F945B3 106.13%)', 
                  textAlign: 'center', 
                  boxShadow: '0px 4px 8px 5px rgba(221, 221, 221, 0.25)',
                  width: '100%', 
                  borderRadius: '10px',
                  padding: '10px',
                }}>
                  <QRCode
                    size={200}
                    value={`mailto:support@chaaat.io?subject=${encodeURIComponent(`${agencyUser?.agency.agency_name}: Subscription Plan Enquiry`)}`}
                    viewBox={`10 10 400 200`}
                    level={'L'}
                  />
                </div>
                <br/>
                <a href={`https://web.whatsapp.com/send/?phone=85268793050&text&type=phone_number&app_absent=0`} target="_blank">
                  WhatsApp Web
                </a>
                <br/>
                <a href={`https://wa.me/85268793050`} target="_blank">
                  WhatsApp Desktop App
                </a>
                <br/>
                <a href={`mailto:support@chaaat.io?subject=${encodeURIComponent(`${agencyUser?.agency.agency_name}: Subscription Plan Enquiry`)}`} target="_blank">
                  Email us @ support@chaaat.io
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}