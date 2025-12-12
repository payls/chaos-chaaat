import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import { api } from '../../api';
import { routes } from '../../configs/routes';
import moment from 'moment';

// STYLES
import IconCircleCheck from '../ProposalTemplate/Link/preview/components/Icons/IconCircleCheck';
import IconDoubleCaretRight from '../ProposalTemplate/Link/preview/components/Icons/IconDoubleCaretRight';

export default function Subscription({isLoading, setLoading}) {
  const [agencyUser, setAgencyUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [productName, setProductName] = useState();
  const [subscriptionStatus, setSubscriptionStatus] = useState();
  const [period, setPeriod] = useState(null);
  const [session, setSession] = useState(null);
  const [subscriptionMatrix, setSubscriptionMatrix] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [mainSubscriptionItem, setMainSubscriptionItem] = useState([]);

  const scriptUrl = 'https://js.stripe.com/v3/pricing-table.js';
  useEffect(() => {
    (async () => {
      setLoading(true);
      h.auth.isLoggedInElseRedirect();
      const apiRes = await api.agencyUser.getCurrentUserAgencyNoRedirect(
        {},
        false,
      );
      if (h.cmpStr(apiRes.status, 'ok')) {
        if (apiRes.data.agencyUser) {
          await getSubscription(apiRes.data.agencyUser.agency_fk);
        }
        setAgencyUser(apiRes.data.agencyUser);
      }
      setLoading(false);
    })();

    // Create a script element
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;

    // Append the script to the document body
    document.body.appendChild(script);

    // Clean up the script when the component is unmounted
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function getSubscription(agency_id) {
    setLoading(true);
    const subsRes = await api.agency.getSubscription(
      {
        agency_id,
      },
      false,
    );
    if (subsRes.data.plan) {
      setSession(subsRes.data.session);
      setPlan(subsRes.data.plan);
      setProductName(subsRes.data.productName);
      setSubscriptionStatus(subsRes.data.subscriptionStatus);
      setSubscription(subsRes.data.subscription);
      getMainSubscriptionItem(subsRes.data.subscription);
      setPeriod(subsRes.data.period);
      setSubscriptionMatrix(subsRes.data.matrix);
      setInventory(subsRes.data.inventory);
      setLoading(false);
    } else {
      // window.location.href = h.getRoute(routes.pricing);
      setLoading(false);
    }
  }

  /**
   * The `async function cancel()` is a function that prompts the user with a confirmation message asking if they are sure
   * they want to cancel their subscription. If the user confirms the cancellation, it makes an API call to cancel the
   * subscription for the agency associated with the user. If the cancellation is successful (status is 'ok'), it then
   * fetches the updated subscription details by calling the `getSubscription()` function for the same agency.
   *
   * @async
   * @function
   * @name cancel
   * @kind function
   * @memberof default.React.memo() callback
   * @returns {Promise<void>}
   */
  async function cancel() {
    h.general.prompt(
      {
        message: `Are you sure you want to cancel your subscription?`,
      },

      async (status) => {
        if (status) {
          const cancelRes = await api.agency.cancelSubscription(
            {
              agency_id: agencyUser?.agency_fk,
              subscription_id: subscription?.id,
            },
            true,
          );

          if (h.cmpStr(cancelRes.status, 'ok')) {
            await getSubscription(agencyUser?.agency_fk);
          }
        }
      },
    );
  }

  /**
   * The `getPlanType(planId)` function is used to retrieve the type of a plan based on its ID.
   *
   * @function
   * @name getPlanType
   * @kind function
   * @memberof default.React.memo() callback
   * @param {any} planId
   * @returns {any}
   */
  function getPlanType(planId) {
    const item = subscription.items.data.find((f) => f.plan.id === planId);

    if (h.notEmpty(item)) {
      return item?.price?.type;
    }

    return null;
  }

  /**
   * Description
   * Function to either redirect to pricing page or generate a customer portal link to manage billing details
   * @async
   * @function
   * @name handleUpgradeButton
   * @kind function
   * @memberof Subscription
   * @returns {Promise<void>}
   */
  async function handleUpgradeButton() {
    setLoading(true);
    if (h.isEmpty(subscription)) {
      window.location.href = h.getRoute(routes.pricing);
    } else {
      const apiRes = await api.agency.generateCustomerPortalLink(agencyUser.agency_fk, subscription?.id, false);
      if (h.cmpStr(apiRes.status, 'ok')) {
        let sessionUrl = apiRes.data.session_url;
        if (!sessionUrl.startsWith('http')) {
          sessionUrl = `https://${sessionUrl}`;
        }
        window.open(sessionUrl, '_blank');
      }
    }
    setLoading(false);
  }

  /**
   * Description
   * Generates a cancel subscription link to stripe
   * @async
   * @function
   * @name handleCancelSubscription
   * @kind function
   * @memberof Subscription
   */
  async function handleCancelSubscription() {
    setLoading(true);
    const apiRes = await api.agency.generateCustomerSubscriptionCancelLink(agencyUser.agency_fk, subscription?.id, false);
    if (h.cmpStr(apiRes.status, 'ok')) {
      let sessionUrl = apiRes.data.session_url;
      if (!sessionUrl.startsWith('http')) {
        sessionUrl = `https://${sessionUrl}`;
      }
      window.open(sessionUrl, '_blank');
    }
    setLoading(false);
  }

  /**
   * Description
   * Fetch the main subscription item from the subscription object
   * @function
   * @name getMainSubscriptionItem
   * @kind function
   * @memberof Subscription
   * @param {object} subscriptionObj
   * @returns {boolean}
   */
  function getMainSubscriptionItem(subscriptionObj) {
    const subscriptionItems = subscriptionObj?.items?.data;
    if (h.notEmpty(subscriptionItems)) {
      const pricingIds = [
        process.env.NEXT_PUBLIC_TRIAL_PRICE,
        process.env.NEXT_PUBLIC_BETA_USER_PRICE,
        process.env.NEXT_PUBLIC_STARTER_PRICE,
        process.env.NEXT_PUBLIC_PRO_PRICE,
      ];
      console.log(subscriptionItems);
      const itemResult = subscriptionItems.filter(item => pricingIds.includes(item.price.id));
      setMainSubscriptionItem(itemResult[0]);
    }
  }

  return (
    <div className="subscription-plan-wrapper mt-3">
      <h3>Your Subscription Plan</h3>
      <h4 className="mb-5">
        Your selected plan will be activated and charges will be made
        accordingly
      </h4>
      <div className="d-flex justify-content-center">
        <div className={`subscription-current-content ${h.cmpBool(isLoading, false) && h.notEmpty(subscription) ? ("minified") : ("no-plan")} mr-4`}>
          <div className="subscription-current-plan">
            <div className="subscription-current-title d-flex justify-content-between align-items-center mt-4">
              {h.cmpBool(isLoading, true) && (
                <>
                  <b>
                    Loading...
                  </b>
                  <IconCircleCheck />
                </>
              )}
              {h.cmpBool(isLoading, false) && h.notEmpty(subscription) && (
                <>
                  <b>
                    {plan?.name}
                  </b>
                  <IconCircleCheck />
                </>
              )}
              {h.cmpBool(isLoading, false) && h.isEmpty(subscription) && (
                <>
                  <b>
                    No Active Subscription Plan
                  </b>
                </>
              )}
            </div>
            <div className="subscription-current-price d-flex justify-content-start align-items-center mt-1">
              {productName === 'Trial' && (
                  <>
                    <b>Free</b>
                  </>
                )}

              {productName !== 'Trial' && subscription &&
                (!subscription.trial_start ||
                  (h.notEmpty(subscription.trial_end) &&
                    moment(subscription.trial_end).isAfter(moment()))) && (
                  <>
                    <b>${(mainSubscriptionItem?.plan.amount / 100).toFixed(2)}</b>
                    <span>
                      /{' '}
                      {getPlanType(mainSubscriptionItem?.plan?.id) === 'recurring'
                        ? ' month'
                        : ''}
                    </span>
                  </>
                )}
            </div>
          </div>
        </div>
        {subscriptionMatrix && inventory && (
          <div className="subscription-current-usage">
            <div className="subscription-current-plan">
              <div className="subscription-current-title d-flex justify-content-between align-items-center">
                <div className="d-flex ">
                  <div class="subscription-stat-container mr-4">
                      <div class="stat-details stat-header">
                          <div class="stat-box label-left">Created Channels</div>
                          <div class="stat-box label-right">Allowed Channels</div>
                      </div>
                      <div class="stat-details stat-content">
                          <div class="stat-box label-left">{inventory.total_channels}</div>
                          <div class="stat-box label-right">{subscriptionMatrix.allowed_channels}</div>
                      </div>
                      <div class="stat-details bottom-box">
                          <div class="stat-box mt-2">
                            <progress value={inventory.total_channels} max={subscriptionMatrix.allowed_channels}></progress>
                          </div>
                      </div>
                  </div>
                  <div class="subscription-stat-container">
                      <div class="stat-details stat-header">
                          <div class="stat-box label-left">Created Campaigns</div>
                          <div class="stat-box label-right">Allowed Campaigns</div>
                      </div>
                      <div class="stat-details stat-content">
                      <div class="stat-box label-left">{inventory.total_campaigns}</div>
                      <div class="stat-box label-right">{subscriptionMatrix.allowed_campaigns}</div>
                      </div>
                      <div class="stat-details bottom-box">
                          <div class="stat-box mt-2">
                             <progress value={inventory.total_campaigns} max={subscriptionMatrix.allowed_campaigns}></progress>
                          </div>
                      </div>
                  </div>
                </div>
              </div>
              <div className="subscription-current-title d-flex justify-content-between align-items-center mt-2">
                <div className="d-flex ">
                  <div class="subscription-stat-container mr-4">
                      <div class="stat-details stat-header">
                          <div class="stat-box label-left">Created Users</div>
                          <div class="stat-box label-right">Allowed Users</div>
                      </div>
                      <div class="stat-details stat-content">
                          <div class="stat-box label-left">{inventory.total_users}</div>
                          <div class="stat-box label-right">{subscriptionMatrix.allowed_users}</div>
                      </div>
                      <div class="stat-details bottom-box">
                          <div class="stat-box mt-2">
                            <progress value={inventory.total_users} max={subscriptionMatrix.allowed_users}></progress>
                          </div>
                      </div>
                  </div>
                  <div class="subscription-stat-container">
                      <div class="stat-details stat-header">
                          <div class="stat-box label-left">Created Automations</div>
                          <div class="stat-box label-right">Allowed Automations</div>
                      </div>
                      <div class="stat-details stat-content">
                      <div class="stat-box label-left">{inventory.total_automations}</div>
                      <div class="stat-box label-right">{subscriptionMatrix.allowed_automations}</div>
                      </div>
                      <div class="stat-details bottom-box">
                          <div class="stat-box mt-2">
                             <progress value={inventory.total_automations} max={subscriptionMatrix.allowed_automations}></progress>
                          </div>
                      </div>
                  </div>
                </div>
              </div>
              <div className="subscription-current-title d-flex justify-content-between align-items-center mt-2">
                <div className="d-flex ">
                  <div class="subscription-stat-container mr-4">
                      <div class="stat-details stat-header">
                          <div class="stat-box label-left">Created Contacts</div>
                          <div class="stat-box label-right">Allowed Contacts</div>
                      </div>
                      <div class="stat-details stat-content">
                          <div class="stat-box label-left">{inventory.total_contacts}</div>
                          <div class="stat-box label-right">{subscriptionMatrix.allowed_contacts}</div>
                      </div>
                      <div class="stat-details bottom-box">
                          <div class="stat-box mt-2">
                            <progress value={inventory.total_contacts} max={subscriptionMatrix.allowed_contacts}></progress>
                          </div>
                      </div>
                  </div>
                  <div class="subscription-stat-container">
                      <div class="stat-details stat-header">
                          <div class="stat-box label-left">Sent Messages</div>
                          <div class="stat-box label-right">Allowed Messages</div>
                      </div>
                      <div class="stat-details stat-content">
                      <div class="stat-box label-left">{inventory.total_messages}</div>
                      <div class="stat-box label-right">{subscriptionMatrix.allowed_outgoing_messages}</div>
                      </div>
                      <div class="stat-details bottom-box">
                          <div class="stat-box mt-2">
                             <progress value={inventory.total_messages} max={subscriptionMatrix.allowed_outgoing_messages}></progress>
                          </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {subscription && h.notEmpty(subscriptionMatrix) && (
        <div className="d-flex justify-content-center mt-3">
          <div className="subscription-info d-flex">
            <div style={{
              marginBottom: '10px',
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '20px',
              lineHeight: '30px',
              color: '#4877FF',
            }}>
                Includes
            </div>
            <div></div>
            <div>
              <IconDoubleCaretRight className="mr-2" /> {subscriptionMatrix.allowed_channels} Channel{subscriptionMatrix.allowed_channels > 1 ? 's':''}
            </div>
            <div>
              <IconDoubleCaretRight className="mr-2" /> {subscriptionMatrix.allowed_campaigns} Campaign{subscriptionMatrix.allowed_campaigns > 1 ? 's':''}
            </div>
            <div>
              <IconDoubleCaretRight className="mr-2" /> {subscriptionMatrix.allowed_users} User{subscriptionMatrix.allowed_users > 1 ? 's':''}
            </div>
            <div>
              <IconDoubleCaretRight className="mr-2" /> {subscriptionMatrix.allowed_automations} Automation{subscriptionMatrix.allowed_automations > 1 ? 's':''}
            </div>
            <div>
              <IconDoubleCaretRight className="mr-2" /> {subscriptionMatrix.allowed_contacts} Contact{subscriptionMatrix.allowed_contacts > 1 ? 's':''}
            </div>
            <div>
              <IconDoubleCaretRight className="mr-2" /> {subscriptionMatrix.allowed_outgoing_messages} Message{subscriptionMatrix.allowed_outgoing_messages > 1 ? 's':''}
            </div>
          </div>
        </div>
      )}

      {period && (
        <div className="d-flex justify-content-center mt-3">
          <div className="subscription-valid-date">
            Your current plan is until{' '}
            {moment(subscription.current_period_end).isBefore(moment()) ? (
              <>
                {moment.unix(subscription.current_period_end).format('LL')}
              </>
            ) : (
              'is expired'
            )}
          </div>
        </div>
      )}

      <div className="d-flex justify-content-center mt-3 subscription-actions mt-5">
        {/* <button type="button"
            className="btn-gradient" onClick={() => {
          test()
        }}>Test</button> */}
        {h.notEmpty(subscription) && (
          <button
            type="button"
            className="btn-gradient"
            onClick={() => {
              handleCancelSubscription()
            }}
          >
            Cancel Subscription
          </button>
        )}
        <button
          type="button"
          className="btn-gradient"
          onClick={() => {
            handleUpgradeButton()
          }}
        >
          {h.isEmpty(subscription) ? 'Subscribe' : 'Click here to update you billing details'}
        </button>
        <a href={`mailto:support@chaaat.io`}>
          <button type="button" className="btn-normal">
            Contact Us
          </button>
        </a>
      </div>
    </div>
  );
}
