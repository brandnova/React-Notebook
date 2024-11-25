import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiMenu, FiPlus, FiSave, FiShare2, FiTrash2, FiSearch, FiChevronDown, FiChevronRight, FiX } from 'react-icons/fi';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

const NotebookApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Personal', notes: [] },
    { id: 2, name: 'Work', notes: [] },
    { id: 3, name: 'Ideas', notes: [] },
  ]);
  const [activeCategory, setActiveCategory] = useState(1);
  const [activeNote, setActiveNote] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [tags, setTags] = useState([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showCategoryDeleteConfirmation, setShowCategoryDeleteConfirmation] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const createNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      dueDate: '',
    };
    const updatedCategories = categories.map(cat =>
      cat.id === activeCategory ? { ...cat, notes: [...cat.notes, newNote] } : cat
    );
    setCategories(updatedCategories);
    setActiveNote(newNote.id);
    setTitle(newNote.title);
    setContent('');
    setTags([]);
    setDueDate('');
  };

  const saveNote = useCallback(() => {
    const updatedCategories = categories.map(cat =>
      cat.id === activeCategory
        ? {
            ...cat,
            notes: cat.notes.map(note =>
              note.id === activeNote
                ? { ...note, title, content, tags, dueDate }
                : note
            ),
          }
        : cat
    );
    setCategories(updatedCategories);
  }, [categories, activeCategory, activeNote, title, content, tags, dueDate]);

  const deleteNote = () => {
    const updatedCategories = categories.map(cat =>
      cat.id === activeCategory
        ? { ...cat, notes: cat.notes.filter(note => note.id !== activeNote) }
        : cat
    );
    setCategories(updatedCategories);
    setActiveNote(null);
    setTitle('');
    setContent('');
    setTags([]);
    setDueDate('');
    setShowDeleteConfirmation(false);
  };

  const deleteCategory = () => {
    if (categoryToDelete) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryToDelete);
      setCategories(updatedCategories);
      if (activeCategory === categoryToDelete) {
        setActiveCategory(updatedCategories[0]?.id);
        setActiveNote(null);
      }
      setCategoryToDelete(null);
      setShowCategoryDeleteConfirmation(false);
    }
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
    setShowTagInput(false);
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const toggleTagSelection = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const exportNote = (format) => {
    const noteToExport = categories
      .find(cat => cat.id === activeCategory)
      .notes.find(note => note.id === activeNote);

    if (!noteToExport) return;

    switch (format) {
      case 'txt':
        const content = `${noteToExport.title}\n\n${noteToExport.content.replace(/<[^>]*>/g, '')}`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(`blob, ${noteToExport.title}.txt`);
        break;
      case 'pdf':
        const doc = new jsPDF();
        doc.text(noteToExport.title, 10, 10);
        doc.setFontSize(12);
        doc.text(noteToExport.content.replace(/<[^>]*>/g, ''), 10, 20);
        doc.save(`${noteToExport.title}.pdf`);
        break;
      default:
        return;
    }
  };

  const shareNote = () => {
    const noteToShare = categories
      .find(cat => cat.id === activeCategory)
      .notes.find(note => note.id === activeNote);

    if (!noteToShare) return;

    if (navigator.share) {
      navigator.share({
        title: noteToShare.title,
        text: noteToShare.content.replace(/<[^>]*>/g, ''),
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      alert('Web Share API not supported in your browser');
    }
  };

  const filteredNotes = categories
    .find(cat => cat.id === activeCategory)
    ?.notes.filter(
      note =>
        (note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase())) &&
        (selectedTags.length === 0 || selectedTags.every(tag => note.tags.includes(tag)))
    ) || [];

  const allTags = Array.from(new Set(categories.flatMap(cat => cat.notes.flatMap(note => note.tags))));

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 mr-4"
            aria-label="Toggle Sidebar"
          >
            <FiMenu size={24} />
          </button>
          <h1 className="text-xl font-semibold">Interactive Notebook</h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={createNewNote}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
            aria-label="New Note"
          >
            <FiPlus size={24} />
          </button>
          <button
            onClick={saveNote}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
            aria-label="Save Note"
          >
            <FiSave size={24} />
          </button>
          <button
            onClick={shareNote}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
            aria-label="Share Note"
          >
            <FiShare2 size={24} />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <div
          className={`${
            isSidebarOpen ? (isMobile ? 'w-full absolute z-10' : 'w-64') : 'w-0'
          } bg-white shadow-lg transition-all duration-300 overflow-hidden flex flex-col`}
        >
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <ul>
              {categories.map(category => (
                <li key={category.id} className="mb-2">
                  <div className="flex items-center justify-between">
                    <button
                      className={`flex items-center w-full text-left p-2 rounded ${
                        activeCategory === category.id ? 'bg-gray-200' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        setActiveCategory(category.id);
                        toggleCategoryExpansion(category.id);
                        if (isMobile) setIsSidebarOpen(false);
                      }}
                    >
                      {expandedCategories[category.id] ? <FiChevronDown /> : <FiChevronRight />}
                      <span className="ml-2">{category.name}</span>
                    </button>
                    <button
                      onClick={() => {
                        setCategoryToDelete(category.id);
                        setShowCategoryDeleteConfirmation(true);
                      }}
                      className="p-1 text-red-500 hover:bg-red-100 rounded"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  {expandedCategories[category.id] && (
                    <ul className="ml-6 mt-2">
                      {category.notes.map(note => (
                        <li
                          key={note.id}
                          className={`p-2 cursor-pointer hover:bg-gray-100 rounded ${
                            activeNote === note.id ? 'bg-gray-200' : ''
                          }`}
                          onClick={() => {
                            setActiveNote(note.id);
                            setTitle(note.title);
                            setContent(note.content);
                            setTags(note.tags);
                            setDueDate(note.dueDate || '');
                            if (isMobile) setIsSidebarOpen(false);
                          }}
                        >
                          {note.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 border-t">
            <button
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
              onClick={() => {
                const name = prompt('Enter new category name:');
                if (name) {
                  setCategories([...categories, { id: Date.now(), name, notes: [] }]);
                }
              }}
            >
              Add Category
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search and Filter Bar */}
          <div className="bg-white p-4 shadow-md">
            <div className="max-w-3xl mx-auto">
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search notes..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTagSelection(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Note Editor */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {activeNote ? (
              <>
                {/* Editing Toolbar */}
                <div className="bg-gray-100 p-2 flex items-center space-x-2 flex-wrap">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-grow text-lg font-bold p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Note Title"
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <div className="flex space-x-2">
                    <button onClick={() => exportNote('txt')} className="p-1 hover:bg-gray-200 rounded" aria-label="Export as TXT">
                      TXT
                    </button>
                    <button onClick={() => exportNote('pdf')} className="p-1 hover:bg-gray-200 rounded" aria-label="Export as PDF">
                      PDF
                      </button>
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="p-1 hover:bg-gray-200 rounded text-red-500"
                      aria-label="Delete Note"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Note Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    className="h-full"
                  />
                </div>

                {/* Tags */}
                <div className="bg-gray-100 p-2 flex flex-wrap items-center">
                  {tags.map(tag => (
                    <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-2 mb-2">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 text-blue-600 hover:text-blue-800">
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                  {showTagInput ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="border rounded px-2 py-1 text-sm mr-2"
                        placeholder="New tag"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag();
                          }
                        }}
                      />
                      <button onClick={addTag} className="text-blue-600 hover:text-blue-800">
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowTagInput(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Tag
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a note or create a new one to start editing
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Note Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this note? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={deleteNote}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {showCategoryDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Category Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this category? All notes within this category will be permanently deleted. This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCategoryDeleteConfirmation(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={deleteCategory}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotebookApp;