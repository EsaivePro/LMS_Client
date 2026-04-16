import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loadingOverlay: false,
  loadingMessage: "Please wait",
  loadingProgress: null,
  loadingShowProgress: false,
  alert: { open: false, message: "", type: "" },
  sidebarOpen: false,
  modal: { open: false },
  viewHeader: true,
  viewSidebar: true,
  viewContainerCard: true,
  viewFooter: true,
  containerTitle: "",
  containerTitleDescription: "",
  viewCourseCard: false,
  user: { userid: 2, name: "Demo User", email: "", role: "Admin" },
}

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    showLoading: (state, action) => {
      const payload = action?.payload;

      state.loadingOverlay = true;
      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        const progress = Number(payload.progress);
        state.loadingMessage = payload.message || "Please wait";
        state.loadingProgress = Number.isFinite(progress)
          ? Math.max(0, Math.min(100, Math.round(progress)))
          : null;
        state.loadingShowProgress = Boolean(
          payload.showProgress ?? Number.isFinite(progress)
        );
        return;
      }

      state.loadingMessage = payload || "Please wait";
      state.loadingProgress = null;
      state.loadingShowProgress = false;
    },
    hideLoading: (state) => {
      state.loadingOverlay = false;
      state.loadingMessage = "";
      state.loadingProgress = null;
      state.loadingShowProgress = false;
    },
    successAlert: (state, action) => {
      state.alert = { open: true, type: "success", message: action.payload };
    },
    errorAlert: (state, action) => {
      state.alert = { open: true, type: "error", message: action.payload };
    },
    warningAlert: (state, action) => {
      state.alert = { open: true, type: "warning", message: action.payload };
    },
    clearAlert: (state) => {
      state.alert = { open: false, message: "", type: "" };
    },
    setViewHeader: (state, action) => {
      state.viewHeader = action.payload;
    },
    setViewSidebar: (state, action) => {
      state.viewSidebar = action.payload;
    },
    setViewFooter: (state, action) => {
      state.viewFooter = action.payload;
    },
    setViewContainerCard: (state, action) => {
      state.viewContainerCard = action.payload;
    },
    setContainerTitle: (state, action) => {
      state.containerTitle = action.payload;
    },
    setContainerTitleDescription: (state, action) => {
      state.containerTitleDescription = action.payload;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setViewCourseCard: (state, action) => {
      state.viewCourseCard = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type.endsWith('/pending'),
      (state) => {
        // state.loadingOverlay = false;
      }
    );
    builder.addMatcher(
      (action) => action.type.endsWith('/fulfilled'),
      (state) => {
        state.loadingOverlay = false;
        state.loadingProgress = null;
        state.loadingShowProgress = false;
      }
    );
    builder.addMatcher(
      (action) => action.type.endsWith('/rejected'),
      (state) => {
        state.loadingOverlay = false;
        state.loadingProgress = null;
        state.loadingShowProgress = false;
      }
    );
  }

});

export const {
  showLoading,
  hideLoading,
  successAlert,
  errorAlert,
  warningAlert,
  clearAlert,
  setViewHeader,
  setViewSidebar,
  setViewFooter,
  setViewContainerCard,
  setContainerTitle,
  setContainerTitleDescription,
  setSidebarOpen,
  setViewCourseCard
} = commonSlice.actions;

export default commonSlice.reducer;