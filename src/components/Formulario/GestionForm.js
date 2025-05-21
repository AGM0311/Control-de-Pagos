import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import './gestion.css';
import { MdHealthAndSafety } from "react-icons/md";
import { FaCow } from "react-icons/fa6";
import { BiGitBranch } from "react-icons/bi";
import { LuShovel } from "react-icons/lu";

export function GestionForm() {
  return (
    <div className="p-4">
      <Row>
        <Col md={6}>
          <StyledButton icon={<MdHealthAndSafety size={30}/>} text="Salud" />
        </Col>
        <Col md={6}>
          <StyledButton icon={<FaCow size={30}/>}text="Alimentación" />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <StyledButton icon={<BiGitBranch size={30}/>} text="Reproducción" />
        </Col>
        <Col md={6}>
          <StyledButton icon={< LuShovel size={30}/>} text="Manejo" />
        </Col>
      </Row>
    </div>
  );
}

function StyledButton({ icon,text }) {
  return (
    <Button
      variant="primary"
      size="lg"
      className="custom-button w-100 mb-2"
    >
    {icon && <span className="me-2">{icon}</span>}
      {text}
    </Button>
  );
}
