import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toast, setToast] = useState({ open: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ open: true, message, type });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, open: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={hideToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={hideToast} severity={toast.type} elevation={6}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
} 