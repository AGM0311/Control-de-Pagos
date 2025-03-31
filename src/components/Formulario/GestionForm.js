import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import './gestion.css';

export function GestionForm() {
  return (
    <div className="p-4">
      <Row>
        <Col md={6}>
          <StyledButton text="Salud" />
        </Col>
        <Col md={6}>
          <StyledButton text="Alimentación" />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <StyledButton text="Reproducción" />
        </Col>
        <Col md={6}>
          <StyledButton text="Manejo" />
        </Col>
      </Row>
    </div>
  );
}

function StyledButton({ text }) {
  return (
    <Button
      variant="outline-primary"
      size="lg"
      className="custom-button w-100 mb-2"
    >
      {text}
    </Button>
  );
}
