// Updated AdminOrdersPage.js with Material-UI components and styling

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    TablePagination,
    Chip,
    TextField,
    InputAdornment,
    IconButton,
    Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { adminApi } from '../api/adminApi';
import { debounce } from 'lodash';

const ORDER_STATUSES = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
};

const STATUS_COLORS = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
};

function AdminOrdersPage() {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState(location.state?.filterStatus || 'all');
    const [searchQuery, setSearchQuery] = useState('');

    // Add debounced search function
    const debouncedSearch = React.useCallback(
        debounce((searchValue) => {
            setSearchQuery(searchValue);
        }, 500),
        []
    );

    // Handle search input change
    const handleSearchChange = (event) => {
        const { value } = event.target;
        event.persist();
        debouncedSearch(value);
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, searchQuery]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get('/admin/orders/');
            let filteredOrders = response.data;

            // Normalize the status values in the response data
            filteredOrders = filteredOrders.map(order => ({
                ...order,
                status: order.status.toLowerCase()
            }));

            // Apply status filter
            if (statusFilter !== 'all') {
                filteredOrders = filteredOrders.filter(
                    order => order.status === statusFilter.toLowerCase()
                );
            }

            // Apply search filter
            if (searchQuery.trim()) {
                const searchTerm = searchQuery.toLowerCase().trim();
                filteredOrders = filteredOrders.filter(
                    order => 
                        order.id.toString().includes(searchTerm) ||
                        order.user.toLowerCase().includes(searchTerm)
                );
            }

            setOrders(filteredOrders);
            setError(null);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await adminApi.patch(`/orders/${orderId}/status/`, {
                status: newStatus.toLowerCase()
            });
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            setError('Failed to update order status');
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    Loading orders...
                </Box>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: '#F4F6F8', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                {/* Header Section */}
                <Box sx={{ 
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box>
                        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                            Orders
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage and track all orders
                        </Typography>
                    </Box>
                </Box>

                {/* Filters Card */}
                <Card 
                    elevation={0}
                    sx={{ 
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2
                    }}
                >
                    <Box sx={{ 
                        p: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <FormControl size="small" sx={{ width: 200 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                                sx={{
                                    height: 40,
                                    '& .MuiSelect-select': {
                                        py: 1
                                    }
                                }}
                            >
                                <MenuItem value="all">All Orders</MenuItem>
                                {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                                    <MenuItem 
                                        key={key} 
                                        value={key.toLowerCase()}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: STATUS_COLORS[key.toLowerCase()]?.borderColor
                                            }}
                                        />
                                        {value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            placeholder="Search by Order ID or Customer"
                            onChange={handleSearchChange}
                            sx={{ 
                                width: 250,
                                '& .MuiInputBase-root': {
                                    height: 40,
                                    padding: 0,
                                    paddingLeft: 1.5,
                                    paddingRight: 1.5
                                },
                                '& .MuiInputBase-input': {
                                    padding: '8px 0',
                                    height: '24px',
                                    lineHeight: '24px'
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon 
                                            color="action" 
                                            fontSize="small"
                                            sx={{ ml: -0.5 }}
                                        />
                                    </InputAdornment>
                                ),
                                sx: {
                                    fontSize: '0.875rem',
                                    '& .MuiInputAdornment-root': {
                                        height: '100%',
                                        maxHeight: 'none',
                                        marginRight: 0.5
                                    }
                                }
                            }}
                        />
                    </Box>
                </Card>

                {/* Error Alert */}
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ mb: 3, borderRadius: 2 }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Orders Table */}
                <Card 
                    elevation={0}
                    sx={{ 
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}
                >
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'background.neutral' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(orders || [])
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((order) => (
                                        <TableRow 
                                            key={order.id}
                                            sx={{ 
                                                '&:hover': { 
                                                    bgcolor: 'action.hover' 
                                                }
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="subtitle2">
                                                    #{order.id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{order.user}</TableCell>
                                            <TableCell>
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontWeight: 500 }}>
                                                    ₹{order.total_price}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={ORDER_STATUSES[order.status.toUpperCase()]}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: STATUS_COLORS[order.status]?.bg,
                                                        color: STATUS_COLORS[order.status]?.color,
                                                        borderColor: STATUS_COLORS[order.status]?.borderColor,
                                                        border: '1px solid',
                                                        fontWeight: 500
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormControl 
                                                    size="small" 
                                                    sx={{ 
                                                        width: 200,
                                                    }}
                                                >
                                                    <Select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        sx={{
                                                            height: 40,
                                                            '& .MuiSelect-select': {
                                                                py: 1,
                                                                fontSize: '0.875rem'
                                                            }
                                                        }}
                                                    >
                                                        {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                                                            <MenuItem 
                                                                key={key} 
                                                                value={key.toLowerCase()}
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    fontSize: '0.875rem'
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        width: 8,
                                                                        height: 8,
                                                                        borderRadius: '50%',
                                                                        bgcolor: STATUS_COLORS[key.toLowerCase()]?.borderColor
                                                                    }}
                                                                />
                                                                {value}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ 
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <TablePagination
                            component="div"
                            count={orders.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{
                                '.MuiTablePagination-select': {
                                    height: '32px',
                                    paddingTop: '0px',
                                    paddingBottom: '0px',
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                '.MuiTablePagination-selectLabel': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: 0
                                },
                                '.MuiTablePagination-displayedRows': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: 0
                                },
                                '.MuiTablePagination-actions': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginLeft: 2
                                }
                            }}
                            labelRowsPerPage="Rows per page:"
                            rowsPerPageOptions={[5, 10, 25, 50]}
                        />
                    </Box>
                </Card>
            </Container>
        </Box>
    );
}

export default AdminOrdersPage;
