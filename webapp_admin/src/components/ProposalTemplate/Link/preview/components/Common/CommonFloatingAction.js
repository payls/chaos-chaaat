import React from 'react';
import {h} from '../../helpers';
import {useRouter} from 'next/router';

/**
 * Common floating action button
 * @param {{route:string, text:string, buttonVariant?:string}} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function CommonFloatingAction(props) {
  const router = useRouter();
  const {route, text, buttonVariant = 'primary', onClick} = props;

  return (
    <h.form.CustomButton
      variant={buttonVariant}
      type="button"
      className="position-absolute p-2"
      style={{
        bottom: 20,
        right: 100,
        zIndex: 99999,
        borderRadius: '50%',
        height: 60,
        width: 60,
      }}
      onClick={async () => {
        if (onClick) onClick();
        else await router.push(route);
      }}
    >
      <span style={{fontSize: 20}}>{text}</span>
    </h.form.CustomButton>
  );
}
