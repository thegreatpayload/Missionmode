
import React, { useState, useMemo } from 'react';
import type { Note, RainbowColor } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Save, X, Palette, Search } from 'lucide-react';
import { COLOR_MAP } from '../constants';
import ColorPicker from './ColorPicker';

interface NotesProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const NoteCard: React.FC<{ note: Note; onDelete: (id: string) => void; onUpdate: (id: string, title: string, content: string, color: RainbowColor | null) => void; }> = ({ note, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);

  const handleSave = () => {
    onUpdate(note.id, editedTitle, editedContent, note.color);
    setIsEditing(false);
  };

  const handleColorSelect = (color: RainbowColor) => {
    onUpdate(note.id, note.title, note.content, color);
    setIsColorPickerOpen(false);
  }
  
  const handleClearColor = () => {
    onUpdate(note.id, note.title, note.content, null);
    setIsColorPickerOpen(false);
  };

  const colorClasses = note.color ? `${COLOR_MAP[note.color].bg} border-l-4 ${COLOR_MAP[note.color].border}` : 'bg-white dark:bg-gray-800';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`p-4 rounded-lg shadow-md transition-colors ${colorClasses}`}
    >
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <input type="text" value={editedTitle} onChange={e => setEditedTitle(e.target.value)} className="text-lg font-bold bg-transparent border-b border-gray-400 focus:outline-none"/>
          <textarea value={editedContent} onChange={e => setEditedContent(e.target.value)} className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded-md h-24 resize-none focus:outline-none"/>
        </div>
      ) : (
        <div>
          <h3 className="font-bold break-words">{note.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 break-words whitespace-pre-wrap">{note.content}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{new Date(note.createdAt).toLocaleDateString()}</p>
        </div>
      )}
      <div className="flex items-center justify-end gap-2 mt-3">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="p-1.5 hover:text-green-500"><Save size={16} /></button>
            <button onClick={() => setIsEditing(false)} className="p-1.5 hover:text-gray-500"><X size={16} /></button>
          </>
        ) : (
          <>
            <button onClick={() => setIsColorPickerOpen(!isColorPickerOpen)} className="p-1.5 hover:text-indigo-500"><Palette size={16} /></button>
            <button onClick={() => setIsEditing(true)} className="p-1.5 hover:text-blue-500"><Edit size={16} /></button>
            <button onClick={() => onDelete(note.id)} className="p-1.5 hover:text-red-500"><Trash2 size={16} /></button>
          </>
        )}
      </div>
      <AnimatePresence>
        {isColorPickerOpen && (
            <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="mt-2">
                <ColorPicker onSelectColor={handleColorSelect} onClear={handleClearColor} />
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


const Notes: React.FC<NotesProps> = ({ notes, setNotes }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      const newNote: Note = {
        id: self.crypto.randomUUID(),
        title: title.trim(),
        content: content.trim(),
        color: null,
        createdAt: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
      setTitle('');
      setContent('');
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  const updateNote = (id: string, updatedTitle: string, updatedContent: string, updatedColor: RainbowColor | null) => {
    setNotes(notes.map(note => note.id === id ? { ...note, title: updatedTitle, content: updatedContent, color: updatedColor } : note));
  };

  const filteredNotes = useMemo(() => {
    if (!searchTerm) return notes;
    const lowercasedTerm = searchTerm.toLowerCase();
    return notes.filter(note =>
      note.title.toLowerCase().includes(lowercasedTerm) ||
      note.content.toLowerCase().includes(lowercasedTerm)
    );
  }, [notes, searchTerm]);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-2xl shadow-lg h-full flex flex-col max-h-[calc(100vh-8rem)]">
      <h2 className="text-xl font-bold mb-4">Notes</h2>
      <form onSubmit={addNote} className="mb-4 flex flex-col gap-2">
        <div className="relative">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Note Title" className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"/>
        </div>
        <div className="relative">
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Note content..." className="w-full p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 h-24 resize-none"/>
        </div>
        <button type="submit" className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition-colors">
          <Plus size={20} /> Add Note
        </button>
      </form>

      <div className="mb-4 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="w-full p-2 pl-10 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
          />
      </div>

      <div className="flex-grow overflow-y-auto pr-2">
        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotes.map(note => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} onUpdate={updateNote} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Notes;
