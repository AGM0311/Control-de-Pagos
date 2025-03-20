import * as YUP from 'yup';

export function initialValues() {
  return {
    nombre: "",
    arete: "",
    cantidad: "",
    peso: "",
    imagen: null, // Cambiado a `null` para manejar archivos
  };
}

export function validationSchema() {
  return YUP.object({
    nombre: YUP.string().required("El nombre del animal es requerido"), // Validación requerida
    arete: YUP.number()
      .required("El número de arete es requerido")
      .positive("El número de arete debe ser positivo")
      .integer("El número de arete debe ser un entero"), // Validación para números positivos y enteros
    cantidad: YUP.number()
      .required("La cantidad es requerida")
      .positive("La cantidad debe ser positiva")
      .integer("La cantidad debe ser un número entero"), // Validación para números positivos y enteros
    peso: YUP.string().required("El peso es requerido"), // Validación requerida
    imagen: YUP.mixed().required("La imagen es requerida"), // Validación para archivos
  });
}