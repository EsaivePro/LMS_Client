import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  loadingCount: 0,
  sidebarOpen: false,
  modal: { open: false },
  viewSidebarHeader: true,
  viewContainerCard: true,
  viewFooter: true,
  containerTitle: "",
  user: { name: "Demo User", email: "demo@example.com" },
};
const s = createSlice({
  name: "ui",
  initialState,
  reducers: {
    showLoading(state) {
      state.loadingCount += 1;
    },
    hideLoading(state) {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar(state, action) {
      state.sidebarOpen = !!action.payload;
    },
    showModal(state, action) {
      state.modal = { open: true, ...action.payload };
    },
    hideModal(state) {
      state.modal.open = false;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setViewContainerCard(state, action) {
      state.viewContainerCard = action.payload;
    },
    setContainerTitle(state, action) {
      state.containerTitle = action.payload;
    },
    setViewSidebarHeader(state, action) {
      state.viewSidebarHeader = action.payload;
    },
    setViewFooter(state, action) {
      state.viewFooter = action.payload;
    },
  },
});
export const {
  showLoading,
  hideLoading,
  toggleSidebar,
  setSidebar,
  showModal,
  hideModal,
  setUser,
  setContainerTitle,
  setViewContainerCard,
  setViewSidebarHeader,
  setViewFooter
} = s.actions;
export default s.reducer;
