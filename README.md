# SmartTEAM ML — extensión para micro:bit (MakeCode)

Bloques en español para que el micro:bit reaccione a las clases que detecta el
**entrenador SmartTEAM ML** en el navegador.

> El entrenador envía por USB una línea `ML:<clase>` cada vez que cambia la
> detección. Esta extensión las recibe y dispara tus bloques.

## Bloques

| Bloque | Tipo | Qué hace |
|---|---|---|
| `al detectar clase ML [nombre]` | evento | Se ejecuta cuando el entrenador detecta esa clase |
| `cuando no se detecta ninguna clase ML` | evento | Se ejecuta cuando se pierde la detección |
| `clase ML actual` | reporter (texto) | La última clase detectada (`none` si no hay) |
| `clase ML es [nombre]` | reporter (booleano) | Verdadero si la clase actual es esa |

El nombre de la clase debe escribirse **igual** que en el entrenador
(mayúsculas/minúsculas y espacios incluidos).

## Paso a paso para docentes

### 1. Programar el micro:bit (una sola vez por programa)

1. Abrí [makecode.microbit.org](https://makecode.microbit.org) y creá un proyecto nuevo.
2. Tocá el engranaje ⚙️ → **Extensiones** (o el botón "Extensiones" en la caja de bloques).
3. Pegá la URL de este repositorio y tocá Enter. Aparece la categoría **SmartTEAM ML** (violeta).
4. Armá tu programa. Ejemplo:
   - `al detectar clase ML "pulgar arriba"` → `mostrar ícono` 😊
   - `al detectar clase ML "pulgar abajo"` → `mostrar ícono` 😢
   - `cuando no se detecta ninguna clase ML` → `borrar pantalla`
5. Conectá el micro:bit por USB y tocá **Descargar** para grabar el programa.

### 2. Conectar el entrenador

1. **Importante:** si MakeCode quedó conectado al micro:bit (consola serial o
   descarga directa), desconectalo o cerrá esa pestaña. El puerto USB solo
   admite una conexión a la vez.
2. Abrí el entrenador SmartTEAM ML en **Chrome o Edge** (Web Serial no existe
   en Safari/Firefox) y entrená tus clases.
3. En el panel **micro:bit (Web Serial)** tocá **Conectar micro:bit** y elegí
   el puerto "BBC micro:bit" en el diálogo del navegador.

### 3. Jugar

Hacé el gesto (o el sonido, o mostrá la imagen): el micro:bit reacciona al
instante. El panel del entrenador muestra cada mensaje enviado y permite
ajustar el umbral de confianza.

## Problemas frecuentes

- **"No se pudo abrir el puerto"** → MakeCode (u otra pestaña) tiene tomado el
  puerto. Desconectalo ahí y reintentá.
- **El micro:bit no reacciona** → verificá que el nombre de la clase en el
  bloque sea idéntico al del entrenador, y que el programa con la extensión
  esté grabado en el micro:bit.
- **No aparece el botón de conectar** → estás en Safari o Firefox; usá Chrome
  o Edge.

## Detalles técnicos

- Velocidad: **115200 baudios**.
- Protocolo: una línea de texto por mensaje, `ML:<clase>\n`. Se envía al
  cambiar la clase ganadora y como latido cada 500 ms.
- `none` es la clase reservada para "sin detección" (el navegador la envía
  cuando no hay sujeto o la confianza está por debajo del umbral).

## Licencia

MIT

#### Metadatos (usados para búsqueda, renderizado)

* for PXT/microbit
