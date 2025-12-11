const csv = require('csvtojson');
const { v4 } = require('uuid');
const path = require('path');
const axios = require('axios');
const _ = require('lodash');

const batchNumber = 10;

async function loadAll(results) {
  const batches = _.chunk(results, 100);
  for (const result of batches[batchNumber - 1]) {
    // console.log(result);
    try {
      await axios({
        method: 'post',
        url: 'https://3270ff10-e0f8-4f00-a94d-09c430a1877c.trayapp.io',
        data: {
          changeSource: 'IMPORTs',
          objectId: result.hbContactId,
          subscriptionType: 'contact.creation',
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
