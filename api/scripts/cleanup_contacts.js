const csv = require('csvtojson');
const { Op } = require('sequelize');
const { v4 } = require('uuid');
const path = require('path');
const axios = require('axios');
const _ = require('lodash');
const models = require('../server/models');

const agency_id = '3d1d056d-0a26-4274-bb9b-5b9e1b3e3b70';

// const batchNumber = 12;

async function loadAll(results) {
  try {
    //   await axios({
    //     method: 'post',
    //     url: 'https://d76317e5-8dd5-43d4-b11b-5129d8c70594.trayapp.io',
    //     data: {
    //       changeSource: 'IMPORTs',
    //       objectId: result.hbContactId,
    //       subscriptionType: 'contact.propertyChanges',
    //       eventId: v4(),
    //     },
    //   });
    const contacts = await models.contact.findAll({
      where: {
        agency_fk: agency_id,
      },
      include: [
        {
          model: models.contact_source,
          where: {
            source_contact_id: {
              [Op.in]: results.map((result) => result.hbContactId),
            },
          },
          require: true,
        },
      ],
    });

    // console.log(
    //   `hb_contact_id,pave_contact_id,firstname,lastname,mobile_number,owner`,
    // );
    for (let contact of contacts) {
      contact = contact.toJSON();

      await models.contact.update(
        {
          // agency_user_fk: 'e4d047d7-197c-4cee-b31f-bbfad41475b1',
          mobile_number: `852${contact.mobile_number}`,
        },
        {
          where: {
            contact_id: contact.contact_id,
          },
        },
      );
      // console.log(
      //   `${contact.contact_sources[0].source_contact_id},${contact.contact_id},${contact.first_name},${contact.last_name},${contact.mobile_number},Frederick Ho`,
      // );
      // console.log(`"${contact.contact_id}",`);

      console.log(`852${contact.mobile_number}`);
    }

    // for (const result of results) {
    //   const hasMatch = _.find(contacts, (contact) => {
    //     contact = contact.toJSON();
    //     return (
    //       contact.contact_sources[0].source_contact_id === result.hbContactId
    //     );
    //   });

    //   if (!hasMatch) {
    //     console.log(result);
    //     await axios({
    //       method: 'post',
    //       url: 'https://3270ff10-e0f8-4f00-a94d-09c430a1877c.trayapp.io',
    //       data: {
    //         changeSource: 'IMPORTs',
    //         objectId: result.hbContactId,
    //         subscriptionType: 'contact.creation',
    //         eventId: v4(),
    //       },
    //     });
    //   }
    // }

    // console.log(contacts.length);
  } catch (err) {
    console.log(err);
  }
}

const filePath = path.resolve('.', 'ashton_agency_hb.csv');

// console.log(filePath);

csv()
  .fromFile(filePath)
  .then((results) => {
    return loadAll(results);
  })
  .then(() => {
    return process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
