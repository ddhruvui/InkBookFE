import { create } from 'zustand'
import { fetchState, putState, summarizeChapter as apiSummarizeChapter } from '../api'
import { compilePrintHtml } from '../utils/exportHtml'
import { stripTags } from '../utils/richtext'

// Subject palette (design token list); the ⋯ menu swatch row shows the
// prototype's 6 colors.
export const SUBJECT_PALETTE = ['#b8552e', '#1f8a70', '#5a6aa8', '#8a5aa8', '#a8752e', '#2e7aa8', '#a83e5a']
export const SWATCH_COLORS = ['#b8552e', '#1f8a70', '#5a6aa8', '#8a5aa8', '#a8752e', '#a83e5a']

export const PLACEHOLDER_HTML = 'A fresh page. Start typing below, or scan handwritten notes into it.'

const uuid = () => crypto.randomUUID()
const now = () => new Date().toISOString()
const byPosition = (a, b) => (a.position ?? 0) - (b.position ?? 0)

function normalize(subjects) {
  const list = (subjects || []).slice().sort(byPosition)
  list.forEach((s, si) => {
    s.position = si
    s.chapters = (s.chapters || []).slice().sort(byPosition)
    s.chapters.forEach((c, ci) => {
      c.position = ci
      c.topics = (c.topics || []).slice().sort(byPosition)
      c.topics.forEach((t, ti) => {
        t.position = ti
        t.blocks = t.blocks || []
      })
    })
  })
  return list
}

function renumber(arr) {
  arr.forEach((item, i) => {
    item.position = i
  })
}

/* ── Lookups (exported for components) ── */

export function findSubject(subjects, subjectId) {
  return subjects.find((s) => s._id === subjectId) || null
}

export function findChapter(subjects, subjectId, chapterId) {
  const subject = findSubject(subjects, subjectId)
  const chapter = subject ? subject.chapters.find((c) => c.id === chapterId) : null
  return chapter ? { subject, chapter } : null
}

export function findTopic(subjects, subjectId, chapterId, topicId) {
  const found = findChapter(subjects, subjectId, chapterId)
  const topic = found ? found.chapter.topics.find((t) => t.id === topicId) : null
  return topic ? { ...found, topic } : null
}

export function findTopicById(subjects, topicId) {
  for (const subject of subjects)
    for (const chapter of subject.chapters)
      for (const topic of chapter.topics)
        if (topic.id === topicId) return { subject, chapter, topic }
  return null
}

export function findTopicByName(subjects, name) {
  const q = String(name || '').toLowerCase()
  for (const subject of subjects)
    for (const chapter of subject.chapters)
      for (const topic of chapter.topics)
        if (topic.name.toLowerCase() === q) return { subject, chapter, topic }
  return null
}

/* ── Derived data (client-side, over unsaved store — like the prototype) ── */

// Body used by search results (prototype: html || text, tags stripped).
function searchBody(topic) {
  return stripTags(
    topic.blocks.map((b) => b.payload?.html || b.payload?.text || b.payload?.transcript || '').join(' ')
  )
}

// Combined plain-text body used to prune ★ marks (prototype noteBody: + before/after).
export function noteBody(topic) {
  return stripTags(
    topic.blocks
      .map(
        (b) =>
          (b.payload?.html || b.payload?.text || b.payload?.transcript || '') +
          ' ' +
          (b.payload?.before || '') +
          ' ' +
          (b.payload?.after || '')
      )
      .join(' ')
  )
}

// Drop marks whose stored text no longer appears in their (still existing) topic.
function pruneMarks(subjects, important, topicId) {
  return important.filter((m) => {
    if (topicId != null && m.topicId !== topicId) return true
    const found = findTopicById(subjects, m.topicId)
    return !found || noteBody(found.topic).includes(m.text)
  })
}

export function chapterMarks(subjects, important, subjectId, chapterId) {
  const found = findChapter(subjects, subjectId, chapterId)
  if (!found) return []
  const topicIds = new Map(found.chapter.topics.map((t) => [t.id, t]))
  return important
    .filter((m) => topicIds.has(m.topicId))
    .map((m) => ({ ...m, topic: topicIds.get(m.topicId) }))
}

export function computeRecents(subjects) {
  const out = []
  subjects.forEach((s) =>
    s.chapters.forEach((c) =>
      c.topics.forEach((t) => out.push({ subject: s, chapter: c, topic: t }))
    )
  )
  out.sort((a, b) => String(b.topic.updatedAt || '').localeCompare(String(a.topic.updatedAt || '')))
  return out
}

export function linkedFrom(subjects, topic) {
  const out = []
  if (!topic) return out
  const needle = '[[' + topic.name + ']]'
  subjects.forEach((s) =>
    s.chapters.forEach((c) =>
      c.topics.forEach((t) => {
        if (t === topic) return
        if (t.blocks.some((b) => b.type === 'text' && (b.payload?.html || '').includes(needle)))
          out.push({ subject: s, chapter: c, topic: t })
      })
    )
  )
  return out
}

// Search palette (max 8 results; filters: all | subject | important | scans).
export function searchNotes(subjects, important, q, filter, currentSubjectId) {
  const ql = String(q || '').trim().toLowerCase()
  const out = []
  if (filter === 'important') {
    important.forEach((m) => {
      if (ql && !m.text.toLowerCase().includes(ql)) return
      const found = findTopicById(subjects, m.topicId)
      if (!found) return
      out.push({
        title: '★ ' + m.text.slice(0, 60),
        path: found.subject.name + ' › ' + found.chapter.name + ' › ' + found.topic.name,
        snippet: 'marked important',
        subjectId: found.subject._id,
        chapterId: found.chapter.id,
        topicId: found.topic.id,
        hl: '',
      })
    })
    return out
  }
  subjects.forEach((s) =>
    s.chapters.forEach((c) =>
      c.topics.forEach((t) => {
        if (filter === 'subject' && currentSubjectId && s._id !== currentSubjectId) return
        if (filter === 'scans' && !t.blocks.some((b) => b.type === 'scan')) return
        const body = searchBody(t)
        if (ql && !(t.name.toLowerCase().includes(ql) || body.toLowerCase().includes(ql))) return
        const i = ql ? body.toLowerCase().indexOf(ql) : -1
        out.push({
          title: t.name,
          path: s.name + ' › ' + c.name,
          snippet: i >= 0 ? '…' + body.slice(Math.max(0, i - 20), i + 60) + '…' : body.slice(0, 70) + '…',
          subjectId: s._id,
          chapterId: c.id,
          topicId: t.id,
          hl: ql,
        })
      })
    )
  )
  return out.slice(0, 8)
}

/* ── Store ── */

let toastTimer = null
let savedTimer = null

// Staged reveal timers for the ✦ chapter summary (points appear ~350ms apart).
let summaryTimers = []
function clearSummaryTimers() {
  summaryTimers.forEach(clearTimeout)
  summaryTimers = []
}

// Debounced background persistence: every data change lands in Mongo shortly
// after it happens; 💾 / ⌘S stays as an instant flush with a toast.
const AUTOSAVE_DELAY = 1500
const AUTOSAVE_RETRY = 3000
let autosaveTimer = null
function scheduleAutosave(delay = AUTOSAVE_DELAY) {
  clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(() => useNotebookStore.getState().save({ silent: true }), delay)
}

const useNotebookStore = create((set, get) => {
  // Mutates the live tree via fn(state), then publishes fresh top-level refs.
  const commit = (fn, { dirty = true } = {}) => {
    const state = get()
    fn(state)
    set({
      subjects: [...state.subjects],
      important: [...state.important],
      ...(dirty ? { dirty: true, rev: state.rev + 1 } : {}),
    })
  }

  const touch = (topic) => {
    topic.updatedAt = now()
  }

  return {
    subjects: [],
    important: [],
    loaded: false,
    dirty: false,
    rev: 0, // bumps on every data change; save() uses it to detect mid-flight edits
    saveStatus: 'idle', // idle | saving | saved
    undoStack: [],
    undoTick: 0, // bumps on undo so open editors can reset

    // UI state
    openSubjects: {},
    openChapters: {},
    drawerOpen: false,
    palOpen: false,
    palQ: '',
    palFilter: 'all',
    hlQ: '',
    menu: null, // {type, subjectId, chapterId, topicId, renaming}
    renameVal: '',
    deleteArm: false,
    adding: null, // {type, subjectId, chapterId}
    addName: '',
    insertOpen: false,
    exportModal: null, // {ctx:{subjectId, chapterId, topicId}, scope, done, busy}
    importantOpen: null, // {subjectId, chapterId}
    scanOpen: null, // {subjectId, chapterId, topicId} — 📷 wizard pre-targeted destination
    summary: null, // {subjectId, chapterId, loading, items:[{head}|{point}]}
    printHtml: '',
    toastOn: false,
    toastMsg: '',

    /* ── feedback ── */
    toast(msg) {
      set({ toastOn: true, toastMsg: msg })
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => set({ toastOn: false }), 2400)
    },

    /* ── persistence ── */
    async load() {
      try {
        const data = await fetchState()
        const subjects = normalize(data.subjects)
        // Any leftover stale mark (source text edited away) is removed on load;
        // dirty so 💾 Save persists the cleanup.
        const important = pruneMarks(subjects, data.important || [])
        set({
          subjects,
          important,
          loaded: true,
          dirty: important.length !== (data.important || []).length,
        })
      } catch {
        set({ loaded: true })
        get().toast('Could not load notes — is the server running?')
      }
    },

    async save({ silent = false } = {}) {
      clearTimeout(autosaveTimer)
      const { subjects, important, saveStatus, rev } = get()
      if (saveStatus === 'saving') {
        scheduleAutosave() // a flush is in flight; pick this change up right after
        return
      }
      set({ saveStatus: 'saving' })
      try {
        await putState(subjects, important)
        // Only mark clean if nothing changed while the PUT was in flight.
        const clean = get().rev === rev
        set({ saveStatus: 'saved', ...(clean ? { dirty: false } : {}) })
        if (!clean) scheduleAutosave()
        if (!silent) get().toast('💾 All changes saved')
        clearTimeout(savedTimer)
        savedTimer = setTimeout(() => set({ saveStatus: 'idle' }), 1600)
      } catch {
        set({ saveStatus: 'idle' })
        scheduleAutosave(AUTOSAVE_RETRY)
        if (!silent) get().toast('Save failed — is the server running?')
      }
    },

    /* ── undo (deep-clone snapshots, max 20) ── */
    snapshot() {
      const { subjects, important, undoStack } = get()
      const next = [...undoStack, JSON.stringify({ subjects, important })]
      if (next.length > 20) next.shift()
      set({ undoStack: next })
    },

    undo() {
      const { undoStack } = get()
      if (!undoStack.length) return get().toast('Nothing to undo')
      const stack = undoStack.slice()
      const snap = JSON.parse(stack.pop())
      set((st) => ({
        subjects: snap.subjects,
        important: snap.important,
        undoStack: stack,
        dirty: true,
        rev: st.rev + 1,
        menu: null,
        insertOpen: false,
        undoTick: st.undoTick + 1,
      }))
      get().toast('↩ Last change undone')
    },

    /* ── UI actions ── */
    openPath(subjectId, chapterId) {
      set((st) => ({
        openSubjects: { ...st.openSubjects, [subjectId]: true },
        openChapters: chapterId ? { ...st.openChapters, [chapterId]: true } : st.openChapters,
      }))
    },
    toggleSubjectOpen(subjectId) {
      set((st) => ({ openSubjects: { ...st.openSubjects, [subjectId]: !st.openSubjects[subjectId] } }))
    },
    toggleChapterOpen(chapterId) {
      set((st) => ({ openChapters: { ...st.openChapters, [chapterId]: !st.openChapters[chapterId] } }))
    },
    setDrawer(open) {
      set({ drawerOpen: open })
    },
    openPalette() {
      set({ palOpen: true, palQ: '', drawerOpen: false })
    },
    closePalette() {
      set({ palOpen: false })
    },
    togglePalette() {
      set((st) => ({ palOpen: !st.palOpen, palQ: '' }))
    },
    setPalQ(q) {
      set({ palQ: q })
    },
    setPalFilter(f) {
      set({ palFilter: f })
    },
    setHlQ(q) {
      set({ hlQ: q })
    },
    setInsertOpen(open) {
      set({ insertOpen: open })
    },
    escapeAll() {
      set({ palOpen: false, menu: null, insertOpen: false, drawerOpen: false, deleteArm: false, scanOpen: null })
    },

    /* ── tree menu / inline add ── */
    toggleMenu(descriptor) {
      const m = get().menu
      const isSame =
        m &&
        m.type === descriptor.type &&
        m.subjectId === descriptor.subjectId &&
        m.chapterId === descriptor.chapterId &&
        m.topicId === descriptor.topicId
      set({ menu: isSame ? null : { ...descriptor, renaming: false }, deleteArm: false })
    },
    startRename(name) {
      set((st) => ({ menu: st.menu ? { ...st.menu, renaming: true } : null, renameVal: name }))
    },
    setRenameVal(v) {
      set({ renameVal: v })
    },
    closeMenus() {
      set({ menu: null, deleteArm: false })
    },
    applyRename() {
      const { menu, renameVal } = get()
      const v = renameVal.trim()
      if (!menu || !v) return set({ menu: null })
      commit((st) => {
        if (menu.type === 'subject') {
          const s = findSubject(st.subjects, menu.subjectId)
          if (s) s.name = v
        } else if (menu.type === 'chapter') {
          const f = findChapter(st.subjects, menu.subjectId, menu.chapterId)
          if (f) f.chapter.name = v
        } else {
          const f = findTopic(st.subjects, menu.subjectId, menu.chapterId, menu.topicId)
          if (f) {
            f.topic.name = v
            touch(f.topic)
          }
        }
      })
      set({ menu: null })
      get().toast('Renamed to "' + v + '"')
    },
    startAdding(adding) {
      set({ adding, addName: '' })
      if (adding?.subjectId) get().openPath(adding.subjectId, adding.chapterId)
    },
    setAddName(v) {
      set({ addName: v })
    },
    cancelAdding() {
      set({ adding: null })
    },
    // Returns {type, subjectId, chapterId, topicId?} so callers can navigate.
    confirmAdd() {
      const { adding, addName } = get()
      const name = addName.trim()
      if (!adding || !name) return null
      let result = null
      if (adding.type === 'subject') {
        const subject = get().addSubject(name)
        result = { type: 'subject', subjectId: subject._id }
      } else if (adding.type === 'chapter') {
        const chapter = get().addChapter(adding.subjectId, name)
        if (chapter) result = { type: 'chapter', subjectId: adding.subjectId, chapterId: chapter.id }
      } else {
        const topic = get().addTopic(adding.subjectId, adding.chapterId, name)
        if (topic)
          result = { type: 'topic', subjectId: adding.subjectId, chapterId: adding.chapterId, topicId: topic.id }
      }
      set({ adding: null, addName: '' })
      return result
    },
    armDelete() {
      set({ deleteArm: true })
    },

    /* ── tree CRUD ── */
    addSubject(name) {
      const { subjects } = get()
      const used = new Set(subjects.map((s) => s.color))
      const color =
        SUBJECT_PALETTE.find((c) => !used.has(c)) || SUBJECT_PALETTE[subjects.length % SUBJECT_PALETTE.length]
      const subject = { _id: uuid(), kind: 'subject', name, color, position: subjects.length, chapters: [] }
      set((st) => ({
        subjects: [...st.subjects, subject],
        dirty: true,
        rev: st.rev + 1,
        openSubjects: { ...st.openSubjects, [subject._id]: true },
      }))
      get().toast('✓ Subject "' + name + '" added — add a chapter with ＋')
      return subject
    },

    addChapter(subjectId, name) {
      let chapter = null
      commit((st) => {
        const subject = findSubject(st.subjects, subjectId)
        if (!subject) return
        chapter = { id: uuid(), name, position: subject.chapters.length, topics: [] }
        subject.chapters.push(chapter)
      })
      if (chapter) {
        get().openPath(subjectId, chapter.id)
        get().toast('✓ Chapter "' + name + '" added')
      }
      return chapter
    },

    addTopic(subjectId, chapterId, name) {
      let topic = null
      commit((st) => {
        const found = findChapter(st.subjects, subjectId, chapterId)
        if (!found) return
        topic = {
          id: uuid(),
          name,
          position: found.chapter.topics.length,
          createdAt: now(),
          updatedAt: now(),
          blocks: [{ id: uuid(), type: 'text', payload: { html: PLACEHOLDER_HTML } }],
        }
        found.chapter.topics.push(topic)
      })
      if (topic) {
        get().openPath(subjectId, chapterId)
        get().toast('✓ Topic "' + name + '" created')
      }
      return topic
    },

    recolorSubject(subjectId, color) {
      commit((st) => {
        const subject = findSubject(st.subjects, subjectId)
        if (subject) subject.color = color
      })
    },

    // dir = -1 (up) | 1 (down)
    moveNode(type, ids, dir) {
      commit((st) => {
        const swap = (arr, i) => {
          if (i < 0 || i + dir < 0 || i + dir >= arr.length) return
          const t = arr[i]
          arr[i] = arr[i + dir]
          arr[i + dir] = t
          renumber(arr)
        }
        if (type === 'subject') {
          swap(st.subjects, st.subjects.findIndex((s) => s._id === ids.subjectId))
        } else if (type === 'chapter') {
          const subject = findSubject(st.subjects, ids.subjectId)
          if (subject) swap(subject.chapters, subject.chapters.findIndex((c) => c.id === ids.chapterId))
        } else {
          const found = findChapter(st.subjects, ids.subjectId, ids.chapterId)
          if (found) swap(found.chapter.topics, found.chapter.topics.findIndex((t) => t.id === ids.topicId))
        }
      })
      set({ deleteArm: false })
    },

    deleteNode(type, ids) {
      get().snapshot()
      commit((st) => {
        if (type === 'subject') {
          const i = st.subjects.findIndex((s) => s._id === ids.subjectId)
          if (i >= 0) st.subjects.splice(i, 1)
          renumber(st.subjects)
        } else if (type === 'chapter') {
          const subject = findSubject(st.subjects, ids.subjectId)
          if (subject) {
            const i = subject.chapters.findIndex((c) => c.id === ids.chapterId)
            if (i >= 0) subject.chapters.splice(i, 1)
            renumber(subject.chapters)
          }
        } else {
          const found = findChapter(st.subjects, ids.subjectId, ids.chapterId)
          if (found) {
            const i = found.chapter.topics.findIndex((t) => t.id === ids.topicId)
            if (i >= 0) found.chapter.topics.splice(i, 1)
            renumber(found.chapter.topics)
          }
        }
      })
      set({ menu: null, deleteArm: false })
      get().toast('Deleted')
    },

    // Deep-copies a subject/chapter/topic with fresh ids at every level and
    // inserts it right after the original. ★ marks are keyed by topicId, so
    // they intentionally stay with the original.
    duplicateNode(type, ids) {
      get().snapshot()
      const cloneBlock = (b) => ({ ...JSON.parse(JSON.stringify(b)), id: uuid() })
      const cloneTopic = (t) => ({
        ...t,
        id: uuid(),
        createdAt: now(),
        updatedAt: now(),
        blocks: (t.blocks || []).map(cloneBlock),
      })
      const cloneChapter = (c) => ({ ...c, id: uuid(), topics: (c.topics || []).map(cloneTopic) })
      let copiedName = null
      commit((st) => {
        if (type === 'subject') {
          const i = st.subjects.findIndex((s) => s._id === ids.subjectId)
          if (i < 0) return
          const src = st.subjects[i]
          const copy = {
            ...src,
            _id: uuid(),
            name: src.name + ' (copy)',
            chapters: (src.chapters || []).map(cloneChapter),
          }
          st.subjects.splice(i + 1, 0, copy)
          renumber(st.subjects)
          copiedName = src.name
        } else if (type === 'chapter') {
          const subject = findSubject(st.subjects, ids.subjectId)
          if (!subject) return
          const i = subject.chapters.findIndex((c) => c.id === ids.chapterId)
          if (i < 0) return
          const copy = cloneChapter(subject.chapters[i])
          copy.name += ' (copy)'
          subject.chapters.splice(i + 1, 0, copy)
          renumber(subject.chapters)
          copiedName = subject.chapters[i].name
        } else {
          const found = findChapter(st.subjects, ids.subjectId, ids.chapterId)
          if (!found) return
          const i = found.chapter.topics.findIndex((t) => t.id === ids.topicId)
          if (i < 0) return
          const copy = cloneTopic(found.chapter.topics[i])
          copy.name += ' (copy)'
          found.chapter.topics.splice(i + 1, 0, copy)
          renumber(found.chapter.topics)
          copiedName = found.chapter.topics[i].name
        }
      })
      set({ menu: null, deleteArm: false })
      if (copiedName) get().toast('⧉ Duplicated "' + copiedName + '"')
      else get().toast('Could not duplicate — item not found')
    },

    renameTopicTitle(topicId, name) {
      commit((st) => {
        const found = findTopicById(st.subjects, topicId)
        if (found && name.trim()) {
          found.topic.name = name.trim()
          touch(found.topic)
        }
      })
    },

    /* ── blocks ── */
    addBlock(topicId, kind) {
      const defaults = {
        text: { html: '' },
        code: { lang: 'python', text: '' },
        code2: { lang: 'code', before: '', after: '' },
        math: { text: 'y = …' },
        todo: { text: 'New task', done: false },
        table: { rows: [['Col 1', 'Col 2'], ['', '']] },
        image: { url: null, caption: 'Caption' },
      }
      let block = null
      commit((st) => {
        const found = findTopicById(st.subjects, topicId)
        if (!found) return
        block = { id: uuid(), type: kind, payload: JSON.parse(JSON.stringify(defaults[kind])) }
        found.topic.blocks.push(block)
        touch(found.topic)
      })
      return block
    },

    appendTextBlock(topicId, html) {
      let topicName = null
      commit((st) => {
        const found = findTopicById(st.subjects, topicId)
        if (!found) return
        found.topic.blocks.push({ id: uuid(), type: 'text', payload: { html } })
        touch(found.topic)
        topicName = found.topic.name
      })
      if (topicName) get().toast('Added to ' + topicName)
    },

    // Applies the inline editor's textarea value per block kind (prototype saveEdit).
    saveBlockEdit(topicId, blockId, text) {
      get().snapshot()
      commit((st) => {
        const found = findTopicById(st.subjects, topicId)
        if (!found) return
        const block = found.topic.blocks.find((b) => b.id === blockId)
        if (!block) return
        const p = block.payload
        if (block.type === 'text') p.html = text.trim() || '…'
        else if (block.type === 'code2') {
          const parts = text.split(/\n---\n?/)
          p.before = (parts[0] || '').trim()
          p.after = (parts[1] || '').trim()
        } else if (block.type === 'table') {
          p.rows = text
            .split('\n')
            .filter((l) => l.trim())
            .map((l) => l.split('|').map((c) => c.trim()))
        } else if (block.type === 'image') p.caption = text.trim()
        else if (block.type === 'link') {
          const parts = text.split('|')
          p.text = (parts[0] || '').trim()
          p.url = (parts[1] || '').trim()
        } else p.text = text
        touch(found.topic)
        st.important = pruneMarks(st.subjects, st.important, topicId)
      })
      get().toast('Saved')
    },

    deleteBlock(topicId, blockId) {
      get().snapshot()
      commit((st) => {
        const found = findTopicById(st.subjects, topicId)
        if (!found) return
        const i = found.topic.blocks.findIndex((b) => b.id === blockId)
        if (i >= 0) found.topic.blocks.splice(i, 1)
        touch(found.topic)
        st.important = pruneMarks(st.subjects, st.important, topicId)
      })
      get().toast('Block deleted — ↩ Undo to restore')
    },

    moveBlock(topicId, blockId, dir) {
      commit((st) => {
        const found = findTopicById(st.subjects, topicId)
        if (!found) return
        const blocks = found.topic.blocks
        const i = blocks.findIndex((b) => b.id === blockId)
        if (i < 0 || i + dir < 0 || i + dir >= blocks.length) return
        const t = blocks[i]
        blocks[i] = blocks[i + dir]
        blocks[i + dir] = t
        touch(found.topic)
      })
    },

    toggleTodo(topicId, blockId) {
      commit((st) => {
        const found = findTopicById(st.subjects, topicId)
        if (!found) return
        const block = found.topic.blocks.find((b) => b.id === blockId)
        if (block) block.payload.done = !block.payload.done
        touch(found.topic)
      })
    },

    setImageUrl(topicId, blockId, url) {
      commit((st) => {
        const found = findTopicById(st.subjects, topicId)
        if (!found) return
        const block = found.topic.blocks.find((b) => b.id === blockId)
        if (block) block.payload.url = url
        touch(found.topic)
      })
      get().toast('🖼 Image added')
    },

    /* ── important marks ── */
    markImportant(topicId, text) {
      set((st) => ({
        important: [...st.important, { id: uuid(), topicId, text: text.slice(0, 120), createdAt: now() }],
        dirty: true,
        rev: st.rev + 1,
      }))
      get().toast('★ Marked important — collected in this chapter')
    },

    /* ── ✦ AI: scan wizard ── */
    openScan(dest) {
      set({ scanOpen: dest || {}, drawerOpen: false, menu: null, insertOpen: false })
    },
    closeScan() {
      set({ scanOpen: null })
    },

    // Appends the reviewed scan blocks to an existing topic (topicId set) or
    // creates a new topic (newName). Returns {subjectId, chapterId, topicId}.
    saveScanToTopic({ subjectId, chapterId, topicId, newName, blocks }) {
      let result = null
      commit((st) => {
        const found = findChapter(st.subjects, subjectId, chapterId)
        if (!found || !blocks.length) return
        const withIds = blocks.map((b) => ({ id: uuid(), ...b }))
        if (topicId) {
          const topic = found.chapter.topics.find((t) => t.id === topicId)
          if (!topic) return
          topic.blocks.push(...withIds)
          touch(topic)
          result = { subjectId, chapterId, topicId }
        } else {
          const topic = {
            id: uuid(),
            name: newName,
            position: found.chapter.topics.length,
            createdAt: now(),
            updatedAt: now(),
            blocks: withIds,
          }
          found.chapter.topics.push(topic)
          result = { subjectId, chapterId, topicId: topic.id }
        }
      })
      if (result) get().openPath(subjectId, chapterId)
      return result
    },

    /* ── ✦ AI: chapter summary (cream panel, staged reveal ~350ms apart) ── */
    async summarizeChapter(subjectId, chapterId) {
      const found = findChapter(get().subjects, subjectId, chapterId)
      if (!found) return
      const { chapter } = found
      if (!chapter.topics.length) return get().toast('No topics to summarize yet')
      clearSummaryTimers()
      set({ summary: { subjectId, chapterId, loading: true, items: [] } })
      try {
        const res = await apiSummarizeChapter(
          chapter.name,
          chapter.topics.map((t) => ({ name: t.name, text: noteBody(t) }))
        )
        const cur = get().summary
        if (!cur || cur.chapterId !== chapterId) return // closed or replaced mid-flight
        const items = []
        ;(res.topics || []).forEach((tp) => {
          items.push({ head: tp.name })
          ;(tp.points || []).forEach((p) => items.push({ point: p }))
        })
        if (!items.length) {
          set({ summary: null })
          return get().toast('The AI returned an empty summary — try again')
        }
        items.forEach((item, i) => {
          summaryTimers.push(
            setTimeout(() => {
              const s2 = get().summary
              if (!s2 || s2.chapterId !== chapterId) return
              set({ summary: { ...s2, items: [...s2.items, item], loading: i < items.length - 1 } })
            }, i * 350)
          )
        })
      } catch (err) {
        get().toast(err.message)
        const cur = get().summary
        if (cur && cur.chapterId === chapterId) set({ summary: null })
      }
    },

    closeSummary() {
      clearSummaryTimers()
      set({ summary: null })
    },

    /* ── modals ── */
    openExport(ctx, scope) {
      set({ exportModal: { ctx, scope, done: false, busy: false }, menu: null, drawerOpen: false })
    },
    closeExport() {
      set({ exportModal: null })
    },
    setExportScope(scope) {
      set((st) => (st.exportModal ? { exportModal: { ...st.exportModal, scope, done: false } } : {}))
    },
    setExportState(patch) {
      set((st) => (st.exportModal ? { exportModal: { ...st.exportModal, ...patch } } : {}))
    },
    openImportant(ref) {
      set({ importantOpen: ref, menu: null, drawerOpen: false })
    },
    closeImportant() {
      set({ importantOpen: null })
    },

    /* ── scoped print (compiled warm-paper view + window.print) ── */
    scopedPrint(scope, ctx) {
      const html = compilePrintHtml(get().subjects, scope, ctx)
      if (!html) return get().toast('Nothing to print yet')
      set({ printHtml: html, exportModal: null, menu: null, drawerOpen: false })
      setTimeout(() => {
        window.print()
        set({ printHtml: '' })
      }, 250)
    },
  }
})

// Any data commit (rev bump) or clean→dirty transition schedules a background
// save, so a refresh or another browser always sees the latest state in Mongo.
useNotebookStore.subscribe((state, prev) => {
  if (state.dirty && (!prev.dirty || state.rev !== prev.rev)) scheduleAutosave()
})

export default useNotebookStore
