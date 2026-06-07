import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Pencil, Check, X } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/LanguageContext";

const ADMIN_EMAILS = ["berenfeldran@gmail.com", "sivanaltar@gmail.com"];

const SECTIONS = [
  { key: "about_me",       titleKey: "home_section_about_title",    image: "/images/main-1.jpeg" },
  { key: "satya_method",   titleKey: "home_section_satya_title",    image: "/images/main-2.png"  },
  { key: "how_it_works",   titleKey: "home_section_howworks_title", image: "/images/main-4.jpeg" },
  { key: "coaching_value", titleKey: "home_section_value_title",    image: "/images/main-3.jpeg" },
];

function Section({ section, content, dir, isAdmin, onSave, index }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content || "");
  const isEven = index % 2 === 0;

  useEffect(() => {
    if (!editing) setDraft(content || "");
  }, [content]);

  return (
    <div className={`py-14 px-6 md:px-16 ${isEven ? "bg-white" : "bg-[#f8f5f0]"}`}>
      <div className="max-w-5xl mx-auto">
        <div className={`flex flex-col md:flex-row gap-10 items-start ${isEven ? "" : "md:flex-row-reverse"}`}>
          <div className="w-full md:w-[30%] flex-shrink-0 md:mt-[3.25rem]">
            <img src={section.image} alt={t(section.titleKey)} className="w-full h-72 object-cover rounded-2xl shadow-md" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-[#4a8fa0]">{t(section.titleKey)}</h2>
              {isAdmin && !editing && (
                <button
                  onClick={() => { setDraft(content || ""); setEditing(true); }}
                  className="p-1.5 rounded-lg bg-[#f0f9fb] text-[#4a8fa0] hover:bg-[#4a8fa0] hover:text-white transition-colors"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
            {editing ? (
              <div>
                <RichTextEditor value={draft} onChange={setDraft} height={400} />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => { onSave(section.key, draft); setEditing(false); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#4a8fa0] text-white rounded-lg text-sm"
                  >
                    <Check size={14} /> {t("save")}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm"
                  >
                    <X size={14} /> {t("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="prose prose-lg max-w-none text-[#3a3a4a] leading-relaxed [&>ul]:list-disc [&>ul]:ps-6 [&>li]:mb-1"
                dir={dir}
                dangerouslySetInnerHTML={{ __html: content || "" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { lang, dir } = useLang();
  const { user } = useAuth();
  const [pageContents, setPageContents] = useState({});

  useEffect(() => {
    loadContents();
  }, [lang]);

  const loadContents = async () => {
    const items = await base44.entities.PageContent.filter({ lang });
    const map = {};
    items.forEach(item => { map[item.key] = item.content; });
    setPageContents(map);
  };

  const handleSave = async (key, content) => {
    const existing = await base44.entities.PageContent.filter({ key, lang });
    if (existing.length > 0) {
      await base44.entities.PageContent.update(existing[0].id, { content });
    } else {
      await base44.entities.PageContent.create({ key, content, lang });
    }
    setPageContents(prev => ({ ...prev, [key]: content }));
  };

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  return (
    <div dir={dir}>
      {/* Hero */}
      <section
        className="relative min-h-[40vh] md:min-h-[45vh] flex items-center justify-center bg-cover bg-center py-8"
        style={{ backgroundImage: "url('/images/main-3.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <blockquote className="text-2xl md:text-3xl font-bold text-[#f0e8c0] mb-3 leading-relaxed">
            {t("home_quote")}
          </blockquote>
          <p className="text-lg text-white/80 mb-6">{t("home_quote_author")}</p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-5 text-white text-lg leading-relaxed mb-8">
            <p>{t("home_hero_text")}</p>
            <p className="mt-2 text-sm opacity-90">{t("home_hero_sub")}</p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to={createPageUrl("Calendar")}
              className="inline-block bg-[#c8a96e] hover:bg-[#b8994e] text-white font-semibold px-8 py-3 rounded-full text-lg transition-colors shadow-lg"
            >
              {t("home_cta_book")}
            </Link>
            <Link
              to={createPageUrl("Contact")}
              className="inline-block border-2 border-white hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-full text-lg transition-colors"
            >
              {t("home_cta_contact")}
            </Link>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      {SECTIONS.map((section, index) => (
        <Section
          key={section.key}
          section={section}
          content={pageContents[section.key]}
          dir={dir}
          isAdmin={isAdmin}
          onSave={handleSave}
          index={index}
        />
      ))}

      {/* CTA */}
      <div className="bg-[#4a8fa0] text-white text-center py-12 px-6">
        <h2 className="text-2xl font-bold mb-3">{t("home_cta_title")}</h2>
        <p className="mb-6 opacity-90">{t("home_cta_sub")}</p>
        <Link
          to={createPageUrl("Calendar")}
          className="inline-block bg-white text-[#4a8fa0] font-semibold px-8 py-3 rounded-full text-lg hover:bg-[#f0f9fb] transition-colors"
        >
          {t("home_cta_book")}
        </Link>
      </div>
    </div>
  );
}
