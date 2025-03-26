import React from 'react';
import { Menu } from '../components/inicio';

export function Plantilla({ children }) {
  return (
    <div style={{ backgroundColor: '#d0d0d0', minHeight: '100vh' }}>
      {/* Menú lateral */}
      <div className='header'>
        <Menu />
      </div>

      {/* Contenido principal con margen izquierdo */}
      <div className='body' style={{ marginLeft: '200px', padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}