import { useState, useEffect } from 'react';
import { supabase, Credential } from '../../lib/supabase';
import { X, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface CredentialFormProps {
  credential: Credential | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CredentialForm({ credential, onClose, onSuccess }: CredentialFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    type: 'password' as 'api_key' | 'password' | 'note',
    username: '',
    value: '',
    url: '',
    description: '',
  });

  useEffect(() => {
    if (credential) {
      setFormData({
        title: credential.title,
        type: credential.type,
        username: credential.username || '',
        value: credential.value,
        url: credential.url || '',
        description: credential.description || '',
      });
    }
  }, [credential]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.title || !formData.value) {
      setError('Title and value are required');
      setLoading(false);
      return;
    }

    const data = {
      ...formData,
      user_id: user?.id,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (credential) {
      result = await supabase
        .from('credentials')
        .update(data)
        .eq('id', credential.id);
    } else {
      result = await supabase
        .from('credentials')
        .insert([data]);
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      onSuccess();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              {credential ? 'Edit Credential' : 'Add New Credential'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="e.g., GitHub API Key, Gmail Password"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-2">
                Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="password">Password</option>
                <option value="api_key">API Key</option>
                <option value="note">Note</option>
              </select>
            </div>

            {formData.type === 'password' && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="username@example.com"
                />
              </div>
            )}

            <div>
              <label htmlFor="value" className="block text-sm font-medium text-slate-700 mb-2">
                {formData.type === 'note' ? 'Content *' : 'Value *'}
              </label>
              {formData.type === 'note' ? (
                <textarea
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-sm"
                  placeholder="Enter your note content..."
                />
              ) : (
                <input
                  id="value"
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-sm"
                  placeholder={formData.type === 'api_key' ? 'sk_live_...' : '••••••••'}
                />
              )}
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-2">
                URL
              </label>
              <input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Additional notes about this credential..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : credential ? 'Update Credential' : 'Save Credential'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
