/**
 * SmartTEAM ML — bloques para reaccionar a las clases que detecta el
 * entrenador SmartTEAM ML en el navegador.
 *
 * Protocolo: el navegador (Web Serial, 115200 baudios) envía una línea de
 * texto por cada cambio de clase y como latido cada 500 ms:
 *
 *     ML:<nombre de la clase>\n
 *
 * Cuando no hay detección (nadie frente a la cámara, confianza baja, etc.)
 * el navegador envía la clase especial "none".
 */
//% color="#7C3AED" icon="\uf0e7" block="SmartTEAM ML" weight=90
namespace smartteamML {
    const PREFIJO = "ML:"
    const SIN_DETECCION = "none"

    let nombres: string[] = []
    let manejadores: (() => void)[] = []
    let claseActualInterna = ""
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
            if (clase.length == 0 || clase == claseActualInterna) return
            claseActualInterna = clase
            for (let i = 0; i < nombres.length; i++) {
                if (nombres[i] == clase) manejadores[i]()
            }
        })
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
