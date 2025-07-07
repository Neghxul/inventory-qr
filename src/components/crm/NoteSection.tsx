"use client";

import { useState } from 'react';
import { Note, User } from '@prisma/client';
import { toast } from 'react-hot-toast';

type NoteWithAuthor = Note & { author: User };

interface Props {
  companyId: string;
  notes: NoteWithAuthor[];
  setNotes: React.Dispatch<React.SetStateAction<NoteWithAuthor[]>>;
}

export function NotesSection({ companyId, notes, setNotes }: Props) {
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/crm/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, companyId }),
      });
      if (!res.ok) throw new Error('Failed to add note');
      const savedNote: NoteWithAuthor = await res.json();
      setNotes(prev => [savedNote, ...prev]);
      setNewNote('');
      toast.success('Note added');
    } catch (error) {
      toast.error('Could not add note');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add a note..."
        className="w-full p-2 bg-gray-800 rounded-md mb-2 text-white"
        rows={3}
      />
      <button onClick={handleAddNote} disabled={isLoading} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium disabled:bg-gray-500">
        {isLoading ? 'Adding...' : 'Add Note'}
      </button>

      <div className="mt-6 space-y-4">
        {notes.map(note => (
          <div key={note.id} className="p-3 bg-gray-800/50 rounded-lg">
            <p className="text-white text-sm whitespace-pre-wrap">{note.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              By {note.author?.name || 'Unknown User'} on {new Date(note.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}