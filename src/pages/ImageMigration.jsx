import { useState } from "react";
import { base44 } from "@/api/base44Client";

const IMAGES_TO_MIGRATE = [
  { key: "main-1", url: "https://www.sivanaltar.com/images/main-1.jpeg", label: "main-1.jpeg" },
  { key: "main-2", url: "https://www.sivanaltar.com/images/main-2.png", label: "main-2.png" },
  { key: "main-3", url: "https://www.sivanaltar.com/images/main-3.jpeg", label: "main-3.jpeg" },
  { key: "main-4", url: "https://www.sivanaltar.com/images/main-4.jpeg", label: "main-4.jpeg" },
  { key: "logo", url: "https://www.sivanaltar.com/images/logo.png", label: "logo.png" },
];

export default function ImageMigration() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const migrateAll = async () => {
    setLoading(true);
    for (const img of IMAGES_TO_MIGRATE) {
      try {
        setResults(prev => ({ ...prev, [img.key]: { status: "loading" } }));

        // Fetch the image as blob
        const response = await fetch(img.url);
        const blob = await response.blob();
        const file = new File([blob], img.label, { type: blob.type });

        // Upload to Base44
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        setResults(prev => ({ ...prev, [img.key]: { status: "done", url: file_url } }));
      } catch (e) {
        setResults(prev => ({ ...prev, [img.key]: { status: "error", error: e.message } }));
      }
    }
    setLoading(false);
  };

  const allDone = Object.values(results).filter(r => r.status === "done").length === IMAGES_TO_MIGRATE.length;

  return (
    <div dir="rtl" className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-[#4a8fa0]">העברת תמונות ל-Base44</h1>

      <button
        onClick={migrateAll}
        disabled={loading || allDone}
        className="mb-8 bg-[#4a8fa0] text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {loading ? "מעביר..." : allDone ? "הועבר בהצלחה!" : "התחל העברה"}
      </button>

      <div className="space-y-4">
        {IMAGES_TO_MIGRATE.map(img => {
          const r = results[img.key];
          return (
            <div key={img.key} className="bg-white rounded-xl p-4 shadow-sm border border-[#e8e0d4]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[#3a3a4a]">{img.label}</span>
                {r?.status === "loading" && <span className="text-blue-500 text-sm">מעלה...</span>}
                {r?.status === "done" && <span className="text-green-600 text-sm font-semibold">✓ הועלה</span>}
                {r?.status === "error" && <span className="text-red-500 text-sm">שגיאה</span>}
              </div>
              {r?.status === "done" && (
                <div>
                  <img src={r.url} alt={img.label} className="h-24 object-cover rounded-lg mb-2" />
                  <p className="text-xs text-gray-500 break-all font-mono bg-gray-50 p-2 rounded">{r.url}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allDone && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="font-bold text-green-700 mb-3">כל התמונות הועברו! העתק את ה-URLs הבאים:</p>
          {Object.entries(results).map(([key, r]) => (
            r.status === "done" && (
              <div key={key} className="mb-2">
                <span className="font-semibold text-sm">{key}:</span>
                <span className="text-xs text-gray-600 break-all font-mono ml-2">{r.url}</span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}