import React, { useState } from 'react';
import { Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { useFormik } from 'formik';
import { RegistroList } from '../Registro.list';
import { initialValues, validationSchema } from './validacion.form'; // Asegúrate de que este archivo esté actualizado

export function RegistroForm() {
  const [informacion, setInformacion] = useState([]);

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    onSubmit: (formValue) => {
      setInformacion([...informacion, formValue]);
      formik.resetForm();
    },
  });

  return (
    <div className="p-4">
      <Form onSubmit={formik.handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="3">
            <Form.Label>Nombre del Animal</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre"
              name="nombre"
              onChange={formik.handleChange}
              value={formik.values.nombre}
            />
          </Form.Group>

          <Form.Group as={Col} md="3">
            <Form.Label>Número de Arete</Form.Label>
            <Form.Control
              type="number"
              placeholder="Arete"
              name="arete"
              onChange={(e) => formik.setFieldValue("arete", Number(e.target.value))}
              value={formik.values.arete}
            />
          </Form.Group>

          <Form.Group as={Col} md="3">
            <Form.Label>Peso</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                placeholder="Peso"
                name="peso"
                onChange={(e) => formik.setFieldValue("peso", Number(e.target.value))}
                value={formik.values.peso}
              />
            </InputGroup>
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} md="3">
            <Form.Label>Edad</Form.Label>
            <Form.Control
              type="number"
              placeholder="Edad"
              name="edad"
              onChange={(e) => formik.setFieldValue("edad", Number(e.target.value))}
              value={formik.values.edad}
            />
          </Form.Group>

          <Form.Group as={Col} md="5">
            <Form.Label>Imagen</Form.Label>
            <Form.Control
              type="file"
              name="imagen"
              onChange={(e) => formik.setFieldValue("imagen", e.target.files[0])}
            />
          </Form.Group>
        </Row>

        <Button type="submit">Agregar Animal</Button>
      </Form>

      <Row className="mt-4">
        <RegistroList datos={informacion} />
      </Row>
    </div>
  );
}
