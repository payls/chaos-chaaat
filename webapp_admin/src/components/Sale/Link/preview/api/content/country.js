import Axios from 'axios';
import {config} from '../../configs/config';
import propertyData from '../../data/property-data.json';
import {h} from '../../helpers';

export async function findAll(data, showMessage) {
  let response = await Axios({
    url: `${config.contentApiUrl}/v2/country?_embed`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data,
  });
  if (response && response.data) {
    response.data.sort((a, b) =>
      a.title.rendered > b.title.rendered
        ? 1
        : b.title.rendered > a.title.rendered
          ? -1
          : 0,
    );
    //Filter records that are not visible in production
    if (h.cmpStr(config.env, 'production')) {
      response.data = response.data.filter((item) =>
        h.cmpInt(item.visible_in_production, 1),
      );
    }
  }
  return h.api.handleApiResponse(response, showMessage);
}

export async function getCountryBySlug(data, showMessage) {
  const response = await Axios({
    url: `${config.contentApiUrl}/v2/country?_embed`,
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  let apiRes = {status: 'ok', data: {country: {}}};
  let countryData = response.data;
  if (countryData) {
    for (let i = 0; i < countryData.length; i++) {
      const country = countryData[i];
      if (h.cmpStr(data.slug, country.slug)) {
        apiRes.data.country = country;
        apiRes.data.country.projects = [];
        if (propertyData) {
          for (let j = 0; j < propertyData.length; j++) {
            const property = propertyData[j];
            if (h.cmpStr(property.country_fk, country.id)) {
              apiRes.data.country.projects.push(property);
            }
          }
        }
      }
    }
  }
  return apiRes;
}
