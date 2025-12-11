import { create } from 'zustand';

/**
 * Creates a store for the side bar component.
 *
 * @param {Function} set - A function used to update the store's state.
 * @returns {Object} The store object with its corresponding state and setter functions.
 */
const useSideBarStore = create((set, get) => ({
  templateDetails: {},
  setTemplateDetails: (templateDetails) => set({ templateDetails }),

  showPreview: false,
  setPreview: (showPreview) => set({ showPreview }),

  bookingMode: false,
  setBookingMode: (bookingMode) => set({ bookingMode }),

  crm: {},
  setCRM: (crm) => set({ crm }),

  nodeData: [],
  setNodeData: (nodeData) => {
    set({ nodeData });
  },
  nodeDataBackup: [],
  setNodeDataBackup: (nodeData) => {
    set({ nodeDataBackup: nodeData })
  },
  restoreNodeDataBackup: () => {
    const nodeData = get().nodeDataBackup;
    set({ nodeData });
  },
  crmData: {
    SEVEN_ROOM: {
      image: 'https://cdn.yourpave.com/assets/chaaat/seven_room.png',
      title: 'Seven Room',
      description:
        'Connect Chaaat to Seven Room allowing for contacts to be synced and activity tracked back to HubSpot.',
        isConnected: 'inactive'
    },
    GOOGLE: {
      image: '../../../../../assets/images/google_calendar_icon.svg',
      title: 'Google',
      description:
        'Connect Chaaat to Google Calendar allowing for contacts to be synced and activity tracked back to Google.',
      isConnected: 'inactive'
    },
    OUTLOOK: {
      image: '../../../../../assets/images/outlook.svg',
      title: 'Outlook',
      description:
        'Connect Chaaat to Outlook Calendar allowing for contacts to be synced and activity tracked back to HubSpot.',
      isConnected: 'inactive'
    },
  },
  edgesDisableOption: {
    createBooking: false,
  },
  selectedWhatsappFlow: null,
  setSelectedWhatsappFlow: (selectedWhatsappFlow) => set({ selectedWhatsappFlow }),
  setCRMData: (crmData) => set({ crmData }),
  setCRMDataStatusByType: (type, status) => {
    const crmData = get().crmData;
    const crmToUpdate = crmData[type.toUpperCase()]
    if (!crmToUpdate) return;
    set({
      crmData: {
        ...crmData,
        [type]: {
          ...crmToUpdate,
          isConnected: status,
        }
      }
    });
  },
  setEdgesDisableOption: (option, value) => {
    const edgesDisableOption = get().edgesDisableOption;
    const disableOptionToUpdate = edgesDisableOption[option];
    if (disableOptionToUpdate === null) return;
    set({
      edgesDisableOption: {
        ...edgesDisableOption,
        [option]: value
      }
    });
  },
  defaultForBookingScreen: [
    {
      title: 'Step 1',
      elements: [
        {
          name: 'full_name',
          value: '',
          placeholder: 'Full name',
          type: 'text',
          fieldType: 'TextInput',
          required: false,
        },
        {
          name: 'company_name',
          value: '',
          placeholder: 'Company Name',
          type: 'text',
          fieldType: 'TextInput',
          required: false,
        },
        {
          name: 'country_code',
          value: '',
          placeholder: 'Country code',
          fieldType: 'TextInput',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          value: '',
          placeholder: 'Phone',
          fieldType: 'TextInput',
          type: 'text',
          required: false,
        },
        {
          name: 'email',
          value: '',
          placeholder: 'Email',
          fieldType: 'TextInput',
          type: 'text',
          required: false,
        },
        {
          name: 'notes',
          value: '',
          placeholder: 'Notes',
          fieldType: 'TextArea',
          type: 'text',
          required: false,
        },
      ],
      cta_label: 'Continue',
    },
    {
      title: 'Step 2',
      elements: [
        {
          name: 'date',
          value: '',
          placeholder: 'Select date',
          fieldType: 'DatePicker',
          type: 'text',
          required: true,
          "min-date": Date.now().toString(),
        },
        {
          name: 'duration',
          value: '',
          placeholder: 'Set duration',
          fieldType: 'Dropdown',
          type: 'dropdown',
          required: true,
        },
        {
          name: 'select_time',
          value: '',
          placeholder: 'Select time',
          fieldType: 'Dropdown',
          type: 'dropdown',
          required: true,
        },
      ],
    },
  ],
  defaultCustomBookingScreen: [
    {
      title: 'Step 1',
      elements: [
        {
          name: 'country_code',
          value: '',
          placeholder: 'Country code',
          fieldType: 'TextInput',
          type: 'text',
          required: true,
        },
        {
          name: 'phone',
          value: '',
          placeholder: 'Phone',
          fieldType: 'TextInput',
          type: 'text',
          required: false,
        },
        {
          name: 'email',
          value: '',
          placeholder: 'Email',
          fieldType: 'TextInput',
          type: 'text',
          required: false,
        }
      ],
      cta_label: 'Continue',
    },
    {
      title: 'Step 2',
      elements: [
        {
          name: 'date',
          value: '',
          placeholder: 'Select date',
          fieldType: 'DatePicker',
          type: 'text',
          required: false,
          "min-date": Date.now().toString(),
        },
        {
          name: 'duration',
          value: '',
          placeholder: 'Set duration',
          fieldType: 'Dropdown',
          type: 'dropdown',
          required: false,
        },
        {
          name: 'select_time',
          value: '',
          placeholder: 'Select time',
          fieldType: 'Dropdown',
          type: 'dropdown',
          required: false,
        },
        {
          name: 'number',
          value: '',
          placeholder: 'Number',
          fieldType: 'TextInput',
          type: 'text',
          required: false,
        }
      ],
    },
  ],
  screens: [
    {
      title: 'Step 1',
      elements: [
        {
          name: 'first_name',
          value: '',
          placeholder: 'First name',
          type: 'text',
          fieldType: 'TextInput',
          required: false,
        },
        {
          name: 'last_name',
          value: '',
          placeholder: 'Last name',
          fieldType: 'TextInput',
          type: 'text',
          required: false,
        },
        {
          name: 'phone',
          value: '',
          placeholder: 'Phone',
          fieldType: 'TextInput',
          type: 'text',
          required: false,
        },
        {
          name: 'email',
          value: '',
          placeholder: 'Email',
          fieldType: 'TextInput',
          type: 'text',
          required: false,
        },
        {
          name: 'notes',
          value: '',
          placeholder: 'Notes',
          fieldType: 'TextArea',
          type: 'text',
          required: false,
        },
      ],
      cta_label: 'Continue',
    },
    {
      title: 'Step 2',
      elements: [
        {
          name: 'date',
          value: '',
          placeholder: 'Select date',
          fieldType: 'DatePicker',
          type: 'text',
          required: true,
          "min-date": Date.now().toString(),
        },
        {
          name: 'duration',
          value: '',
          placeholder: 'Set duration',
          fieldType: 'Dropdown',
          type: 'dropdown',
          required: true,
        },
        {
          name: 'select_time',
          value: '',
          placeholder: 'Select time',
          fieldType: 'Dropdown',
          type: 'dropdown',
          required: true,
        },
      ],
    },
  ],
  setScreens: (screens) => set({ screens }),
  currentScreenIndex:0,
  setCurrentScreenIndex: (currentScreenIndex) => set({ currentScreenIndex }),

  bookingOption: 'book-table',
  cachedBookingOption: 'book-table',
  setCachedBookingOption: (cachedBookingOption) => set({cachedBookingOption}),
  setBookingOption: (bookingOption) => set({bookingOption}),
  
  nodeEdges: [],
  setNodeEdges: (nodeEdges) => set({ nodeEdges }),

  selectedNodeStore: null,
  setSelectedNodeStore: (selectedNodeStore) => set({ selectedNodeStore }),
  resetBookingSidebar: () => set({ currentScreenIndex: 0, bookingMode: false }),

  whatsappFlowSelected: null,
  setWhatsappFlowSelected: (whatsappFlowSelected) =>{
    set({ whatsappFlowSelected })
  },
}));

export default useSideBarStore;
