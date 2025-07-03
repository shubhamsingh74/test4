import React, { createContext, useCallback, useContext, useState } from 'react';

// Create a context for sharing data across components
const DataContext = createContext();

export function DataProvider({ children }) {
  // State for items, loading, error, and pagination
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Fetch items from the backend API with optional search and pagination
  const fetchItems = useCallback(async (params = {}) => {
    const controller = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      // Build query string from params
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.append('q', params.q);
      if (params.page) searchParams.append('page', params.page);
      if (params.limit) searchParams.append('limit', params.limit);
      
      const url = `http://localhost:3001/api/items?${searchParams.toString()}`;
      
      // Fetch data with abort support
      const res = await fetch(url, { signal: controller.signal });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Only update state if not aborted
      if (!controller.signal.aborted) {
        setItems(data.items || data); // Support both paginated and non-paginated responses
        setPagination(data.pagination || null);
      }
    } catch (err) {
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
        setError(err.message);
        console.error('Error fetching items:', err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
    
    return controller;
  }, []);

  // Provide state and fetch function to children
  return (
    <DataContext.Provider value={{ 
      items, 
      fetchItems, 
      loading, 
      error, 
      pagination 
    }}>
      {children}
    </DataContext.Provider>
  );
}

// Custom hook to use the data context
export const useData = () => useContext(DataContext);