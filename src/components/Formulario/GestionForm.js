import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';
export function GestionForm() {
  return (
    <div>
      <Row>
        <Col md={6}>
          <Button
            variant="outline-primary"
            size="lg"
            className="w-100 mb-2"
            style={{ height: '120px' }}
          >
            Salud
          </Button>
        </Col>
        <Col md={6}>
          <Button
            variant="outline-primary"
            size="lg"
            className="w-100 mb-2"
            style={{ height: '120px' }} 
          >
            Alimentacion
          </Button>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Button
          
            variant="outline-primary"
            size="lg"
            className="w-100 mb-2"
            style={{ height: '120px' }} 
          >
            Reproduccion
          </Button>
        </Col>
        <Col md={6}>
          <Button
            variant="outline-primary"
            size="lg"
            className="w-100 mb-2"
            style={{ height: '120px' }} 
          
          >
            Manejo
          </Button>
        </Col>
      </Row>
    </div>
  );
}
