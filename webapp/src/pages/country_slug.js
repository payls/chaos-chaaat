import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { h } from '../helpers';
import { useRouter } from 'next/router';
import { Body, Footer, Header } from '../components/Layouts/Layout';
import propertyData from '../data/property-data.json';
import { PartialListingCard } from '../components/Partials/PartialListingCard';

export default function CountryPageSlug() {
  const router = useRouter();
  const [country, setCountry] = useState();

  useEffect(() => {
    h.route.redirectToHome();
  }, []);

  useEffect(() => {
    (async () => {
      const { country_slug } = router.query;
      const apiRes = await api.content.country.getCountryBySlug(
        { slug: country_slug },
        false,
      );
      if (h.cmpStr(apiRes.status, 'ok')) {
        setCountry(apiRes.data.country);
      }
    })();
  }, [router.query]);

  return (
    h.notEmpty(country) && (
      <div>
        <Header title={country.title.rendered} />
        <Body className="mb-5 pb-5">
          <section
            className="country-description-section w-100 position-relative"
            style={{
              backgroundPosition: 'center center',
              backgroundSize: 'cover',
              backgroundImage: `url(${country.fimg_url})`,
            }}
          >
            <div className="overlay" />
            <div className="container h-100">
              <div className="row no-gutters align-items-center text-white">
                <div className="col-12 col-lg-7" style={{ zIndex: 9 }}>
                  <h1 className="display-4 pt-5 pt-lg-0 pb-5 pb-lg-0">
                    {country.title.rendered}
                  </h1>
                </div>
                <div className="country-description col-12 col-lg-5 mt-0 mt-lg-5">
                  <p className="m-4" style={{ fontSize: 14 }}>
                    {country.description_1}
                  </p>
                  <p className="m-4" style={{ fontSize: 14 }}>
                    {country.description_2}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-5 pt-5">
            <div className="container pt-5">
              {h.notEmpty(country.projects) &&
                country.projects.map((project, index) => {
                  return (
                    <PartialListingCard
                      key={index}
                      images={project.images}
                      projectName={project.name}
                      projectLocation={project.location.address}
                      completionStatusActiveCount={parseInt(
                        project.completion_status * 10,
                      )}
                      completionStatusInactveCount={
                        10 - parseInt(project.completion_status * 10)
                      }
                      availabilityActiveCount={parseInt(
                        project.availability * 10,
                      )}
                      availabilityInactiveCount={
                        10 - parseInt(project.availability * 10)
                      }
                      pricing={project.pricing_description}
                      bedrooms={project.bedrooms_description}
                      residences={project.residences_description}
                      estimated_completion={project.estimated_completion}
                      description={project.description}
                      downloadBrochureLink={project.brochure_url}
                      learnMoreLink={project.breadcrumbs[1].url}
                    />
                  );
                })}
            </div>
          </section>
        </Body>
        <Footer />
      </div>
    )
  );
}
