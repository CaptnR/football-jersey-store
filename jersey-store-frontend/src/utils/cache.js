export const cacheData = (key, data, expiryMinutes = 5) => {
    const item = {
        data,
        timestamp: new Date().getTime(),
        expiryMinutes
    };
    localStorage.setItem(key, JSON.stringify(item));
};

export const getCachedData = (key) => {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const { data, timestamp, expiryMinutes } = JSON.parse(item);
    const now = new Date().getTime();
    
    if (now - timestamp > expiryMinutes * 60 * 1000) {
        localStorage.removeItem(key);
        return null;
    }
    
    return data;
}; 