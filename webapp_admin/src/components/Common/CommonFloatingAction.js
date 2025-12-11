import React from 'react';
import { h } from '../../helpers';
import { useRouter } from 'next/router';

/**
 * Common floating action button
 * @param {{route:string, text:string, buttonVariant?:string}} props
 * @returns {JSX.Element}
 * @constructor
 */
export default function CommonFloatingAction(props) {
  const router = useRouter();
  const { route, text, buttonVariant = 'primary', onClick } = props;

  return (
    <h.form.CustomButton
      variant={buttonVariant}
      type="button"
      className="position-absolute"
      style={{
        bottom: 10,
        right: 10,
        zIndex: 99999,
        borderRadius: '50%',
        height: 50,
        width: 50,
      }}
      onClick={async () => {
        if (onClick) onClick();
        else await router.push(route);
      }}
    >
      {text}
    </h.form.CustomButton>
  );
}
