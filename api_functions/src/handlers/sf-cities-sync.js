const jsforce = require('jsforce');
const { Op } = require('sequelize');

const models = require('../models');
const h = require('../helpers');
const config = require('../configs/config')(process.env.NODE_ENV);

const Promise = require('bluebird');
const Sentry = require('@sentry/serverless');

if (process.env.LOG_TO_SENTRY === 'true') {
  Sentry.AWSLambda.init({
    dsn: 'https://c564f8c5d401dba75219d6c740aa1c16@o4505836464701440.ingest.us.sentry.io/4505837208207360',
    environment: process.env.NODE_ENV,
  });
}

const sfCitiesSync = async (event = {}) => {
  const functionName = 'SF_CITIES_SYNC';
  try {
    console.info('START SF_CITIES_SYNC', event);
    console.info(JSON.stringify(event));

    console.info('ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ Getting agencies with active sf oauth');

    const agencyOauth = await models.agency_oauth.findAll({
      where: {
        status: 'active',
        source: 'SALESFORCE',
        created_date: { [Op.gte]: '2023-10-01 00:00:00' },
      },
    });

    console.info(agencyOauth);

    await Promise.mapSeries(agencyOauth, async (oauth) => {
      const agencySF = oauth.dataValues;
      console.info('ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️', agencySF);

      const { access_token, refresh_token, instance_url } = JSON.parse(
        agencySF.access_info,
      );

      const oauthParams = {
        clientId: config.directIntegrations.salesforce.clientId,
        clientSecret: config.directIntegrations.salesforce.clientSecret,
        redirectUri: config.directIntegrations.salesforce.redirectUri,
      };

      if (instance_url.includes('sandbox')) {
        oauthParams.loginUrl = 'https://test.salesforce.com';
      }

      const oauth2 = new jsforce.OAuth2(oauthParams);

      const connParams = {
        oauth2,
        instanceUrl: instance_url,
        accessToken: access_token,
        refreshToken: refresh_token,
      };

      if (instance_url.includes('sandbox')) {
        connParams.loginUrl = 'https://test.salesforce.com';
      }

      const conn = new jsforce.Connection(connParams);

      await new Promise((resolve, reject) => {
        conn.oauth2.refreshToken(refresh_token, async (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
      if (instance_url.includes('executivecentre')) {
        console.info(
          `ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ℹ️ Getting agency cities of ${agencySF.agency_fk}`,
        );
        const cities = await new Promise((resolve, reject) => {
          const retrieved_cities = [];
          conn.query(
            'SELECT Id, Name, Name_jp__c, Name_kr__c, Name_zh_hans__c, Name_zh_hant__c, City_Code__c, Country__c FROM City__c',
            function (err, result) {
              if (err) {
                return reject(err);
              }
              const records = result.records;
              for (let index = 0; index < records.length; index++) {
                console.info(records[index]);
                retrieved_cities.push({
                  agency: agencySF.agency_fk,
                  id: records[index].Id,
                  name: records[index].Name,
                  code: records[index].City_Code__c,
                  language: 'en',
                  country: records[index].Country__c,
                });
                retrieved_cities.push({
                  agency: agencySF.agency_fk,
                  id: records[index].Id,
                  name: records[index].Name_jp__c,
                  code: records[index].City_Code__c,
                  language: 'jp',
                  country: records[index].Country__c,
                });
                retrieved_cities.push({
                  agency: agencySF.agency_fk,
                  id: records[index].Id,
                  name: records[index].Name_kr__c,
                  code: records[index].City_Code__c,
                  language: 'kr',
                  country: records[index].Country__c,
                });
                // retrieved_cities.push({
                //   agency: agencySF.agency_fk,
                //   id: records[index].Id,
                //   name: records[index].Name_zh_hans__c,
                //   code: records[index].City_Code__c,
                //   language: 'zh-hk',
                //   country: records[index].Country__c,
                // });
                retrieved_cities.push({
                  agency: agencySF.agency_fk,
                  id: records[index].Id,
                  name: records[index].Name_zh_hant__c,
                  code: records[index].City_Code__c,
                  language: 'zh-Hant',
                  country: records[index].Country__c,
                });
              }
              if (result.done) {
                resolve(retrieved_cities);
              }
            },
          );
        });

        for (let index = 0; index < cities.length; index++) {
          console.info(cities[index]);
          const sf_city = await models.agency_salesforce_city.findOne({
            where: {
              agency_fk: cities[index].agency,
              sf_city_id: cities[index].id,
              name: cities[index].name,
              code: cities[index].code,
              language: cities[index].language,
            },
          });

          if (h.isEmpty(sf_city)) {
            const agency_salesforce_city_id = h.general.generateId();
            await models.agency_salesforce_city.create({
              agency_salesforce_city_id: agency_salesforce_city_id,
              agency_fk: cities[index].agency,
              sf_city_id: cities[index].id,
              name: cities[index].name,
              code: cities[index].code,
              language: cities[index].language,
              country: cities[index].country,
            });
          } else {
            await models.agency_salesforce_city.update(
              {
                agency_fk: cities[index].agency,
                sf_city_id: cities[index].id,
                name: cities[index].name,
                code: cities[index].code,
                language: cities[index].language,
                country: cities[index].country,
              },
              {
                where: {
                  agency_salesforce_city_id: sf_city.agency_salesforce_city_id,
                },
              },
            );
          }
        }
      }
      console.info('END SF_CITIES_SYNC', event);
    });
  } catch (err) {
    Sentry.captureException(err);
    console.error({
      function: functionName,
      err,
    });
    return { success: false, function: functionName, error: err };
  }
};

exports.sfCitiesSync = Sentry.AWSLambda.wrapHandler(sfCitiesSync);
