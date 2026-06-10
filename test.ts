// Programa de ejemplo: un ícono distinto por clase.
// Entrená dos clases en el entrenador (por ejemplo "pulgar arriba" y
// "pulgar abajo") y usá los mismos nombres acá.

smartteamML.alDetectarClase("pulgar arriba", function () {
    basic.showIcon(IconNames.Happy)
})

smartteamML.alDetectarClase("pulgar abajo", function () {
    basic.showIcon(IconNames.Sad)
})

smartteamML.cuandoNoHayDeteccion(function () {
    basic.clearScreen()
})
