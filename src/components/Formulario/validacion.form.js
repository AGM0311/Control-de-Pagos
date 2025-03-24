import * as YUP from 'yup';

export function initialValues() {
  return {
    nombre: "",
    arete: "",
    peso: "",
    edad: "",
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
    peso: YUP.number()
      .required("La edad es requerida")
      .positive("La edad debe ser positiva")
      .integer("La edad debe ser un número entero"), // Validación para números positivos y enteros
    edad: YUP.string().required("El peso es requerido"), // Validación requerida
    imagen: YUP.mixed().required("La imagen es requerida"), // Validación para archivos
  });
}