import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';

// Utility to generate a color from a string
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 60%)`;
  return color;
}

// VirtualizedItems renders a large list efficiently using react-window
const VirtualizedItems = ({ items, height = 600, itemHeight = 120 }) => {
  // Renders a single item in the virtualized list
  const ItemRenderer = ({ index, style }) => {
    const item = items[index];
    const avatarColor = stringToColor(item.name);
    const avatarLetter = item.name.charAt(0).toUpperCase();
    
    return (
      <div style={style}>
        <div className="item-card">
          <div className="item-avatar" style={{ background: avatarColor }}>
            {avatarLetter}
          </div>
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