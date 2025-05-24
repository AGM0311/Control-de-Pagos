import React from 'react';
import { Registro } from '../../Formulario/RegistroForm';


export function Catalogo() {
    
    const fondo = {
        tema: {
        
            color: "white",
            fontSize: '20px'
        }
    };
    return (
        <div className='container' style={fondo.tema}>
            <Registro />
            
        </div>
    );
}
