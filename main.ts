/**
 * SmartTEAM ML — bloques para reaccionar a las clases que detecta el
 * entrenador SmartTEAM ML en el navegador.
 *
 * Protocolo (Web Serial, 115200 baudios, una línea por mensaje):
 *
 *   Modo "a pedido" (recomendado): el micro:bit pregunta con "ML?\n"
 *   (bloque "pedir clase ML") y el navegador responde una sola línea
 *   "ML:<nombre de la clase>\n". Como nunca llega un byte sin pedirlo,
 *   el buffer del micro:bit no se llena aunque el programa se bloquee.
 *
 *   Modo "automático" (programas viejos): el navegador empuja
 *   "ML:<nombre de la clase>\n" al cambiar la clase y cada 500 ms.
 *
 * Cuando no hay detección (nadie frente a la cámara, confianza baja, etc.)
 * el navegador envía la clase especial "none".
 */
//% color="#7C3AED" icon="\uf0e7" block="SmartTEAM ML" weight=90
namespace smartteamML {
    const PREFIJO = "ML:"
    const PEDIDO = "ML?"
    const SIN_DETECCION = "none"
    const TIMEOUT_PEDIDO_MS = 500

    let nombres: string[] = []
    let manejadores: (() => void)[] = []
    let claseActualInterna = ""
    let respuestaPendiente = false
    let iniciado = false

    function limpiar(texto: string): string {
        let inicio = 0
        let fin = texto.length
        while (inicio < fin && texto.charCodeAt(inicio) <= 32) inicio++
        while (fin > inicio && texto.charCodeAt(fin - 1) <= 32) fin--
        return texto.substr(inicio, fin - inicio)
    }

    function iniciar(): void {
        if (iniciado) return
        iniciado = true
        serial.redirectToUSB()
        serial.setBaudRate(BaudRate.BaudRate115200)
        serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            const linea = limpiar(serial.readUntil(serial.delimiters(Delimiters.NewLine)))
            if (linea.indexOf(PREFIJO) != 0) return
            const clase = limpiar(linea.substr(PREFIJO.length))
            if (clase.length == 0) return
            respuestaPendiente = false
            if (clase == claseActualInterna) return
            claseActualInterna = clase
            for (let i = 0; i < nombres.length; i++) {
                if (nombres[i] == clase) manejadores[i]()
            }
        })
    }

    /**
     * Pide la clase actual al entrenador y espera la respuesta.
     * Devuelve la última clase conocida si no llega respuesta a tiempo
     * (entrenador desconectado o ventana cerrada).
     * Usalo dentro de "por siempre": el ritmo lo marca tu programa y el
     * buffer del micro:bit nunca se llena.
     */
    //% blockId=smartteam_ml_pedir_clase
    //% block="pedir clase ML"
    //% weight=95
    export function pedirClaseML(): string {
        iniciar()
        respuestaPendiente = true
        serial.writeString(PEDIDO + "\n")
        let esperado = 0
        while (respuestaPendiente && esperado < TIMEOUT_PEDIDO_MS) {
            basic.pause(10)
            esperado += 10
        }
        return claseActualInterna
    }

    /**
     * Ejecuta el código cuando el entrenador detecta la clase indicada.
     * @param nombre el nombre de la clase, igual que en el entrenador
     */
    //% blockId=smartteam_ml_al_detectar
    //% block="al detectar clase ML %nombre"
    //% nombre.defl="clase 1"
    //% weight=100
    export function alDetectarClase(nombre: string, manejador: () => void): void {
        iniciar()
        nombres.push(limpiar(nombre))
        manejadores.push(manejador)
    }

    /**
     * Ejecuta el código cuando el entrenador deja de detectar (clase "none").
     */
    //% blockId=smartteam_ml_sin_deteccion
    //% block="cuando no se detecta ninguna clase ML"
    //% weight=90
    export function cuandoNoHayDeteccion(manejador: () => void): void {
        alDetectarClase(SIN_DETECCION, manejador)
    }

    /**
     * La última clase detectada por el entrenador ("none" si no hay detección).
     */
    //% blockId=smartteam_ml_clase_actual
    //% block="clase ML actual"
    //% weight=80
    export function claseActual(): string {
        iniciar()
        return claseActualInterna
    }

    /**
     * Verdadero si la clase detectada en este momento es la indicada.
     * @param nombre el nombre de la clase, igual que en el entrenador
     */
    //% blockId=smartteam_ml_clase_es
    //% block="clase ML es %nombre"
    //% nombre.defl="clase 1"
    //% weight=70
    export function claseEs(nombre: string): boolean {
        iniciar()
        return claseActualInterna == limpiar(nombre)
    }
}
