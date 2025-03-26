import React from "react";
import { Routes, Route } from "react-router-dom";
import { Catalogo } from "../components/Catalogo";
import { Home } from "../page";
import { Plantilla } from "../layouts";
import { Gestion } from "../components/Gestion/Gestion";
import { Usuarios } from "../components/Usuarios";
import { Informe } from "../components/Informe";
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
      <Route path="/usuarios" element={Layouts(Plantilla,Usuarios)} />
      <Route path="/gestion" element={Layouts(Plantilla,Gestion)} />
      <Route path="/informe" element={Layouts(Plantilla,Informe)} />
    </Routes>
  );
}