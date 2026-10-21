// maze.js
// Laberinto 28x31 fiel a la geometria del nivel 1 de Pac-Man.
// Se escribe como 31 strings de 28 chars (legible) y se parsea a numeros.
//   '#' pared(1) · '.' dot(2) · ' ' vacio transitable(0) · '-' puerta pen(3)
// Coordenadas: celda (x,y), origen arriba-izquierda. x in [0,27], y in [0,30].
// Simetrico respecto al eje vertical central (entre cols 13 y 14).

const MAZE_STR = [
  '############################', // 0  borde
  '#............##............#', // 1
  '#.####.#####.##.#####.####.#', // 2
  '#.####.#####.##.#####.####.#', // 3
  '#.####.#####.##.#####.####.#', // 4
  '#..........................#', // 5
  '#.####.##.########.##.####.#', // 6
  '#.####.##.########.##.####.#', // 7
  '#......##....##....##......#', // 8
  '######.#####.##.#####.######', // 9
  '######.#####.##.#####.######', // 10
  '######.##..........##.######', // 11
  '######.##.###--###.##.######', // 12  puerta pen cols 13-14
  '######.##.#      #.##.######', // 13  interior pen
  '          #      #          ', // 14  tunel (extremos abiertos) + pen
  '######.##.#      #.##.######', // 15  interior pen
  '######.##.########.##.######', // 16  fondo pen
  '######.##..........##.######', // 17
  '######.#####.##.#####.######', // 18
  '######.#####.##.#####.######', // 19
  '#............##............#', // 20
  '#.####.#####.##.#####.####.#', // 21
  '#.####.#####.##.#####.####.#', // 22
  '#...##................##...#', // 23  fila inicio Pacman (13,23)
  '###.##.##.########.##.##.###', // 24
  '###.##.##.########.##.##.###', // 25
  '#......##....##....##......#', // 26
  '#.##########.##.##########.#', // 27
  '#.##########.##.##########.#', // 28
  '#..........................#', // 29
  '############################', // 30  borde
];

function parseTile( ch ) {
  if ( ch === '#' ) return 1;
  if ( ch === '.' ) return 2;
  if ( ch === '-' ) return 3;
  return 0; // espacio = vacio transitable
}

// Matriz numerica pristina (no se muta; cada partida copia esto).
const MAZE = MAZE_STR.map( ( row ) => row.split( '' ).map( parseTile ) );

const TUNNEL_ROW = 14;
const PACMAN_START = { x: 13, y: 23 };
const GHOST_STARTS = [
  { x: 13, y: 14, kind: 'hunter' },                    // Blinky: cazador agresivo
  { x: 14, y: 14, kind: 'chaser' },                    // Pinky: perseguidor parcial
  { x: 12, y: 14, kind: 'patrol' },                    // Inky: patrullero
  { x: 13, y: 13, kind: 'scatter' },                   // Sue: dispersor de esquinas
  { x: 13.5, y: 14, kind: 'hunter', speed: 0.05 },    // Clyde: cazador lento
  { x: 15, y: 14, kind: 'mimic' }                     // Sexto fantasma: imita a Pacman
];

// Puntos de patrulla para el fantasma tipo 'patrol'
const PATROL_POINTS = [
  { x: 1,  y: 1 },    // arriba-izquierda
  { x: 26, y: 1 },    // arriba-derecha
  { x: 26, y: 29 },   // abajo-derecha
  { x: 1,  y: 29 }    // abajo-izquierda
];

// Esquinas de dispersión asignadas por índice de fantasma
const SCATTER_CORNERS = [
  { x: 1,  y: 1 },    // fantasma 0 (hunter) -> arriba-izquierda
  { x: 26, y: 1 },    // fantasma 1 (chaser) -> arriba-derecha
  { x: 26, y: 29 },   // fantasma 2 (patrol) -> abajo-derecha
  { x: 1,  y: 29 },   // fantasma 3 (scatter) -> abajo-izquierda
  { x: 1,  y: 1 },    // fantasma 4 (clyde/hunter lento) -> arriba-izquierda
  { x: 26, y: 29 }   // fantasma 5 (mimic) -> abajo-derecha
];

window.MAZE = MAZE;
window.TUNNEL_ROW = TUNNEL_ROW;
window.PACMAN_START = PACMAN_START;
window.GHOST_STARTS = GHOST_STARTS;
window.PATROL_POINTS = PATROL_POINTS;
window.SCATTER_CORNERS = SCATTER_CORNERS;
