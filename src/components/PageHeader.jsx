import { useLang } from "@/lib/LanguageContext";

export default function PageHeader({ icon: Icon, title, subtitle }) {
  const { dir } = useLang();
  return (
    <div dir={dir} className="bg-[#4a8fa0] text-white text-center py-8 md:py-14 px-6">
      <div className="flex items-center justify-center gap-2 mb-2">
        {Icon && <Icon size={28} className="flex-shrink-0 mt-0.5" />}
        <h1 className="text-2xl md:text-4xl font-bold">{title}</h1>
      </div>
      {subtitle && <p className="text-base md:text-lg opacity-90">{subtitle}</p>}
    </div>
  );
}