import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';

function App() {
  return (
    <DataProvider>
      {/* Modern header for branding and polish */}
      <header>
        <div className="header-title">Bitgesell Finance</div>
        <div className="header-sub">Senior Assessment v2</div>
      </header>
      <nav style={{padding: 16, borderBottom: '1px solid #ddd'}}>
        <Link to="/">Items</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail />} />
      </Routes>
    </DataProvider>
  );
}

export default App;