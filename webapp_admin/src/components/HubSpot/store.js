import { create } from 'zustand';

const useHubSpotStore = create((set) => ({
  linkDetails: {
    list_id: '',
    list_name: '',
    list: '',
  },
  setStoreLinkDetails: (linkDetails) => set({ linkDetails }),

  contactsArray: [],
  addContactsToImport: (contactsArray) => set({ contactsArray }),

  hbObjectStore: { label: 'Contact', value: 'Contact' },
  setHBObject: (hbObjectStore) => set({ hbObjectStore }),
}));

export default useHubSpotStore;
