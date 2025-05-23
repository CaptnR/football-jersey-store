// Updated AdminDashboardPage.js with Material-UI components and styling

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import {
    Container,
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Card,
    List,
    ListItem,
    ListItemText,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Divider,
    Paper,
    Select,
    MenuItem,
    Chip,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    CardHeader,
    DialogContentText,
    Checkbox
} from '@mui/material';
import {
    AttachMoney,
    ShoppingCart,
    TrendingUp,
    LocalShipping,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { fetchAdminDashboard, updateJerseyStock, adminApi } from '../api/adminApi';
import { API } from '../api/api';

const ORDER_STATUSES = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    RETURN_PENDING: 'Return Pending',
    RETURN_APPROVED: 'Return Approved',
    RETURN_REJECTED: 'Return Rejected',
    RETURN_COMPLETED: 'Return Completed',
    CANCELLED: 'Cancelled'
};

const STATUS_COLORS = {
    pending: {
        bg: '#FFF4E5',
        color: '#7A4F01',
        borderColor: '#FFB74D'
    },
    processing: {
        bg: '#E8F4FD',
        color: '#0A4D88',
        borderColor: '#64B5F6'
    },
    shipped: {
        bg: '#E0F4F4',
        color: '#006C6C',
        borderColor: '#4DB6AC'
    },
    delivered: {
        bg: '#E6F4EA',
        color: '#1E4620',
        borderColor: '#66BB6A'
    },
    cancelled: {
        bg: '#FEEBEE',
        color: '#932338',
        borderColor: '#EF5350'
    },
    return_pending: {
        bg: '#FFF3E0',
        color: '#E65100',
        borderColor: '#FFB74D'
    },
    return_approved: {
        bg: '#E8F5E9',
        color: '#2E7D32',
        borderColor: '#81C784'
    },
    return_rejected: {
        bg: '#FFEBEE',
        color: '#C62828',
        borderColor: '#E57373'
    },
    return_completed: {
        bg: '#E0F2F1',
        color: '#00695C',
        borderColor: '#4DB6AC'
    }
};

function StatCard({ title, value, icon, trend }) {
    return (
        <Card 
            elevation={0}
            sx={{ 
                p: 3, 
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ 
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                    backgroundColor: 'primary.lighter',
                    color: 'primary.main'
                }}>
                    {icon}
                </Box>
                {trend && (
                    <Chip
                        size="small"
                        label={`${trend > 0 ? '+' : ''}${trend}%`}
                        color={trend > 0 ? 'success' : 'error'}
                        variant="outlined"
                    />
                )}
            </Box>
            <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 600 }}>
                {value}
            </Typography>
            <Typography color="text.secondary" variant="body2">
                {title}
            </Typography>
        </Card>
    );
}

// Add a component for the Order Status Dialog
function OrderStatusDialog({ open, onClose, order, onUpdateStatus }) {
    const [newStatus, setNewStatus] = useState(order?.status || '');

    const handleSubmit = () => {
        // Convert status to lowercase before sending to backend
        onUpdateStatus(order.id, newStatus.toLowerCase());
    };

    useEffect(() => {
        // Set initial status when order changes
        if (order) {
            setNewStatus(order.status.toLowerCase());
        }
    }, [order]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Select
                        fullWidth
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                    >
                        {Object.entries(ORDER_STATUSES).map(([key, label]) => (
                            <MenuItem 
                                key={key} 
                                value={key.toLowerCase()}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    '&.Mui-selected': {
                                        backgroundColor: STATUS_COLORS[key.toLowerCase()]?.bg,
                                        '&:hover': {
                                            backgroundColor: STATUS_COLORS[key.toLowerCase()]?.bg
                                        }
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: STATUS_COLORS[key.toLowerCase()]?.borderColor,
                                            mr: 1
                                        }}
                                    />
                                    {label}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!newStatus || newStatus === order?.status}
                >
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function AdminDashboardPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedJersey, setSelectedJersey] = useState(null);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [newStock, setNewStock] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
    const [returnRequests, setReturnRequests] = useState([]);
    const [selectedJerseys, setSelectedJerseys] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const checkAdminStatus = async () => {
        try {
            const response = await adminApi.get('/admin/check/');
            if (!response.data.is_admin) {
                navigate('/');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Admin check failed:', error);
            navigate('/login');
            return false;
        }
    };

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const isAdmin = await checkAdminStatus();
            if (!isAdmin) return;

            const data = await fetchAdminDashboard();
            setDashboardData(data);
            setError('');
            fetchReturnRequests();
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateStock = async () => {
        try {
            await updateJerseyStock(selectedJersey.id, {
                stock: parseInt(newStock),
                low_stock_threshold: selectedJersey.low_stock_threshold
            });
            setIsUpdateDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error updating stock:', error);
            setError('Failed to update stock');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            // Ensure status is lowercase
            const status = newStatus.toLowerCase();
            await adminApi.patch(`/orders/${orderId}/status/`, { status });
            showToast('Order status updated successfully', 'success');
            fetchData();
            setIsOrderDialogOpen(false);
        } catch (error) {
            console.error('Error updating order status:', error);
            showToast(error.response?.data?.error || 'Failed to update order status', 'error');
        }
    };

    const fetchReturnRequests = async () => {
        try {
            const response = await API.get('/returns/pending/');
            setReturnRequests(response.data);
        } catch (error) {
            console.error('Error fetching return requests:', error);
            showToast('Failed to fetch return requests', 'error');
        }
    };

    const handleReturnAction = async (returnId, action) => {
        try {
            await API.patch(`/returns/${returnId}/approve/`, { action });
            showToast(`Return request ${action}ed successfully`, 'success');
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.error || `Failed to ${action} return`, 'error');
        }
    };

    const handleDeleteJerseys = async () => {
        try {
            await API.post('/jerseys/bulk_delete/', {
                jersey_ids: selectedJerseys
            });
            showToast('Jerseys deleted successfully', 'success');
            setDeleteDialogOpen(false);
            setSelectedJerseys([]);
            fetchData();
        } catch (error) {
            showToast(error.response?.data?.error || 'Failed to delete jerseys', 'error');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const { kpis, low_stock_jerseys = [] } = dashboardData || {};

    return (
        <Box sx={{ 
            bgcolor: '#F4F6F8',
            minHeight: '100vh'
        }}>
            <Container maxWidth="xl">
                <Box sx={{ py: 4 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 4 
                    }}>
                        <Box>
                            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                                Dashboard
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Welcome back, Admin
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/admin/orders')}
                            startIcon={<ShoppingCart />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 3
                            }}
                        >
                            View All Orders
                        </Button>
                    </Box>

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 3,
                                borderRadius: 2,
                                boxShadow: 1
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* KPIs Section with updated spacing */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Total Revenue"
                                value={`₹${kpis?.total_revenue?.toLocaleString() || 0}`}
                                icon={<AttachMoney />}
                                trend={12} // Add actual trend calculation
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Total Orders"
                                value={kpis?.total_orders || 0}
                                icon={<ShoppingCart color="primary" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Average Order"
                                value={`₹${kpis?.average_order_value?.toLocaleString() || 0}`}
                                icon={<TrendingUp color="info" />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Total Customers"
                                value={kpis?.total_customers || 0}
                                icon={<LocalShipping color="warning" />}
                            />
                        </Grid>
                    </Grid>

                    {/* Orders by Status with updated styling */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Orders by Status
                        </Typography>
                        <Grid container spacing={2}>
                            {(() => {
                                // First combine the counts for same statuses
                                const normalizedStatuses = Object.entries(kpis?.orders_by_status || {})
                                    .reduce((acc, [status, count]) => {
                                        const normalizedStatus = status.toLowerCase();
                                        acc[normalizedStatus] = (acc[normalizedStatus] || 0) + count;
                                        return acc;
                                    }, {});

                                // Then map the normalized statuses
                                return Object.entries(normalizedStatuses).map(([status, count]) => (
                                    <Grid item xs={12} sm={6} md={4} key={status}>
                                        <Card 
                                            elevation={0}
                                            sx={{ 
                                                p: 3, 
                                                cursor: 'pointer',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
                                                }
                                            }}
                                            onClick={() => navigate('/admin/orders', { 
                                                state: { filterStatus: status } 
                                            })}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        bgcolor: STATUS_COLORS[status]?.borderColor,
                                                        mr: 1.5
                                                    }}
                                                />
                                                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                                                    {ORDER_STATUSES[status.toUpperCase()]}
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                                {count}
                                            </Typography>
                                        </Card>
                                    </Grid>
                                ));
                            })()}
                        </Grid>
                    </Box>

                    {/* Recent Orders and Stock Alerts Grid */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} lg={8}>
                            <Card 
                                elevation={0}
                                sx={{ 
                                    height: '100%',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    overflow: 'hidden'
                                }}
                            >
                                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="h6">Recent Orders</Typography>
                                </Box>
                                <List disablePadding>
                                    {dashboardData?.recent_orders?.map((order, index) => (
                                        <ListItem
                                            key={order.id}
                                            divider={index !== dashboardData.recent_orders.length - 1}
                                            sx={{ 
                                                px: 3,
                                                py: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                gap: 1,
                                                bgcolor: 'background.paper',
                                                '&:hover': {
                                                    bgcolor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <Box sx={{ width: '100%' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                    <Typography variant="subtitle1">
                                                        Order #{order.id}
                                                    </Typography>
                                                    <Chip
                                                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: STATUS_COLORS[order.status]?.bg,
                                                            color: STATUS_COLORS[order.status]?.color,
                                                            borderColor: STATUS_COLORS[order.status]?.borderColor,
                                                            border: '1px solid',
                                                            height: '24px'
                                                        }}
                                                    />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Customer: {order.user} | Total: ₹{order.total_price}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Ordered on: {new Date(order.created_at).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setIsOrderDialogOpen(true);
                                                }}
                                                sx={{
                                                    minWidth: '80px',
                                                    height: '28px',
                                                    alignSelf: 'flex-end',
                                                    mt: 1,
                                                    borderColor: STATUS_COLORS[order.status]?.borderColor,
                                                    color: STATUS_COLORS[order.status]?.color,
                                                    '&:hover': {
                                                        borderColor: STATUS_COLORS[order.status]?.borderColor,
                                                        backgroundColor: STATUS_COLORS[order.status]?.bg
                                                    }
                                                }}
                                            >
                                                Update
                                            </Button>
                                        </ListItem>
                                    ))}
                                </List>
                            </Card>
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <Card 
                                elevation={0}
                                sx={{ 
                                    height: '100%',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    overflow: 'hidden'
                                }}
                            >
                                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="h6">Stock Alerts</Typography>
                                </Box>
                                {low_stock_jerseys.length > 0 ? (
                                    <>
                                        <Alert 
                                            severity="warning" 
                                            sx={{ 
                                                mx: 3,
                                                mt: 2,
                                                mb: 1,
                                                '& .MuiAlert-message': {
                                                    width: '100%'
                                                }
                                            }}
                                        >
                                            {low_stock_jerseys.length} jerseys are running low on stock!
                                        </Alert>
                                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => setDeleteDialogOpen(true)}
                                                disabled={selectedJerseys.length === 0}
                                            >
                                                Delete Selected Jerseys
                                            </Button>
                                        </Box>
                                        <List sx={{ px: 0 }}>
                                            {low_stock_jerseys.map((jersey) => (
                                                <ListItem
                                                    key={jersey.id}
                                                    divider
                                                    secondaryAction={
                                                        <Checkbox
                                                            checked={selectedJerseys.includes(jersey.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedJerseys([...selectedJerseys, jersey.id]);
                                                                } else {
                                                                    setSelectedJerseys(selectedJerseys.filter(id => id !== jersey.id));
                                                                }
                                                            }}
                                                        />
                                                    }
                                                    sx={{ 
                                                        px: 3,
                                                        py: 2,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-start',
                                                        gap: 1
                                                    }}
                                                >
                                                    <Box sx={{ width: '100%' }}>
                                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                                            {jersey.player__name}'s Jersey
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Stock: {jersey.stock} / {jersey.low_stock_threshold}
                                                        </Typography>
                                                    </Box>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedJersey(jersey);
                                                            setNewStock(jersey.stock.toString());
                                                            setIsUpdateDialogOpen(true);
                                                        }}
                                                        sx={{ 
                                                            minWidth: '80px',
                                                            height: '28px',
                                                            alignSelf: 'flex-end',
                                                            mt: 1,
                                                            padding: '4px 12px'
                                                        }}
                                                    >
                                                        Update
                                                    </Button>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </>
                                ) : (
                                    <Alert severity="success">
                                        All jerseys are well stocked!
                                    </Alert>
                                )}
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Stock Update Dialog */}
                    <Dialog 
                        open={isUpdateDialogOpen} 
                        onClose={() => setIsUpdateDialogOpen(false)}
                    >
                        <DialogTitle>Update Stock Level</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="New Stock Level"
                                type="number"
                                fullWidth
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                InputProps={{
                                    inputProps: { min: 0 }
                                }}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setIsUpdateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleUpdateStock}
                                variant="contained"
                                disabled={!newStock || parseInt(newStock) < 0}
                            >
                                Update
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Order Status Update Dialog */}
                    <OrderStatusDialog
                        open={isOrderDialogOpen}
                        onClose={() => setIsOrderDialogOpen(false)}
                        order={selectedOrder}
                        onUpdateStatus={handleUpdateOrderStatus}
                    />

                    {/* Return Requests Section */}
                    <Card sx={{ mt: 4 }}>
                        <CardHeader 
                            title="Return Requests" 
                            sx={{ 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                '& .MuiCardHeader-title': {
                                    fontSize: '1.25rem',
                                    fontWeight: 600
                                }
                            }}
                        />
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Order ID</TableCell>
                                        <TableCell>Customer</TableCell>
                                        <TableCell>Return Reason</TableCell>
                                        <TableCell>Request Date</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {returnRequests.length > 0 ? (
                                        returnRequests.map((returnRequest) => (
                                            <TableRow key={returnRequest.id}>
                                                <TableCell>#{returnRequest.order}</TableCell>
                                                <TableCell>{returnRequest.user}</TableCell>
                                                <TableCell>{returnRequest.reason}</TableCell>
                                                <TableCell>
                                                    {new Date(returnRequest.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleReturnAction(returnRequest.id, 'approve')}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleReturnAction(returnRequest.id, 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                <Typography color="textSecondary">
                                                    No pending return requests
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>

                    {/* Confirmation Dialog */}
                    <Dialog
                        open={deleteDialogOpen}
                        onClose={() => setDeleteDialogOpen(false)}
                    >
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to delete the selected jerseys? This action cannot be undone.
                                All related orders, reviews, and wishlist items will also be deleted.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                            <Button 
                                onClick={handleDeleteJerseys} 
                                color="error" 
                                variant="contained"
                            >
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Container>
        </Box>
    );
}

export default AdminDashboardPage;
