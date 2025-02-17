export const cacheManager = {
    set: (key, data, ttl = 5 * 60 * 1000) => {
        const item = {
            data,
            timestamp: Date.now(),
            ttl
        };
        localStorage.setItem(key, JSON.stringify(item));
    },

    get: (key) => {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const { data, timestamp, ttl } = JSON.parse(item);
        if (Date.now() - timestamp > ttl) {
            localStorage.removeItem(key);
            return null;
        }
        return data;
    }
}; 