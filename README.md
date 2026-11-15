# Control de Pagos · Servicios Ely

Sistema de control de pagos para una empresa de internet por fibra óptica.
Permite registrar clientes, registrar y consultar pagos, detectar clientes
vencidos o próximos a vencer, ver un panel con ingresos del mes e importar
clientes desde Word o Excel.

## Stack

- **Frontend:** React (Create React App) + React Bootstrap + Recharts.
- **Backend:** Node.js + Express. Guarda los datos en archivos JSON locales
  (`data/clientes.json` y `data/alertas.json`). No requiere base de datos ni
  conexión a internet.
- **Escritorio:** Electron + electron-builder + electron-updater (auto-actualización
  vía GitHub Releases).

## Requisitos

- Node.js 18 o superior.
- npm (viene con Node.js).

## Cómo ejecutar

Desde la carpeta del proyecto:

```bash
npm install        # solo la primera vez
npm run server     # terminal 1: backend en http://localhost:3001
npm start          # terminal 2: frontend en http://localhost:3000
```

O abre la aplicación con un solo comando:

- **Windows:** doble clic en `start.bat`.
- **macOS/Linux:** `./start.command` (la primera vez ejecuta `chmod +x start.command`).

Abre tu navegador en <http://localhost:3000>.

## Funcionalidades

- **Inicio / Panel:** total de clientes, activos, vencidos e ingresos del mes,
  gráfica de estado y tabla con búsqueda por nombre, IP o teléfono.
- **Clientes:** alta, edición y baja. Cada cliente tiene nombre, teléfono, IP,
  plan, precio mensual y día de corte (1–28).
- **Pagos:** registrar un pago (fecha, monto y método) y consultar/eliminar
  pagos de un cliente.
- **Cobros:** clientes **vencidos** y los que vencen en los próximos 7 días,
  con alertas por cliente.
- **Historial:** historial de pagos por cliente con total acumulado.
- **Importar:** carga masiva desde `.docx` o `.xlsx` (columnas IP y Nombre),
  evitando duplicados por IP.
- **Descargar / Restaurar respaldo:** guarda una copia de todos los clientes en
  un `.json` (para pasarla a otra PC o como respaldo de seguridad) y recupérala
  en otra computadora sin borrar los existentes.

### Regla de facturación

Cada cliente paga mensualmente y tiene un día de corte. Se considera **al día**
si registró un pago en el periodo de facturación vigente. Si su día de corte ya
pasó y no hay pago, aparece como **vencido** con los días de atraso. Toda esta
lógica vive en [`src/utils/facturacion.js`](src/utils/facturacion.js) para no
duplicarla entre pantallas.

## Estructura

```text
Control-de-Pagos/
├── server.js                 Backend Express (JSON local)
├── package.json
├── start.bat / start.command Lanzadores
├── .env.example              Plantilla de variables de entorno
├── data/                     Datos en tiempo de ejecución (no se suben)
├── uploads/                  Archivos temporales de importación (no se suben)
├── public/                   HTML y estáticos
└── src/
    ├── api/api.js            Instancia única de axios (URL configurable)
    ├── utils/
    │   ├── constantes.js     Rutas de la API y constantes
    │   └── facturacion.js    Lógica de vencimientos e ingresos
    ├── components/           Pantallas (clientes, pagos, cobros, historial)
    ├── page/Home/Home.js     Panel principal
    ├── layouts/              Plantilla con menú lateral
    └── routes/Rutas.js       Rutas de React Router
```

## Configuración

Copia `.env.example` a `.env` si quieres cambiar el puerto del backend o el
origen de CORS. La URL del backend en el frontend se configura con la variable
`REACT_APP_API_URL` (por defecto `http://localhost:3001`).

> ⚠️ Nunca subas el archivo `.env` a un repositorio. Ya está en `.gitignore`.

## Plan: aplicación de escritorio con auto-actualización

El proyecto ya está preparado para empaquetarse como aplicación de escritorio
para Windows. La arquitectura lo permite sin rehacer nada:

- El backend es un proceso Node/Express que se ejecuta **dentro** de la propia
  app de escritorio (Electron lo arranca con `startServer()`).
- En producción, el backend **sirve el frontend compilado** (`build/`) en
  `http://localhost:3001`, por lo que frontend y backend comparten origen y no
  hay problemas de CORS.
- Los datos (`data/`) y los archivos subidos (`uploads/`) se guardan en la
  carpeta de datos del usuario (`app.getPath("userData")`), no dentro del
  ejecutable (que es de solo lectura).

### Generar el instalador de Windows

El instalador se compila **automáticamente con GitHub Actions** cada vez que se
sube un tag de versión (`v*`), así que no hace falta compilar a mano. Si aun así
quieres hacerlo en una PC con Windows:

```bash
npm install
npm run dist:win
```

Esto compila el frontend y genera un instalador `.exe` (NSIS) en la carpeta
`release/`. El instalador crea un acceso directo en el escritorio y permite
elegir la carpeta de instalación.

### Auto-actualización

La app usa `electron-updater` para actualizarse sola desde **GitHub Releases**.
Para publicar una nueva versión:

1. Sube el número de versión en `package.json` (ej. `0.4.0`).
2. Crea un tag y súbelo (GitHub Actions compila y publica el instalador solo):

   ```bash
   git tag v0.4.0
   git push origin v0.4.0
   ```

3. La próxima vez que un usuario abra la app, detectará la nueva versión,
   descargará el instalador y se actualizará sola.

> El repositorio de publicación está configurado como `AGM0311/Control-de-Pagos`.
> Si prefieres usar un repositorio aparte de releases (como `farmacia-pos-releases`),
> cambia `owner` y `repo` en la sección `build.publish` de `package.json`.

### Hoja de ruta

- Migrar el almacenamiento JSON a **SQLite** cuando crezca el volumen de clientes
  y pagos (más robusto y rápido).
- Añadir respaldo/exportación de datos.
- Firmar el ejecutable con un certificado para evitar avisos de Windows SmartScreen.

## Licencia

Proyecto privado.
