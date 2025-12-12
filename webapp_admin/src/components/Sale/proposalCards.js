import React from 'react';
import { h } from '../../helpers';
import { useRouter } from 'next/router';
import { routes } from '../../configs/routes';

export default function ProposalCards(props) {
  const router = useRouter();
  const { selectedContactId, formMode } = props;

  let params_create_link = {};
  if (h.notEmpty(selectedContactId))
    params_create_link.contact_id = selectedContactId;
  if (h.notEmpty(formMode)) params_create_link.form_mode = formMode;
  return (
    <div className={'row justify-content-center pt-5'}>
      <div className={'col-xl-2 col-lg-3 col-md-3'}>
        <div className={'card h-100'}>
          <div className={'card-body d-flex flex-column'}>
            <h5 className={'card-title'}>General Enquiry</h5>
            <p className={'card-text'}>
              Send one or more properties to a prospect to gather their interest
              in the project.{' '}
            </p>
            <button
              className={'btn btn-primary mt-auto common-button-simplified'}
              onClick={(e) => {
                router.push(
                  h.getRoute(
                    h.isEmpty(selectedContactId)
                      ? routes.sales.create_link
                      : routes.sales.edit,
                    {
                      is_general_enquiry: 'true',
                      ...params_create_link,
                    },
                  ),
                );
              }}
            >
              Send proposal without pricing
            </button>
          </div>
        </div>
      </div>
      <div className={'col-xl-2 col-lg-3 col-md-3'}>
        <div className={'card h-100'}>
          <div className={'card-body d-flex flex-column'}>
            <h5 className={'card-title'}>With Pricing</h5>
            <p className={'card-text'}>
              Send one or properties to a prospect with pricing included.
            </p>
            <button
              className={'btn btn-primary mt-auto common-button-simplified'}
              onClick={(e) => {
                router.push(
                  h.getRoute(
                    h.isEmpty(selectedContactId)
                      ? routes.sales.create_link
                      : routes.sales.edit,
                    {
                      is_general_enquiry: 'false',
                      ...params_create_link,
                    },
                  ),
                );
              }}
            >
              Send proposal with pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
