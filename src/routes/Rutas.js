import React from "react";
import { Routes, Route } from "react-router-dom";
import { Catalogo } from "../components/Catalogo";
import { Home } from "../page";
import { Plantilla } from "../layouts";
//import { RegistroForm } from "../components/Formulario/RegistroForm";
export function Rutas() {

  const Layouts=(Layout,Page)=>(
    <Layout>
      <Page/>
    </Layout>
  )
  
  return (
    <Routes>
      <Route path="/" element={Layouts(Plantilla,Home)} />
      <Route path="/catalogo" element={Layouts(Plantilla,Catalogo)} />
    </Routes>
  );
}