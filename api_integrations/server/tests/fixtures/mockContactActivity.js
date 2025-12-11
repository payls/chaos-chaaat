const constant = require('../../constants/constant.json');
const Sequelize = require('sequelize');
module.exports.mockContactActivity = {
  contact_fk: '8ue38sh7-49e8-11eb-a0fc-2147043b1de0',
  activity_type: constant.CONTACT.ACTIVITY.TYPE.BUYER_LINK_OPENED,
  activity_date: Sequelize.literal('NOW()'),
  activity_meta: 'ACTIVITY_META',
  created_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
  updated_by: 'fb4663a4-49e8-11eb-a0fc-2147043b1de0',
};
