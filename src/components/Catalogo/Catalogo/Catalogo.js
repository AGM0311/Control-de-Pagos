import React from 'react';
import { RegistroForm } from '../../Formulario/RegistroForm';

export function Catalogo() {
    
    const fondo = {
        tema: {
            backgroundColor: 'rgb(140, 140, 142)',
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
