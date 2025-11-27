import { useState, useEffect } from 'react';
import KeyValidator from './components/KeyValidator';
import BoostInterface from './components/BoostInterface';
import AdminPanel from './components/AdminPanel';

function App() {
  const [accessKeyId, setAccessKeyId] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowAdmin(params.get('admin') === 'true' || window.location.hash === '#/admin');
  }, []);

  if (showAdmin) {
    return <AdminPanel />;
  }

  if (!accessKeyId) {
    return <KeyValidator onValidKey={setAccessKeyId} />;
  }

  return <BoostInterface accessKeyId={accessKeyId} />;
}

export default App;
