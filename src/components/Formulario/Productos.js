import React, { useState } from 'react';
import { Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { useFormik } from 'formik';
import { initialValues, validationSchema } from './Productos.form'; // Asegúrate de actualizar este archivo
import { ListProductos } from '../ListProductos'; // Asegúrate de que este componente esté adaptado

export function Productos() {
  const [informacion, setInformacion] = useState([]);

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    onSubmit: (formValue) => {
      // Agregar el nuevo registro de ganado al estado
      setInformacion([...informacion, formValue]);
      console.log(formValue); // Para depuración
      formik.resetForm(); // Limpiar el formulario después de enviar
    },
  });

  return (
    <div className="p-4">
      <Form onSubmit={formik.handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="3" controlId="validationCustom01">
            <Form.Label>Nombre del Animal</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre"
              name="nombre"
              onChange={formik.handleChange}
              value={formik.values.nombre}
            />
          </Form.Group>

          <Form.Group as={Col} md="3" controlId="validationCustom02">
            <Form.Label>Número de Arete</Form.Label>
            <Form.Control
              type="number"
              placeholder="Arete"
              name="arete"
              onChange={formik.handleChange}
              value={formik.values.arete}
            />
          </Form.Group>

          <Form.Group as={Col} md="3" controlId="validationCustomUsername">
            <Form.Label>Cantidad</Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="number"
                placeholder="Cantidad"
                name="cantidad"
                onChange={formik.handleChange}
                value={formik.values.cantidad}
              />
            </InputGroup>
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} md="3" controlId="validationCustom03">
            <Form.Label>Peso</Form.Label>
            <Form.Control
              type="text"
              placeholder="Peso"
              name="peso"
              onChange={formik.handleChange}
              value={formik.values.peso}
            />
          </Form.Group>
          <Form.Group as={Col} md="5">
            <Form.Label>Imagen</Form.Label>
            <Form.Control
              type="file"
              name="imagen"
              onChange={(e) => {
                formik.setFieldValue('imagen', e.target.files[0]);
              }}
            />
          </Form.Group>
        </Row>
        <Button type="submit">Enviar</Button>
      </Form>

      <Row>
        {/* Pasa los datos de ganado al componente ListProductos */}
        <ListProductos datos={informacion} />
      </Row>
    </div>
  );
}