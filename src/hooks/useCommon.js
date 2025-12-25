import { useDispatch, useSelector } from "react-redux";
import {
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
} from "../redux/slices/commonSlice";

const useCommon = () => {
    const dispatch = useDispatch();

    // Selectors
    const loadingOverlay = useSelector((state) => state.common.loadingOverlay);
    const loadingMessage = useSelector((state) => state.common.loadingMessage)
    const alert = useSelector((state) => state.common.alert);
    const sidebarOpen = useSelector((state) => state.common.sidebarOpen);
    const modal = useSelector((state) => state.common.modal);
    const viewHeader = useSelector((state) => state.common.viewHeader);
    const viewSidebar = useSelector((state) => state.common.viewSidebar);
    const viewContainerCard = useSelector((state) => state.common.viewContainerCard);
    const viewFooter = useSelector((state) => state.common.viewFooter);
    const containerTitle = useSelector((state) => state.common.containerTitle);
    const containerTitleDescription = useSelector((state) => state.common.containerTitleDescription);
    const user = useSelector((state) => state.common.user);
    const viewCourseCard = useSelector((state) => state.common.viewCourseCard);


    // Dispatchers
    const showLoader = (msg = "") => dispatch(showLoading(msg));
    const hideLoader = () => dispatch(hideLoading());

    const showSuccess = (msg) => dispatch(successAlert(msg));
    const showError = (msg) => dispatch(errorAlert(msg));
    const showWarning = (msg) => dispatch(warningAlert(msg));
    const clearAlerts = () => dispatch(clearAlert());
    const setHeaderView = (view) => dispatch(setViewHeader(view));
    const setSidebarView = (view) => dispatch(setViewSidebar(view));
    const setFooterView = (view) => dispatch(setViewFooter(view));
    const setContainerCardView = (view) => dispatch(setViewContainerCard(view));
    const setTitleContainer = (title) => dispatch(setContainerTitle(title));
    const setContainerDescription = (description) => dispatch(setContainerTitleDescription(description));
    const setSidebarState = (isOpen) => dispatch(setSidebarOpen(isOpen));
    const setCourseCardView = (view) => dispatch(setViewCourseCard(view));

    return {
        // state
        loadingOverlay,
        loadingMessage,
        alert,
        sidebarOpen,
        modal,
        viewHeader,
        viewSidebar,
        viewContainerCard,
        viewFooter,
        containerTitle,
        user,
        viewCourseCard,
        containerTitleDescription,

        // actions
        showLoader,
        hideLoader,
        showSuccess,
        showError,
        showWarning,
        clearAlerts,
        setHeaderView,
        setSidebarView,
        setFooterView,
        setContainerCardView,
        setTitleContainer,
        setContainerDescription,
        setSidebarState,
        setCourseCardView
    };
};

export default useCommon;
