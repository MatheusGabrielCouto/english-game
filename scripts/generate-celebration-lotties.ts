import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

type Rgb = [number, number, number]

const OUT_DIR = join(process.cwd(), 'assets/lottie')

const base = (name: string, op: number, layers: object[]) => ({
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op,
  w: 512,
  h: 512,
  nm: name,
  ddd: 0,
  assets: [],
  layers,
  markers: [],
})

const transform = () => ({
  ty: 'tr',
  p: { a: 0, k: [0, 0], ix: 2 },
  a: { a: 0, k: [0, 0], ix: 1 },
  s: { a: 0, k: [100, 100], ix: 3 },
  r: { a: 0, k: 0, ix: 6 },
  o: { a: 0, k: 100, ix: 7 },
  sk: { a: 0, k: 0, ix: 4 },
  sa: { a: 0, k: 0, ix: 5 },
  nm: 'Transform',
})

const fill = (color: Rgb, opacity = 100) => ({
  ty: 'fl',
  c: { a: 0, k: [...color, 1], ix: 4 },
  o: { a: 0, k: opacity, ix: 5 },
  r: 1,
  bm: 0,
  nm: 'Fill',
  mn: 'ADBE Vector Graphic - Fill',
  hd: false,
})

const ellipse = (size: number) => ({
  ty: 'el',
  p: { a: 0, k: [0, 0], ix: 2 },
  s: { a: 0, k: [size, size], ix: 3 },
  nm: 'Ellipse',
  mn: 'ADBE Vector Shape - Ellipse',
  hd: false,
})

const rect = (width: number, height: number) => ({
  ty: 'rc',
  p: { a: 0, k: [0, 0], ix: 2 },
  s: { a: 0, k: [width, height], ix: 3 },
  r: { a: 0, k: 2, ix: 4 },
  nm: 'Rect',
  mn: 'ADBE Vector Shape - Rect',
  hd: false,
})

const group = (items: object[], name: string) => ({
  ty: 'gr',
  it: [...items, transform()],
  nm: name,
  np: items.length + 1,
  cix: 2,
  bm: 0,
  ix: 1,
  mn: 'ADBE Vector Group',
  hd: false,
})

const shapeLayer = (
  index: number,
  name: string,
  shapes: object[],
  ks: object,
  op = 60,
) => ({
  ddd: 0,
  ind: index,
  ty: 4,
  nm: name,
  sr: 1,
  ks,
  ao: 0,
  shapes,
  ip: 0,
  op,
  st: 0,
  bm: 0,
})

const fadeOut = (start: number, end: number) => ({
  a: 1,
  k: [
    { t: start, s: [100], h: 1 },
    {
      t: end,
      s: [0],
      i: { x: [0.667], y: [1] },
      o: { x: [0.333], y: [0] },
    },
  ],
  ix: 11,
})

const scaleBurst = (start: number, end: number, from: number, to: number) => ({
  a: 1,
  k: [
    {
      t: start,
      s: [from, from, 100],
      e: [to, to, 100],
      i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
      o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
    },
    { t: end, s: [to, to, 100], h: 1 },
  ],
  ix: 6,
})

const moveY = (start: number, end: number, from: number, to: number, x: number) => ({
  a: 1,
  k: [
    {
      t: start,
      s: [x, from, 0],
      e: [x, to, 0],
      i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] },
      o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] },
    },
    { t: end, s: [x, to, 0], h: 1 },
  ],
  ix: 2,
})

const staticPos = (x: number, y: number) => ({ a: 0, k: [x, y, 0], ix: 2 })

const palette: Rgb[] = [
  [0.545, 0.361, 0.965],
  [0.22, 0.741, 0.973],
  [0.984, 0.749, 0.141],
  [0.133, 0.773, 0.369],
  [0.957, 0.447, 0.714],
  [0.753, 0.518, 0.988],
]

const confetti = () => {
  const layers = palette.map((color, index) => {
    const x = 96 + index * 56
    const delay = index * 2
    const drift = index % 2 === 0 ? 24 : -24
    return shapeLayer(
      index + 1,
      `Confetti ${index + 1}`,
      [group([rect(14, 22), fill(color)], 'Particle')],
      {
        o: fadeOut(delay + 8, delay + 50),
        r: {
          a: 1,
          k: [
            { t: delay, s: [0], e: [220], i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] } },
            { t: delay + 50, s: [220], h: 1 },
          ],
          ix: 10,
        },
        p: moveY(delay, delay + 50, -40, 560, x + drift),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: { a: 0, k: [100, 100, 100], ix: 6 },
      },
      60,
    )
  })

  return base('EQ Confetti', 60, layers)
}

const sparkle = () =>
  base('EQ Sparkle', 45, [
    shapeLayer(
      1,
      'Burst',
      [group([ellipse(180), fill([0.984, 0.749, 0.141])], 'Ring')],
      {
        o: fadeOut(0, 40),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 40, 20, 140),
      },
      45,
    ),
    shapeLayer(
      2,
      'Core',
      [group([ellipse(90), fill([0.545, 0.361, 0.965])], 'Core')],
      {
        o: fadeOut(4, 36),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 36, 0, 110),
      },
      45,
    ),
  ])

const success = () =>
  base('EQ Success', 36, [
    shapeLayer(
      1,
      'Pulse',
      [group([ellipse(120), fill([0.133, 0.773, 0.369])], 'Pulse')],
      {
        o: fadeOut(0, 30),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 30, 40, 100),
      },
      36,
    ),
    shapeLayer(
      2,
      'Spark',
      [group([rect(18, 18), fill([0.22, 0.741, 0.973])], 'Spark')],
      {
        o: fadeOut(6, 28),
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [45], i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] } },
            { t: 28, s: [45], h: 1 },
          ],
          ix: 10,
        },
        p: staticPos(256, 210),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 24, 0, 100),
      },
      36,
    ),
  ])

const prestige = () =>
  base('EQ Prestige', 54, [
    shapeLayer(
      1,
      'Gold Ring',
      [group([ellipse(220), fill([0.984, 0.749, 0.141], 55)], 'Ring')],
      {
        o: fadeOut(0, 48),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 48, 25, 150),
      },
      54,
    ),
    shapeLayer(
      2,
      'Purple Core',
      [group([ellipse(110), fill([0.545, 0.361, 0.965])], 'Core')],
      {
        o: fadeOut(6, 44),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 36, 0, 120),
      },
      54,
    ),
    shapeLayer(
      3,
      'Ascend',
      [group([rect(16, 28), fill([0.984, 0.749, 0.141])], 'Shard')],
      {
        o: fadeOut(8, 46),
        r: {
          a: 1,
          k: [
            { t: 8, s: [0], e: [30], i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] } },
            { t: 46, s: [30], h: 1 },
          ],
          ix: 10,
        },
        p: moveY(8, 46, 120, -80, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(8, 30, 40, 100),
      },
      54,
    ),
  ])

const petEvolution = () =>
  base('EQ Pet Evolution', 60, [
    shapeLayer(
      1,
      'Legendary Halo',
      [group([ellipse(240), fill([0.753, 0.518, 0.988], 60)], 'Halo')],
      {
        o: fadeOut(0, 52),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 52, 20, 145),
      },
      60,
    ),
    shapeLayer(
      2,
      'Gold Burst',
      [group([ellipse(130), fill([0.984, 0.749, 0.141])], 'Burst')],
      {
        o: fadeOut(4, 48),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 40, 0, 125),
      },
      60,
    ),
    ...palette.slice(0, 4).map((color, index) => {
      const angle = index * 90
      const x = 256 + Math.cos((angle * Math.PI) / 180) * 40
      const y = 256 + Math.sin((angle * Math.PI) / 180) * 40
      const delay = 6 + index * 3
      return shapeLayer(
        index + 3,
        `Orb ${index + 1}`,
        [group([ellipse(36), fill(color)], 'Orb')],
        {
          o: fadeOut(delay, delay + 40),
          r: { a: 0, k: angle, ix: 10 },
          p: staticPos(x, y),
          a: { a: 0, k: [0, 0, 0], ix: 1 },
          s: scaleBurst(delay, delay + 28, 0, 130),
        },
        60,
      )
    }),
  ])

const lootEpic = () =>
  base('EQ Loot Epic', 42, [
    shapeLayer(
      1,
      'Epic Halo',
      [group([ellipse(210), fill([0.659, 0.333, 0.969], 65)], 'Halo')],
      {
        o: fadeOut(0, 38),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 38, 30, 140),
      },
      42,
    ),
    shapeLayer(
      2,
      'Epic Spark',
      [group([rect(24, 24), fill([0.545, 0.361, 0.965])], 'Spark')],
      {
        o: fadeOut(4, 36),
        r: {
          a: 1,
          k: [
            { t: 0, s: [-22], e: [22], i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] } },
            { t: 36, s: [22], h: 1 },
          ],
          ix: 10,
        },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 28, 50, 115),
      },
      42,
    ),
    shapeLayer(
      3,
      'Epic Beam',
      [group([rect(12, 48), fill([0.22, 0.741, 0.973])], 'Beam')],
      {
        o: fadeOut(8, 38),
        r: { a: 0, k: 45, ix: 10 },
        p: staticPos(256, 220),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(8, 32, 0, 110),
      },
      42,
    ),
  ])

const lootLegendary = () =>
  base('EQ Loot Legendary', 54, [
    shapeLayer(
      1,
      'Legend Ring',
      [group([ellipse(230), fill([0.984, 0.749, 0.141], 70)], 'Ring')],
      {
        o: fadeOut(0, 48),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 48, 20, 155),
      },
      54,
    ),
    shapeLayer(
      2,
      'Legend Core',
      [group([ellipse(150), fill([0.984, 0.749, 0.141])], 'Core')],
      {
        o: fadeOut(4, 44),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 36, 0, 130),
      },
      54,
    ),
    shapeLayer(
      3,
      'Legend Accent',
      [group([ellipse(180), fill([0.545, 0.361, 0.965], 45)], 'Accent')],
      {
        o: fadeOut(8, 46),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(8, 46, 60, 125),
      },
      54,
    ),
    shapeLayer(
      4,
      'Legend Ray',
      [group([rect(20, 20), fill([0.984, 0.749, 0.141])], 'Ray')],
      {
        o: fadeOut(6, 42),
        r: {
          a: 1,
          k: [
            { t: 6, s: [-30], e: [30], i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] } },
            { t: 42, s: [30], h: 1 },
          ],
          ix: 10,
        },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(6, 30, 70, 120),
      },
      54,
    ),
  ])

const achievement = () =>
  base('EQ Achievement', 48, [
    shapeLayer(
      1,
      'Halo',
      [group([ellipse(200), fill([0.984, 0.749, 0.141], 70)], 'Halo')],
      {
        o: fadeOut(0, 42),
        r: { a: 0, k: 0, ix: 10 },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 42, 30, 125),
      },
      48,
    ),
    shapeLayer(
      2,
      'Star',
      [group([rect(26, 26), fill([0.984, 0.749, 0.141])], 'Star')],
      {
        o: fadeOut(4, 40),
        r: {
          a: 1,
          k: [
            { t: 0, s: [-18], e: [18], i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] } },
            { t: 40, s: [18], h: 1 },
          ],
          ix: 10,
        },
        p: staticPos(256, 256),
        a: { a: 0, k: [0, 0, 0], ix: 1 },
        s: scaleBurst(0, 24, 60, 110),
      },
      48,
    ),
  ])

mkdirSync(OUT_DIR, { recursive: true })

const files = {
  'confetti.json': confetti(),
  'sparkle.json': sparkle(),
  'success.json': success(),
  'achievement.json': achievement(),
  'prestige.json': prestige(),
  'pet-evolution.json': petEvolution(),
  'loot-epic.json': lootEpic(),
  'loot-legendary.json': lootLegendary(),
}

for (const [fileName, payload] of Object.entries(files)) {
  writeFileSync(join(OUT_DIR, fileName), `${JSON.stringify(payload)}\n`, 'utf8')
}

console.log(`Generated ${Object.keys(files).length} celebration lotties in ${OUT_DIR}`)
