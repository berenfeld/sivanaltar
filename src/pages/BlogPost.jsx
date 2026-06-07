import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, ArrowLeft, Save, Eye, EyeOff, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/LanguageContext";
import RichTextEditor from "@/components/RichTextEditor";

const ADMIN_EMAILS = ["berenfeldran@gmail.com", "sivanaltar@gmail.com"];

export default function BlogPost() {
  const { t } = useTranslation();
  const { lang, dir } = useLang();
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const isNew = params.get("new") === "1";
  const viewOnly = params.get("view") === "1";

  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [form, setForm] = useState({ title: "", summary: "", content: "", category: lang === 'en' ? "Reflections" : "הגיגים", published: false, image_url: "", lang });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editMode, setEditMode] = useState(isNew);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
    if (postId) loadPost();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    const items = await base44.entities.BlogPost.filter({ id: postId });
    if (items.length > 0) {
      const p = items[0];
      setPost(p);
      setForm({ title: p.title || "", summary: p.summary || "", content: p.content || "", category: p.category || "", published: p.published || false, image_url: p.image_url || "", lang: p.lang || 'he' });
    }
    setLoading(false);
  };

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const handleSave = async () => {
    setSaving(true);
    if (isNew || !postId) {
      const created = await base44.entities.BlogPost.create({ ...form, lang });
      window.location.href = createPageUrl("BlogPost") + `?id=${created.id}`;
    } else {
      await base44.entities.BlogPost.update(postId, form);
      setPost({ ...post, ...form });
      setEditMode(false);
    }
    setSaving(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, image_url: file_url }));
    setUploadingImage(false);
  };

  const dateLocale = lang === 'en' ? 'en-US' : 'he-IL';
  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[#4a8fa0] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // View mode
  if (viewOnly && post && !editMode) {
    return (
      <div dir={dir} className="min-h-screen bg-[#f8f5f0]">
        {post.image_url && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-3xl mx-auto px-6 py-10">
          <Link to={createPageUrl("Blog")} className="inline-flex items-center gap-1 text-[#4a8fa0] mb-6 hover:underline">
            <BackArrow size={16} /> {t("blog_back")}
          </Link>
          {post.category && (
            <span className="text-xs bg-[#f0e8d8] text-[#c8a96e] px-2 py-0.5 rounded-full font-medium ms-2">{post.category}</span>
          )}
          <h1 className="text-3xl font-bold text-[#3a3a4a] mt-3 mb-2 leading-snug">{post.title}</h1>
          {post.publish_date && (
            <p className="text-sm text-[#aaa] mb-6">
              {t("blog_updated")}: {new Date(post.publish_date).toLocaleDateString(dateLocale, { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
          <div
            className="prose prose-lg max-w-none text-[#3a3a4a] leading-relaxed [&>ul]:list-disc [&>ul]:ps-6"
            dir={dir}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          {isAdmin && (
            <button
              onClick={() => setEditMode(true)}
              className="mt-8 flex items-center gap-2 bg-[#4a8fa0] text-white px-4 py-2 rounded-lg text-sm"
            >
              {t("blog_edit_post")}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Admin edit/create mode
  if (!isAdmin) {
    return (
      <div dir={dir} className="flex items-center justify-center min-h-screen">
        <p className="text-[#999]">{t("blog_no_access")}</p>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-[#f8f5f0]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl("Blog")} className="inline-flex items-center gap-1 text-[#4a8fa0] hover:underline">
            <BackArrow size={16} /> {t("blog_back")}
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm(prev => ({ ...prev, published: !prev.published }))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${form.published ? "bg-[#4a8fa0] text-white" : "bg-yellow-100 text-yellow-700"}`}
            >
              {form.published ? <><Eye size={14} /> {t("blog_published")}</> : <><EyeOff size={14} /> {t("blog_unpublished")}</>}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-[#c8a96e] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#b8994e] transition-colors"
            >
              <Save size={14} />
              {saving ? t("blog_saving") : t("blog_save")}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div>
            {form.image_url ? (
              <div className="relative">
                <img src={form.image_url} alt="cover" className="w-full h-48 object-cover rounded-xl" />
                <button
                  onClick={() => setForm(prev => ({ ...prev, image_url: "" }))}
                  className="absolute top-2 start-2 bg-white/80 rounded-full p-1 hover:bg-white"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-[#c8a96e] rounded-xl cursor-pointer hover:bg-[#fdf8f0] transition-colors">
                <Upload size={24} className="text-[#c8a96e] mb-2" />
                <span className="text-sm text-[#999]">{uploadingImage ? t("blog_uploading") : t("blog_upload_cover")}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
            )}
          </div>

          <input
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder={t("blog_title_placeholder")}
            className="w-full text-2xl font-bold text-[#3a3a4a] border-none outline-none bg-transparent placeholder:text-[#ccc]"
            dir={dir}
          />

          <input
            value={form.category}
            onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
            placeholder={t("blog_category_placeholder")}
            className="w-full text-sm border border-[#e8e0d4] rounded-lg px-3 py-2 outline-none focus:border-[#4a8fa0] bg-transparent"
            dir={dir}
          />

          <textarea
            value={form.summary}
            onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
            placeholder={t("blog_summary_placeholder")}
            rows={2}
            className="w-full text-sm border border-[#e8e0d4] rounded-lg px-3 py-2 outline-none focus:border-[#4a8fa0] bg-transparent resize-none"
            dir={dir}
          />

          <div>
            <RichTextEditor
              value={form.content}
              onChange={val => setForm(prev => ({ ...prev, content: val }))}
              height={500}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
