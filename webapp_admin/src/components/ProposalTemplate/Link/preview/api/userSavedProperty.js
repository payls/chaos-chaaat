import { config } from '../configs/config';
import { h } from '../helpers';
import Axios from 'axios';
import propertyData from '../data/property-data.json';

/**
 * Create user's saved property record
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function create(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/user-saved-property`,
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
 * Delete user's saved property record
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function destroy(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/user-saved-property/${data.property_fk}`,
    method: 'delete',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  return h.api.handleApiResponse(response, showMessage);
}

/**
 * Find user's saved property record by property id
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function findOne(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/user-saved-property/${data.property_fk}`,
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
 * Get user's list of saved properties
 * @param {object} [data]
 * @param {boolean} [showMessage=true]
 * @returns {Promise<{data: {}, status: string}>}
 */
export async function getAll(data, showMessage) {
  const response = await Axios({
    url: `${config.apiUrl}/v1/user-saved-property`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  let apiRes = { status: 'ok', data: { savedProperties: {} } };
  const savedProperties = h.notEmpty(response.data.user_saved_properties)
    ? response.data.user_saved_properties.map((apiPropertyRes) => {
        const [propertyRes] = propertyData
          .map((project) => {
            const property = project.units_available_for_purchase.find(
              (property) => property.property_id === apiPropertyRes.property_fk,
            );
            if (property) {
              return {
                ...property,
                project,
              };
            }
          })
          .filter((project) => project);

        return propertyRes;
      })
    : [];
  apiRes.data.savedProperties = savedProperties;
  return h.api.handleApiResponse(apiRes, showMessage);
}
