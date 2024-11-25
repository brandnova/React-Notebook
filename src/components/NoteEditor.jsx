import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaExpandArrowsAlt, FaSave } from 'react-icons/fa';

const NoteEditor = ({ note, updateNote, categories, setIsFullScreen, isFullScreen }) => {
  const handleChange = (field, value) => {
    updateNote({ ...note, [field]: value });
  };

  return (
    <div className={`bg-white p-4 ${isFullScreen ? 'fixed inset-0 z-50' : 'flex-1'}`}>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={note.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="text-2xl font-bold w-full mr-2 focus:outline-none"
          placeholder="Note Title"
        />
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaExpandArrowsAlt />
        </button>
      </div>
      <div className="mb-4">
        <select
          value={note.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full p-2 border rounded"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <select
          value={note.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>
      <div className="mb-4">
        <input
          type="date"
          value={note.dueDate || ''}
          onChange={(e) => handleChange('dueDate', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <ReactQuill
        value={note.content}
        onChange={(content) => handleChange('content', content)}
        className="h-64 mb-4"
      />
      <button
        onClick={() => updateNote(note)}
        className="bg-green-500 text-white py-2 px-4 rounded flex items-center hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <FaSave className="mr-2" /> Save
      </button>
    </div>
  );
};

export default NoteEditor;