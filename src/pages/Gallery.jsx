import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Check, Upload, ChevronLeft, ChevronRight, Image } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import PageHeader from "@/components/PageHeader";

const ADMIN_EMAILS = ["berenfeldran@gmail.com", "sivanaltar@gmail.com"];

function LightboxViewer({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const touchStartX = useRef(null);

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next, onClose]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? prev() : next();
    touchStartX.current = null;
  };

  const img = images[current];

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 left-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
        <X size={24} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 right-4 z-10 text-white/70 text-sm">{current + 1} / {images.length}</div>

      {/* Prev arrow */}
      <button onClick={prev} className="absolute right-3 md:right-6 z-10 p-2 md:p-3 bg-white/10 hover:bg-white/25 rounded-full text-white transition-colors" style={{top: "50%", transform: "translateY(-50%)"}}>
        <ChevronRight size={28} />
      </button>

      {/* Image */}
      <img
        src={img.image_url}
        alt={img.title}
        className="max-h-[75vh] max-w-[85vw] md:max-h-[80vh] object-contain select-none"
        draggable={false}
      />

      {/* Caption — below image, never overlapping */}
      {(img.title || img.subtitle) && (
        <div className="text-center px-6 mt-4 mb-20 md:mb-4 max-w-lg" dir="rtl">
          {img.title && <p className="font-semibold text-lg text-white">{img.title}</p>}
          {img.subtitle && <p className="text-sm text-white/80 mt-1">{img.subtitle}</p>}
        </div>
      )}

      {/* Next arrow */}
      <button onClick={next} className="absolute left-3 md:left-6 z-10 p-2 md:p-3 bg-white/10 hover:bg-white/25 rounded-full text-white transition-colors" style={{top: "50%", transform: "translateY(-50%)"}}>
        <ChevronLeft size={28} />
      </button>
    </div>
  );
}

function ImageCard({ img, isAdmin, onEdit, onDelete, onTogglePublish, onClick }) {
  return (
    <div className={`relative group rounded-2xl overflow-hidden shadow-md bg-white cursor-pointer ${!img.published ? "opacity-60 ring-2 ring-dashed ring-[#c8a96e]" : ""}`}>
      <img
        src={img.image_url}
        alt={img.title}
        className="w-full h-56 object-cover"
        onClick={onClick}
      />
      <div className="p-3 text-right">
        <h3 className="font-semibold text-[#3a3a4a] text-sm">{img.title}</h3>
        {img.subtitle && <p className="text-xs text-[#888] mt-0.5 line-clamp-2">{img.subtitle}</p>}
      </div>
      {isAdmin && (
        <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePublish(img)}
            className={`p-1.5 rounded-lg shadow text-white text-xs transition-colors ${img.published ? "bg-[#4a8fa0]" : "bg-yellow-500"}`}
            title={img.published ? "הסתר" : "פרסם"}
          >
            {img.published ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={() => onEdit(img)}
            className="p-1.5 rounded-lg shadow bg-white text-[#4a8fa0] hover:bg-[#f0f9fb]"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(img)}
            className="p-1.5 rounded-lg shadow bg-white text-red-400 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
      {isAdmin && !img.published && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">לא מפורסם</div>
      )}
    </div>
  );
}

function ImageModal({ image, onClose, onSave, isNew }) {
  const [form, setForm] = useState(image || { title: "", subtitle: "", image_url: "", published: true });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, image_url: file_url }));
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#3a3a4a]">{isNew ? "הוסף תמונה" : "ערוך תמונה"}</h3>
          <button onClick={onClose}><X size={20} className="text-[#999]" /></button>
        </div>

        <div className="space-y-3">
          {form.image_url ? (
            <div className="relative">
              <img src={form.image_url} alt="" className="w-full h-40 object-cover rounded-xl" />
              <button
                onClick={() => setForm(prev => ({ ...prev, image_url: "" }))}
                className="absolute top-2 left-2 bg-white/80 rounded-full p-1"
              ><X size={14} /></button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#c8a96e] rounded-xl cursor-pointer hover:bg-[#fdf8f0]">
              <Upload size={20} className="text-[#c8a96e] mb-1" />
              <span className="text-sm text-[#999]">{uploading ? "מעלה..." : "העלה תמונה"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          )}

          <input
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="כותרת"
            className="w-full border border-[#e8e0d4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a8fa0]"
          />
          <textarea
            value={form.subtitle}
            onChange={e => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
            placeholder="תיאור קצר"
            rows={2}
            className="w-full border border-[#e8e0d4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4a8fa0] resize-none"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => setForm(prev => ({ ...prev, published: e.target.checked }))} className="w-4 h-4 accent-[#4a8fa0]" />
            <span className="text-sm text-[#3a3a4a]">מפורסם (גלוי לציבור)</span>
          </label>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => onSave(form)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#4a8fa0] text-white py-2 rounded-lg font-medium text-sm hover:bg-[#2d6b7a]"
          >
            <Check size={14} /> שמור
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#e8e0d4] text-sm text-[#666]">
            בטל
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [draggedId, setDraggedId] = useState(null);
  const [touchTarget, setTouchTarget] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const imgs = await base44.entities.GalleryImage.list("order");
    setImages(imgs);
    setLoading(false);
  };

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  const visibleImages = isAdmin ? images : images.filter(i => i.published);

  const handleSave = async (form) => {
    if (editingImage && editingImage.id) {
      await base44.entities.GalleryImage.update(editingImage.id, form);
    } else {
      await base44.entities.GalleryImage.create({ ...form, order: images.length + 1 });
    }
    setModalOpen(false);
    setEditingImage(null);
    loadImages();
  };

  const handleDelete = async () => {
    await base44.entities.GalleryImage.delete(deleteModal.id);
    setDeleteModal({ open: false, id: null });
    loadImages();
  };

  const handleTogglePublish = async (img) => {
    await base44.entities.GalleryImage.update(img.id, { published: !img.published });
    loadImages();
  };

  const handleDragStart = (e, imgId) => {
    setDraggedId(imgId);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const draggedIdx = images.findIndex(img => img.id === draggedId);
    const targetIdx = images.findIndex(img => img.id === targetId);

    const newImages = Array.from(images);
    const [movedImage] = newImages.splice(draggedIdx, 1);
    newImages.splice(targetIdx, 0, movedImage);

    setImages(newImages);
    setDraggedId(null);

    const updates = newImages.map((img, idx) => 
      base44.entities.GalleryImage.update(img.id, { order: idx + 1 })
    );
    await Promise.all(updates);
  };

  const handleTouchStart = (e, imgId) => {
    setDraggedId(imgId);
    setTouchTarget(imgId);
  };

  const handleTouchEnd = async (e, targetId) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setTouchTarget(null);
      return;
    }

    const draggedIdx = images.findIndex(img => img.id === draggedId);
    const targetIdx = images.findIndex(img => img.id === targetId);

    const newImages = Array.from(images);
    const [movedImage] = newImages.splice(draggedIdx, 1);
    newImages.splice(targetIdx, 0, movedImage);

    setImages(newImages);
    setDraggedId(null);
    setTouchTarget(null);

    const updates = newImages.map((img, idx) => 
      base44.entities.GalleryImage.update(img.id, { order: idx + 1 })
    );
    await Promise.all(updates);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f5f0]">
      <PageHeader 
        icon={Image}
        title="גלריה"
        subtitle="תמונות שצילמתי ואני אוהבת"
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {isAdmin && (
          <div className="mb-8 text-right">
            <button
              onClick={() => { setEditingImage(null); setModalOpen(true); }}
              className="inline-flex items-center gap-2 bg-[#4a8fa0] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#2d6b7a] transition-colors"
            >
              <Plus size={18} /> הוסף תמונה
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-56 animate-pulse" />
            ))}
          </div>
        ) : visibleImages.length === 0 ? (
          <div className="text-center text-[#999] py-20">
            <p className="text-xl">אין תמונות עדיין</p>
          </div>
        ) : isAdmin ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {visibleImages.map((img, idx) => (
              <div
                key={img.id}
                draggable
                onDragStart={(e) => handleDragStart(e, img.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, img.id)}
                onTouchStart={(e) => handleTouchStart(e, img.id)}
                onTouchEnd={(e) => handleTouchEnd(e, img.id)}
                className={`transition-opacity ${draggedId === img.id ? "opacity-40" : ""}`}
              >
                <ImageCard
                  img={img}
                  isAdmin={isAdmin}
                  onEdit={(img) => { setEditingImage(img); setModalOpen(true); }}
                  onDelete={(img) => setDeleteModal({ open: true, id: img.id })}
                  onTogglePublish={handleTogglePublish}
                  onClick={() => setLightboxIndex(idx)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {visibleImages.map((img, idx) => (
              <ImageCard
                key={img.id}
                img={img}
                isAdmin={isAdmin}
                onEdit={(img) => { setEditingImage(img); setModalOpen(true); }}
                onDelete={(img) => setDeleteModal({ open: true, id: img.id })}
                onTogglePublish={handleTogglePublish}
                onClick={() => setLightboxIndex(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <LightboxViewer
          images={visibleImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        title="מחיקת תמונה"
        message="האם אתה בטוח שברצונך למחוק את התמונה? פעולה זו אינה ניתנת לביטול."
        confirmLabel="מחק תמונה"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
      />

      {modalOpen && (
        <ImageModal
          image={editingImage}
          isNew={!editingImage?.id}
          onClose={() => { setModalOpen(false); setEditingImage(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}