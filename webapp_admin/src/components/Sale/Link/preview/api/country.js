import propertyData from '../data/property-data.json';
import {h} from '../helpers';
import countryData from '../data/country-data.json';

/**
 * Get country by slug
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getCountryBySlug(data, showMessage) {
  let apiRes = {status: 'ok', data: {country: {}}};
  if (countryData) {
    for (let i = 0; i < countryData.length; i++) {
      const country = countryData[i];
      if (h.cmpStr(data.slug, country.slug)) {
        apiRes.data.country = country;
        apiRes.data.country.projects = [];
        if (propertyData) {
          for (let j = 0; j < propertyData.length; j++) {
            const property = propertyData[j];
            if (h.cmpStr(property.country_fk, country.country_id)) {
              apiRes.data.country.projects.push(property);
            }
          }
        }
      }
    }
  }
  return apiRes;
}
