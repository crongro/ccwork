import { useState } from 'react';
import { NotesProvider, useNotes } from './context/NotesContext';
import { Layout } from './components/Layout';
import { NoteList } from './components/note/NoteList';
import { NoteEditor } from './components/note/NoteEditor';
import { TagPanel } from './components/tag/TagPanel';
import { SearchBox } from './components/search/SearchBox';
import { useTagFilter } from './hooks/tag/useTagFilter';
import { useNoteFilter } from './hooks/search/useNoteFilter';

function AppContent() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const { notes } = useNotes();
  const { allTags, filteredNotes: tagFilteredNotes } = useTagFilter(notes, selectedTag);
  const searchFilteredNotes = useNoteFilter(notes, query);
  const filteredNotes = query.trim() === '' ? tagFilteredNotes : searchFilteredNotes;

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
          <SearchBox onChange={setQuery} />
          <NoteList
            selectedNoteId={selectedNoteId}
            onSelect={handleSelectNote}
            notes={filteredNotes}
            selectedTag={selectedTag}
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
