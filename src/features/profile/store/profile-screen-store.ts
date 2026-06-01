import { create } from 'zustand';

type ProfileScreenState = {
  isEditModalVisible: boolean;
  openEditModal: () => void;
  closeEditModal: () => void;
};

export const useProfileScreenStore = create<ProfileScreenState>()((set) => ({
  isEditModalVisible: false,
  openEditModal: () => set({ isEditModalVisible: true }),
  closeEditModal: () => set({ isEditModalVisible: false }),
}));
