import React from 'react';
import {
    Box,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    TablePagination,
    Paper,
    TextField,
    Typography,
    CircularProgress,
} from '@mui/material';

export default function SimpleTable({
    rows = [],
    columns = [],
    defaultPageSize = 5,
    pageSizeOptions = [5, 10, 20],
    loading = false,
    searchPlaceholder = 'Search',
    noRowsText = 'No data available',
    onRowDelete,
}) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(defaultPageSize);
    const [search, setSearch] = React.useState('');

    const normalized = React.useMemo(() => {
        const q = (search || '').toString().toLowerCase().trim();
        if (!q) return rows;
        return rows.filter((r) => {
            // stringify row values
            try {
                const text = Object.values(r)
                    .map((v) => (v && typeof v === 'object' ? JSON.stringify(v) : String(v)))
                    .join(' ')
                    .toLowerCase();
                return text.includes(q);
            } catch (e) {
                return false;
            }
        });
    }, [rows, search]);

    const display = React.useMemo(() => {
        const start = page * rowsPerPage;
        return normalized.slice(start, start + rowsPerPage);
    }, [normalized, page, rowsPerPage]);

    React.useEffect(() => setPage(0), [search, rowsPerPage]);

    return (
        <Paper sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderBottom: '1px solid var(--lightgrey)' }}>
                <TextField
                    size="small"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 360 }}
                />
                <Box sx={{ ml: 'auto' }}>
                    {loading && <CircularProgress size={20} />}
                </Box>
            </Box>

            <TableContainer sx={{ width: '100%' }}>
                <Table stickyHeader sx={{ width: '100%', minWidth: 600 }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((c) => (
                                <TableCell key={c.field} sx={{ minWidth: c.minWidth }}>{c.headerName}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {display.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={Math.max(1, columns.length)} align="center">
                                    <Typography variant="body2">{noRowsText}</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            display.map((row, i) => (
                                <TableRow key={row.id ?? i} hover>
                                    {columns.map((c) => (
                                        <TableCell key={c.field}>
                                            {c.renderCell ? c.renderCell({ row, value: row[c.field] }) : (row[c.field] ?? '-')}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={normalized.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                rowsPerPageOptions={pageSizeOptions}
                labelRowsPerPage="Records to Show"
                sx={{ px: 2 }}
            />
        </Paper>
    );
}
