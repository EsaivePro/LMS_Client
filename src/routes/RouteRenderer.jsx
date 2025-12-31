import React, { Fragment } from "react";
import { Route } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { RequireRole } from "../components/protectedRoute/ProtectedRoute";

export default function RouteRenderer({ routes }) {
    return (
        <Fragment>
            {routes.map((route) => {
                const {
                    path,
                    title,
                    description,
                    permission,
                    element,
                    layoutProps = {},
                } = route;

                return (
                    <Route
                        key={path}
                        path={path}
                        element={
                            <AppLayout
                                title={title}
                                titleDescription={description}
                                {...layoutProps}
                            >
                                {permission ? (
                                    <RequireRole role={permission}>{element}</RequireRole>
                                ) : (
                                    element
                                )}
                            </AppLayout>
                        }
                    />
                );
            })}
        </Fragment>
    );
}
