const models = require('./server/models');
const h = require('./server/helpers');
const sequelize = require('sequelize');
const { Op } = sequelize;
const csv = require('csvtojson');

const path = require('path');
const agency_id = '1da3ff5f-d3fc-11eb-8182-065264a181d4';

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
  const contactHsId = result['Record ID - Contact'];
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

  // find agent
  const user = await models.user.findOne({
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

  const hasOwner = user && user.user_id !== null;

  // find contact
  const contactSource = await models.contact_source.findOne({
    where: {
      source_contact_id: contactHsId.trim(),
    },
    include: [
      {
        model: models.contact,
        required: true,
      },
    ],
  });

  // if (!contactSource && hasOwner) console.log(contactHsId);

  if (!hasOwner) {
    // console.log(
    //   `${contactHsId},${first_name},${last_name},${email},${mobile},${contactOwnerFullName}`,
    // );
  }

  const isDup = contactSource && contactSource.contact_source_id !== null;

  if (!isDup)
    await createContact({
      hasOwner,
      first_name,
      last_name,
      contactHsId,
      mobile,
      email,
      user,
      agency_id,
    });
  else {
    await updateContact({
      contactSource,
      user,
      mobile,
      email,
      hasOwner,
    });
  }
}

async function loadAll(results) {
  const agents = {};
  for (const result of results) {
    const contactHsId = result['Record ID - Contact'];
    const first_name = result['First Name'];
    const last_name = result['Last Name'];
    const email = result.Email;
    const mobile = result['Phone Number'];
    const contactOwnerFullName = result['Contact owner'];

    if (agents[contactOwnerFullName]) {
      agents[contactOwnerFullName] += 1;
    } else {
      agents[contactOwnerFullName] = 1;
    }
  }

  console.log('Agent Name,Number of Contacts');
  const as = Object.keys(agents);

  for (const a of as) {
    console.log(a + ',' + agents[a]);
  }
}

csv()
  .fromFile(path.resolve('.', 'hb-raeon-contacts.csv'))
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
