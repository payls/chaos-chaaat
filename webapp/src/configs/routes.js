export const routes = {
  home: '/',
  login: '/login',
  logout: '/logout',
  signup: '/signup?invitee=[invitee]',
  company: '/register/company',
  industry: '/register/industry',
  company_name: '/register/company-name',
  real_estate_type: '/register/real-estate-type',
  company_size: '/register/company-size',
  company_website: '/register/company-website',
  verify_email_registration: '/register/verify-email-registration',
  forgot_password: '/forgot-password',
  reset_password: '/reset-password',
  get_started: '/get-started',
  create_account: '/create-account?buyer_type=[buyer_type]',
  about_us: '/about-us',
  why_pave: '/why-pave',
  pave_bespoke: '/pave-bespoke',
  contact_us: '/contact-us',
  closer_tool: '/closer-tool',
  google_registration: '/register/google-registration',

  //Help center
  help_center: 'https://help.yourpave.com',

  //Social links
  facebook: 'https://www.facebook.com/PaveRealEstateAgent ',
  linkedin: 'https://www.linkedin.com/company/pave-real-estate',
  instagram: 'https://www.instagram.com/paverealestate/',

  //Country pages
  thailand: '/thailand',
  vietnam: '/vietnam',

  dashboard: {
    index: '/dashboard',
    properties: '/dashboard/properties',
    tasks: '/dashboard/tasks',
    timeline: '/dashboard/timeline',
  },

  property: {
    add: '/property/add',
    edit: '/property/edit?property_id=[property_id]',
    view: '/property/view?property_id=[property_id]',
  },

  task: {
    // add: '/task/add',
    view: '/dashboard/tasks?task_id=[task_id]&form_mode=[form_mode]',
  },

  preview: '/preview?permalink=[permalink]',
};
