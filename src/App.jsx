import { useState, useEffect } from 'react'

const App = () => {

  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [search, setSearch] = useState('')
  const [editIndex, setEditIndex] = useState(null)

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

  const submitHandler = (e) => {
    e.preventDefault()

    // Validation: khaali title allow nahi
    if (title.trim() === '') {
      alert('Please enter a note heading')
      return
    }

    const copyTask = [...task]

    if (editIndex !== null) {
      // Edit mode: purana note update karo
      copyTask[editIndex] = { title, details }
      setEditIndex(null)
    } else {
      // Naya note add karo
      copyTask.push({ title, details })
    }

    setTask(copyTask)
    setTitle('')
    setDetails('')
  }

  const deleteNote = (idx) => {
    const copyTask = [...task]
    copyTask.splice(idx, 1)
    setTask(copyTask)

    // Agar edit hota hua note delete ho gaya to form reset karo
    if (editIndex === idx) {
      setEditIndex(null)
      setTitle('')
      setDetails('')
    } else if (editIndex !== null && idx < editIndex) {
      setEditIndex(editIndex - 1)
    }
  }

  const editNote = (idx) => {
    setTitle(task[idx].title)
    setDetails(task[idx].details)
    setEditIndex(idx)
  }

  const cancelEdit = () => {
    setEditIndex(null)
    setTitle('')
    setDetails('')
  }

  const clearAll = () => {
    if (window.confirm('Delete all notes?')) {
      setTask([])
      cancelEdit()
    }
  }

  // Search: original index bhi saath rakhte hain taaki edit/delete sahi note par chale
  const filteredNotes = task
    .map((elem, idx) => ({ ...elem, idx }))
    .filter((elem) => {
      const q = search.toLowerCase()
      return (
        elem.title.toLowerCase().includes(q) ||
        elem.details.toLowerCase().includes(q)
      )
    })

  return (
    <div className='h-screen lg:flex bg-black text-white'>

      <form onSubmit={(e) => {
        submitHandler(e)
      }} className='flex gap-4 lg:w-1/2 p-10 flex-col items-start'>

        <h1 className='text-4xl mb-2 font-bold'>
          {editIndex !== null ? 'Edit Note' : 'Add Notes'}
        </h1>

        {/* PEHLA INPUT FOR HEADING */}
        <input
          type="text"
          placeholder='Enter Notes Heading'
          className='px-5 w-full font-medium py-2 border-2 outline-none rounded '
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
          }}
        />

        {/* DETAILED VALA INPUT  */}
        <textarea
          className='px-5 w-full font-medium h-32 py-2 flex items-start flex-row border-2 outline-none  rounded '
          placeholder='Write Details here'
          value={details}
          onChange={(e) => {
            setDetails(e.target.value)
          }}
        />

        <button
          className='bg-white active:scale-95 font-medium w-full outline-none  text-black px-5 py-2 rounded'
        >
          {editIndex !== null ? 'Update Note' : 'Add Note'}
        </button>

        {editIndex !== null && (
          <button
            type="button"
            onClick={cancelEdit}
            className='border-2 active:scale-95 font-medium w-full outline-none px-5 py-2 rounded'
          >
            Cancel
          </button>
        )}

      </form>

      <div className='lg:w-1/2 lg:border-l-2 p-10'>

        <div className='flex items-center justify-between gap-4'>
          <h1 className='text-4xl font-bold'>Recent Notes ({task.length})</h1>
          {task.length > 0 && (
            <button
              onClick={clearAll}
              className='cursor-pointer active:scale-95 bg-red-500 px-3 py-1 text-xs rounded font-bold text-white'
            >
              Clear All
            </button>
          )}
        </div>

        {/* SEARCH BAR */}
        <input
          type="text"
          placeholder='Search notes...'
          className='mt-5 px-5 w-full font-medium py-2 border-2 outline-none rounded'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
        />

        <div className='flex flex-wrap items-start justify-start gap-5 mt-6 h-[75%] overflow-auto'>

          {task.length === 0 && (
            <p className='text-gray-400'>No notes yet. Add your first note.</p>
          )}

          {task.length > 0 && filteredNotes.length === 0 && (
            <p className='text-gray-400'>No notes match your search.</p>
          )}

          {filteredNotes.map(function (elem) {

            return <div key={elem.idx} className=" flex justify-between flex-col items-start relative h-52 w-40 bg-cover rounded-xl text-black pt-9 pb-4 px-4 bg-[url('https://static.vecteezy.com/system/resources/previews/037/152/677/non_2x/sticky-note-paper-background-free-png.png')]">
              <div className='overflow-hidden'>
                <h3 className='leading-tight text-lg font-bold'>{elem.title}</h3>
                <p className='mt-2 leading-tight text-xs font-semibold text-gray-600'>{elem.details}</p>
              </div>
              <div className='flex gap-2 w-full'>
                <button onClick={() => {
                  editNote(elem.idx)
                }} className='w-1/2 cursor-pointer active:scale-95 bg-blue-500 py-1 text-xs rounded font-bold text-white'>Edit</button>
                <button onClick={() => {
                  deleteNote(elem.idx)
                }} className='w-1/2 cursor-pointer active:scale-95 bg-red-500 py-1 text-xs rounded font-bold text-white'>Delete</button>
              </div>
            </div>
          })}
        </div>
      </div>
    </div>
  )
}

export default App