import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';

// VirtualizedItems renders a large list efficiently using react-window
const VirtualizedItems = ({ items, height = 600, itemHeight = 120 }) => {
  // Renders a single item in the virtualized list
  const ItemRenderer = ({ index, style }) => {
    const item = items[index];
    
    return (
      <div style={style}>
        <div className="item-card">
          <Link to={'/items/' + item.id} className="item-link">
            <h3>{item.name}</h3>
            <p className="item-category">{item.category}</p>
            <p className="item-price">${item.price}</p>
          </Link>
        </div>
      </div>
    );
  };

  // Render the virtualized list
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
      className="virtualized-list"
    >
      {ItemRenderer}
    </List>
  );
};

export default VirtualizedItems; 