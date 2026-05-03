import React, { useEffect } from "react";
import SideBarWithHeader from "./SideBarWithHeader";
import LoadingScreen from "../common/loading/LoadingScreen";
import Footer from "./Footer";
import useCommon from "../../hooks/useCommon";
import BreadcrumbsNav from "../common/breadcrumbs/BreadcrumbsNav";
import GlobalAlert from "../common/alert/GlobalAlert";
import { FormHeaderProvider } from "../../contexts/FormHeaderContext";

export default function AppLayout({
    children,
    title = "",
    titleDescription = "",
    footer = true,
    header = true,
    sidebar = true,
    containerCard = true,
    courseCard = false,
    breadCurmbs = true,
    normalCard = false,
    fixed = true,
}) {
    const {
        setFooterView,
        setContainerCardView,
        setHeaderView,
        setSidebarState,
        setTitleContainer,
        setCourseCardView,
        setContainerDescription
    } = useCommon();

    useEffect(() => {
        setHeaderView(header);
        setSidebarState(sidebar);
        setFooterView(footer);
        setContainerCardView(containerCard);
        setTitleContainer(title);
        setContainerDescription(titleDescription);
        setCourseCardView(courseCard);
    }, [children]);

    return (
        <FormHeaderProvider>
            <div className="app-root">
                <SideBarWithHeader footer={<Footer />} fixed={fixed} normalCard={normalCard}>
                    {/* FIXED BREADCRUMB / FORM HEADER NAV */}
                    <BreadcrumbsNav breadCurmbs={breadCurmbs} />
                    <GlobalAlert />
                    {/* PAGE CONTENT */}
                    <LoadingScreen />
                    {children}
                </SideBarWithHeader>
            </div>
        </FormHeaderProvider>
    );
}
