import React from 'react';
import { h } from '../../helpers';
import Image from 'next/image';

function ProposalFooter({ customStyle, agencyUser, translate, headerRef }) {
  return (
    <div
      className="d-flex flex-column w-100 align-items-center justify-content-center pb-3"
      style={{ background: customStyle?.footer?.background }}
    >
      <>
        {h.notEmpty(agencyUser?.agency?.agency_logo_url) ? (
          <Image
            src={agencyUser?.agency?.agency_logo_url}
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
            {h.user.getNameInitials(agencyUser?.agency?.agency_name)}
          </span>
        )}
      </>
      <div
        className="pt-3 text-center"
        style={{
          color: customStyle?.footer?.text,
          fontFamily: 'PoppinsRegular',
        }}
      >
        {h.translate.localize('poweredBy', translate)}{' '}
        <a
          href="https://www.chaaat.io/"
          target="_blank"
          style={{
            textDecoration: 'underline',
            color: customStyle?.footer?.text,
          }}
        >
          Pave
        </a>
      </div>
      <div
        className="toTop"
        style={{
          background: customStyle?.projectFeatures?.iconBg,
          color: customStyle?.projectFeatures?.iconColor,
        }}
        onClick={() => {
          headerRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }}
      >
        &uarr;
      </div>
    </div>
  );
}

export default React.memo(ProposalFooter);
