import React from "react";
import EnrollmentFilters from "../../../modules/enrollments/components/EnrollmentFilters";

export default function EnrollmentFiltersWidget({ filters, onFilterChange, onClear }) {
    return (
        <EnrollmentFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onClear={onClear}
        />
    );
}
