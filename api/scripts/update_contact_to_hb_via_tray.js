const csv = require('csvtojson');
const { v4 } = require('uuid');
const path = require('path');
const axios = require('axios');
const _ = require('lodash');

const batchNumber = 12;

async function loadAll(results) {
  const batches = _.chunk(results, 100);
  for (const result of batches[batchNumber - 1]) {
    // console.log(result);
    try {
      await axios({
        method: 'post',
        url: 'https://d76317e5-8dd5-43d4-b11b-5129d8c70594.trayapp.io',
        data: {
          changeSource: 'IMPORTs',
          objectId: result.hbContactId,
          subscriptionType: 'contact.propertyChanges',
          eventId: v4(),
        },
      });
    } catch (err) {
      console.log(err);
      console.log(result);
    }
  }
}

const filePath = path.resolve('.', 'ashton_agency_hb.csv');

console.log(filePath);

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
