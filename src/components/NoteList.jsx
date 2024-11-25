import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FaPlus, FaTrash } from 'react-icons/fa';

const NoteItem = ({ note, onClick, onDelete, index, moveNote }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'NOTE',
    item: { id: note.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'NOTE',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      moveNote(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const ref = React.useRef(null);
  const dragDropRef = drag(drop(ref));

  return (
    <div
      ref={dragDropRef}
      className={`flex items-center justify-between p-3 bg-white rounded-lg shadow mb-2 cursor-pointer ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={() => onClick(note)}
    >
      <div>
        <h3 className="font-semibold">{note.title}</h3>
        <p className="text-sm text-gray-500">{note.category}</p>
      </div>
      <div className="flex items-center">
        <span className="text-sm text-gray-500 mr-2">{note.status}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
          className="text-red-500 hover:text-red-700"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

const NoteList = ({ notes, currentCategory, setCurrentNote, addNote, deleteNote }) => {
  const filteredNotes = currentCategory === 'All'
    ? notes
    : notes.filter(note => note.category === currentCategory);

  const moveNote = React.useCallback((dragIndex, hoverIndex) => {
    const dragNote = filteredNotes[dragIndex];
    const newNotes = [...filteredNotes];
    newNotes.splice(dragIndex, 1);
    newNotes.splice(hoverIndex, 0, dragNote);
    // Update the notes array in the parent component
  }, [filteredNotes]);

  return (
    <div className="w-1/3 bg-gray-200 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notes</h2>
        <button
          onClick={addNote}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FaPlus />
        </button>
      </div>
      {filteredNotes.map((note, index) => (
        <NoteItem
          key={note.id}
          note={note}
          onClick={setCurrentNote}
          onDelete={deleteNote}
          index={index}
          moveNote={moveNote}
        />
      ))}
    </div>
  );
};

export default NoteList;