import React, { useEffect, useState, useRef } from 'react';
import { useData } from '../state/DataContext';
import VirtualizedItems from '../components/VirtualizedItems';

function Items() {
  // Get items, fetchItems, loading, error, and pagination from context
  const { items, fetchItems, loading, error, pagination } = useData();
  // Local state for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  // Ref to hold the current AbortController for fetch cancellation
  const abortControllerRef = useRef(null);

  // Fetch items when search term or page changes
  useEffect(() => {
    // Abort any existing request before starting a new one
    if (
      abortControllerRef.current &&
      typeof abortControllerRef.current.abort === 'function'
    ) {
      abortControllerRef.current.abort();
    }

    // Start new fetch request
    const controller = fetchItems({ 
      q: searchTerm, 
      page: currentPage, 
      limit: 50 // Increased limit for better virtualization demo
    });
    abortControllerRef.current = controller;

    // Cleanup: abort fetch if component unmounts or dependencies change
    return () => {
      if (
        abortControllerRef.current &&
        typeof abortControllerRef.current.abort === 'function'
      ) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchItems, searchTerm, currentPage]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle pagination button click
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Render error state
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  // Main render
  return (
    <div className="items-container">
      {/* Search bar */}
      <div className="search-section">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading items...</p>
        </div>
      ) : (
        <>
          {/* No items found */}
          {items.length === 0 ? (
            <p className="no-items">No items found.</p>
          ) : (
            <>
              {/* Virtualized list for performance */}
              <VirtualizedItems 
                items={items} 
                height={600} 
                itemHeight={120}
              />

              {/* Pagination controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  
                  <span className="pagination-info">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Items;