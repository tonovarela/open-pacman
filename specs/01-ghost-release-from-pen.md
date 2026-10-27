# SPEC 01 — Fantasmas salen de la jaula de partida

> **Status:** Aprobado
> **Depends on:** (ninguno)
> **Date:** 2026-10-27
> **Objective:** Implementar un sistema de salida diferida y controlada de los fantasmas desde la jaula de partida (pen), con tiempos personalizados por fantasma.

## Scope

**In:**

- Definir el área de la pen (jaula) y su puerta de salida en `maze.js`.
- Agregar propiedades de estado a cada fantasma: `inPen` (booleano) y `penFrameCount` (contador).
- Implementar estrategia de movimiento dentro de la pen (`decideGhostInPen`).
- Implementar tiempos de salida diferida por fantasma (`PEN_RELEASE_TIMES`).
- Modificar `decideGhost()` en `game.js` para usar la estrategia de pen cuando corresponda.
- Probar que cada fantasma sale en su momento sin colisiones.

**Out of scope (para specs futuras):**

- IA avanzada dentro de la pen (por ahora, movimiento simple hacia la puerta).
- Estados especiales (miedo, poder-ups que afecten la pen).
- Configuración dinámica de tiempos desde la UI.

## Data model

```js
// maze.js — Nuevas constantes
const PEN_BOUNDS = { x0: 11, x1: 15, y0: 12, y1: 16 };  // Área de la jaula
const PEN_EXIT = { x: 13, y: 11 };                        // Puerta de salida (arriba)
const PEN_RELEASE_TIMES = [
  30,   // Blinky (hunter):   ~0.5 seg a 60fps
  120,  // Pinky (chaser):    ~2 seg
  180,  // Inky (patrol):     ~3 seg
  250,  // Sue (scatter):     ~4 seg
  300   // Clyde (lento):     ~5 seg
];

// game.js — Estructura de fantasma (agregar a cada fantasma en createGame)
{
  x: number,
  y: number,
  dir: string,
  speed: number,
  kind: string,
  patrolIndex: number,
  homeCorner: { x, y },
  inPen: true,           // ← NUEVO
  penFrameCount: 0       // ← NUEVO
}
```

Esta feature reutiliza la estructura de fantasmas existente. No introduce nuevas tablas ni persistencia.

## Implementation plan

1. **Agregar constantes a `maze.js`**: definir `PEN_BOUNDS`, `PEN_EXIT`, `PEN_RELEASE_TIMES` como globals.
   - Manual test: abrir console y verificar que `window.PEN_BOUNDS`, `window.PEN_EXIT`, `window.PEN_RELEASE_TIMES` existen.

2. **Inicializar estado de pen en `game.js` → `createGame()`**: Agregar `inPen: true` y `penFrameCount: 0` a cada fantasma.
   - Manual test: crear una partida, abrir console, verificar `game.ghosts[0].inPen === true`.

3. **Implementar `decideGhostInPen()` en `game.js`**: función que guía al fantasma hacia `PEN_EXIT` usando Manhattan distance.
   - Manual test: jugar 30+ frames, ver que el fantasma 0 (Blinky) intenta moverse hacia la puerta.

4. **Modificar `moveGhost()` en `game.js`**: Agregar lógica de conteo de frames y cambio de estado `inPen = false` cuando llega el tiempo.
   - Manual test: después de su `PEN_RELEASE_TIME`, verificar que el fantasma abandona la pen y sigue su IA normal.

5. **Modificar `decideGhost()` en `game.js`**: verificar `if (g.inPen)` al inicio y delegar a `decideGhostInPen()`.
   - Manual test: jugar un nivel completo; los fantasmas salen en orden (Blinky primero, Clyde último).

6. **Verificación e integración**: Jugar y confirmar que todos los fantasmas salen sin atrapamientos ni colisiones.

## Acceptance criteria

- [ ] Cada fantasma nace dentro de la pen (`inPen: true`).
- [ ] Los fantasmas se mueven hacia la puerta de salida cuando están dentro de la pen.
- [ ] Blinky (fantasma 0) sale después de 30 frames.
- [ ] Pinky (fantasma 1) sale después de 120 frames.
- [ ] Inky (fantasma 2) sale después de 180 frames.
- [ ] Sue (fantasma 3) sale después de 250 frames.
- [ ] Clyde (fantasma 4) sale después de 300 frames.
- [ ] Una vez fuera, cada fantasma usa su estrategia de IA (hunter, chaser, patrol, scatter).
- [ ] No hay atrapamientos ni colisiones al salir de la pen.
- [ ] El juego no muestra errores en la console.

## Decisions

- **Sí:** Tiempos fijos (no aleatorios). Más predecible y fácil de balancear.
- **No:** Sacar todos los fantasmas al mismo tiempo. Los tiempos escalonados hacen el juego más jugable.
- **Sí:** Movimiento simple hacia la puerta. Una IA compleja dentro de la pen es innecesaria.
- **No:** Persistencia de estado de pen. Se reinicia con cada partida.
- **Sí:** Constants globales en `maze.js`. Reutiliza el patrón existente (`GHOST_STARTS`, etc.).

## Risks

| Risk | Mitigation |
|------|-----------|
| Fantasma no alcanza la puerta de salida | Verificar que la puerta está accesible y que `decideGhostInPen()` calcula correctamente Manhattan distance. |
| Múltiples fantasmas apilados en la puerta | Movimiento simple (ir hacia puerta) puede causar congestión; si ocurre, agregar pequeño offset aleatorio en Phase 2. |
| Fantasma queda atrapado después de salir | Revisar que `inPen = false` dispara correctamente y que la estrategia de IA toma el control. |

## What is **not** in this spec

- IA de patrulla compleja dentro de la pen.
- Ajustes de dificultad según nivel o tiempo de juego.
- Mensajes o indicadores visuales de salida de fantasmas.
- Bloqueos adicionales o puertas dobles.

Cada uno de esos, si se necesita, va en su propia spec.
