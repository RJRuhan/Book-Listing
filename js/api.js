// API Constants
const API_BASE_URL = 'https://gutendex.com';
const BOOKS_ENDPOINT = '/books';

// Function to fetch books from the API
async function fetchBooks(params = {}) {
    // Create URL with query parameters
    const queryParams = new URLSearchParams();
    
    // Add parameters that were passed in
    Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
    });
    
    // Build the URL
    const url = `${API_BASE_URL}${BOOKS_ENDPOINT}?${queryParams.toString()}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching books:', error);
        throw error;
    }
}

// Function to fetch a single book by ID
async function fetchBook(bookId) {
    try {
        const url = `${API_BASE_URL}${BOOKS_ENDPOINT}/${bookId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error fetching book with ID ${bookId}:`, error);
        throw error;
    }
}

// Function to extract all genres/topics from books
function extractGenres(books) {
    const genreSet = new Set();
    
    books.forEach(book => {
        // Add subjects and bookshelves as genres
        book.subjects.forEach(subject => genreSet.add(subject));
        book.bookshelves.forEach(bookshelf => genreSet.add(bookshelf));
    });
    
    return Array.from(genreSet).sort();
}