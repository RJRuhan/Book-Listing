// State management
let currentBooks = [];
let currentPage = 1;
let totalPages = 0;
let nextPageUrl = null;
let previousPageUrl = null;
let currentSearch = '';
let currentGenre = '';

// Initialize books functionality
document.addEventListener('DOMContentLoaded', () => {
    // Only run on index page
    if (!document.getElementById('books-list')) return;
    
    // Initialize from localStorage (bonus feature)
    loadUserPreferences();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial books
    loadBooks();
});

// Set up event listeners for search and filter
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const genreFilter = document.getElementById('genre-filter');
    
    // Search by title
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function() {
            currentSearch = this.value.trim();
            saveUserPreferences();
            currentPage = 1; // Reset to first page
            loadBooks();
        }, 500));
    }
    
    // Filter by genre
    if (genreFilter) {
        genreFilter.addEventListener('change', function() {
            currentGenre = this.value;
            saveUserPreferences();
            currentPage = 1; // Reset to first page
            loadBooks();
        });
    }
}

// Load books from API with current filters
async function loadBooks() {
    showLoading();
    
    try {
        // Prepare parameters
        const params = {};
        
        // Add search parameter if exists
        if (currentSearch) {
            params.search = currentSearch;
        }
        
        // Add topic/genre parameter if exists
        if (currentGenre) {
            params.topic = currentGenre;
        }
        
        // Add page parameter if needed
        if (currentPage > 1 && nextPageUrl) {
            // Extract URL from nextPageUrl
            const url = new URL(nextPageUrl);
            url.searchParams.forEach((value, key) => {
                params[key] = value;
            });
        }
        
        // Fetch books from API
        const data = await fetchBooks(params);
        
        // Update state
        currentBooks = data.results;
        totalPages = Math.ceil(data.count / 32); // API returns 32 books per page
        nextPageUrl = data.next;
        previousPageUrl = data.previous;
        
        // Display books
        displayBooks(currentBooks);
        
        // Update pagination
        displayPagination(totalPages, currentPage);
        
        // console.log(document.getElementById('genre-filter').options.length);
        
        // Populate genre filter if it's the first load
        if (document.getElementById('genre-filter').options.length == 1) {
            populateGenreFilter(currentBooks);
        }
    } catch (error) {
        showError('Failed to load books. Please try again later.');
    }
}

// Load next page of books
function loadNextPage() {
    if (!nextPageUrl) return;
    
    currentPage++;
    loadBooks();
    
    // Scroll to top of book list
    document.getElementById('books-list').scrollIntoView({ behavior: 'smooth' });
}

// Load previous page of books
function loadPreviousPage() {
    if (!previousPageUrl) return;
    
    currentPage--;
    loadBooks();
    
    // Scroll to top of book list
    document.getElementById('books-list').scrollIntoView({ behavior: 'smooth' });
}

// Load specific page of books
function loadPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages || pageNumber === currentPage) return;
    
    currentPage = pageNumber;
    loadBooks();
    
    // Scroll to top of book list
    document.getElementById('books-list').scrollIntoView({ behavior: 'smooth' });
}

// Display books in the UI
function displayBooks(books) {
    const booksContainer = document.getElementById('books-list');
    const wishlist = getWishlist();
    
    if (!books || !books.length) {
        booksContainer.innerHTML = '<div class="no-books">No books found matching your criteria</div>';
        return;
    }
    
    let booksHTML = '<div class="books-grid">';
    
    books.forEach(book => {
        const isWishlisted = wishlist.includes(book.id);
        const coverImage = book.formats['image/jpeg'] || 'assets/default-cover.png';
        const authors = book.authors.map(author => author.name).join(', ');
        
        // Get first subject as genre (or default)
        const genre = book.subjects.length ? book.subjects[0] : 'Unknown';
        
        booksHTML += `
            <div class="book-card" data-id="${book.id}">
                <div class="book-card-image">
                    <img src="${coverImage}" alt="${book.title}" loading="lazy">
                    <button class="wishlist-icon ${isWishlisted ? 'wishlisted' : ''}" 
                        data-id="${book.id}" onclick="toggleWishlist(${book.id})">
                        <!-- Heart SVG -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${isWishlisted ? 'red' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
                <div class="book-card-content">
                    <h3><a href="book-details.html?id=${book.id}">${book.title}</a></h3>
                    <p class="book-author">${authors || 'Unknown author'}</p>
                    <div class="book-meta">
                        <span class="book-genre">${genre}</span>
                        <span class="book-id">ID: ${book.id}</span>
                    </div>
                    <a href="book-details.html?id=${book.id}" class="view-details">View Details</a>
                </div>
            </div>
        `;
    });
    
    booksHTML += '</div>';
    booksContainer.innerHTML = booksHTML;
    
    // Add animation classes (bonus feature)
    setTimeout(() => {
        document.querySelectorAll('.book-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 50); // Stagger the animations
        });
    }, 100);
}

// Populate genre filter dropdown
function populateGenreFilter(books) {
    const genres = extractGenres(books);
    const genreFilter = document.getElementById('genre-filter');
    
    // Clear existing options except the first one
    while (genreFilter.options.length > 1) {
        genreFilter.remove(1);
    }
    
    // Add genres to the dropdown
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
    
    // Set current genre if it exists
    if (currentGenre) {
        genreFilter.value = currentGenre;
    }
}

// Display pagination controls
function displayPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination-controls">';
    
    // Previous button
    paginationHTML += `
        <button ${previousPageUrl ? '' : 'disabled'} class="pagination-btn prev-btn" onclick="loadPreviousPage()">
            &laquo; Previous
        </button>
    `;
    
    // Page numbers
    paginationHTML += '<div class="page-numbers">';
    
    // Determine which page numbers to show
    const pagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    
    // Adjust start page if we're at the end
    if (endPage - startPage + 1 < pagesToShow) {
        startPage = Math.max(1, endPage - pagesToShow + 1);
    }
    
    // Show first page if we're not starting from page 1
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="loadPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="loadPage(${i})">
                ${i}
            </button>
        `;
    }
    
    // Show last page if we're not ending at the last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="loadPage(${totalPages})">${totalPages}</button>`;
    }
    
    paginationHTML += '</div>';
    
    // Next button
    paginationHTML += `
        <button ${nextPageUrl ? '' : 'disabled'} class="pagination-btn next-btn" onclick="loadNextPage()">
            Next &raquo;
        </button>
    `;
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Save user preferences to localStorage (bonus feature)
function saveUserPreferences() {
    const preferences = {
        search: currentSearch,
        genre: currentGenre
    };
    
    localStorage.setItem('bookExplorerPreferences', JSON.stringify(preferences));
}

// Load user preferences from localStorage (bonus feature)
function loadUserPreferences() {
    const preferences = JSON.parse(localStorage.getItem('bookExplorerPreferences')) || {};
    
    // Set current values
    currentSearch = preferences.search || '';
    currentGenre = preferences.genre || '';
    
    // Update UI elements
    const searchInput = document.getElementById('search-input');
    if (searchInput && currentSearch) {
        searchInput.value = currentSearch;
    }
    
    // Genre filter will be set when it's populated
}

// Show loading state
function showLoading() {
    const booksContainer = document.getElementById('books-list');
    booksContainer.innerHTML = '<div class="loading"></div>';
}

// Show error message
function showError(message) {
    const booksContainer = document.getElementById('books-list');
    booksContainer.innerHTML = `<div class="error">${message}</div>`;
}