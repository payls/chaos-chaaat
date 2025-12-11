import * as authApi from './auth';
import * as projectApi from './project';
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
import * as shortlistedProjectCommentApi from './shortlistedProjectComment';
import * as shortlistedPropertyCommentReactionApi from './shortlistedPropertyCommentReaction';
import * as shortlistedProjectCommentReactionApi from './shortlistedProjectCommentReaction';
import * as uploadApi from './upload';
import * as whatsAppApi from './whatsApp';
import * as agencyCustomLandingPageApi from './agencyCustomLandingPage';
export const api = {
  auth: authApi,
  project: projectApi,
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
  shortlistedProjectComment: shortlistedProjectCommentApi,
  shortlistedPropertyCommentReaction: shortlistedPropertyCommentReactionApi,
  shortlistedProjectCommentReaction: shortlistedProjectCommentReactionApi,
  whatsApp: whatsAppApi,
  agencyCustomLandingPage: agencyCustomLandingPageApi,
};
