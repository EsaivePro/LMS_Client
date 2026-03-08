import React, { useState, useMemo } from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Typography,
    Chip,
    IconButton,
    Stack,
    Grid,
    Divider,
    Paper,
    CircularProgress,
    TextField,
    InputAdornment,
    TablePagination,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import InboxIcon from "@mui/icons-material/Inbox";

/* ========================================================= */

export default function DataAccordion({
    data = [],
    loading = false,
    onEdit,
    onDelete,
    onView,
    renderContent,
    getId = (item) => item.id,
    getSummary,
    getChips,
    searchFields = [],
    enableSearch = true,
    enablePagination = true,
    defaultPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
}) {
    const [expanded, setExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(0); // Reset to first page on search
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        setExpanded(false); // Collapse accordion when changing page
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        setExpanded(false);
    };

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery.trim() || searchFields.length === 0) {
            return data;
        }

        const query = searchQuery.toLowerCase();
        return data.filter((item) => {
            return searchFields.some((field) => {
                const value = field.split('.').reduce((obj, key) => obj?.[key], item);
                if (value == null) return false;

                // Strip HTML tags if the value contains them
                const stringValue = String(value).replace(/<[^>]*>/g, '').toLowerCase();
                return stringValue.includes(query);
            });
        });
    }, [data, searchQuery, searchFields]);

    // Paginate filtered data
    const paginatedData = useMemo(() => {
        if (!enablePagination) {
            return filteredData;
        }
        const startIndex = page * rowsPerPage;
        return filteredData.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredData, page, rowsPerPage, enablePagination]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 8,
                    textAlign: "center",
                    bgcolor: "grey.50",
                    border: "2px dashed",
                    borderColor: "grey.300",
                    borderRadius: 2,
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: "50%",
                            bgcolor: "grey.200",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <InboxIcon sx={{ fontSize: 48, color: "grey.500" }} />
                    </Box>
                    <Box>
                        <Typography variant="h6" color="text.primary" fontWeight={600} gutterBottom>
                            No Data Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            There are no items to display at the moment.
                        </Typography>
                    </Box>
                </Stack>
            </Paper>
        );
    }

    return (
        <Box>
            {/* Search Bar */}
            {enableSearch && searchFields.length > 0 && (
                <Paper sx={{ p: 2, mb: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={handleClearSearch}
                                        edge="end"
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    {searchQuery && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                            Found {filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
                        </Typography>
                    )}
                </Paper>
            )}

            {/* Accordions */}
            {paginatedData.map((item, index) => {
                const itemId = getId(item);
                const panelId = `panel-${itemId}`;
                const globalIndex = enablePagination ? page * rowsPerPage + index : index;

                return (
                    <Accordion
                        key={itemId}
                        expanded={expanded === panelId}
                        onChange={handleChange(panelId)}
                        sx={{
                            mb: 1,
                            "&:before": { display: "none" },
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            "&.Mui-expanded": {
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                            },
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                                "&:hover": {
                                    bgcolor: "action.hover",
                                },
                                "& .MuiAccordionSummary-content": {
                                    alignItems: "center",
                                    my: 1,
                                },
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                sx={{ width: "100%", pr: 2 }}
                            >
                                {/* Index Badge */}
                                <Box
                                    sx={{
                                        minWidth: 40,
                                        height: 40,
                                        borderRadius: 1,
                                        bgcolor: "primary.main",
                                        color: "white",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 600,
                                    }}
                                >
                                    {globalIndex + 1}
                                </Box>

                                {/* Summary Content */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    {getSummary ? getSummary(item) : (
                                        <Typography noWrap>
                                            Item {itemId}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Chips */}
                                {getChips && (
                                    <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                                        {getChips(item)}
                                    </Stack>
                                )}

                                {/* Actions */}
                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    onClick={(e) => e.stopPropagation()}
                                    sx={{ flexShrink: 0 }}
                                >
                                    {onView && (
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onView(item);
                                            }}
                                            title="View"
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    )}

                                    {onEdit && (
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(item);
                                            }}
                                            title="Edit"
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    )}

                                    {onDelete && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(item);
                                            }}
                                            title="Delete"
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Stack>
                            </Stack>
                        </AccordionSummary>

                        <AccordionDetails sx={{ pt: 2, pb: 3 }}>
                            <Divider sx={{ mb: 2 }} />
                            {renderContent ? renderContent(item) : (
                                <Typography>
                                    No content renderer provided
                                </Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>
                );
            })}

            {/* Pagination */}
            {enablePagination && filteredData.length > 0 && (
                <Paper sx={{ mt: 2 }}>
                    <TablePagination
                        component="div"
                        count={filteredData.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={pageSizeOptions}
                        labelRowsPerPage="Items per page:"
                    />
                </Paper>
            )}
        </Box>
    );
}
