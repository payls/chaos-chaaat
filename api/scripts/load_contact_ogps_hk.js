const models = require('../server/models');
const h = require('../server/helpers');
const sequelize = require('sequelize');
const { Op } = sequelize;
const csv = require('csvtojson');

const path = require('path');
const agency_id = '1f880948-0097-40a8-b431-978fd59ca321';

function mobileNumberChecker(mobile_number = '') {
  if (
    mobile_number.includes('852') &&
    mobile_number.substring(0, 3) === '852'
  ) {
    return mobile_number;
  } else if (
    mobile_number.length === 5 ||
    mobile_number.length === 6 ||
    mobile_number.length === 7 ||
    mobile_number.length === 8 ||
    mobile_number.length === 9
  ) {
    mobile_number = mobile_number.replaceAll('+');
    return '852' + mobile_number;
  } else {
    return mobile_number;
  }
}

async function createContact({
  hasOwner,
  first_name,
  last_name,
  contactHsId,
  mobile,
  email,
  user,
}) {
  // crete contact
  const contact_id = h.general.generateId();
  await models.contact.create({
    contact_id,
    first_name,
    last_name,
    email: email.trim(),
    mobile_number: mobile.trim(),
    agency_fk: agency_id,
    agency_user_fk: user?.agency_user?.agency_user_id,
    from_export: true,
    status: 'active',
  });
  // create contact source
  const contact_source_id = h.general.generateId();
  await models.contact_source.create({
    contact_source_id,
    contact_fk: contact_id,
    source_contact_id: contactHsId.trim(),
    sourct_type: 'HUBSPOT',
  });
}

async function updateContact({ contactSource, mobile, email, user, hasOwner }) {
  const contact_id = contactSource?.contact?.contact_id;
  const updateBody = {
    mobile_number: mobile.trim(),
    email: email.trim(),
  };
  if (hasOwner) {
    updateBody.agency_user_fk = user?.agency_user?.agency_user_id;
  }
  await models.contact.update(updateBody, { where: { contact_id } });
}

async function load(result) {
  const contactHsId = result['Record ID'];
  const first_name = result['First Name'];
  const last_name = result['Last Name'];
  const email = result.Email;
  const mobile = result['Phone Number'];
  const contactOwnerFullName = result['Contact owner'];
  console.log(contactOwnerFullName);

  const contactNameArr = contactOwnerFullName.split(' ');
  let agent_fname;
  let agent_lname;
  switch (contactNameArr.length) {
    case 1:
      agent_fname = contactNameArr[0];
      break;
    case 2:
      agent_fname = contactNameArr[0];
      agent_lname = contactNameArr[1];
      break;
    case 3:
      agent_fname = `${contactNameArr[0]} ${contactNameArr[1]}`;
      agent_lname = contactNameArr[2];
      break;
    default:
      agent_fname = contactNameArr[0];
      agent_lname = contactNameArr[1];
      break;
  }

  let user;

  user = await models.user.findOne({
    where: {
      [Op.or]: [
        {
          first_name: agent_fname,
        },
        {
          last_name: agent_lname,
        },
      ],
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

  const mobile_number = mobileNumberChecker(mobile);

  user = await models.user.findOne({
    where: {
      [Op.or]: [
        {
          first_name: agent_fname,
        },
        {
          last_name: agent_lname,
        },
        // {
        //   email: 'melissamontgomery+1@ogpsglobal.com',
        // },
      ],
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

  const hasOwner = user && user.user_id !== null;
  // find contact
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

  // console.log(user.email);

  // if (!contactSource && hasOwner) console.log(contactHsId);

  // if (!hasOwner) {
  //   console.log(
  //     `${contactHsId},${first_name},${last_name},${email},${mobile},${contactOwnerFullName}`,
  //   );
  // }

  const isDup = contactSource && contactSource.contact_source_id !== null;

  console.log(
    `${contactHsId},${first_name},${last_name},${email},${mobile},${contactOwnerFullName},${
      isDup ? 'Yes' : 'No'
    }`,
  );

  // if (!isDup) {
  //   console.log(
  //     `${contactHsId},${first_name},${last_name},${email},${mobile_number},${
  //       user?.first_name + ' ' + user?.last_name
  //     },${isDup ? 'Yes' : 'No'}`,
  //   );
  // }

  if (!isDup)
    await createContact({
      hasOwner,
      first_name,
      last_name,
      contactHsId,
      mobile: mobile_number,
      email,
      user,
      agency_id,
    });
  else {
    await updateContact({
      contactSource,
      user,
      mobile: mobile_number,
      email,
      hasOwner,
    });
  }

  // console.log(
  //   `${contactHsId},${contactSource.contact.contact_id},${first_name},${last_name},${email},${contactSource.contact.mobile_number},${contactOwnerFullName}`,
  // );
}

async function loadAll(results) {
  console.log(
    'HB_ID,contact_id,first_name,last_name,email,mobile,lead_score,contact_owner',
  );
  for (const result of results) {
    // console.log(result);

    await load(result);
  }
}

csv()
  .fromFile(path.resolve('.', 'ogps_hk_feb_tcrw_2023_eng.csv'))
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
