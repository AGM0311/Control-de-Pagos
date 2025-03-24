import React from 'react';
import { Row, Col } from "react-bootstrap";
import { Tarjeta } from "../Tarjeta/Tarjeta";
import { Datos } from '../../../utils/bd';
import { RegistroForm } from '../../Formulario/RegistroForm';
import "./Catalogo.scss";

export function Catalogo() {
    console.log(Datos);
    
    const fondo = {
        tema: {
            backgroundColor: 'rgb(63, 65, 67)',
            color: "white",
            fontSize: '20px'
        }
    };

    return (
        <div className='container' style={fondo.tema}>
            <RegistroForm />
            <Row xs={1} sm={2} md={3} lg={4}> 
                {Datos.map((Catalogo, index) => (
                    <Col key={index}>
                        <Tarjeta catalogo={Catalogo} />
                    </Col>
                ))}
            </Row>
            
        </div>
    );
}
