import { h } from '../../helpers';

import React from 'react';
import Link from 'next/link';
import Carousel from '../../components/Common/Carousel';

export function PartialListingCard({
  images,
  projectName,
  projectLocation,
  completionStatusActiveCount = 0,
  completionStatusInactveCount = 0,
  availabilityActiveCount = 0,
  availabilityInactiveCount = 0,
  pricing = '',
  bedrooms = '',
  residences = '',
  estimated_completion = '',
  description,
  downloadBrochureLink,
  learnMoreLink,
}) {
  images = h.isEmpty(images)
    ? [{ src: '/assets/images/listing-placeholder.png', alt: '' }]
    : images;
  return (
    <div className="row mt-4 mb-5 pb-5">
      <div className="col-12 col-lg-5">
        <img src={images[0].src} alt={images[0].alt} class="img-fluid" />
      </div>
      <div className="col-12 col-lg-6 pt-5">
        <table className="listing-table" cellPadding={6}>
          <tbody>
            {h.notEmpty(projectName) && (
              <tr>
                <th style={{ width: 170 }} className="font-MontserratSemiBold">
                  Project Name
                </th>
                <td>{projectName}</td>
              </tr>
            )}
            {h.notEmpty(projectLocation) && (
              <tr>
                <th className="font-MontserratSemiBold">Project Location</th>
                <td>{projectLocation}</td>
              </tr>
            )}
            {h.notEmpty(completionStatusActiveCount) &&
              h.notEmpty(completionStatusInactveCount) && (
                <tr>
                  <th className="font-MontserratSemiBold">Completion Status</th>
                  <td>
                    {[...Array(completionStatusActiveCount)].map(() => {
                      return <StatusIcon status="active" />;
                    })}
                    {[...Array(completionStatusInactveCount)].map(() => {
                      return <StatusIcon status="inactive" />;
                    })}
                  </td>
                </tr>
              )}
            {h.notEmpty(availabilityActiveCount) &&
              h.notEmpty(availabilityInactiveCount) && (
                <tr>
                  <th className="font-MontserratSemiBold">Availability</th>
                  <td>
                    {[...Array(availabilityActiveCount)].map(() => {
                      return <StatusIcon status="active" />;
                    })}
                    {[...Array(availabilityInactiveCount)].map(() => {
                      return <StatusIcon status="inactive" />;
                    })}
                  </td>
                </tr>
              )}
            {h.notEmpty(pricing) && (
              <tr>
                <th className="font-MontserratSemiBold">Pricing</th>
                <td>{pricing}</td>
              </tr>
            )}
            {h.notEmpty(bedrooms) && (
              <tr>
                <th className="font-MontserratSemiBold">Bedrooms</th>
                <td>{bedrooms}</td>
              </tr>
            )}
            {h.notEmpty(residences) && (
              <tr>
                <th className="font-MontserratSemiBold">Residences</th>
                <td>{residences}</td>
              </tr>
            )}
            {h.notEmpty(estimated_completion) && (
              <tr>
                <th className="font-MontserratSemiBold">
                  Estimated Completion
                </th>
                <td>{estimated_completion}</td>
              </tr>
            )}
            <tr>
              <th className="font-MontserratSemiBold">Description</th>
              <td>{description}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4">
          {h.notEmpty(downloadBrochureLink) && (
            <a target="_blank" href={downloadBrochureLink}>
              <h.form.CustomButton
                className="btn-custom-outline-primary1"
                variant="outline-primary"
              >
                Download e-brochure
              </h.form.CustomButton>
            </a>
          )}
          {h.notEmpty(learnMoreLink) && (
            <Link href={learnMoreLink}>
              <h.form.CustomButton
                className="btn-custom-outline-primary1 ml-0 ml-sm-3 mt-3 mt-sm-0 d-block d-sm-inline-block"
                variant="outline-primary"
              >
                Learn more
              </h.form.CustomButton>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatusIcon({ status = 'inactive' }) {
  const imgStyle = {
    width: 13,
    marginRight: 5,
  };
  return h.cmpStr(status, 'inactive') ? (
    <img style={imgStyle} src="/assets/images/status-inactive-icon.png" />
  ) : (
    <img style={imgStyle} src="/assets/images/status-active-icon.png" />
  );
}
