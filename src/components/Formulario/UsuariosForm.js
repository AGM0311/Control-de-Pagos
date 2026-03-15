import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table } from "react-bootstrap";
import axios from "axios";
import { BASE_API } from "../../utils/constantes";

export function Informe(){

 const [clientes,setClientes] = useState([]);
 const [alertas,setAlertas] = useState({vencidos:[],porVencer:[]});

 const fetchClientes = async () => {
  const res = await axios.get(`${BASE_API}/clientes`);
  setClientes(res.data);
 };

 const fetchAlertas = async () => {
  const res = await axios.get(`${BASE_API}/alertas`);
  setAlertas(res.data);
 };

 useEffect(()=>{
  fetchClientes();
  fetchAlertas();
 },[]);

 const totalClientes = clientes.length;

 const activos = clientes.filter(c=>c.estado==="activo").length;

 const vencidos = alertas.vencidos.length;

 let ingresosMes = 0;

 clientes.forEach(c=>{
  if(c.pagos){
   c.pagos.forEach(p=>{
    const fecha = new Date(p.fecha);
    const hoy = new Date();

    if(
     fecha.getMonth() === hoy.getMonth() &&
     fecha.getFullYear() === hoy.getFullYear()
    ){
     ingresosMes += p.monto;
    }

   });
  }
 });

 return(

  <div className="p-4">

   <h2 className="mb-4">Informe</h2>

   <Row className="mb-4">

    <Col md={3}>
     <Card bg="primary" text="white">
      <Card.Body>
       <Card.Title>Total Clientes</Card.Title>
       <h3>{totalClientes}</h3>
      </Card.Body>
     </Card>
    </Col>

    <Col md={3}>
     <Card bg="success" text="white">
      <Card.Body>
       <Card.Title>Activos</Card.Title>
       <h3>{activos}</h3>
      </Card.Body>
     </Card>
    </Col>

    <Col md={3}>
     <Card bg="danger" text="white">
      <Card.Body>
       <Card.Title>Vencidos</Card.Title>
       <h3>{vencidos}</h3>
      </Card.Body>
     </Card>
    </Col>

    <Col md={3}>
     <Card bg="warning">
      <Card.Body>
       <Card.Title>Ingresos del mes</Card.Title>
       <h3>${ingresosMes}</h3>
      </Card.Body>
     </Card>
    </Col>

   </Row>

   <Card>

    <Card.Body>

     <Card.Title>Clientes por vencer</Card.Title>

     <Table striped bordered>

      <thead>
       <tr>
        <th>Nombre</th>
        <th>Teléfono</th>
        <th>IP</th>
        <th>Corte</th>
       </tr>
      </thead>

      <tbody>

       {alertas.porVencer.map(c=>(
        <tr key={c.id}>
         <td>{c.nombre}</td>
         <td>{c.telefono}</td>
         <td>{c.ip}</td>
         <td>{c.fechaCorte}</td>
        </tr>
       ))}

      </tbody>

     </Table>

    </Card.Body>

   </Card>

  </div>

 );

}