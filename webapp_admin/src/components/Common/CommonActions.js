import React from 'react';
import { h } from '../../helpers';
import { useRouter } from 'next/router';

/**
 * Common action buttons
 * @param {{actions:array<{route:string, text:string, buttonVariant?:string}>, className?:string}} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function CommonActions(props) {
  const router = useRouter();
  const { actions, className = 'float-right' } = props;

  return (
    <div className="row">
      <div className="col-12 col-sm-12">
        {h.notEmpty(actions) &&
          actions.map(({ route, text, buttonVariant = 'primary' }, index) => {
            return (
              <span key={`${text}_${index}`}>
                <h.form.CustomButton
                  variant={buttonVariant}
                  type="button"
                  className={`${className} ml-1`}
                  onClick={async () => await router.push(route)}
                >
                  {text}
                </h.form.CustomButton>
              </span>
            );
          })}
      </div>
    </div>
  );
}
