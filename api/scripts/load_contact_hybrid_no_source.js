const models = require('../server/models');
const h = require('../server/helpers');
const sequelize = require('sequelize');
const { Op } = sequelize;
const csv = require('csvtojson');
const fs = require('fs');

const path = require('path');
const agency_id = 'd3e5e710-59a6-4d03-8313-da45b893022b';
const manual_label = 'may 20 b2 loaded';
const data = [];
const file_name = 'hybrid_campaign_may_20_b2.csv';

function mobileNumberChecker(mobile_number = '', code = '') {
  if (code) {
    mobile_number = mobile_number.replaceAll('+');
    const new_mobile_number = code + mobile_number;
    return new_mobile_number;
  } else {
    return mobile_number;
  }
}

async function createContact({
  hasOwner,
  first_name,
  last_name,
  mobile_number,
  email,
  user,
  manual_label,
}) {
  // crete contact
  console.log('create');
  const contact_id = h.general.generateId();
  await models.contact.create({
    contact_id,
    first_name,
    last_name,
    email: email.trim(),
    mobile_number: mobile_number.trim(),
    agency_fk: agency_id,
    agency_user_fk: user?.agency_user?.dataValues?.agency_user_id,
    from_export: true,
    status: 'active',
    manual_label,
  });
  const newRow = [
    contact_id,
    first_name,
    last_name,
    email,
    mobile_number,
    user?.agency_user?.dataValues?.agency_user_id,
    true,
  ];
  data.push(newRow);
}

async function updateContact({
  contactRecord,
  first_name,
  last_name,
  mobile_number,
  email,
  user,
  hasOwner,
  manual_label,
}) {
  console.log('update');
  const contact_id = contactRecord?.contact_id;
  const updateBody = {
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    mobile_number: mobile_number.trim(),
    email: email.trim(),
    manual_label: manual_label.trim(),
  };
  if (hasOwner) {
    updateBody.agency_user_fk = user?.agency_user?.dataValues?.agency_user_id;
  }
  await models.contact.update(updateBody, { where: { contact_id } });
  const newRow = [
    contact_id,
    first_name,
    last_name,
    email,
    mobile_number,
    hasOwner ? user?.agency_user?.dataValues?.agency_user_id : '',
    false,
  ];
  data.push(newRow);
}

async function load(result) {
  const first_name = result['First Name'];
  const last_name = result['Last Name'];
  const email = result.Email;
  const mobile = result['Phone Number'];
  const contactOwnerEmail = result['Contact Owner Email'];

  let user;

  if (contactOwnerEmail) {
    user = await models.user.findOne({
      where: {
        email: contactOwnerEmail,
      },
      include: [
        {
          model: models.agency_user,
          where: {
            agency_fk: agency_id,
          },
          include: [
            {
              model: models.agency,
            },
          ],
        },
      ],
    });
  }

  const mobile_number = mobileNumberChecker(mobile, null);
  console.log(mobile_number);

  if (contactOwnerEmail) {
    user = await models.user.findOne({
      where: {
        email: contactOwnerEmail,
      },
      include: [
        {
          model: models.agency_user,
          where: {
            agency_fk: agency_id,
          },
          include: [
            {
              model: models.agency,
            },
          ],
        },
      ],
    });
  }

  const hasOwner = user && user.user_id !== null;

  if (
    mobile_number.trim() !== '' ||
    mobile_number.trim() !== '0' ||
    mobile_number.trim() !== '10000000000'
  ) {
    // find contact
    const contactRecord = await models.contact.findOne({
      where: {
        mobile_number: mobile_number,
        agency_fk: agency_id,
      },
    });

    const isDup = contactRecord && contactRecord.contact_id !== null;
    const agency_user_id = user?.agency_user?.dataValues?.agency_user_id;
    console.log(
      `${first_name},${last_name},${email},${mobile_number},${agency_user_id},
      ${isDup ? 'Yes' : 'No'}`,
    );
    if (!isDup)
      await createContact({
        hasOwner,
        first_name,
        last_name,
        mobile_number,
        email,
        user,
        agency_id,
        manual_label,
      });
    else {
      await updateContact({
        contactRecord,
        user,
        first_name,
        last_name,
        mobile_number,
        email,
        hasOwner,
        manual_label,
      });
    }
  }
}

async function loadAll(results) {
  console.log(
    'contact_id,first_name,last_name,email,mobile,contact_owner,contact_owner_email',
  );
  for (const result of results) {
    if (result['Phone Number'] !== '') {
      await load(result);
    }
  }

  const headers = [
    'Contact ID',
    'First Nam',
    'Last Name',
    'Email',
    'Phone',
    'Contact Owner ID',
    'New Record',
  ];

  await fs.writeFile(file_name, headers.join(',') + '\n', (err) => {
    if (err) throw err;
    console.log('CSV file created');
    // Append the data rows
    data.forEach(async (row) => {
      await fs.appendFile(file_name, row.join(',') + '\n', (err) => {
        if (err) throw err;
        console.log(`Data appended: ${row.join(',')}`);
      });
    });
  });
}

csv()
  .fromFile(path.resolve('.', 'hybrid_may_20_b2.csv'))
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
