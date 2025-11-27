import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Calendar, Key as KeyIcon, RefreshCw } from 'lucide-react';
import { supabase, AccessKey } from '../lib/supabase';

const ADMIN_PASSWORD = 'titi123';

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [durationType, setDurationType] = useState<'1day' | '2day' | '3day' | 'lifetime'>('1day');

  useEffect(() => {
    if (authenticated) {
      loadKeys();
    }
  }, [authenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const loadKeys = async () => {
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('access_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setKeys(data || []);
    } catch (err) {
      console.error('Failed to load keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) key += '-';
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    return key;
  };

  const calculateExpiry = (type: string) => {
    if (type === 'lifetime') return null;
    const days = parseInt(type);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry.toISOString();
  };

  const createKey = async () => {
    setLoading(true);
    try {
      const newKey = generateKey();
      const expiresAt = calculateExpiry(durationType);

      const { error: dbError } = await supabase
        .from('access_keys')
        .insert({
          key: newKey,
          duration_type: durationType,
          expires_at: expiresAt,
          is_active: true,
          used_count: 0
        });

      if (dbError) throw dbError;
      await loadKeys();
    } catch (err) {
      console.error('Failed to create key:', err);
      setError('Failed to create key');
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (id: string) => {
    try {
      const { error: dbError } = await supabase
        .from('access_keys')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      await loadKeys();
    } catch (err) {
      console.error('Failed to delete key:', err);
    }
  };

  const toggleKeyStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error: dbError } = await supabase
        .from('access_keys')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (dbError) throw dbError;
      await loadKeys();
    } catch (err) {
      console.error('Failed to toggle key status:', err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-500 p-4 rounded-full">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-white mb-2">
              Admin Access
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Enter admin password to continue
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-400">Manage access keys</p>
          </div>
          <a
            href="?admin=false"
            className="text-gray-400 hover:text-blue-400 text-sm transition"
          >
            Back to App
          </a>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Generate New Key</h2>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration Type
              </label>
              <select
                value={durationType}
                onChange={(e) => setDurationType(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="1day">1 Day</option>
                <option value="2day">2 Days</option>
                <option value="3day">3 Days</option>
                <option value="lifetime">Lifetime Access</option>
              </select>
            </div>

            <button
              onClick={createKey}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Generate Key
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Access Keys</h2>
            <button
              onClick={loadKeys}
              disabled={loading}
              className="text-gray-400 hover:text-white transition"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {keys.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No keys generated yet</p>
            ) : (
              keys.map((key) => (
                <div
                  key={key.id}
                  className={`bg-gray-900 rounded-lg p-4 border ${
                    isExpired(key.expires_at)
                      ? 'border-red-500/30'
                      : key.is_active
                      ? 'border-green-500/30'
                      : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <KeyIcon className="w-4 h-4 text-gray-400" />
                        <code className="text-blue-400 font-mono text-lg">{key.key}</code>
                        {isExpired(key.expires_at) && (
                          <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">
                            Expired
                          </span>
                        )}
                        {!isExpired(key.expires_at) && key.is_active && (
                          <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                            Active
                          </span>
                        )}
                        {!key.is_active && !isExpired(key.expires_at) && (
                          <span className="bg-gray-500/20 text-gray-400 text-xs px-2 py-1 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                      <div className="flex gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {key.duration_type === 'lifetime' ? 'Lifetime' : `${key.duration_type.replace('day', ' Day')}`}
                        </span>
                        <span>Expires: {formatDate(key.expires_at)}</span>
                        <span>Used: {key.used_count} times</span>
                        <span>Created: {formatDate(key.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleKeyStatus(key.id, key.is_active)}
                        className={`px-4 py-2 rounded-lg transition ${
                          key.is_active
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {key.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteKey(key.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
