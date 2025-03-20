import React from 'react'
import{Tabs, Tab,Row,Col} from "react-bootstrap";
import{Tarjeta} from "../Tarjeta/Tarjeta";
import {Datos} from '../../../utils/bd';
import "./Catalogo.scss";

export function Catalogo() {
    console.log(Datos);
const fondo={
    tema:{
        backgroundColor:' rgb(212, 224, 237)',
        color:"white",
        fontSize:'20px'
    }
}

  return (
    <div className='container' style={fondo.tema}>
    <Tabs
    
    defaultActiveKey="profile"
    id="uncontrolled-tab-example"
    className="mb-3"
  >
    <Tab eventKey="home" title="Catalogo">
    <Row xs={1} sm={2} md={3} lg={4}> 
      {Datos.map((Catalogo,index)=>(
        <Col>
        <Tarjeta key={index} catalogo={Catalogo} />
        </Col>
      ))}
      </Row>
    </Tab>
  </Tabs>
  </div>
  )
}
