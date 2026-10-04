import { useState, useEffect, useRef } from 'react'

// Theme ke saare colors yahin hain
const THEMES = {
  // Light = reading mode: soft warm paper tone, pure white nahi
  light: {
    page: 'bg-[#f0e6d0] text-stone-800',
    header: 'bg-[#f6eedc]/90 border-stone-300',
    badge: 'bg-stone-300/60 text-stone-600',
    field: 'bg-[#e5dac2] text-stone-800 placeholder:text-stone-500 focus:ring-stone-400',
    muted: 'text-stone-500',
    section: 'text-stone-600',
    ghost: 'hover:bg-black/10',
    primary: 'bg-stone-800 text-stone-50',
    danger: 'text-red-700 hover:bg-red-500/15',
    border: 'border-black/10',
    note: 'bg-[#fbf7ec]',
    card: 'bg-[#fbf7ec]',
    noteText: 'text-stone-800',
    noteBody: 'text-stone-700',
    noteMeta: 'text-stone-500',
    placeholder: 'placeholder:text-stone-500',
    chipActive: 'bg-stone-800 text-stone-50',
    chipIdle: 'bg-black/5 text-stone-700 hover:bg-black/10',
    timerField: 'bg-[#e5dac2] text-stone-800',
  },
  dark: {
    page: 'bg-stone-950 text-stone-100',
    header: 'bg-stone-900/90 border-stone-800',
    badge: 'bg-stone-800 text-stone-300',
    field: 'bg-stone-800 text-stone-100 placeholder:text-stone-400 focus:ring-stone-600',
    muted: 'text-stone-400',
    section: 'text-stone-400',
    ghost: 'hover:bg-white/10',
    primary: 'bg-stone-100 text-stone-900',
    danger: 'text-red-400 hover:bg-red-500/20',
    border: 'border-white/10',
    note: 'bg-stone-800',
    card: 'bg-stone-900',
    noteText: 'text-stone-50',
    noteBody: 'text-stone-300',
    noteMeta: 'text-stone-500',
    placeholder: 'placeholder:text-stone-500',
    chipActive: 'bg-stone-100 text-stone-900',
    chipIdle: 'bg-white/10 text-stone-300 hover:bg-white/20',
    timerField: 'bg-stone-800 text-stone-100',
  },
}

const PRESETS = [5, 10, 25, 45]

// Timer khatam hone par 3 beep
const playBeep = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    ;[0, 0.35, 0.7].forEach((delay) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.value = 0.2
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.2)
    })
  } catch {
    // audio na chale to chalega
  }
}

const formatTime = (secs) => {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const App = () => {

  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [search, setSearch] = useState('')
  const [editIndex, setEditIndex] = useState(null)

  // ---------- TIMER ----------
  const [minutes, setMinutes] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const endAt = useRef(0)

  // Theme: saved choice uthao, nahi mili to dark
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      return saved === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  // Local Storage: page load par saved notes uthao
  const [task, setTask] = useState(() => {
    try {
      const saved = localStorage.getItem('notes')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Local Storage: jab bhi notes badle, save karo
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(task))
  }, [task])

  // Theme save karo, aur page ke peeche ka background bhi usi theme ka rakho
  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.body.style.backgroundColor = theme === 'dark' ? '#0c0a09' : '#f0e6d0'
  }, [theme])

  // Timer tick: end time se hisaab karte hain, isliye tab background me ho tab bhi sahi chalta hai
  useEffect(() => {
    if (!running) return

    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000))
      setTimeLeft(left)

      if (left === 0) {
        setRunning(false)
        setFinished(true)
        playBeep()
      }
    }, 250)

    return () => clearInterval(id)
  }, [running])

  // Tab ke title me time dikhao
  useEffect(() => {
    document.title = running ? `${formatTime(timeLeft)} - Notes` : 'Notes'
  }, [running, timeLeft])

  const t = THEMES[theme]

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // ---------- TIMER FUNCTIONS ----------
  const startTimer = () => {
    let secs = timeLeft
    if (secs <= 0 || finished) {
      secs = Math.max(1, Number(minutes) || 1) * 60
    }
    endAt.current = Date.now() + secs * 1000
    setTimeLeft(secs)
    setFinished(false)
    setRunning(true)
  }

  const pauseTimer = () => {
    setRunning(false)
  }

  const resetTimer = () => {
    setRunning(false)
    setFinished(false)
    setTimeLeft(Math.max(1, Number(minutes) || 1) * 60)
  }

  const choosePreset = (m) => {
    setMinutes(m)
    if (!running) {
      setFinished(false)
      setTimeLeft(m * 60)
    }
  }

  const changeMinutes = (value) => {
    const m = Math.min(180, Math.max(0, Number(value) || 0))
    setMinutes(m)
    if (!running) {
      setFinished(false)
      setTimeLeft(m * 60)
    }
  }

  // ---------- NOTES FUNCTIONS ----------
  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const resetForm = () => {
    setEditIndex(null)
    setTitle('')
    setDetails('')
  }

  const submitHandler = (e) => {
    e.preventDefault()

    if (title.trim() === '') {
      alert('Please enter a note heading')
      return
    }

    const copyTask = [...task]

    if (editIndex !== null) {
      copyTask[editIndex] = { ...copyTask[editIndex], title, details }
    } else {
      copyTask.push({
        title,
        details,
        pinned: false,
        date: new Date().toISOString(),
      })
    }

    setTask(copyTask)
    resetForm()
  }

  const deleteNote = (idx) => {
    const copyTask = [...task]
    copyTask.splice(idx, 1)
    setTask(copyTask)

    if (editIndex === idx) {
      resetForm()
    } else if (editIndex !== null && idx < editIndex) {
      setEditIndex(editIndex - 1)
    }
  }

  const editNote = (idx) => {
    setTitle(task[idx].title)
    setDetails(task[idx].details)
    setEditIndex(idx)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearAll = () => {
    if (window.confirm('Delete all notes?')) {
      setTask([])
      resetForm()
    }
  }

  const togglePin = (idx) => {
    const copyTask = [...task]
    copyTask[idx] = { ...copyTask[idx], pinned: !copyTask[idx].pinned }
    setTask(copyTask)
  }

  // Search. Original index (idx) saath rakhte hain taaki edit/delete/pin sahi note par chale
  const filteredNotes = task
    .map((elem, idx) => ({ ...elem, idx }))
    .filter((elem) => {
      const q = search.toLowerCase()
      return (
        elem.title.toLowerCase().includes(q) ||
        elem.details.toLowerCase().includes(q)
      )
    })

  const pinnedNotes = filteredNotes.filter((n) => n.pinned)
  const otherNotes = filteredNotes.filter((n) => !n.pinned)

  // Ek note ka card
  const renderNote = (elem) => (
    <div
      key={elem.idx}
      className={`mb-4 break-inside-avoid rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${t.border} ${t.note}`}
    >
      <h3 className={`text-lg font-semibold leading-snug break-words ${t.noteText}`}>
        {elem.title}
      </h3>

      {elem.details && (
        <p className={`mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${t.noteBody}`}>
          {elem.details}
        </p>
      )}

      {elem.date && (
        <p className={`mt-3 text-xs ${t.noteMeta}`}>{formatDate(elem.date)}</p>
      )}

      <div className='mt-2 -ml-2 flex items-center gap-1'>
        <button
          onClick={() => togglePin(elem.idx)}
          className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium active:scale-95 ${t.noteText} ${t.ghost}`}
        >
          {elem.pinned ? '📌 Unpin' : '📌 Pin'}
        </button>
        <button
          onClick={() => editNote(elem.idx)}
          className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium active:scale-95 ${t.noteText} ${t.ghost}`}
        >
          Edit
        </button>
        <button
          onClick={() => deleteNote(elem.idx)}
          className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium active:scale-95 ${t.danger}`}
        >
          Delete
        </button>
      </div>
    </div>
  )

  const gridClass = 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4'

  return (
    <div className={`min-h-screen transition-colors ${t.page}`}>

      {/* TOP BAR */}
      <header className={`sticky top-0 z-10 border-b backdrop-blur ${t.header}`}>
        <div className='mx-auto flex max-w-6xl items-center gap-3 px-4 py-3'>
          <h1 className='text-xl font-bold'>Notes</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.badge}`}>
            {task.length}
          </span>

          <input
            type='text'
            placeholder='Search notes'
            className={`ml-2 min-w-0 max-w-md flex-1 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 ${t.field}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className='ml-auto flex items-center gap-1'>
            {task.length > 0 && (
              <button
                onClick={clearAll}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium active:scale-95 ${t.danger}`}
              >
                Clear all
              </button>
            )}

            {/* THEME TOGGLE */}
            <button
              onClick={toggleTheme}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium active:scale-95 ${t.ghost}`}
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-6xl px-4 pb-16'>

        {/* COMPOSER + TIMER */}
        <div className='mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3'>

          {/* COMPOSER */}
          <form
            onSubmit={submitHandler}
            className={`rounded-2xl border p-4 shadow-md md:col-span-2 ${t.border} ${t.card}`}
          >
            {editIndex !== null && (
              <p className={`mb-2 text-sm font-medium ${t.muted}`}>Editing note</p>
            )}

            <input
              type='text'
              placeholder='Title'
              className={`w-full bg-transparent text-lg font-semibold outline-none ${t.noteText} ${t.placeholder}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder='Write your note here'
              className={`mt-2 h-28 w-full resize-none bg-transparent text-sm outline-none ${t.noteBody} ${t.placeholder}`}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />

            <div className='mt-3 flex items-center justify-end gap-2'>
              {editIndex !== null && (
                <button
                  type='button'
                  onClick={resetForm}
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium active:scale-95 ${t.noteText} ${t.ghost}`}
                >
                  Cancel
                </button>
              )}
              <button
                className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium active:scale-95 ${t.primary}`}
              >
                {editIndex !== null ? 'Save changes' : 'Add note'}
              </button>
            </div>
          </form>

          {/* TIMER */}
          <div className={`rounded-2xl border p-4 shadow-md ${t.border} ${t.card}`}>
            <h2 className={`text-sm font-semibold ${t.section}`}>Timer</h2>

            <p
              className={`mt-2 text-center text-5xl font-bold tabular-nums ${finished ? 'text-red-500' : t.noteText}`}
            >
              {formatTime(timeLeft)}
            </p>

            {finished && (
              <p className='mt-1 text-center text-sm font-medium text-red-500'>
                Time's up
              </p>
            )}

            {/* PRESETS */}
            <div className='mt-4 flex flex-wrap justify-center gap-2'>
              {PRESETS.map((m) => (
                <button
                  key={m}
                  type='button'
                  onClick={() => choosePreset(m)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium active:scale-95 ${minutes === m ? t.chipActive : t.chipIdle}`}
                >
                  {m} min
                </button>
              ))}
            </div>

            {/* CUSTOM MINUTES */}
            <div className='mt-3 flex items-center justify-center gap-2 text-sm'>
              <input
                type='number'
                min='1'
                max='180'
                value={minutes}
                disabled={running}
                onChange={(e) => changeMinutes(e.target.value)}
                className={`w-16 rounded-lg px-2 py-1 text-center outline-none disabled:opacity-50 ${t.timerField}`}
              />
              <span className={t.muted}>minutes</span>
            </div>

            {/* CONTROLS */}
            <div className='mt-4 flex gap-2'>
              {running ? (
                <button
                  type='button'
                  onClick={pauseTimer}
                  className={`flex-1 cursor-pointer rounded-full py-2 text-sm font-medium active:scale-95 ${t.primary}`}
                >
                  Pause
                </button>
              ) : (
                <button
                  type='button'
                  onClick={startTimer}
                  className={`flex-1 cursor-pointer rounded-full py-2 text-sm font-medium active:scale-95 ${t.primary}`}
                >
                  {timeLeft > 0 && timeLeft < minutes * 60 && !finished ? 'Resume' : 'Start'}
                </button>
              )}
              <button
                type='button'
                onClick={resetTimer}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium active:scale-95 ${t.chipIdle}`}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* EMPTY STATES */}
        {task.length === 0 && (
          <p className={`mt-16 text-center ${t.muted}`}>
            No notes yet. Write your first note above.
          </p>
        )}

        {task.length > 0 && filteredNotes.length === 0 && (
          <p className={`mt-16 text-center ${t.muted}`}>
            No notes match your search.
          </p>
        )}

        {/* PINNED NOTES */}
        {pinnedNotes.length > 0 && (
          <section className='mt-10'>
            <h2 className={`mb-3 text-sm font-semibold ${t.section}`}>Pinned</h2>
            <div className={gridClass}>{pinnedNotes.map(renderNote)}</div>
          </section>
        )}

        {/* OTHER NOTES */}
        {otherNotes.length > 0 && (
          <section className='mt-10'>
            {pinnedNotes.length > 0 && (
              <h2 className={`mb-3 text-sm font-semibold ${t.section}`}>Others</h2>
            )}
            <div className={gridClass}>{otherNotes.map(renderNote)}</div>
          </section>
        )}

      </main>
    </div>
  )
}

export default App