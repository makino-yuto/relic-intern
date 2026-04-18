import { useState } from 'react';
import { PenLine } from 'lucide-react';
import { Page, DiaryEntry } from './types/diary';
import { useTheme } from './hooks/useTheme';
import { useDiaryEntries } from './hooks/useDiaryEntries';
import Navigation from './components/Navigation';
import WritePage from './pages/WritePage';
import CalendarPage from './pages/CalendarPage';
import ListPage from './pages/ListPage';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('list');
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [writeDate, setWriteDate] = useState<string | null>(null);
  const { colorId, sat, lit, selectColor, setSat, setLit } = useTheme();
  const { entries, saveEntry, deleteEntry } = useDiaryEntries();

  const handleNavigate = (page: Page) => {
    if (page !== 'write') {
      setEditingEntry(null);
      setWriteDate(null);
    }
    setCurrentPage(page);
  };

  const handleEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setCurrentPage('write');
  };

  const handleSave = async (entry: DiaryEntry) => {
    await saveEntry(entry);
    setEditingEntry(null);
    setWriteDate(null);
    setCurrentPage('list');
  };

  const handleBack = () => {
    setEditingEntry(null);
    setWriteDate(null);
    setCurrentPage('list');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'write':
        return (
          <WritePage
            editingEntry={editingEntry}
            initialDate={writeDate}
            onSave={handleSave}
            onBack={handleBack}
          />
        );
      case 'calendar':
        return <CalendarPage entries={entries} onNavigate={handleNavigate} onEdit={handleEdit} />;
      case 'settings':
        return (
          <SettingsPage
            colorId={colorId}
            sat={sat}
            lit={lit}
            onSelectColor={selectColor}
            onSetSat={setSat}
            onSetLit={setLit}
          />
        );
      case 'home':
        return <HomePage entries={entries} onNavigate={handleNavigate} onEdit={handleEdit} />;
      case 'list':
      default:
        return <ListPage entries={entries} onEdit={handleEdit} onDelete={deleteEntry} />;
    }
  };

  const showFab = currentPage !== 'write' && currentPage !== 'settings';

  return (
    <div className="min-h-screen bg-background">
      {renderPage()}
      {currentPage !== 'write' && (
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      {showFab && (
        <button
          onClick={() => handleNavigate('write')}
          className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ boxShadow: '0 4px 20px color-mix(in srgb, hsl(var(--primary)) 45%, transparent)' }}
        >
          <PenLine size={22} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
