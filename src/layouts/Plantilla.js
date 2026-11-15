import React from 'react';
import { Menu } from '../components/inicio';

export function Plantilla({ children }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f6f8' }}>
      <Menu />
      <div style={{ marginLeft: '180px', padding: '10px' }}>
        {children}
      </div>
    </div>
  );
}
