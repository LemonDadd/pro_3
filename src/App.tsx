import { Routes, Route } from 'react-router-dom';
import Library from './pages/Library';
import Reader from './pages/Reader';
import Notes from './pages/Notes';
import Stats from './pages/Stats';
import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/reader/:bookId" element={<Reader />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </Layout>
  );
}

export default App;
