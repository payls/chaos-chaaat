import * as authApi from './auth';
import * as propertyApi from './property';
import * as countryApi from './country';
import * as taskApi from './task';
import * as taskMessageApi from './taskMessage';
import * as contentCountryApi from './content/country';
import * as contentProjectApi from './content/project';
import * as userSavedPropertyApi from './userSavedProperty';
import * as contactApi from './contact';
import * as contactActivityApi from './contactActivity';
import * as shortlistedPropertyApi from './shortlistedProperty';
import * as shortlistedProjectApi from './shortlistedProject';
import * as shortlistedPropertyCommentApi from './shortlistedPropertyComment';
import * as shortlistedPropertyCommentReactionApi from './shortlistedPropertyCommentReaction';
import * as uploadApi from './upload';
import * as whatsAppAPi from './whatsApp';

export const api = {
  auth: authApi,
  property: propertyApi,
  country: countryApi,
  task: taskApi,
  taskMessage: taskMessageApi,
  content: {
    country: contentCountryApi,
    project: contentProjectApi,
  },
  upload: uploadApi,
  userSavedProperty: userSavedPropertyApi,
  contact: contactApi,
  contactActivity: contactActivityApi,
  shortlistedProperty: shortlistedPropertyApi,
  shortlistedProject: shortlistedProjectApi,
  shortlistedPropertyComment: shortlistedPropertyCommentApi,
  shortlistedPropertyCommentReaction: shortlistedPropertyCommentReactionApi,
  whatsapp: whatsAppAPi,
};
