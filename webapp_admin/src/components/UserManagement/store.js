import { create } from 'zustand';

const useUserManagementStore = create((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}));

export default useUserManagementStore;
