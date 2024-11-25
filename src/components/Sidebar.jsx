import React, { useState } from 'react';
import { FaBook, FaPlus } from 'react-icons/fa';

const Sidebar = ({ categories, currentCategory, setCurrentCategory, addCategory }) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <FaBook className="mr-2" /> Notebook
      </h1>
      <ul className="space-y-2">
        <li>
          <button
            className={`w-full text-left py-2 px-4 rounded ${
              currentCategory === 'All' ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
            onClick={() => setCurrentCategory('All')}
          >
            All Notes
          </button>
        </li>
        {categories.map((category) => (
          <li key={category}>
            <button
              className={`w-full text-left py-2 px-4 rounded ${
                currentCategory === category ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
              onClick={() => setCurrentCategory(category)}
            >
              {category}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddCategory} className="mt-4">
        <div className="flex">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className="flex-1 py-2 px-3 bg-gray-700 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-3 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <FaPlus />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Sidebar;