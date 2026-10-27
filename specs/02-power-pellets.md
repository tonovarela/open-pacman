# SPEC 02 — Power Pellets en esquinas del mapa

> **Status:** Pendiente de aprobación
> **Depends on:** SPEC 01 (fantasmas salen de la pen)
> **Date:** 2026-10-27
> **Objective:** Implementar Power Pellets (píldoras de poder) en las 4 esquinas del mapa que atemorizen a los fantasmas y permitan comerlos para obtener puntos bonus.

## Scope

**In:**

- Definir 4 Power Pellets en las esquinas del mapa (valor especial en MAZE: 4).
- Agregar propiedades de estado al juego: `frightMode` (booleano) y `frightFrameCount` (contador).
- Implementar efecto de miedo en fantasmas: cambio visual y comportamiento defensivo.
- Modificar movimiento de fantasmas en modo miedo: huir de Pacman.
- Permitir comer fantasmas asustados: +200 puntos por fantasma.
- Reiniciar Power Pellets y estado de miedo al perder una vida.
- Mostrar indicador visual de modo miedo (fantasmas parpadeantes/azules).

**Out of scope (para specs futuras):**

- Animación suave de transición de miedo.
- Sonido especial al comer fantasmas.
- Bonus dinámico por comer múltiples fantasmas en sucesión.
- Power-ups adicionales (frutas, estrellas, etc.).

## Data model

```js
// maze.js — Nuevas constantes
const POWER_PELLET_POSITIONS = [
  { x: 1,  y: 1 },    // esquina arriba-izquierda
  { x: 26, y: 1 },    // esquina arriba-derecha
  { x: 26, y: 29 },   // esquina abajo-derecha
  { x: 1,  y: 29 }    // esquina abajo-izquierda
];

const FRIGHT_DURATION = 300;  // ~5 segundos a 60fps
const FRIGHT_POINTS = 200;    // Puntos al comer un fantasma asustado

// game.js — Valores de grid
// 0 = vacío
// 1 = pared
// 2 = dot
// 3 = puerta pen
// 4 = power pellet (NUEVO)

// game.js — Estado del juego (agregar a createGame)
{
  // ... propiedades existentes ...
  frightMode: false,           // ← NUEVO: ¿está activado el modo miedo?
  frightFrameCount: 0,         // ← NUEVO: contador de frames en modo miedo
}

// game.js — Estructura de fantasma (agregar a cada fantasma en createGame)
{
  // ... propiedades existentes ...
  frightened: false,           // ← NUEVO: ¿este fantasma está asustado?
  eatenThisRound: false,       // ← NUEVO: ¿fue comido en esta ronda de miedo?
}
```

## Implementation plan

1. **Agregar constantes a `maze.js`**: definir `POWER_PELLET_POSITIONS`, `FRIGHT_DURATION`, `FRIGHT_POINTS`.
   - Manual test: verificar en console que `window.POWER_PELLET_POSITIONS` existe y contiene 4 posiciones.

2. **Modificar matriz MAZE en `maze.js`**: Colocar valor 4 en las 4 esquinas (valores en MAZE_STR).
   - Manual test: jugar partida, verificar que los 4 power pellets aparecen en esquinas.

3. **Inicializar estado de miedo en `game.js` → `createGame()`**: Agregar `frightMode: false` y `frightFrameCount: 0` al objeto game.
   - Manual test: crear partida, verificar `game.frightMode === false`.

4. **Inicializar estado de fantasma en `game.js` → `createGame()`**: Agregar `frightened: false` y `eatenThisRound: false` a cada fantasma.
   - Manual test: crear partida, verificar `game.ghosts[0].frightened === false`.

5. **Implementar lógica de comer Power Pellet en `movePacman()`**: Detectar si Pacman come un power pellet (grid[ y ][ x ] === 4).
   - Cuando se come:
     - Establecer `game.frightMode = true`, `game.frightFrameCount = 0`.
     - Marcar todos los fantasmas como `frightened = true`, `eatenThisRound = false`.
     - Remover el power pellet del grid (setear a 0).
     - Sumar +50 puntos al score.
   - Manual test: comer un power pellet y verificar que el estado cambia.

6. **Implementar movimiento defensivo en `decideGhost()`**: Cuando `g.frightened === true`, usar estrategia "huir".
   - Estrategia Flee: maximizar distancia Manhattan a Pacman (opuesto a Hunter).
   - Manual test: con modo miedo activado, fantasmas deben alejarse de Pacman.

7. **Implementar detección de comer fantasma en `update()`**: Modificar colisión Pacman-fantasma.
   - Si `game.frightMode` y `g.frightened` y `!g.eatenThisRound`:
     - Marcar `g.eatenThisRound = true`.
     - Sumar `game.score += FRIGHT_POINTS`.
     - Hacre fantasma invisible o cambiar posición (enviar a pen).
   - Si no hay fantasmas sin comer, reiniciar modo miedo.
   - Manual test: comer un fantasma asustado y ganar puntos.

8. **Implementar contador de miedo en `update()`**: Decrementar `game.frightFrameCount`.
   - Cuando llega a `FRIGHT_DURATION`:
     - Establecer `game.frightMode = false`.
     - Marcar todos los fantasmas como `frightened = false`.
     - Restablecer posiciones iniciales de fantasmas.
   - Manual test: esperar ~5 segundos después de power pellet y verificar que el modo miedo se desactiva.

9. **Modificar `resetPositions()` en `game.js`**: Limpiar estado de miedo al reiniciar.
   - Establecer `game.frightMode = false`, `game.frightFrameCount = 0`.
   - Establecer todos los fantasmas a `frightened = false`, `eatenThisRound = false`.
   - Manual test: perder una vida y verificar que se reinicia el estado.

10. **Actualizar `render.js` para modo miedo** (si aplica):
    - Dibujar power pellets con color/tamaño diferente.
    - Cuando `game.frightMode`: dibujar fantasmas en color azul o con parpadeo.
    - Manual test: visual de power pellets y fantasmas azules en modo miedo.

11. **Verificación e integración**: Jugar nivel completo y confirmar mecánica completa.

## Acceptance criteria

- [ ] Los 4 Power Pellets aparecen en las esquinas del mapa.
- [ ] Pacman puede comer los Power Pellets.
- [ ] Al comer un Power Pellet, todos los fantasmas entran en modo miedo.
- [ ] Los fantasmas asustados se mueven alejándose de Pacman.
- [ ] Pacman puede comer fantasmas asustados y ganar +200 puntos cada uno.
- [ ] El modo miedo dura ~5 segundos (300 frames a 60fps).
- [ ] Después de 5 segundos, el modo miedo se desactiva y los fantasmas regresan a su comportamiento normal.
- [ ] Al perder una vida, se reinicia el estado de miedo y los Power Pellets reaparecen.
- [ ] Los Power Pellets reaparecen en cada nueva partida.
- [ ] Los fantasmas no son comibles fuera del modo miedo.
- [ ] No hay atrapamientos ni comportamientos inesperados.
- [ ] El juego no muestra errores en la consola.

## Decisions

- **Sí:** 4 Power Pellets en esquinas (ubicación estándar de Pac-Man).
- **Sí:** Modo miedo global para todos los fantasmas (más simple que individual).
- **Sí:** Fantasmas huyen (estrategia Flee minimizando distancia).
- **Sí:** 300 frames de duración (~5 segundos a 60fps, balanceado).
- **Sí:** +200 puntos al comer fantasma (recompensa significativa).
- **Sí:** Fantasmas regresan a pen o posiciones iniciales después de modo miedo.
- **No:** Bonus acumulativo por múltiples comidas (complejidad innecesaria en Phase 1).
- **No:** Animación de transición (implementar después si es necesario).

## Risks

| Risk | Mitigation |
|------|-----------|
| Fantasmas quedan atrapados en modo miedo | Implementar estrategia Flee robusta; revisar que maximiza distancia. |
| Power Pellet se come múltiples veces | Verificar que grid[ y ][ x ] se setea a 0 después de comer. |
| Modo miedo no se desactiva | Implementar contador `frightFrameCount` con verificación clara. |
| Fantasma comido aparece en posición extraña | Definir posición explícita (pen o inicio) al ser comido. |
| Colisión Pacman-fantasma no se detecta en modo miedo | Revisar lógica de colisión; diferenciar entre miedo y normal. |

## What is **not** in this spec

- Animación o parpadeo de fantasmas (solo cambio de color).
- Sonidos especiales.
- Bonus variable por combo de fantasmas.
- Niveles con Power Pellets diferentes.
- Transiciones visuales suaves.

Cada uno de esos, si se necesita, va en su propia spec.

## Preguntas de Phase 2 (aclaraciones finales)

1. **¿Los Power Pellets deben ser comibles solo una vez por partida, o reaparecen?**
   - Decisión: Reaparecen con cada vida/partida nueva (estándar Pac-Man).

2. **¿Qué sucede si Pacman come todos los dots pero quedan Power Pellets sin comer?**
   - Decisión: El juego continúa hasta que se cumpla condición de victoria (todos los dots + modo no activo).

3. **¿Los fantasmas pueden comerse entre sí en modo miedo?**
   - Decisión: No, solo Pacman puede comerlos.

4. **¿Cuál es el comportamiento exacto de "huir"?**
   - Decisión: Maximizar distancia Manhattan a Pacman (opuesto a Hunter).
