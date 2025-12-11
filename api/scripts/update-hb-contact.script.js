const axios = require('axios');

const { v4 } = require('uuid');

const models = require('../server/models');

const agency_id = '1da3ff5f-d3fc-11eb-8182-065264a181d4';
async function loadAll(contacts) {
  for (let contact of contacts) {
    contact = contact.toJSON();

    // console.log(contact);
  }

  console.log(contacts.length);
}
models.contact
  .findAll({
    where: {
      agency_fk: agency_id,
    },
    include: [
      {
        model: models.contact_source,
        require: true,
      },
    ],
  })
  .then((contacts) => {
    return loadAll(contacts);
  })
  .then(() => {
    return process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit();
  });
