import React, { useEffect, useState } from 'react';
import * as Sentry from '@sentry/nextjs';

function Error({ err }) {
  const [errorSent, setErrorSent] = useState(false);
  useEffect(async() => {
    if (!errorSent && err) {
      await Sentry.captureUnderscoreErrorException(err);
      setErrorSent(true);
    }
  }, [err]);
  useEffect(() => {
    try {
      window && window.newrelic ? window.newrelic.noticeError(err) : null;
    } catch (err) {
      console.log(`Failed to send error to New Relic`, {
        err,
      });
      throw err;
    }
  }, []);
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <p>An unexpected error has occured.</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  return { err };
};

export default Error;
