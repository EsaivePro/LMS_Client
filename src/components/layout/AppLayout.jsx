import React, { useEffect } from "react";
import SideBarWithHeader from "./SideBarWithHeader";
import LoadingScreen from "../common/loading/LoadingScreen";
import Footer from "./Footer";
import useCommon from "../../hooks/useCommon";
import BreadcrumbsNav from "../common/breadcrumbs/BreadcrumbsNav";   // 👈 ADD THIS
import GlobalAlert from "../common/alert/GlobalAlert";

export default function AppLayout({
    children,
    title = "",
    titleDescription = "",
    footer = true,
    header = true,
    sidebar = true,
    containerCard = true,
    courseCard = false
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
        <div className="app-root">
            <SideBarWithHeader>
                {/* FIXED BREADCRUMB NAV */}
                {/* <BreadcrumbsNav /> */}
                <GlobalAlert />
                {/* PAGE CONTENT */}
                <LoadingScreen />

                {/* Offset for sticky breadcrumb (avoids overlap) */}
                {children}

            </SideBarWithHeader>

            <Footer />
        </div>
    );
}
