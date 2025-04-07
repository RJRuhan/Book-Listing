// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Function to extract URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to truncate text to a specified length
function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Function to create a URL-friendly slug from a string
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// Function to format date
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to detect if device is mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}