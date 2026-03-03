import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Credential } from '../../lib/supabase';
import { LogOut, Plus, Search, Key, Lock, FileText, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { CredentialForm } from './CredentialForm';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'api_key' | 'password' | 'note'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [visibleValues, setVisibleValues] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCredentials();
  }, []);

  useEffect(() => {
    filterCredentials();
  }, [credentials, searchQuery, selectedType]);

  const fetchCredentials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCredentials(data);
    }
    setLoading(false);
  };

  const filterCredentials = () => {
    let filtered = credentials;

    if (selectedType !== 'all') {
      filtered = filtered.filter(c => c.type === selectedType);
    }

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCredentials(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) return;

    const { error } = await supabase
      .from('credentials')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchCredentials();
    }
  };

  const toggleValueVisibility = (id: string) => {
    setVisibleValues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api_key':
        return <Key className="w-5 h-5" />;
      case 'password':
        return <Lock className="w-5 h-5" />;
      case 'note':
        return <FileText className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'api_key':
        return 'bg-blue-100 text-blue-800';
      case 'password':
        return 'bg-green-100 text-green-800';
      case 'note':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showForm || editingCredential) {
    return (
      <CredentialForm
        credential={editingCredential}
        onClose={() => {
          setShowForm(false);
          setEditingCredential(null);
        }}
        onSuccess={() => {
          setShowForm(false);
          setEditingCredential(null);
          fetchCredentials();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Credential Vault</h1>
              <p className="text-sm text-slate-600 mt-1">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="api_key">API Keys</option>
              <option value="password">Passwords</option>
              <option value="note">Notes</option>
            </select>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCredentials.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No credentials found</h3>
            <p className="text-slate-600 mb-4">Get started by adding your first credential</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Credential
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCredentials.map((credential) => (
              <div
                key={credential.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${getTypeColor(credential.type)}`}>
                      {getTypeIcon(credential.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {credential.title}
                      </h3>
                      {credential.url && (
                        <a
                          href={credential.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {credential.url}
                        </a>
                      )}
                      {credential.description && (
                        <p className="text-sm text-slate-600 mt-2">{credential.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCredential(credential)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(credential.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {credential.username && (
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Username
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-mono">
                          {credential.username}
                        </code>
                        <button
                          onClick={() => copyToClipboard(credential.username!)}
                          className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {credential.type === 'note' ? 'Content' : 'Value'}
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm font-mono overflow-x-auto">
                        {visibleValues.has(credential.id) ? credential.value : '••••••••••••'}
                      </code>
                      <button
                        onClick={() => toggleValueVisibility(credential.id)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                      >
                        {visibleValues.has(credential.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(credential.value)}
                        className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  Created {new Date(credential.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
