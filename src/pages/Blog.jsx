import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import PageHeader from "@/components/PageHeader";

const ADMIN_EMAILS = ["berenfeldran@gmail.com", "sivanaltar@gmail.com"];

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const all = await base44.entities.BlogPost.list("-created_date");
    setPosts(all);
    setLoading(false);
  };

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const visiblePosts = isAdmin ? posts : posts.filter(p => p.published);

  const handleDelete = async () => {
    await base44.entities.BlogPost.delete(deleteModal.id);
    setDeleteModal({ open: false, id: null });
    loadPosts();
  };

  const handleTogglePublish = async (post) => {
    await base44.entities.BlogPost.update(post.id, { published: !post.published });
    loadPosts();
  };

  const stripHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || div.innerText || "";
  };

  const truncateAtWord = (text, maxChars) => {
    if (text.length <= maxChars) return text;
    const truncated = text.slice(0, maxChars);
    const lastSpace = truncated.lastIndexOf(" ");
    return truncated.slice(0, lastSpace) + "...";
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f5f0]">
      <PageHeader 
        icon={BookOpen}
        title="בלוג"
        subtitle="שיתוף במחשבות והגיגים שלי"
      />

      <div className="max-w-4xl mx-auto px-4 py-10">
        {isAdmin && (
          <div className="mb-8 text-right">
            <Link
              to={createPageUrl("BlogPost") + "?new=1"}
              className="inline-flex items-center gap-2 bg-[#4a8fa0] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#2d6b7a] transition-colors"
            >
              <Plus size={18} />
              פוסט חדש
            </Link>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse h-40" />
            ))}
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="text-center text-[#999] py-20">
            <p className="text-xl">אין פוסטים עדיין</p>
          </div>
        ) : (
          <div className="space-y-8">
            {visiblePosts.map(post => (
              <article
                key={post.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${!post.published ? "opacity-60 border-2 border-dashed border-[#c8a96e]" : ""}`}
              >
                <div className="flex flex-col md:flex-row">
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full md:w-64 h-48 md:h-auto object-cover flex-shrink-0"
                    />
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.category && (
                          <span className="text-xs bg-[#f0e8d8] text-[#c8a96e] px-2 py-0.5 rounded-full font-medium">
                            {post.category}
                          </span>
                        )}
                        {isAdmin && !post.published && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                            לא מפורסם
                          </span>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleTogglePublish(post)}
                            className={`p-1.5 rounded-lg transition-colors ${post.published ? "text-[#4a8fa0] hover:bg-[#f0f9fb]" : "text-yellow-600 hover:bg-yellow-50"}`}
                            title={post.published ? "הסתר" : "פרסם"}
                          >
                            {post.published ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <Link
                            to={createPageUrl("BlogPost") + `?id=${post.id}`}
                            className="p-1.5 rounded-lg text-[#4a8fa0] hover:bg-[#f0f9fb] transition-colors"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: post.id })}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-[#3a3a4a] mb-2 leading-snug">{post.title}</h2>

                    <p className="text-[#666] text-sm leading-relaxed flex-1 mb-4">
                      {truncateAtWord(stripHtml(post.content), 400)}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#aaa]">
                        {post.publish_date ? new Date(post.publish_date).toLocaleDateString("he-IL", { year: "numeric", month: "long", day: "numeric" }) : ""}
                      </span>
                      <Link
                        to={createPageUrl("BlogPost") + `?id=${post.id}&view=1`}
                        className="text-[#4a8fa0] font-medium text-sm hover:underline"
                      >
                        קרא עוד ←
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={deleteModal.open}
        title="מחיקת פוסט"
        message="האם אתה בטוח שברצונך למחוק את הפוסט? פעולה זו אינה ניתנת לביטול."
        confirmLabel="מחק פוסט"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />
    </div>
  );
}