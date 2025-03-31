import React from 'react';
import { RegistroForm } from '../../Formulario/RegistroForm';

export function Catalogo() {
    
    const fondo = {
        tema: {
        
            color: "white",
            fontSize: '20px'
        }
    };
    return (
        <div className='container' style={fondo.tema}>
            <RegistroForm />
            
        </div>
    );
}
