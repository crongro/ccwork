import { useState } from 'react';
import { NotesProvider, useNotes } from './context/NotesContext';
import { Layout } from './components/Layout';
import { NoteList } from './components/note/NoteList';
import { NoteEditor } from './components/note/NoteEditor';
import { TagPanel } from './components/tag/TagPanel';
import { useTagFilter } from './hooks/tag/useTagFilter';

function AppContent() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { notes } = useNotes();
  const { allTags, filteredNotes } = useTagFilter(notes, selectedTag);

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    setIsCreating(false);
  };

  const handleNewNote = () => {
    setSelectedNoteId(null);
    setIsCreating(true);
  };

  const handleDone = () => {
    setIsCreating(false);
  };

  const handleSelectTag = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag));
  };

  return (
    <Layout
      onNewNote={handleNewNote}
      sidebar={
        <>
          <TagPanel allTags={allTags} selectedTag={selectedTag} onSelectTag={handleSelectTag} />
          <NoteList
            selectedNoteId={selectedNoteId}
            onSelect={handleSelectNote}
            notes={filteredNotes}
          />
        </>
      }
      main={
        <NoteEditor selectedNoteId={selectedNoteId} isCreating={isCreating} onDone={handleDone} />
      }
    />
  );
}

function App() {
  return (
    <NotesProvider>
      <AppContent />
    </NotesProvider>
  );
}

export default App;
