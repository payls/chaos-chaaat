const h = require('../server/helpers');
const c = require('../server/controllers');
const MindBodyAPI = require('../server/services/mindBodyApi');

const syncContacts = async () => {
  const agency_fk = 'cd5e428d-086b-48fc-9ece-479943180256';
  const agency_user_fk = 'bfb3db66-b60d-485e-8142-4d9ea8bbad9b';

  const mindBodySetting = await c.agencyOauthCtlr.findOne({
    source: 'MINDBODY',
    status: 'active',
    agency_fk,
  });
  if (h.isEmpty(mindBodySetting)) {
    return;
  }
  const { access_info } = mindBodySetting;

  const accessInfo = JSON.parse(access_info);
  const { siteId, apiKey, staffUsername, staffPassword } = accessInfo;
  const mindbodyApi = new MindBodyAPI(siteId, apiKey);

  const staffRes = await mindbodyApi.getStaffToken(
    staffUsername,
    staffPassword,
  );

  try {
    // let pageSize = 0;
    let count = 1;
    let offset = 4200; // next 24   00
    const limit = 200;
    const contacts = [];

    // for (let ii = 0; ii < 10; ii++) {
    console.log(offset);

    console.log('🚨🚨🚨🚨🚨🚨🚨🚨STARTED SYNC🚨🚨🚨🚨🚨🚨🚨🚨');
    // Get MB Client Info
    const clients = await mindbodyApi.getAllClients(
      {
        limit,
        offset,
        // searchText: 'ian',
      },
      staffRes.AccessToken,
    );
    console.log(
      `🚨🚨🚨🚨🚨🚨🚨🚨CLIENTS: ${clients.Clients.length}🚨🚨🚨🚨🚨🚨🚨🚨`,
    );

    if (clients.Clients.length > 0) {
      if (clients.PaginationResponse.TotalResults > 0) {
        // pageSize = clients.PaginationResponse.TotalResults / limit;

        // Add first page
        for (const client of clients.Clients) {
          const cs = await c.contactSource.findOne({
            source_contact_id: client.Id,
          });

          if (h.isEmpty(cs)) {
            contacts.push(getContactDetails(client));
          }
        }
        // if (clients.Clients.length !== limit) {
        //   if (pageSize > 1) {
        //     for (let i = 0; i < pageSize; i++) {
        //       offset += limit;
        //       const otherClients = await mindbodyApi.getAllClients(
        //         {
        //           limit,
        //           offset,
        //           //   searchText: 'ian',
        //         },
        //         staffRes.AccessToken,
        //       );

        //       for (const otherClient of otherClients.Clients) {
        //         const cs = await c.contactSource.findOne({
        //           source_contact_id: otherClient.Id,
        //         });

        //         if (h.isEmpty(cs)) {
        //           contacts.push(getContactDetails(otherClient));
        //         }
        //       }

        //       if (otherClients.Clients.length !== limit) {
        //         break;
        //       }
        //     }
        //   }
        // }
      }
    }
    let ncount = 1;
    for (const contact of contacts) {
      const {
        last_name,
        first_name,
        email,
        mobile_number,
        sourceId,
        source_payload,
      } = contact;
      const { contact_id, contact_source_id } = await h.database.transaction(
        async (transaction) => {
          // Create contact record
          console.log(`⬇️⬇️⬇️⬇️ SAVING ${email}:${sourceId} ⬇️⬇️⬇️⬇️`);
          const contact_id = await c.contact.create(
            {
              first_name,
              last_name,
              email,
              mobile_number,
              agency_fk,
              status: 'active',
              agency_user_fk,
            },
            { transaction },
          );

          // Create contact_source_record
          const contact_source_id = await c.contactSource.create(
            {
              contact_fk: contact_id,
              source_contact_id: sourceId,
              source_type: 'MINDBODY',
              source_original_payload: JSON.stringify(source_payload),
            },
            { transaction },
          );

          console.log(`📥📥📥📥 GETTING MINDBODY DATA 📥📥📥📥`);
          await c.automationCtlr.updateClientInfo(
            agency_fk,
            sourceId,
            contact_id,
          );

          return { contact_id, contact_source_id };
        },
      );

      console.log(
        `✅✅✅✅ #${count} - ${ncount} Synced: ${email}:${sourceId} ✅✅✅✅`,
      );
      count++;
      ncount++;
    }
    offset += limit;
    // }
    console.log('🚨🚨🚨🚨🚨🚨🚨🚨END SYNC🚨🚨🚨🚨🚨🚨🚨🚨');
  } catch (err) {
    console.log('💥💥💥💥💥💥💥START ERROR💥💥💥💥💥💥💥');
    console.log(err);
    console.log('💥💥💥💥💥💥💥END ERROR💥💥💥💥💥💥💥');
  }
};

function getContactDetails(details) {
  return {
    source_payload: details,
    last_name: details.LastName,
    first_name: details.FirstName,
    email: details.Email,
    mobile_number: details.MobilePhone,
    sourceId: details.Id,
  };
}

syncContacts();
