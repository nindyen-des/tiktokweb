import { useState } from 'react';
import { Key } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface KeyValidatorProps {
  onValidKey: (keyId: string) => void;
}

export default function KeyValidator({ onValidKey }: KeyValidatorProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateKey = async () => {
    if (!key.trim()) {
      setError('Please enter an access key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: dbError } = await supabase
        .from('access_keys')
        .select('*')
        .eq('key', key.trim())
        .eq('is_active', true)
        .maybeSingle();

      if (dbError) throw dbError;

      if (!data) {
        setError('Invalid access key');
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError('This key has expired');
        return;
      }

      await supabase
        .from('access_keys')
        .update({ used_count: data.used_count + 1 })
        .eq('id', data.id);

      onValidKey(data.id);
    } catch (err) {
      setError('Failed to validate key');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-500 p-4 rounded-full">
              <Key className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-2">
            TikTok Boost
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Enter your access key to continue
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Access Key
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && validateKey()}
                placeholder="Enter your key"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              onClick={validateKey}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? 'Validating...' : 'Access'}
            </button>

            <a
              href="?admin=true"
              className="w-full block text-center text-gray-400 hover:text-blue-400 text-sm py-2 transition"
            >
              Admin Access
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
