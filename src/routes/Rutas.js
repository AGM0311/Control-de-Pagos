import React from "react";
import { Routes, Route } from "react-router-dom";
import { Catalogo } from "../components/Catalogo";
import { Home } from "../page";
import { Plantilla } from "../layouts";
import { Gestion } from "../components/Gestion/Gestion";
import { Clientes } from "../components/Usuarios";
import { Informe } from "../components/Informe";
import { ImportarClientes } from "../components/ImportarClientes";
import { Reportes } from "../components/Reportes";

export function Rutas() {
  const Layouts = (Layout, Page) => (
    <Layout>
      <Page />
    </Layout>
  );

  return (
    <Routes>
      <Route path="/" element={Layouts(Plantilla, Home)} />
      <Route path="/catalogo" element={Layouts(Plantilla, Catalogo)} />
      <Route path="/informe" element={Layouts(Plantilla, Informe)} />
      <Route path="/gestion" element={Layouts(Plantilla, Gestion)} />
      <Route path="/usuarios" element={Layouts(Plantilla, Clientes)} />
      <Route path="/importar" element={Layouts(Plantilla, ImportarClientes)} />
      <Route path="/reportes" element={Layouts(Plantilla, Reportes)} />
    </Routes>
  );
}
