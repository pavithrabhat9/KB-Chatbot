import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, X, BookOpen, Search } from 'lucide-react';
import {
  subscribeToArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../utils/firebase';
import useAuthStore from '../context/authStore';
import Toast from './Toast';

const KnowledgeBaseManager = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToArticles((data) => {
      setArticles(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, key: Date.now() });
  };

  const openCreateModal = () => {
    setEditingArticle(null);
    setTitle('');
    setContent('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (article) => {
    setEditingArticle(article);
    setTitle(article.title || '');
    setContent(article.content || '');
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingArticle(null);
    setTitle('');
    setContent('');
    setFormError('');
  };

  const validateForm = () => {
    if (!title.trim()) { setFormError('Title is required'); return false; }
    if (title.trim().length > 200) { setFormError('Title must be less than 200 characters'); return false; }
    if (!content.trim()) { setFormError('Content is required'); return false; }
    if (content.trim().length < 50) { setFormError('Content must be at least 50 characters'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editingArticle) {
        await updateArticle(editingArticle.id, { title: title.trim(), content: content.trim() });
        showToast('Article updated successfully', 'success');
      } else {
        await createArticle({ title: title.trim(), content: content.trim(), createdBy: user?.fullName || 'Unknown' });
        showToast('Article created successfully', 'success');
      }
      closeModal();
    } catch (error) {
      showToast('Failed to save article. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteArticle(id);
      showToast('Article deleted successfully', 'success');
      setShowDeleteConfirm(null);
    } catch (error) {
      showToast('Failed to delete article. Please try again.', 'error');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return 'Just now';
    return timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredArticles = articles.filter(
    (article) =>
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 dark:text-[#F1E9E9]">
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-[#982598]" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-[#F1E9E9]">Knowledge Base Articles</h2>
          <span className="text-sm text-gray-500 dark:text-[#E491C9]/60 bg-gray-100 dark:bg-[#0e0f29] px-2.5 py-0.5 rounded-full">{articles.length} articles</span>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-[#982598] hover:bg-[#7a1e7a] text-white px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Create Article
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-2 border border-[#982598]/20 dark:border-[#982598]/30 rounded-lg focus:ring-2 focus:ring-[#982598] focus:border-transparent outline-none bg-white dark:bg-[#0e0f29] text-gray-800 dark:text-[#F1E9E9]" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#982598]" /></div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20 text-gray-500 dark:text-[#E491C9]/60">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-[#E491C9]/30" />
          <p className="text-lg font-medium">No articles yet</p>
          <p className="text-sm mt-1">{articles.length === 0 ? 'Click "Create Article" to add your first knowledge base article.' : 'No articles match your search.'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#982598]/10 dark:border-[#982598]/20">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-[#E491C9]/60 uppercase tracking-wider">ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-[#E491C9]/60 uppercase tracking-wider">Title</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-[#E491C9]/60 uppercase tracking-wider">Content Preview</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-[#E491C9]/60 uppercase tracking-wider">Created</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-[#E491C9]/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#982598]/5 dark:divide-[#982598]/20">
              {filteredArticles.map((article, index) => (
                <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-[#0e0f29] transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-500">#{index + 1}</td>
                  <td className="py-3 px-4"><p className="text-sm font-medium text-gray-900 dark:text-[#F1E9E9]">{article.title}</p></td>
                  <td className="py-3 px-4"><p className="text-sm text-gray-600 dark:text-[#E491C9]/80 truncate max-w-xs">{article.content?.substring(0, 100)}{(article.content?.length || 0) > 100 ? '...' : ''}</p></td>
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(article.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(article)} className="p-1.5 text-[#982598] hover:bg-[#982598]/10 dark:hover:bg-[#982598]/20 rounded-lg transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setShowDeleteConfirm(article.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white dark:bg-[#15173D] rounded-2xl shadow-xl w-full max-w-lg p-6 z-50 border border-[#982598]/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-[#F1E9E9]">{editingArticle ? 'Edit Article' : 'Create Article'}</h3>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-[#0e0f29]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#E491C9] mb-1.5">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder="Enter article title"
                  className="w-full px-3 py-2 border border-[#982598]/20 dark:border-[#982598]/30 rounded-lg focus:ring-2 focus:ring-[#982598] focus:border-transparent outline-none bg-white dark:bg-[#0e0f29] text-gray-800 dark:text-[#F1E9E9]" />
                <p className="text-xs text-gray-400 mt-1">{title.length}/200 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[#E491C9] mb-1.5">Content * (min 50 characters)</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Enter article content..."
                  className="w-full px-3 py-2 border border-[#982598]/20 dark:border-[#982598]/30 rounded-lg focus:ring-2 focus:ring-[#982598] focus:border-transparent outline-none resize-none bg-white dark:bg-[#0e0f29] text-gray-800 dark:text-[#F1E9E9]" />
                <p className="text-xs text-gray-400 mt-1">{content.length} characters</p>
              </div>
              {formError && <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg text-sm">{formError}</div>}
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 px-4 py-2.5 border border-[#982598]/20 dark:border-[#982598]/30 text-gray-700 dark:text-[#E491C9] rounded-lg hover:bg-gray-50 dark:hover:bg-[#0e0f29] transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 bg-[#982598] hover:bg-[#7a1e7a] disabled:bg-[#982598]/50 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editingArticle ? 'Update Article' : 'Save Article'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-[#15173D] rounded-2xl shadow-xl w-full max-w-md p-6 z-50 border border-[#982598]/20">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-[#F1E9E9] mb-2">Delete Article</h3>
            <p className="text-sm text-gray-600 dark:text-[#E491C9]/80 mb-6">Are you sure you want to delete this article? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-[#982598]/20 dark:border-[#982598]/30 text-gray-700 dark:text-[#E491C9] rounded-lg hover:bg-gray-50 dark:hover:bg-[#0e0f29] transition-colors">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseManager;