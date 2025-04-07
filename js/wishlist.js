// Get wishlist from localStorage
function getWishlist() {
    const wishlist = localStorage.getItem('bookExplorerWishlist');
    return wishlist ? JSON.parse(wishlist) : [];
}

// Save wishlist to localStorage
function saveWishlist(wishlist) {
    localStorage.setItem('bookExplorerWishlist', JSON.stringify(wishlist));
}

// Toggle book in wishlist
function toggleWishlist(bookId) {
    const wishlist = getWishlist();
    const index = wishlist.indexOf(bookId);
    
    if (index === -1) {
        // Add to wishlist
        wishlist.push(bookId);
        showToast('Book added to wishlist!');
    } else {
        // Remove from wishlist
        wishlist.splice(index, 1);
        showToast('Book removed from wishlist');
    }
    
    // Save updated wishlist
    saveWishlist(wishlist);
    
    // Update UI
    const wishlistButtons = document.querySelectorAll(`.wishlist-icon[data-id="${bookId}"], .wishlist-btn[data-id="${bookId}"]`);
    
    wishlistButtons.forEach(button => {
        if (index === -1) {
            // Add to wishlist
            button.classList.add('wishlisted');
            
            // Update SVG fill if it's an icon
            const svg = button.querySelector('svg');
            if (svg) svg.setAttribute('fill', 'red');
            
            // Update button text if it's a button
            if (button.classList.contains('wishlist-btn')) {
                button.textContent = 'Remove from Wishlist';
            }
        } else {
            // Remove from wishlist
            button.classList.remove('wishlisted');
            
            // Update SVG fill if it's an icon
            const svg = button.querySelector('svg');
            if (svg) svg.setAttribute('fill', 'none');
            
            // Update button text if it's a button
            if (button.classList.contains('wishlist-btn')) {
                button.textContent = 'Add to Wishlist';
            }
        }
    });
    
    // If on wishlist page, update the display
    if (window.location.pathname.includes('wishlist.html')) {
        displayWishlistBooks();
    }
}

// Display wishlist books on wishlist page
async function displayWishlistBooks() {
    try {
        const wishlistContainer = document.getElementById('wishlist-books');
        const wishlist = getWishlist();
        
        if (!wishlist.length) {
            wishlistContainer.innerHTML = `
                <div class="empty-wishlist">
                    <h2>Your wishlist is empty</h2>
                    <p>Books you add to your wishlist will appear here</p>
                    <a href="index.html" class="btn">Browse Books</a>
                </div>
            `;
            return;
        }
        
        wishlistContainer.innerHTML = '<div class="loading"></div>';
        
        // Fetch each book in the wishlist
        const bookPromises = wishlist.map(id => fetchBook(id).catch(error => {
            console.error(`Error fetching book with ID ${id}:`, error);
            return null; // Return null for failed requests
        }));
        
        // Wait for all promises to resolve
        const books = await Promise.all(bookPromises);
        
        // Filter out any null results (failed requests)
        const validBooks = books.filter(book => book !== null);
        
        if (!validBooks.length) {
            wishlistContainer.innerHTML = '<div class="error">Failed to load wishlist books</div>';
            return;
        }
        
        let wishlistHTML = '<div class="books-grid">';
        
        validBooks.forEach(book => {
            const coverImage = book.formats['image/jpeg'] || 'assets/default-cover.png';
            const authors = book.authors.map(author => author.name).join(', ');
            const genre = book.subjects.length ? book.subjects[0] : 'Unknown';
            
            wishlistHTML += `
                <div class="book-card" data-id="${book.id}">
                    <div class="book-card-image">
                        <img src="${coverImage}" alt="${book.title}" loading="lazy">
                        <button class="wishlist-icon wishlisted" data-id="${book.id}" onclick="toggleWishlist(${book.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red" stroke="currentColor" stroke-width="2">
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
        
        wishlistHTML += '</div>';
        wishlistContainer.innerHTML = wishlistHTML;
        
        // Add animation classes (bonus feature)
        setTimeout(() => {
            document.querySelectorAll('.book-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('fade-in');
                }, index * 50); // Stagger the animations
            });
        }, 100);
    } catch (error) {
        console.error('Error displaying wishlist books:', error);
        const wishlistContainer = document.getElementById('wishlist-books');
        wishlistContainer.innerHTML = '<div class="error">Failed to load wishlist books</div>';
    }
}

// Show toast notification
function showToast(message) {
    // Check if toast container exists, create it if not
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}