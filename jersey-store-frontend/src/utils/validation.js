export const validateReview = (data) => {
    const errors = {};
    if (!data.rating) errors.rating = 'Rating is required';
    if (!data.comment) errors.comment = 'Please write a review';
    if (data.comment && data.comment.length < 10) {
        errors.comment = 'Review must be at least 10 characters';
    }
    return errors;
};

export const validateLogin = (data) => {
    const errors = {};
    if (!data.username) {
        errors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9]+$/.test(data.username)) {
        errors.username = 'Username can only contain letters and numbers';
    }
    if (!data.password) errors.password = 'Password is required';
    return errors;
};

export const validateSignup = (data) => {
    const errors = {};
    if (!data.username) {
        errors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9]+$/.test(data.username)) {
        errors.username = 'Username can only contain letters and numbers';
    }
    if (!data.password) errors.password = 'Password is required';
    if (data.password && data.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }
    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
};

export const validateCheckout = (data) => {
    const errors = {};
    if (!data.address) errors.address = 'Address is required';
    if (!data.city) errors.city = 'City is required';
    if (!data.postalCode) errors.postalCode = 'Postal code is required';
    if (!data.phone) errors.phone = 'Phone number is required';
    if (data.phone && !/^\d{10}$/.test(data.phone)) {
        errors.phone = 'Please enter a valid 10-digit phone number';
    }
    return errors;
}; 