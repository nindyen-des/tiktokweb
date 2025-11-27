import { useState, useEffect } from 'react';
import { Play, Square, TrendingUp, Heart, Eye, Activity } from 'lucide-react';
import { startBoost, getBoostStatus, stopBoost } from '../lib/api';
import { supabase } from '../lib/supabase';

interface BoostInterfaceProps {
  accessKeyId: string;
}

export default function BoostInterface({ accessKeyId }: BoostInterfaceProps) {
  const [url, setUrl] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    success: 0,
    failed: 0
  });

  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      try {
        const status = await getBoostStatus(sessionId);
        if (status.stats) {
          setStats({
            totalViews: status.stats.totalViews,
            totalLikes: status.stats.totalLikes,
            success: status.stats.success,
            failed: status.stats.failed
          });

          await supabase
            .from('boost_sessions')
            .update({
              total_views: status.stats.totalViews,
              total_likes: status.stats.totalLikes,
              success_count: status.stats.success,
              failed_count: status.stats.failed,
              last_update: new Date().toISOString()
            })
            .eq('id', sessionId);
        }
      } catch (err) {
        console.error('Failed to update stats:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId]);

  const handleStart = async () => {
    if (!url.trim()) {
      setError('Please enter a TikTok URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await startBoost(url);

      if (!result.success) {
        setError(result.error || 'Failed to start boost');
        return;
      }

      const { data: session } = await supabase
        .from('boost_sessions')
        .insert({
          access_key_id: accessKeyId,
          tiktok_url: url,
          is_active: true
        })
        .select()
        .single();

      if (session) {
        setSessionId(session.id);
      }
    } catch (err) {
      setError('Failed to start boost session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!sessionId) return;

    try {
      await stopBoost(sessionId);
      await supabase
        .from('boost_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      setSessionId(null);
      setUrl('');
      setStats({ totalViews: 0, totalLikes: 0, success: 0, failed: 0 });
    } catch (err) {
      console.error('Failed to stop session:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TikTok Boost</h1>
          <p className="text-gray-400">Increase your TikTok engagement</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                TikTok Video URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://tiktok.com/@username/video/..."
                disabled={!!sessionId}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              {!sessionId ? (
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {loading ? 'Starting...' : 'Start Boost'}
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  Stop Boost
                </button>
              )}
            </div>
          </div>
        </div>

        {sessionId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Eye className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Views</p>
                  <p className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-pink-500/20 p-3 rounded-lg">
                  <Heart className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Likes</p>
                  <p className="text-2xl font-bold text-white">{stats.totalLikes.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Successful Boosts</p>
                  <p className="text-2xl font-bold text-white">{stats.success}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.success + stats.failed > 0
                      ? Math.round((stats.success / (stats.success + stats.failed)) * 100)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
