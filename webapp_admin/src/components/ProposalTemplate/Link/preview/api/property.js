import {config} from '../configs/config';
import {h} from '../helpers';
import Axios from 'axios';
import countryData from '../data/country-data.json';
import propertyData from '../data/property-data.json';

/**
 * Get property by slug
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getPropertyBySlug(data, showMessage) {
  let apiRes = {status: 'ok', data: {property: {}}};
  if (propertyData) {
    for (let i = 0; i < propertyData.length; i++) {
      const property = propertyData[i];
      if (h.cmpStr(data.slug, property.slug)) {
        apiRes.data.property = property;
        if (countryData) {
          for (let j = 0; j < countryData.length; j++) {
            const country = countryData[j];
            if (h.cmpStr(property.country_fk, country.country_id)) {
              apiRes.data.property.country = country;
            }
          }
        }
      }
    }
  }
  return apiRes;
}

/**
 * Create property
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function create(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/property`,
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Update property by property id
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function update(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/property`,
    method: 'put',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get properties that belongs to current user
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findAll(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/property`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Get one property by property_id
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findOne(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/property/${data.property_id}`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}
