/**
 * SmartTEAM ML — bloques para reaccionar a las clases que detecta el
 * entrenador SmartTEAM ML en el navegador.
 *
 * Protocolo (Web Serial, 115200 baudios, una línea por mensaje), siempre
 * "a pedido": el micro:bit pregunta con "ML?\n" y el navegador responde una
 * sola línea "ML:<nombre de la clase>\n". Como nunca llega un byte sin
 * pedirlo, el buffer del micro:bit no se llena aunque el programa se bloquee.
 *
 * La extensión sondea sola en segundo plano (un pedido cada ~200 ms), así
 * los bloques de evento y los reporters están siempre actualizados sin que
 * el programa tenga que pedir nada. El bloque "pedir clase ML" fuerza un
 * pedido inmediato cuando se necesita la respuesta más fresca posible.
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
    const INTERVALO_SONDEO_MS = 200

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

    function esperarRespuesta(): void {
        let esperado = 0
        while (respuestaPendiente && esperado < TIMEOUT_PEDIDO_MS) {
            basic.pause(10)
            esperado += 10
        }
        respuestaPendiente = false
    }

    function solicitar(): void {
        if (respuestaPendiente) {
            // ya hay un pedido en vuelo: esperar a que se resuelva
            esperarRespuesta()
            return
        }
        respuestaPendiente = true
        serial.writeString(PEDIDO + "\n")
        esperarRespuesta()
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
        // Sondeo en segundo plano: mantiene frescos los eventos y reporters
        // sin que el programa del chico tenga que pedir nada.
        control.inBackground(function () {
            while (true) {
                solicitar()
                basic.pause(INTERVALO_SONDEO_MS)
            }
        })
    }

    /**
     * Pide la clase actual al entrenador ahora mismo y espera la respuesta
     * (máximo 500 ms). No suele hacer falta: la extensión ya pregunta sola
     * en segundo plano. Usalo cuando necesites la lectura más fresca posible
     * justo antes de decidir.
     */
    //% blockId=smartteam_ml_pedir_clase
    //% block="pedir clase ML"
    //% weight=95
    export function pedirClaseML(): void {
        iniciar()
        solicitar()
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
     * Se actualiza sola gracias al sondeo en segundo plano.
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
     * Se actualiza sola gracias al sondeo en segundo plano.
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
