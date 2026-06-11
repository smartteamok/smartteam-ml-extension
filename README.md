# SmartTEAM ML — extensión para micro:bit (MakeCode)

Bloques en español para que el micro:bit reaccione a las clases que detecta el
**entrenador SmartTEAM ML** en el navegador.

> El micro:bit le **pide** la clase al entrenador (nunca recibe un byte que
> no haya pedido, así su buffer no se llena). La extensión pregunta sola en
> segundo plano: los bloques de evento y los reporters se actualizan solos.

## Bloques

| Bloque | Tipo | Qué hace |
|---|---|---|
| `al detectar clase ML [nombre]` | evento | Se ejecuta cuando el entrenador detecta esa clase |
| `cuando no se detecta ninguna clase ML` | evento | Se ejecuta cuando se pierde la detección |
| `clase ML actual` | reporter (texto) | La última clase detectada (`none` si no hay). Se actualiza sola |
| `clase ML es [nombre]` | reporter (booleano) | Verdadero si la clase actual es esa. Se actualiza sola |
| `pedir clase ML` | acción | Fuerza un pedido inmediato y espera la respuesta (máx. 500 ms). Opcional: útil justo antes de decidir |

El nombre de la clase debe escribirse **igual** que en el entrenador
(mayúsculas/minúsculas y espacios incluidos).

### Cómo funciona por dentro

La extensión envía `ML?` al entrenador cada ~200 ms (en segundo plano) y el
entrenador responde una sola línea con la clase actual. Como el ritmo lo
marca el micro:bit, el buffer serial nunca se llena aunque tu programa esté
ocupado con pausas o animaciones. Programa típico, solo con eventos:

```blocks
smartteamML.alDetectarClase("pulgar arriba", function () {
    basic.showIcon(IconNames.Happy)
})
smartteamML.alDetectarClase("pulgar abajo", function () {
    basic.showIcon(IconNames.Sad)
})
smartteamML.cuandoNoHayDeteccion(function () {
    basic.clearScreen()
})
```

O en estilo encuesta, con el pedido explícito:

```blocks
basic.forever(function () {
    smartteamML.pedirClaseML()
    if (smartteamML.claseEs("pulgar arriba")) {
        basic.showIcon(IconNames.Happy)
    } else {
        basic.clearScreen()
    }
})
```

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
- **La clase no cambia nunca** → el entrenador no está conectado (los
  bloques conservan la última clase conocida). Conectá el micro:bit desde el
  panel del entrenador y verificá que el contador de "pedidos respondidos"
  crece.
- **Programa grabado con la extensión v0.2 o anterior** → actualizá la
  extensión en MakeCode (Extensiones → ya instalada → actualizar) y volvé a
  grabar el `.hex`: el entrenador ahora solo responde a pedidos.
- **No aparece el botón de conectar** → estás en Safari o Firefox; usá Chrome
  o Edge.

## Detalles técnicos

- Velocidad: **115200 baudios**, una línea de texto por mensaje.
- micro:bit → navegador: `ML?\n` (sondeo en segundo plano cada ~200 ms, o
  inmediato con el bloque `pedir clase ML`).
- navegador → micro:bit: una única línea `ML:<clase>\n` por pedido. Timeout
  de espera: 500 ms.
- `none` es la clase reservada para "sin detección" (el navegador la envía
  cuando no hay sujeto o la confianza está por debajo del umbral).

## Licencia

MIT

#### Metadatos (usados para búsqueda, renderizado)

* for PXT/microbit
