const models = require('../server/models');
const h = require('../server/helpers');
const sequelize = require('sequelize');
const csv = require('csvtojson');

const path = require('path');
const agency_id = '1f880948-0097-40a8-b431-978fd59ca321';

const hbIds = [
  '27042201',
  '18315551',
  '1132551',
  '25831851',
  '23558401',
  '25610751',
  '1022110',
  '21397601',
  '26949851',
  '24553951',
  '418',
  '19028101',
  '24168651',
  '21231751',
  '24490151',
  '19356501',
  '25082851',
  '17080851',
  '996076',
  '959205',
  '12823101',
  '25242151',
  '25766451',
  '24980851',
  '17311001',
  '1020950',
  '19592451',
  '1793151',
  '19619201',
  '24419801',
  '21955651',
  '24568851',
  '19414151',
  '5156251',
  '24364201',
  '22944901',
  '5602',
  '18740451',
  '26804201',
  '24620801',
  '19243001',
  '24677951',
  '19644001',
  '16437151',
  '23963301',
  '24735401',
];

function filter(results) {
  return results.filter((result) => {
    return !hbIds.includes(result.contactHsId);
  });
}

function format(results) {
  return results.map((result) => {
    const contactHsId = result['Record ID'];
    const first_name = result['First Name'];
    const last_name = result['Last Name'];
    const email = result.Email;
    const mobile = result['Phone Number'];
    const contactOwnerFullName = result['Contact owner'];

    return {
      contactHsId,
      first_name,
      last_name,
      email,
      mobile,
      contactOwnerFullName,
    };
  });
}

async function load(result) {
  const {
    contactHsId,
    first_name,
    last_name,
    email,
    mobile,
    contactOwnerFullName,
  } = result;

  const contactSource = await models.contact_source.findOne({
    where: {
      source_contact_id: contactHsId.trim(),
    },
    include: [
      {
        model: models.contact,
        where: { agency_fk: agency_id },
        required: true,
      },
    ],
  });

  const contact_id = contactSource?.contact?.contact_id;
  const lead_score = contactSource?.contact?.lead_score;

  // if (
  //   contactOwnerFullName === 'Admin raeon' ||
  //   contactOwnerFullName === 'Becky Ho'
  // ) {
  //   contactOwnerFullName = 'info@rae-on.com';
  // }

  // console.log(
  //   `${contactHsId},${contact_id},${first_name},${last_name},${email},${contactSource?.contact?.mobile_number},${lead_score},${contactOwnerFullName}`,
  // );
  console.log(`"${contact_id}",`);
}

async function loadAll(results) {
  // console.log(
  //   'HB_ID,contact_id,first_name,last_name,email,mobile,lead_score,contact_owner',
  // );
  for (const result of results) {
    await load(result);
  }
  return results;
}

csv()
  .fromFile(path.resolve('.', 'OGPS_CONTACTS.csv'))
  .then((results) => {
    return format(results);
  })
  // .then((results) => {
  //   return filter(results);
  // })
  .then((results) => {
    return loadAll(results);
  })
  .then((results) => {
    // console.log(results.length);
    return process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
