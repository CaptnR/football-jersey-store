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
    Alert,
    InputBase,
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { adminApi } from '../api/adminApi';
import { debounce } from 'lodash';
import { updateOrderStatus } from '../api/api';
import { API } from '../api/api';
import { useToast } from '../context/ToastContext';

const ORDER_STATUSES = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    RETURN_REQUESTED: 'Return Requested',
    RETURN_APPROVED: 'Return Approved',
    RETURN_REJECTED: 'Return Rejected'
};

const STATUS_COLORS = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error',
    return_requested: 'warning',
    return_approved: 'success',
    return_rejected: 'error'
};

// Add this new component for the search bar
const SearchBar = ({ value, onChange, onSubmit, onClear }) => {
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            onSubmit(event.target.value);
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 350,
                height: 58,
                backgroundColor: 'white',
                borderRadius: '24px',
                border: '1px solid',
                borderColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                px: 2,
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.12)',
                }
            }}
        >
            <SearchIcon 
                sx={{ 
                    fontSize: 20,
                    color: 'text.secondary',
                    mr: 1.5
                }}
            />
            
            <Box
                sx={{
                    flex: 1,
                    height: '10px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <InputBase
                    value={value}
                    onChange={onChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Search Orders"
                    sx={{
                        flex: 1,
                        pl: 1.5,
                        '& input': {
                            padding: '8px 0',
                            fontSize: '14px',
                            lineHeight: '1',
                            position: 'relative',
                            top: '10px',
                            '&::placeholder': {
                                color: '#757575',
                                opacity: 0,
                                textAlign: 'left',
                                position: 'fixed',
                                top: '5px'
                            },
                            '&:focus': {
                                outline: 'none',
                            },
                        },
                        // Remove the default focus outline
                        '& .MuiInputBase-input:focus': {
                            outline: 'none',
                            border: 'none',
                            boxShadow: 'none',
                        },
                        // Remove default borders
                        '& .MuiInputBase-root': {
                            border: 'none',
                            '&:before, &:after': {
                                display: 'none',
                            },
                        },
                        // Remove focus ring
                        '&.Mui-focused': {
                            outline: 'none',
                            border: 'none',
                            boxShadow: 'none',
                        }
                    }}
                />
            </Box>

            {value && (
                <IconButton
                    onClick={onClear}
                    size="small"
                    sx={{
                        ml: 1,
                        p: 0.5,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                    }}
                >
                    <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
            )}
        </Box>
    );
};

function AdminOrdersPage() {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState(location.state?.filterStatus || 'all');
    const [searchInput, setSearchInput] = useState('');
    const { showToast } = useToast();

    // Update the fetchOrders function to handle empty search properly
    const fetchOrders = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminApi.get('/admin/orders/');
            let filteredOrders = response.data;

            // Normalize the status values
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

            // Only apply search filter if there's a search term
            if (searchInput && searchInput.trim()) {
                const searchTerm = searchInput.toLowerCase().trim();
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
    }, [statusFilter, searchInput]);

    // Create a memoized debounced search function
    const debouncedSearch = React.useCallback(
        debounce((value) => {
            setSearchInput(value);
            fetchOrders();  // Only fetch after debounce
        }, 500),
        [fetchOrders]  // Include fetchOrders in dependencies
    );

    // Update the search handler to only update local state immediately
    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchInput(value);  // Just update the input value
    };

    const handleSearchSubmit = (value) => {
        fetchOrders();  // Only fetch when Enter is pressed
    };

    // Update the clear search handler
    const handleClearSearch = () => {
        setSearchInput('');  // Clear the input
        // Fetch orders without search filter
        const fetchWithoutSearch = async () => {
            try {
                setLoading(true);
                const response = await adminApi.get('/admin/orders/');
                let filteredOrders = response.data;

                // Only apply status filter
                if (statusFilter !== 'all') {
                    filteredOrders = filteredOrders.filter(
                        order => order.status === statusFilter.toLowerCase()
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
        fetchWithoutSearch();
    };

    // Update useEffect to only fetch on mount and status filter changes
    useEffect(() => {
        fetchOrders();
    }, [statusFilter]); // Remove fetchOrders from dependencies

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            // Refresh orders or update local state
            fetchOrders(); // or however you're refreshing the orders list
        } catch (error) {
            console.error('Error updating order status:', error);
            // Show error message to user
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleReturnAction = async (orderId, returnId, action) => {
        try {
            if (!returnId) {
                showToast('Return ID not found', 'error');
                return;
            }

            // Call the specific endpoint for approve/reject
            await API.post(`/returns/${returnId}/${action}/`);
            
            showToast(`Return ${action}d successfully`, 'success');
            fetchOrders(); // Refresh orders list
        } catch (error) {
            console.error('Return action error:', error);
            showToast(error.response?.data?.error || `Failed to ${action} return`, 'error');
        }
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
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                        Orders Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        View and manage all customer orders
                    </Typography>
                </Box>

                {/* Filters Card with Status and Search */}
                <Card 
                    elevation={0}
                    sx={{ 
                        mb: 3,
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2
                    }}
                >
                    <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap'
                    }}>
                        <FormControl 
                            size="small" 
                            sx={{ minWidth: 200 }}
                        >
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Orders</MenuItem>
                                {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                                    <MenuItem 
                                        key={key} 
                                        value={key.toLowerCase()}
                                    >
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1 
                                        }}>
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: STATUS_COLORS[key.toLowerCase()]
                                                }}
                                            />
                                            {value}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <SearchBar
                            value={searchInput}
                            onChange={handleSearch}
                            onSubmit={handleSearchSubmit}
                            onClear={handleClearSearch}
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
                                                {order.status === 'return_requested' ? (
                                                    <Box>
                                                        <Button
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleReturnAction(order.id, order.return_id, 'approve')}
                                                            sx={{ mr: 1 }}
                                                            disabled={!order.return_id}
                                                        >
                                                            Approve Return
                                                        </Button>
                                                        <Button
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleReturnAction(order.id, order.return_id, 'reject')}
                                                            disabled={!order.return_id}
                                                        >
                                                            Reject Return
                                                        </Button>
                                                        {order.return_reason && (
                                                            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                                                                Reason: {order.return_reason}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                ) : (
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
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    
                    {/* Pagination */}
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
                                    height: '32px'
                                }
                            }}
                        />
                    </Box>
                </Card>
            </Container>
        </Box>
    );
}

export default AdminOrdersPage;
