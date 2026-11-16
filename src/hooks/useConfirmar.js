import { useCallback, useRef, useState } from "react";

// Reemplaza window.confirm() por un modal propio de React.
//
// Motivo: en Electron sobre Windows, mostrar un cuadro nativo (alert/confirm)
// deja los campos de texto sin responder al teclado hasta que se cambia de
// ventana y se vuelve. Con un modal propio no ocurre.
//
// Uso:
//   const { confirmar, mensaje, responder } = useConfirmar();
//   if (!(await confirmar("¿Seguro?"))) return;
//   ... y en el JSX: <ConfirmarModal mensaje={mensaje} onResponder={responder} />
export function useConfirmar() {
  const [mensaje, setMensaje] = useState(null);
  const resolverRef = useRef(null);

  const confirmar = useCallback((texto) => {
    setMensaje(texto);
    return new Promise((resolver) => {
      resolverRef.current = resolver;
    });
  }, []);

  const responder = useCallback((valor) => {
    setMensaje(null);
    if (resolverRef.current) {
      const resolver = resolverRef.current;
      resolverRef.current = null;
      resolver(valor);
    }
  }, []);

  return { confirmar, mensaje, responder };
}
