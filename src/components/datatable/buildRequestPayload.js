export function buildRequestPayload({
    columnsConfig,
    columnFilters,
    globalFilter,
    sorting,
    pagination,
}) {
    const payload = {};

    payload.columns = columnsConfig.filter((c) => c.accessorKey).map((c) => c.accessorKey);

    payload.pagination = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    };

    if (sorting.length) {
        payload.sort = {
            column: sorting[0].id,
            order: sorting[0].desc ? "desc" : "asc",
        };
    }

    const where = {};

    Object.entries(columnFilters).forEach(([key, value]) => {
        const col = columnsConfig.find((c) => c.accessorKey === key);
        if (!col || value == null || value === "") return;

        switch (col.filterType) {
            case "like":
                where[`${key}_like`] = value;
                break;
            case "range":
                if (value.from) where[`${key}_from`] = value.from;
                if (value.to) where[`${key}_to`] = value.to;
                break;
            case "in":
                where[key] = value;
                break;
            default:
                where[key] = value;
        }
    });

    if (Object.keys(where).length) payload.where = where;

    if (globalFilter) {
        payload.search = {
            value: globalFilter,
            columns: columnsConfig
                .filter((c) => c.searchable)
                .map((c) => c.accessorKey),
        };
    }

    return payload;
}