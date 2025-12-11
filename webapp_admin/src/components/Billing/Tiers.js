import React, { useState, useEffect } from 'react';

import { h } from '../../helpers';
import { api } from '../../api';
import { config } from '../../configs/config';
import { routes } from '../../configs/routes';

import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';

export default React.memo(() => {
  const [agencyUser, setAgencyUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState();
  const [period, setPeriod] = useState(null);

  const scriptUrl = 'https://js.stripe.com/v3/pricing-table.js';
  useEffect(() => {
    (async () => {
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
    const subsRes = await api.agency.getSubscription(
      {
        agency_id,
      },
      false,
    );
    if (subsRes.data.plan) {
      setPlan(subsRes.data.plan);
      setSubscriptionStatus(subsRes.data.subscriptionStatus);
      setSubscription(subsRes.data.subscription);
      setPeriod(subsRes.data.period);
    } else {
      window.location.href = h.getRoute(routes.pricing);
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

  return (
    <div
      className="contacts-root"
      style={{ height: '100%', background: '#fff' }}
    >
      {agencyUser && plan && subscription && (
        <div className=" d-flex justify-content-center">
          <section className="subscription-wrapper d-flex justify-content-between">
            <div>
              <h6>Current Plan</h6>
              <h3>{plan?.name}</h3>

              {subscriptionStatus === 'trial' &&
                h.notEmpty(subscription.trial_start) &&
                moment(subscription.trial_end).isBefore(moment()) && (
                  <>
                    <h1>Free</h1>
                    <small>
                      Your free plan ends on{' '}
                      {moment
                        .unix(subscription.trial_end)
                        .format('DD MMM YYYY')}
                    </small>
                    <br />
                  </>
                )}

              {subscription &&
                (!subscription.trial_start ||
                  (h.notEmpty(subscription.trial_end) &&
                    moment(subscription.trial_end).isAfter(moment()))) && (
                  <>
                    <h1>
                    ${(subscription?.plan.amount / 100).toFixed(2)}{' '}
                      {getPlanType(subscription?.plan?.id) === 'recurring'
                        ? ' per month'
                        : ''}
                    </h1>
                    {period && (
                      <small>
                        Your plan{' '}
                        {moment(subscription.current_period_end).isBefore(
                          moment(),
                        ) ? (
                          <>
                            {subscription?.status === 'canceled'
                              ? 'is until'
                              : 'renews on'}{' '}
                            {moment
                              .unix(subscription.current_period_end)
                              .format('LL')}
                          </>
                        ) : (
                          'is expired'
                        )}
                      </small>
                    )}{' '}
                  </>
                )}

              {subscription?.status === 'canceled' && (
                <>
                  (
                  <span
                    style={{ color: '#fe5959', cursor: 'pointer' }}
                    onClick={() => {
                      window.location.href = h.getRoute(routes.pricing);
                    }}
                  >
                    Upgrade
                  </span>{' '}
                  or{' '}
                  <span
                    style={{ color: '#fe5959', cursor: 'pointer' }}
                    onClick={cancel}
                  >
                    Cancel
                  </span>
                  )
                </>
              )}
            </div>
            <div
              style={{
                display: 'grid',
                placeItems: 'center',
                marginRight: '30px',
              }}
            >
              <FontAwesomeIcon
                icon={
                  moment(subscription.current_period_end).isBefore(moment())
                    ? faCheckCircle
                    : faTimesCircle
                }
                color="#d4d4d4"
                size="5x"
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
});
