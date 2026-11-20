// Small deterministic notebook used by every UI test.
const HL = "<span style='background:#f5d98f;padding:0 3px;border-radius:3px'>"

export const IDS = {
  physics: 'subj-physics',
  cs: 'subj-cs',
  empty: 'subj-empty',
  mechanics: 'ch-mechanics',
  waves: 'ch-waves',
  algorithms: 'ch-algorithms',
  newton: 'tp-newton',
  kinematics: 'tp-kinematics',
  waveBasics: 'tp-waves',
  binary: 'tp-binary',
  cheatSheet: 'tp-cheatsheet', // sits directly in Computer Science (no chapter)
}

export function makeState() {
  return {
    version: 7,
    subjects: [
      {
        _id: IDS.physics,
        name: 'Physics',
        color: '#b8552e',
        position: 0,
        chapters: [
          {
            id: IDS.mechanics,
            name: 'Mechanics',
            position: 0,
            topics: [
              {
                id: IDS.newton,
                name: "Newton's Laws",
                position: 0,
                updatedAt: '2026-11-19T10:00:00.000Z',
                blocks: [
                  { id: 'b-n1', type: 'text', payload: { html: `<b>Second law:</b> ${HL}net force equals mass times acceleration</span>. See [[Kinematics]].` } },
                  { id: 'b-n2', type: 'math', payload: { text: 'F = ma' } },
                  { id: 'b-n3', type: 'todo', payload: { text: 'Solve the problem set', done: false } },
                ],
              },
              {
                id: IDS.kinematics,
                name: 'Kinematics',
                position: 1,
                updatedAt: '2026-11-18T10:00:00.000Z',
                blocks: [
                  { id: 'b-k1', type: 'text', payload: { html: 'Equations of motion for constant acceleration.' } },
                  { id: 'b-k2', type: 'table', payload: { rows: [['Equation', 'Missing'], ['v = u + at', 's']] } },
                ],
              },
            ],
          },
          {
            id: IDS.waves,
            name: 'Waves',
            position: 1,
            topics: [
              {
                id: IDS.waveBasics,
                name: 'Wave Basics',
                position: 0,
                updatedAt: '2026-11-10T10:00:00.000Z',
                blocks: [{ id: 'b-w1', type: 'scan', payload: { imageUrl: null, transcript: 'Transverse and longitudinal waves.' } }],
              },
            ],
          },
        ],
      },
      {
        _id: IDS.cs,
        name: 'Computer Science',
        color: '#5a6aa8',
        position: 1,
        chapters: [
          {
            id: IDS.algorithms,
            name: 'Algorithms',
            position: 0,
            topics: [
              {
                id: IDS.binary,
                name: 'Binary Search',
                position: 0,
                updatedAt: '2026-11-17T10:00:00.000Z',
                blocks: [
                  { id: 'b-b1', type: 'text', payload: { html: 'Works on a sorted array in O(log n).' } },
                  { id: 'b-b2', type: 'code', payload: { lang: 'python', text: 'def search(a, x):\n    pass' } },
                  { id: 'b-b3', type: 'link', payload: { text: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Binary_search' } },
                ],
              },
            ],
          },
        ],
        topics: [
          {
            id: IDS.cheatSheet,
            name: 'Cheat Sheet',
            position: 0,
            updatedAt: '2026-11-01T10:00:00.000Z',
            blocks: [{ id: 'b-c1', type: 'text', payload: { html: 'Hash map lookups are O(1) on average. See [[Binary Search]].' } }],
          },
        ],
      },
      { _id: IDS.empty, name: 'Empty Subject', color: '#1f8a70', position: 2, chapters: [] },
    ],
    important: [
      { id: 'm1', topicId: IDS.newton, text: 'net force equals mass times acceleration', createdAt: '2026-11-19T10:00:00.000Z' },
      { id: 'm2', topicId: IDS.kinematics, text: 'constant acceleration', createdAt: '2026-11-18T10:00:00.000Z' },
    ],
  }
}

export const topicPath = (s, c, t) => `/s/${s}/c/${c}/t/${t}`
export const chapterPath = (s, c) => `/subject/${s}/chapter/${c}`
export const subjectPath = (s) => `/subject/${s}`
export const subjectTopicPath = (s, t) => `/s/${s}/t/${t}`
