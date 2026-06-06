import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { BookOpen, Image, Mail, Calendar, Menu, X } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import FloatingChat from "@/components/FloatingChat";

const ADMIN_EMAILS = ["berenfeldran@gmail.com", "sivanaltar@gmail.com"];

const navLinks = [
  { label: "בלוג", page: "Blog", icon: BookOpen },
  { label: "גלריה", page: "Gallery", icon: Image },
  { label: "יומן", page: "Calendar", icon: Calendar },
  { label: "צור קשר", page: "Contact", icon: Mail },
];

const PAGE_TITLES = {
  Home: "בית",
  Blog: "בלוג",
  Gallery: "גלריה",
  Calendar: "יומן",
  Contact: "צור קשר",
};
const SITE_NAME = "סיון אלטרוביץ מאמנת רגשית בשיטת סאטיה";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    const pageLabel = PAGE_TITLES[currentPageName];
    document.title = pageLabel ? `${pageLabel} - ${SITE_NAME}` : SITE_NAME;
    window.scrollTo(0, 0);
  }, [currentPageName]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f5f0] text-[#3a3a4a] flex flex-col">
      <style>{`
        :root {
          --teal: #4a8fa0;
          --teal-light: #6ab0c0;
          --teal-dark: #2d6b7a;
          --warm: #c8a96e;
          --warm-light: #f0e8d8;
          --bg: #f8f5f0;
          --text: #3a3a4a;
        }
        body { direction: rtl; }
        .nav-link-active { border-bottom: 2px solid var(--teal); color: var(--teal); }
        .btn-primary { background-color: var(--teal); color: white; }
        .btn-primary:hover { background-color: var(--teal-dark); }
      `}</style>

      <FloatingChat />

      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-8 py-2 bg-white shadow-sm sticky top-0 z-50">
        <Link to={createPageUrl("Home")} className="flex items-center gap-3">
          <img
            src="/images/logo.png"
            alt="סיון אלטרוביץ"
            className="h-12 w-auto"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </Link>

        <nav className="flex items-center gap-8">
          {navLinks.map(({ label, page, icon: Icon }) => (
            <Link
              key={page}
              to={createPageUrl(page)}
              className={`flex items-center gap-2 hover:text-[#4a8fa0] transition-colors ${
                currentPageName === page ? "text-[#4a8fa0]" : "text-[#3a3a4a]"
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <span className="text-xs bg-[#4a8fa0] text-white px-2 py-1 rounded-full">מנהל</span>
              )}
              <button
                onClick={() => setLogoutConfirm(true)}
                className="text-sm text-[#4a8fa0] hover:underline"
              >
                התנתק
              </button>
            </div>
          ) : (
            <button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="text-sm btn-primary px-4 py-2 rounded-lg font-medium"
            >
              התחבר
            </button>
          )}
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-2 bg-white shadow-sm sticky top-0 z-50">
        <Link to={createPageUrl("Home")}>
          <img
            src="/images/logo.png"
            alt="סיון אלטרוביץ"
            className="h-10 w-auto"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#e8e0d4] z-40">
          {navLinks.map(({ label, page, icon: Icon }) => (
            <Link
              key={page}
              to={createPageUrl(page)}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-base font-medium border-b border-[#f0ebe3] hover:bg-[#f8f5f0] hover:text-[#4a8fa0] ${
                currentPageName === page ? "text-[#4a8fa0]" : "text-[#3a3a4a]"
              }`}
            >
              {Icon && <Icon size={20} />}
              {label}
            </Link>
          ))}
          {user ? (
            <div className="px-6 py-3 flex items-center gap-3">
              {isAdmin && <span className="text-xs bg-[#4a8fa0] text-white px-2 py-1 rounded-full">מנהל</span>}
              <button onClick={() => setLogoutConfirm(true)} className="text-sm text-[#4a8fa0]">התנתק</button>
            </div>
          ) : (
            <div className="px-6 py-3">
              <button
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="text-sm btn-primary px-4 py-2 rounded-lg font-medium"
              >
                התחבר
              </button>
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Social Footer */}
      <div className="md:hidden bg-[#2d6b7a] text-white py-4 px-4 flex justify-center gap-3 pb-20">
        <a href="https://www.facebook.com/sivanaltar" target="_blank" rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-[#1877F2]/15 border border-[#1877F2] hover:bg-[#1877F2]/30 flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="https://www.instagram.com/sivanaltar" target="_blank" rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-[#E1306C]/15 border border-[#E1306C] hover:bg-[#E1306C]/30 flex items-center justify-center transition-colors">
          <svg className="w-5 h-5" fill="url(#ig-grad-mobile)" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="ig-grad-mobile" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F58529"/>
                <stop offset="50%" stopColor="#E1306C"/>
                <stop offset="100%" stopColor="#833AB4"/>
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path fill="#2d6b7a" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r="0.7" fill="#2d6b7a"/>
          </svg>
        </a>
        <a href="mailto:sivanaltar@gmail.com"
          className="w-10 h-10 rounded-full bg-[#EA4335]/15 border border-[#EA4335] hover:bg-[#EA4335]/30 flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-[#EA4335]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </a>
        <a href="https://wa.me/972545999671" target="_blank" rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-[#25D366]/15 border border-[#25D366] hover:bg-[#25D366]/30 flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        </a>
        <a href="tel:+972545999671"
          className="w-10 h-10 rounded-full bg-[#34A853]/15 border border-[#34A853] hover:bg-[#34A853]/30 flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-[#34A853]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </a>
      </div>

      {/* Footer */}
      <footer className="hidden md:block bg-[#2d6b7a] text-white py-10 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="לוגו"
              className="h-10 w-auto opacity-90"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <p className="font-semibold text-lg">סיון אלטרוביץ</p>
              <p className="text-sm opacity-75">מאמנת רגשית בשיטת סאטיה</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a href="https://www.facebook.com/sivanaltar" target="_blank" rel="noopener noreferrer" title="פייסבוק"
              className="w-10 h-10 rounded-full bg-[#1877F2]/15 border border-[#1877F2] hover:bg-[#1877F2]/30 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://www.instagram.com/sivanaltar" target="_blank" rel="noopener noreferrer" title="אינסטגרם"
              className="w-10 h-10 rounded-full bg-[#E1306C]/15 border border-[#E1306C] hover:bg-[#E1306C]/30 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5" fill="url(#ig-grad-footer)" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="ig-grad-footer" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F58529"/>
                    <stop offset="50%" stopColor="#E1306C"/>
                    <stop offset="100%" stopColor="#833AB4"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path fill="#2d6b7a" d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r="0.7" fill="#2d6b7a"/>
              </svg>
            </a>
            <a href="mailto:sivanaltar@gmail.com" title="אימייל"
              className="w-10 h-10 rounded-full bg-[#EA4335]/15 border border-[#EA4335] hover:bg-[#EA4335]/30 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-[#EA4335]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
            <a href="https://wa.me/972545999671" target="_blank" rel="noopener noreferrer" title="וואטסאפ"
              className="w-10 h-10 rounded-full bg-[#25D366]/15 border border-[#25D366] hover:bg-[#25D366]/30 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
            </a>
            <a href="tel:+972545999671" title="טלפון"
              className="w-10 h-10 rounded-full bg-[#34A853]/15 border border-[#34A853] hover:bg-[#34A853]/30 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-[#34A853]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
          </div>
        </div>
        <div className="text-center text-xs opacity-50 mt-6">© 2026 סיון אלטרוביץ. כל הזכויות שמורות.</div>
      </footer>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutConfirm}
        title="התנתקות"
        message="האם אתה בטוח שברצונך להתנתק?"
        onConfirm={() => base44.auth.logout()}
        onCancel={() => setLogoutConfirm(false)}
        confirmLabel="התנתק"
        confirmClassName="bg-red-500 hover:bg-red-600 text-white"
      />

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8e0d4] z-50 flex">
        {navLinks.map(({ label, page, icon: Icon }) => (
          <Link
            key={page}
            to={createPageUrl(page)}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
              currentPageName === page ? "text-[#4a8fa0]" : "text-[#999]"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}