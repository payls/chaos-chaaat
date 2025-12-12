import { create } from 'zustand';

const useSalesforceStore = create((set) => ({
  linkDetails: {
    report_id: '',
    report_name: '',
    list: '',
  },
  setStoreLinkDetails: (linkDetails) => set({ linkDetails }),

  contactsArray: [],
  addContactsToImport: (contactsArray) => set({ contactsArray }),

  sfObjectStore: { label: 'Contact', value: 'Contact' },
  setSFObject: (sfObjectStore) => set({ sfObjectStore }),
}));

export default useSalesforceStore;
