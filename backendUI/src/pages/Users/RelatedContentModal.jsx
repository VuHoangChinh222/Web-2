import React from 'react';
import { Trash2 } from 'lucide-react';
import GlassModal from '../../components/GlassModal';

const RelatedContentModal = ({
  isOpen,
  onClose,
  selectedUser,
  blogs,
  categoriesBlog,
  resolveImageUrl,
  deleteBlog,
  deleteUser,
  currentUser
}) => {
  const userBlogs = blogs.filter(b => Number(b.authorId) === Number(selectedUser?.id));

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Related records for account: ${selectedUser?.fullname || ''}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          Cannot delete this staff user due to existing database dependencies. Please delete the following associated blog posts first.
        </div>

        {/* Related Blogs Table */}
        <div className="overflow-x-auto glass-scrollbar max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-medium">
                <th className="py-2.5 pb-2">Article / Blog</th>
                <th className="py-2.5 pb-2">Category</th>
                <th className="py-2.5 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!selectedUser || userBlogs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-slate-500 font-semibold">
                    All associated articles have been cleared! You can now proceed to delete this user.
                  </td>
                </tr>
              ) : (
                userBlogs.map(blog => {
                  const category = categoriesBlog.find(c => c.id === blog.categoryId);
                  return (
                    <tr key={blog.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveImageUrl(blog.image)}
                            alt=""
                            className="w-10 h-7 rounded object-cover border border-white/10"
                          />
                          <span className="font-semibold text-white line-clamp-1 max-w-[320px]">
                            {blog.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-400">
                        {category ? category.name : 'Uncategorized'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete the article "${blog.title}"?`)) {
                              await deleteBlog(blog.id);
                            }
                          }}
                          className="p-1.5 rounded glass-btn text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
                          title="Delete article"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="glass-btn px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
          {selectedUser && userBlogs.length === 0 && (
            <button
              type="button"
              onClick={async () => {
                if (confirm(`Are you sure you want to permanently delete user account "${selectedUser.fullname}"?`)) {
                  const success = await deleteUser(selectedUser.id, currentUser?.id);
                  if (success) {
                    onClose();
                  }
                }
              }}
              className="glass-btn-primary px-5 py-2 rounded-xl text-xs font-semibold"
            >
              Delete Staff User
            </button>
          )}
        </div>
      </div>
    </GlassModal>
  );
};

export default RelatedContentModal;
