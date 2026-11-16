import React from "react";
import { Modal, Button } from "react-bootstrap";

// Modal de confirmación propio (reemplaza window.confirm para evitar el bug de
// Electron/Windows que congela el teclado de los inputs tras un diálogo nativo).
export function ConfirmarModal({ mensaje, onResponder }) {
  return (
    <Modal show={Boolean(mensaje)} onHide={() => onResponder(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar</Modal.Title>
      </Modal.Header>
      <Modal.Body>{mensaje}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onResponder(false)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={() => onResponder(true)}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
