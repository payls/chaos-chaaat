export const routes = {
  home: '/',
  login: '/login',
  signup: '/signup?invitee=[invitee]',
  company: '/register/company',
  verify_email_registration: '/register/verify-email-registration',
  logout: '/logout',
  forgot_password: '/forgot-password',
  get_started: '/get-started',
  create_account: '/create-account?buyer_type=[buyer_type]',
  pricing: '/pricing',
  company: '/register/company',
  verify_email_registration: '/register/verify-email-registration',
  google_registration: '/register/google-registration',
  settings: {
    profile: '/settings/profile',
    user_management: '/settings/user-management',
    integrations: '/settings/integrations',
    ['integrations.mindbody.connect']: '/settings/mindbody/connect',
    agency_management: '/settings/agency-management',
    billing: '/billing',
    index: '/settings',
  },

  dashboard: {
    index: '/dashboard',
    properties: '/dashboard/properties',
    tasks: '/dashboard/tasks',
    leads: {
      activity_stream: '/dashboard/leads/activity-stream',
      all_leads: '/dashboard/leads/all-leads',
      my_leads: '/dashboard/leads/my-leads',
      inactive_leads: '/dashboard/leads/inactive-leads',
      archived_leads: '/dashboard/leads/archived-leads',
      unassigned_leads: '/dashboard/leads/unassigned-leads',
      hubspot_leads: '/dashboard/leads/hubspot-leads',
      salesforce_leads: '/dashboard/leads/salesforce-leads',
      saved_view: '/dashboard/leads/',
    },
    products: '/dashboard/products',
    'products.custom': '/dashboard/products/custom',
    'products.editor': '/dashboard/products/editor/[landing_id]',
    'products.create': '/dashboard/products/create',
    'products.preview': '/dashboard/products/preview?slug=[slug]',
    'products.edit': '/dashboard/products/edit/[project_id]',
    'products.edit.step': '/dashboard/products/edit/[project_id]?step=[step]',
    sales: '/dashboard/sales',
    comments: '/dashboard/comments',
    messaging: '/dashboard/messaging',
    'messaging.inbox': '/dashboard/messaging/inbox?campaign=[campaign]',
    reports: '/dashboard/reports',
    sms: '/dashboard/sms',
    'sms.inbox': '/dashboard/sms/inbox?campaign=[campaign]',
    line: '/dashboard/line',
    messenger: '/dashboard/messenger',
  },

  inbox: {
    index: '/inbox',
  },

  channels: {
    connect: '/channels/connect',
    integration: '/channels/integration'
  },

  contact: {
    add: '/dashboard/leads/all-leads?form_mode=add',
    edit_my_leads:
      '/dashboard/leads/my-leads?contact_id=[contact_id]&form_mode=edit',
    edit_all_leads:
      '/dashboard/leads/all-leads?contact_id=[contact_id]&form_mode=edit',
    edit_unassigned_leads:
      '/dashboard/leads/unassigned-leads?contact_id=[contact_id]&form_mode=edit',
    edit_inactive_leads:
      '/dashboard/leads/inactive-leads?contact_id=[contact_id]&form_mode=edit',
    edit_hubspot_leads:
      '/dashboard/leads/hubspot-leads?contact_id=[contact_id]&form_mode=edit',
    edit_salesforce_leads:
      '/dashboard/leads/salesforce-leads?contact_id=[contact_id]&form_mode=edit',
  },

  sales: {
    add: '/dashboard/sales/create-link?contact_id=[contact_id]&form_mode=add',
    edit: '/dashboard/sales/create-link?contact_id=[contact_id]&form_mode=edit',
    proposal_type_edit:
      '/dashboard/sales/proposal-type?contact_id=[contact_id]&form_mode=edit',
    proposal_type_new: '/dashboard/sales/proposal-type',
    create_link:
      '/dashboard/sales/create-link?is_general_enquiry=[is_general_enquiry]',
  },

  property: {
    add: '/property/add',
    edit: '/property/edit?property_id=[property_id]',
    view: '/property/view?property_id=[property_id]',
  },

  task: {
    view: '/dashboard/tasks?task_id=[task_id]&form_mode=[form_mode]',
  },

  proposal: {
    template: {
      add: '/dashboard/proposal/create-template?form_mode=add',
    },
  },
  errors: {
    subscription: '/errors/subscription',
  },
  templates: {
    whatsapp: {
      list: '/templates/whatsapp/list',
      create: '/templates/whatsapp/create',
      edit: '/templates/whatsapp/edit?waba_template_id=[waba_template_id]',
      view: '/templates/whatsapp/view?waba_template_id=[waba_template_id]',
    },
    contact: {
      list: '/templates/contact/list',
      list_view: '/templates/contact/list/[list_id]',
      list_view_import_upload:
        '/templates/contact/list/import-upload?list=[list_id]',
      list_view_import_existing:
        '/templates/contact/list/import-existing?list=[list_id]',
      list_view_import_hubspot:
        '/templates/contact/list/import-hubspot?list=[list_id]',
      list_view_import_line:
        '/templates/contact/list/import-line?list=[list_id]',
    },
    line: {
      list: '/templates/line/list',
      create: '/templates/line/create',
      edit: '/templates/line/edit?line_template_id=[line_template_id]',
      view: '/templates/line/view?line_template_id=[line_template_id]',
    },
  },
  whatsapp: {
    campaign: {
      index: '/campaign',
      create: '/whatsapp/campaign/create',
      edit: '/whatsapp/campaign/edit?campaign_draft_id=[campaign_draft_id]',
      view: '/whatsapp/campaign/view?campaign_draft_id=[campaign_draft_id]',
      review: '/whatsapp/campaign/review?campaign_draft_id=[campaign_draft_id]',
    },
    connect: '/whatsapp/connect',
  },
  line: {
    campaign: {
      create: '/line/campaign/create',
      edit: '/line/campaign/edit?campaign_draft_id=[campaign_draft_id]',
      view: '/line/campaign/view?campaign_draft_id=[campaign_draft_id]',
      review: '/line/campaign/review?campaign_draft_id=[campaign_draft_id]',
    },
  },
  automation: {
    index: '/automation',
    index_back: '/automation?b=[platform]',
    form_add: '/automation/rule/form?category=[category]&form_mode=create',
    form_edit: '/automation/rule/form?ruleId=[ruleID]&form_mode=edit',
    form_view: '/automation/rule/form?ruleId=[ruleID]&form_mode=view',
    form_chaaatbuilder: '/automation/builder]',
    template: '/automation/template?form_mode=[form_mode]',
  },
  salesforce: {
    contact: '/salesforce/contact',
    reports: '/salesforce/reports?list=[contact_list]',
    mapping:
      '/salesforce/mapping?report=[report_id]&name=[report_name]&list=[list]',
  },
  hubspot: {
    contact: '/hubspot/contact',
  }
};
