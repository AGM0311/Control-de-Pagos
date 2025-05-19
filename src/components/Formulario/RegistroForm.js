import React, { useState } from 'react';
import { Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { useFormik } from 'formik';
import { RegistroList } from '../Registro.list';
import { validationSchema } from './validacion.form'; // Asegúrate de que este archivo esté actualizado

export function RegistroForm() {
  const [informacion, setInformacion] = useState([]);

  const formik = useFormik({
    initialValues: {
      nombre: '',
      arete: '',
      edad: '',
      peso: '',
      raza: '',
      color: '',
      sexo: '',
      fechaNacimiento: '',
      propietario: '',
      ubicacion: '',
      imagen: null,
      vacunado: false,
    },
    validationSchema: validationSchema(),
    onSubmit: (formValue) => {
      const newAnimal = {
        ...formValue,
        peso: `${formValue.peso}Kg`, // Aseguramos el formato "Kg"
      };
      setInformacion([...informacion, newAnimal]);
      formik.resetForm();
    },
  });

  return (
    <div className="p-4">
      <Form onSubmit={formik.handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nombre"
              name="nombre"
              onChange={formik.handleChange}
              value={formik.values.nombre}
            />
          </Form.Group>

          <Form.Group as={Col} md="3">
            <Form.Label>Arete</Form.Label>
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
                onChange={(e) => formik.setFieldValue("peso", e.target.value)}
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

          <Form.Group as={Col} md="3">
            <Form.Label>Raza</Form.Label>
            <Form.Control
              type="text"
              placeholder="Raza"
              name="raza"
              onChange={formik.handleChange}
              value={formik.values.raza}
            />
          </Form.Group>

          <Form.Group as={Col} md="3">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="text"
              placeholder="Color"
              name="color"
              onChange={formik.handleChange}
              value={formik.values.color}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} md="3">
            <Form.Label>Sexo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Sexo"
              name="sexo"
              onChange={formik.handleChange}
              value={formik.values.sexo}
            />
          </Form.Group>

          <Form.Group as={Col} md="3">
            <Form.Label>Fecha de Nacimiento</Form.Label>
            <Form.Control
              type="date"
              name="fechaNacimiento"
              onChange={formik.handleChange}
              value={formik.values.fechaNacimiento}
            />
          </Form.Group>

          <Form.Group as={Col} md="3">
            <Form.Label>Propietario</Form.Label>
            <Form.Control
              type="text"
              placeholder="Propietario"
              name="propietario"
              onChange={formik.handleChange}
              value={formik.values.propietario}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} md="3">
            <Form.Label>Ubicacion</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ubicacion"
              name="ubicacion"
              onChange={formik.handleChange}
              value={formik.values.ubicacion}
            />
          </Form.Group>

          <Form.Group as={Col} md="3">
            <Form.Label>Imagen</Form.Label>
            <Form.Control
              type="file"
              name="imagen"
              onChange={(e) => formik.setFieldValue("imagen", e.target.files[0])}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} md="3">
            <Form.Check
              type="checkbox"
              label="Vacunado"
              name="vacunado"
              onChange={formik.handleChange}
              checked={formik.values.vacunado}
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
