import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { FaExpand, FaCompress, FaMoon, FaSun, FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaChevronDown, FaBars } from 'react-icons/fa';

const ReactQuill = lazy(() => import('react-quill'));

import 'react-quill/dist/quill.snow.css';

const noteTemplates = {
  academic: { title: 'Academic Notes', content: '## Topic\n\n## Key Concepts\n\n## Summary\n\n## References' },
  work: { title: 'Work Notes', content: '## Project\n\n## Tasks\n\n## Deadlines\n\n## Action Items' },
  personal: { title: 'Personal Notes', content: '## Date\n\n## Thoughts\n\n## Goals\n\n## Reflections' },
};

const statusColors = {
  pending: '#FFA500',
  inProgress: '#4169E1',
  completed: '#32CD32',
  onHold: '#FF6347',
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

const Button = ({ children, onClick, className, variant = 'default', size = 'default', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'underline-offset-4 hover:underline text-primary',
  };
  const sizeStyles = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  />
));

const Select = ({ children, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left w-full">
      <div>
        <span className="rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
            id="options-menu"
            aria-haspopup="true"
            aria-expanded="true"
          >
            {value || placeholder}
            <FaChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
          </button>
        </span>
      </div>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          <div className="py-1" role="none">
            {React.Children.map(children, child => 
              React.cloneElement(child, {
                onClick: () => {
                  onChange(child.props.value);
                  setIsOpen(false);
                }
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SelectItem = ({ value, children, onClick }) => (
  <button
    onClick={onClick}
    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    role="menuitem"
  >
    {children}
  </button>
);

const Dialog = ({ open, onClose, children, fullScreen = false }) => {
  if (!open) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${fullScreen ? 'p-0' : 'p-4'} bg-black bg-opacity-50`}>
      <div className={`bg-white rounded-lg ${fullScreen ? 'w-full h-full' : 'max-w-4xl w-full'} overflow-auto`}>
        <div className="p-6 relative">
          {children}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

const ScrollArea = ({ className, children }) => (
  <div className={`overflow-auto ${className}`}>
    {children}
  </div>
);

const NotebookPage = ({ children, className = '' }) => {
  const lineHeight = '1.5rem';
  const pageColor = '#F0EAD6';
  const lineColor = '#A0C8E1';

  return (
    <div className={`bg-white shadow-md rounded-lg border-2 border-amber-200 relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[#F0EAD6] z-0"></div>
      <div 
        className="relative z-10 p-8 min-h-auto box-border"
        style={{
          backgroundImage: `
            linear-gradient(${pageColor} 1.4rem, ${lineColor} 1.45rem, ${lineColor} 1.5rem, ${pageColor} 1.5rem, ${pageColor} 2.9rem)`,
          backgroundSize: `100% ${lineHeight}`,
          backgroundAttachment: 'local',
        }}
      >
        <div 
          className="font-handwriting text-xl leading-[1.5] tracking-wide"
          style={{
            lineHeight,
            paddingTop: '0.25rem', // Adjust to align text with lines
          }}
        >
          {children}
        </div>
      </div>
      <div className="absolute top-0 left-[4rem] bottom-0 w-px bg-red-200 z-20"></div>
    </div>
  );
};

// Component One: Note List Item
const NoteListItem = ({ note, viewFullNote, truncateContent }) => (
  <div onClick={() => viewFullNote(note)} className="cursor-pointer mb-4">
    <NotebookPage>
      <h3 className="text-lg font-bold mb-2">{note.title}</h3>
      <div dangerouslySetInnerHTML={{ __html: truncateContent(note.content) }} className="mb-2" />
      <div className="flex justify-between items-center text-sm">
        <span>{note.category}</span>
        <span style={{ color: note.color }}>{note.status}</span>
      </div>
      {note.dueDate && (
        <div className="flex items-center mt-2 text-sm">
          <span className="mr-1">📅</span>
          {new Date(note.dueDate).toLocaleDateString()}
        </div>
      )}
    </NotebookPage>
  </div>
);

// Component Two: Full Note View
const FullNoteView = ({ selectedNote, isFullScreen }) => (
  <NotebookPage className="min-h-full p-6" isFullScreen={isFullScreen}>
    <h2 className="text-2xl font-bold mb-4">{selectedNote?.title}</h2>
    <div className="mt-4">
      <Suspense fallback={<div>Loading content...</div>}>
        <ReactQuill
          value={selectedNote?.content}
          readOnly={true}
          modules={{ toolbar: false }}
        />
      </Suspense>
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
        <span style={{ color: selectedNote?.color }}>{selectedNote?.status}</span>
        {selectedNote?.dueDate && (
          <div className="flex items-center mt-2 text-sm">
            <span className="mr-1">📅</span>
            {new Date(selectedNote.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  </NotebookPage>
);

// Component Three: Edit Note Dialog
const EditNoteDialog = ({ editingNote, setEditingNote, updateNote, isFullScreen, toggleFullScreen, isZenMode, toggleZenMode, statusColors }) => (
  <Dialog 
    open={!!editingNote} 
    onClose={() => setEditingNote(null)}
    fullScreen={isFullScreen}
  >
    <div className={`flex flex-col ${isFullScreen ? 'h-screen' : 'h-[90vh]'}`}>
      <div className="flex justify-between items-center mb-4 p-4">
        <h2 className="text-2xl font-bold">Edit Note</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={toggleZenMode}>
            {isZenMode ? <FaSun /> : <FaMoon />}
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullScreen}>
            {isFullScreen ? <FaCompress /> : <FaExpand />}
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-grow">
        <NotebookPage className={`min-h-full ${isZenMode ? 'bg-gray-900 text-white' : ''}`} isFullScreen={isFullScreen}>
          <Input
            type="text"
            value={editingNote?.title}
            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
            className="w-full mb-2"
          />
          <Suspense fallback={<div>Loading editor...</div>}>
            <ReactQuill
              value={editingNote?.content}
              onChange={(content) => setEditingNote({ ...editingNote, content })}
              className="mb-2"
              theme={isZenMode ? "bubble" : "snow"}
            />
          </Suspense>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
            <Select
              value={editingNote?.status}
              onChange={(value) => setEditingNote({ ...editingNote, status: value, color: statusColors[value]})}
              placeholder="Status"
            >
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inProgress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="onHold">On Hold</SelectItem>
            </Select>
            <Input
              type="date"
              value={editingNote?.dueDate || ''}
              onChange={(e) => setEditingNote({ ...editingNote, dueDate: e.target.value })}
              className="w-full sm:w-auto"
            />
          </div>
        </NotebookPage>
      </ScrollArea>
      <div className="flex justify-end space-x-2 mt-4 p-4">
        <Button onClick={() => updateNote(editingNote)}><FaSave className="mr-2" /> Save</Button>
        <Button variant="outline" onClick={() => setEditingNote(null)}><FaTimes className="mr-2" /> Cancel</Button>
      </div>
    </div>
  </Dialog>
);

export default function NotebookApp() {
  const [notes, setNotes] = useLocalStorage('notes', []);
  const [categories, setCategories] = useLocalStorage('categories', []);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isViewingFullNote, setIsViewingFullNote] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => 
      (selectedCategory ? note.category === selectedCategory : true) &&
      (searchTerm ? 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      : true)
    );
  }, [notes, selectedCategory, searchTerm]);

  

  const addCategory = () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setSelectedCategory(newCategory);
    }
  };

  const deleteCategory = (category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category}"? All notes in this category will be deleted.`)) {
      setCategories(categories.filter(cat => cat !== category));
      setNotes(notes.filter(note => note.category !== category));
      if (selectedCategory === category) {
        setSelectedCategory(null);
      }
    }
  };

  const addNote = (template = null) => {
    if (!selectedCategory) {
      alert('Please select or create a category first.');
      return;
    }
    const newNote = {
      id: Date.now().toString(),
      title: template ? noteTemplates[template].title : 'New Note',
      content: template ? noteTemplates[template].content : '',
      category: selectedCategory,
      status: 'pending',
      dueDate: null,
      color: statusColors.pending,
    };
    setNotes([...notes, newNote]);
    setEditingNote(newNote);
  };

  const updateNote = (updatedNote) => {
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
    setEditingNote(null);
    setSelectedNote(null);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    setSelectedNote(null);
  };

  const handleStatusChange = (note, status) => {
    const updatedNote = { ...note, status, color: statusColors[status] };
    updateNote(updatedNote);
  };

  const truncateContent = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substr(0, maxLength) + '...';
  };

  const viewFullNote = (note) => {
    setSelectedNote(note);
    setIsViewingFullNote(true);
  };

  const closeFullNote = () => {
    setSelectedNote(null);
    setIsViewingFullNote(false);
    setIsFullScreen(false);
  };

  const confirmDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(id);
      closeFullNote();
    }
  };

  const toggleZenMode = () => setIsZenMode(!isZenMode);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`flex h-screen ${isZenMode ? 'bg-gray-900 text-white' : 'bg-amber-50'} font-sans`}>
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden ${isZenMode ? 'bg-gray-800' : 'bg-amber-100'}`}>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          <Button onClick={addCategory} className="mb-4 w-full">
            <FaPlus className="mr-2" /> Add Category
          </Button>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li
                key={category}
                className={`p-2 rounded cursor-pointer flex justify-between items-center ${
                  selectedCategory === category ? 'bg-amber-200' : 'bg-white'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                <span>{category}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); deleteCategory(category); }}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`${isZenMode ? 'bg-gray-800' : 'bg-amber-100'} p-4 shadow-md flex justify-between items-center`}>
          <Button variant="ghost" onClick={toggleSidebar}>
            <FaBars />
          </Button>
          <h1 className="text-2xl font-bold">Notebook App</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={toggleZenMode}>
              {isZenMode ? <FaSun /> : <FaMoon />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            <Select value="" onChange={(value) => addNote(value)} placeholder="Add Note">
              <SelectItem value="">Blank Note</SelectItem>
              <SelectItem value="academic">Academic Notes</SelectItem>
              <SelectItem value="work">Work Notes</SelectItem>
              <SelectItem value="personal">Personal Notes</SelectItem>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4">
            {filteredNotes.map((note) => (
              <NoteListItem key={note.id} note={note} viewFullNote={viewFullNote} truncateContent={truncateContent} />
            ))}
          </div>
        </main>
      </div>

      {/* Full Note View Dialog */}
      <Dialog open={isViewingFullNote} onClose={closeFullNote} fullScreen={isFullScreen}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{selectedNote?.title}</h2>
          <Button variant="outline" size="sm" onClick={toggleFullScreen}>
            {isFullScreen ? <FaCompress /> : <FaExpand />}
          </Button>
        </div>
        <ScrollArea className={`${isFullScreen ? 'h-[calc(100vh-10rem)]' : 'max-h-[60vh]'}`}>
          <FullNoteView selectedNote={selectedNote} isFullScreen={isFullScreen} />
        </ScrollArea>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={() => setEditingNote(selectedNote)}><FaEdit className="mr-2" /> Edit</Button>
          <Button variant="destructive" onClick={() => confirmDelete(selectedNote?.id)}><FaTrash className="mr-2" /> Delete</Button>
        </div>
      </Dialog>

      {/* Edit Note Dialog */}
      <EditNoteDialog 
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        updateNote={updateNote}
        isFullScreen={isFullScreen}
        toggleFullScreen={toggleFullScreen}
        isZenMode={isZenMode}
        toggleZenMode={toggleZenMode}
        statusColors={statusColors}
      />
    </div>
  );
}