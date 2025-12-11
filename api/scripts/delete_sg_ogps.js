const models = require('../server/models');
const h = require('../server/helpers');
const sequelize = require('sequelize');
const { Op } = sequelize;
const csv = require('csvtojson');

const path = require('path');
const agency_id = 'f69e636d-6097-4fd3-8cf9-3f06529533db';

function mobileNumberChecker(mobile_number = '') {
  if (mobile_number.includes('65') && mobile_number.substring(0, 2) === '65') {
    return mobile_number;
  } else if (
    mobile_number.length === 5 ||
    mobile_number.length === 6 ||
    mobile_number.length === 7 ||
    mobile_number.length === 8 ||
    mobile_number.length === 9 ||
    mobile_number.length === 10
  ) {
    mobile_number = mobile_number.replaceAll('+');
    return '65' + mobile_number;
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
        {
          email: 'melissamontgomery+1@ogpsglobal.com',
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

  //   console.log(
  //     `${contactHsId},${first_name},${last_name},${email},${mobile},${contactOwnerFullName},${
  //       isDup ? 'Yes' : 'No'
  //     }`,
  //   );

  if (!isDup) {
    // console.log(
    //   `${contactHsId},${first_name},${last_name},${email},${mobile_number},${contactOwnerFullName},${
    //     isDup ? 'Yes' : 'No'
    //   }`,
    // );
  }

  //   if (!isDup)
  //     await createContact({
  //       hasOwner,
  //       first_name,
  //       last_name,
  //       contactHsId,
  //       mobile: mobile_number,
  //       email,
  //       user,
  //       agency_id,
  //     });
  //   else {
  //     await updateContact({
  //       contactSource,
  //       user,
  //       mobile: mobile_number,
  //       email,
  //       hasOwner,
  //     });
  //   }

  console.log(
    `${contactHsId},${contactSource.contact.contact_id},${first_name},${last_name},${email},${contactSource.contact.mobile_number},${contactOwnerFullName}`,
  );
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

async function deleteOGPSSGContacts() {
  const contacts = await models.contact.findAll({
    where: {
      agency_fk: agency_id,
    },
  });

  for (const contact of contacts) {
    const transaction = await models.sequelize.transaction();
    try {
      const contactSource = await models.contact_source.findOne({
        where: {
          contact_fk: contact.contact_id,
        },
      });

      await contactSource.destroy({ transaction });
      await contact.destroy({ transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
    }
  }
}

deleteOGPSSGContacts()
  .then(() => {
    return process.exit();
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
