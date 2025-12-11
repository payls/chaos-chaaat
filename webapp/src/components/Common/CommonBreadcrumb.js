import React, { useState, useEffect } from 'react';
import { h } from '../../helpers';
import Link from 'next/link';

/**
 * Common breadcrumb component
 * @param {Array<{route?:string, text:string}>} breadcrumbs
 * @returns {JSX.Element}
 * @constructor
 */
export default function CommonBreadcrumb({ breadcrumbs }) {
  return (
    <div className="row mb-5">
      <div className="col-12">
        {h.notEmpty(breadcrumbs) &&
          breadcrumbs.map((breadcrumb, index) => {
            const suffix = breadcrumbs.length - 1 === index ? '' : ' / ';
            return (
              <span key={breadcrumb.route || ''}>
                {h.notEmpty(breadcrumb.route) ? (
                  <Link href={breadcrumb.route}>{breadcrumb.text}</Link>
                ) : (
                  <span>{breadcrumb.text}</span>
                )}
                {suffix}
              </span>
            );
          })}
      </div>
    </div>
  );
}
