import React, { useState } from 'react';
import './ContextMenu.css';

const ContextMenu = ({ x, y, onRemove, onStatusUpdate }) => {
  const [showStatuses, setShowStatuses] = useState(false);
  const statuses = ['No Cursado', 'Cursando', 'Aprobado', 'Reprobado'];

  const handleStatusClick = (e) => {
    e.stopPropagation();
    setShowStatuses(true);
  };

  return (
    <div className="context-menu" style={{ top: y, left: x }} onClick={(e) => e.stopPropagation()}>
      {!showStatuses ? (
        <>
          <button onClick={onRemove}>Remove</button>
          <button onClick={handleStatusClick}>Change Status</button>
        </>
      ) : (
        statuses.map(status => (
          <button key={status} onClick={() => onStatusUpdate(status)}>{status}</button>
        ))
      )}
    </div>
  );
};

export default ContextMenu;