# SPEC 01 — Sexto fantasma con IA "mimic"

> **Estado:** Implementado
> **Depende en:** Ninguna (primer spec del proyecto)
> **Fecha:** 2026-10-21
> **Objetivo:** Añadir un sexto fantasma verde con un nuevo tipo de IA `mimic` que persigue la posición retrasada de Pacman.

## Scope

**In:**

- Un sexto fantasma en el laberinto, con `kind: 'mimic'`, velocidad estándar `GHOST_SPEED` (0.1 celda/frame) y color verde `#00c000`.
- Posición de aparición en la pencilera, celda `(15, 14)`, junto a Clyde.
- Una nueva función de decisión `decideMimic( game, g, choices )` en `game.js`, registrada como `case 'mimic'` en `decideGhost`.
- La regla de objetivo: `tile(Pacman) + 2 × vector(pacman.dir)`, es decir, dos celdas por delante de Pacman en su dirección de avance.
- Una sexta entrada en `SCATTER_CORNERS` para que `homeCorner` nunca quede `undefined` por desalineación de índices.

**Out of scope (para specs futuros):**

- Ajuste del número de vidas o del balance de dificultad con 6 fantasmas.
- Mecanismo de release (salida escalonada) de la pencilera.
- Modo "frightened" (fantasmas asustados / azulados).
- Mostrar el nombre o el color del 6º fantasma en el HUD o en el overlay.
- Cambios en la IA de los 5 fantasmas existentes.
- Cualquier infraestructura de tests automatizados.

## Data model

No se introduce ninguna estructura nueva. Se amplían tres arrays existentes y el objeto fantasma conserva su forma actual.

```js
// src/js/maze.js
const GHOST_STARTS = [
  { x: 13, y: 14, kind: 'hunter' },                    // Blinky: cazador agresivo
  { x: 14, y: 14, kind: 'chaser' },                    // Pinky: perseguidor parcial
  { x: 12, y: 14, kind: 'patrol' },                    // Inky: patrullero
  { x: 13, y: 13, kind: 'scatter' },                   // Sue: dispersor de esquinas
  { x: 13.5, y: 14, kind: 'hunter', speed: 0.05 },    // Clyde: cazador lento
  { x: 15, y: 14, kind: 'mimic' }                     // Sexto fantasma: imita a Pacman
];

const SCATTER_CORNERS = [
  { x: 1,  y: 1 },    // fantasma 0 (hunter) -> arriba-izquierda
  { x: 26, y: 1 },    // fantasma 1 (chaser) -> arriba-derecha
  { x: 26, y: 29 },   // fantasma 2 (patrol) -> abajo-derecha
  { x: 1,  y: 29 },   // fantasma 3 (scatter) -> abajo-izquierda
  { x: 1,  y: 1 },    // fantasma 4 (clyde/hunter lento) -> arriba-izquierda
  { x: 26, y: 29 }    // fantasma 5 (mimic) -> abajo-derecha
];

// src/js/render.js
const GHOST_COLORS = [ '#ff0000', '#00ffff', '#ffb8ff', '#ffb852', '#cc6600', '#00c000' ];
```

El objeto fantasma creado en `createGame()` no gana campos nuevos. El sexto hereda `kind`, `speed`, `patrolIndex` y `homeCorner` por el mapeo existente:

```js
ghosts: GHOST_STARTS.map( ( g, i ) => ( {
  x: g.x,
  y: g.y,
  dir: 'up',
  speed: g.speed || GHOST_SPEED,
  kind: g.kind,
  patrolIndex: 0,
  homeCorner: SCATTER_CORNERS[ i ],
} ) ),
```

Convención del cálculo del objetivo del `mimic`:

```js
// Objetivo = tile de Pacman + 2 celdas en su dirección de avance.
const dir = DIRS[ game.pacman.dir ] || { x: 0, y: 0 };
const tx = Math.round( game.pacman.x ) + dir.x * 2;
const ty = Math.round( game.pacman.y ) + dir.y * 2;
```

El objetivo solo se usa para comparar distancias Manhattan entre las direcciones candidatas. Nunca se navega hasta él y puede caer dentro de una pared sin consecuencias.

## Plan de implementación

1. En `src/js/render.js`, añadir `'#00c000'` al final de `GHOST_COLORS` (índice 5). Todavía no es visible: el índice 5 no lo usa ningún fantasma. Manual: el juego carga igual que antes, sin errores en consola.

2. En `src/js/maze.js`, añadir `{ x: 15, y: 14, kind: 'mimic' }` como sexta entrada de `GHOST_STARTS` y `{ x: 26, y: 29 }` como sexta entrada de `SCATTER_CORNERS`. Manual: al arrancar la partida se ven 6 fantasmas, el último en verde dentro de la pencilera, y los otros 5 se mueven igual que antes.

3. En `src/js/game.js`, añadir `decideMimic( game, g, choices )` con la fórmula de objetivo del bloque anterior, eligiendo la dirección candidata con menor distancia Manhattan al objetivo (mismo patrón que `decideHunter`), y registrar `case 'mimic': newDir = decideMimic( game, g, choices ); break;` en el `switch` de `decideGhost`. Manual: el fantasma verde se desplaza por el laberinto, no se queda atascado en las paredes y no invierte 180° salvo en un callejón.

## Criterios de aceptación

- [ ] Al iniciar la partida se dibujan 6 fantasmas en el canvas, y el sexto es de color verde `#00c000`.
- [ ] El sexto fantasma aparece en la celda `(15, 14)` de la pencilera al inicio de la partida.
- [ ] Tras perder una vida, el sexto fantasma vuelve a la celda `(15, 14)`.
- [ ] El sexto fantasma se mueve a la misma velocidad que Blinky, Pinky, Inky y Sue (0.1 celda/frame).
- [ ] Cuando Pacman se mueve a la derecha, el sexto fantasma se dirige hacia la celda situada 2 columnas a la derecha de Pacman.
- [ ] Cuando Pacman se mueve a la izquierda, el sexto fantasma se dirige hacia la celda situada 2 columnas a la izquierda de Pacman.
- [ ] El sexto fantasma elige entre las direcciones candidatas la que minimiza la distancia Manhattan al objetivo, y no elige la dirección opuesta a la que venía salvo en un callejón sin salida.
- [ ] Con Pacman quieto, el sexto fantasma no se queda detenido ni lanza errores.
- [ ] La consola del navegador no muestra ningún error durante la partida.
- [ ] El HUD sigue mostrando únicamente `SCORE` y `VIDAS`.
- [ ] El número de vidas sigue siendo 3.
- [ ] La partida puede llegar al estado `won` (quedan 0 dots) y al estado `lost` (0 vidas).

## Decisiones

- **Sí:** un `kind` nuevo `mimic` en lugar de reusar `hunter`, `chaser`, `patrol` o `scatter`. Aporta un comportamiento distinguible sin tocar la IA de los 5 fantasmas existentes.
- **Sí:** objetivo = `tile(Pacman) + 2 × vector(pacman.dir)`. Determinista, sin pathfinding y con coste O(1) por decisión.
- **No:** el Inky clásico del arcade (reflejo de dos vectores usando a otro fantasma como líder). Exigía elegir un fantasma líder y ampliar el modelo de decisión a más de un actor.
- **No:** intercepción o anticipación (apuntar a un punto situado delante de Pacman con más de 2 celdas de ventaja). Exigía un modelo de predicción de la trayectoria del jugador.
- **Sí:** usar siempre `pacman.dir` y nunca `pacman.nextDir`. Es determinista y evita que el fantasma reaccione a un giro que el jugador todavía no ha ejecutado.
- **Sí:** añadir la sexta entrada en `SCATTER_CORNERS` aunque el `mimic` no use `homeCorner`. Garantiza que `homeCorner` no sea `undefined` si en el futuro se le asigna un `kind` `scatter`.
- **Sí:** el sexto nace dentro de la pencilera y sale con la misma lógica que los otros 5. No se implementa un mecanismo de release ni un retardo de salida.
- **Sí:** verde `#00c000` como sexto color. distinguishable de los cinco existentes y visible sobre el fondo negro.
- **No:** subir las vidas a 4 o 5. El balance se evalúa jugando y, si hace falta, se ajusta en otro spec.
- **No:** mostrar el sexto fantasma en el HUD o en el overlay. El HUD se mantiene con `SCORE` y `VIDAS`.
- **No:** añadir un runner de tests. El proyecto no tiene infraestructura de test y la verificación de este spec es manual en el navegador.
- **No:** renombrar ni restructurar los 5 fantasmas existentes. Sus `kind`, colores y posiciones no cambian.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El objetivo del `mimic` puede caer dentro de una pared o fuera del laberinto | El objetivo solo se usa para comparar distancias Manhattan entre candidatos; nunca se navega hasta él |
| Con Pacman quieto, `pacman.dir` vale `'left'` (valor inicial) y el `mimic` persigue una celda a la izquierda | Comportamiento determinista y documentado; se añade criterio de aceptación explícito |
| Seis fantasmas aumentan la dificultad y el jugador puede perder la partida a menudo | Las vidas se mantienen en 3 y el ajuste de balance queda fuera de este spec |
| `SCATTER_CORNERS` y `GHOST_STARTS` se desalinean al crecer | Ambos arrays quedan con 6 entradas en el mismo orden; el índice del array es el índice del fantasma |
| La decisión del `mimic` solo se recalcula cuando el fantasma está alineado a una celda | Es el mismo comportamiento que el resto de fantasmas en `moveGhost`; la información queda vigente hasta la siguiente celda |

## Lo que **no** entra en este spec

- Ajuste de vidas o de dificultad por el sexto fantasma.
- Mecanismo de release de la pencilera.
- Modo "frightened" (fantasmas asustados).
- Nombre o color del sexto fantasma en el HUD o en el overlay.
- Cambios en la IA de Blinky, Pinky, Inky, Sue y Clyde.
- Tests automatizados o infraestructura de build.

Cada uno de esos, si aterriza, va en su propio spec.
