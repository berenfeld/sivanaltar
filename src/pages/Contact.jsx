import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Phone, Mail, MapPin, Send, Check, MessageCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function Contact() {
  const [user, setUser] = useState(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user) {
      setForm(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setLoginPrompt(true);
      return;
    }
    if (!form.name || !form.email || !form.message) {
      setError("נא למלא את כל השדות החובה");
      return;
    }
    setSending(true);
    setError("");

    // Save to DB
    await base44.entities.ContactMessage.create(form);

    const emailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f5f0; padding: 0; border-radius: 12px; overflow: hidden; direction: rtl;">
        <div style="background: #4a8fa0; padding: 30px 20px; text-align: right; direction: rtl;">
          <img src="https://www.sivanaltar.com/images/logo.png" alt="לוגו" style="height: 60px; margin-bottom: 10px;" />
          <h1 style="color: white; margin: 0; font-size: 22px;">הודעה חדשה מהאתר</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 5px 0 0; font-size: 14px;">סיון אלטרוביץ – מאמנת רגשית</p>
        </div>
        <div style="padding: 30px 24px; background: white; text-align: right; direction: rtl;">
          <p style="color: #3a3a4a; font-size: 16px; margin-bottom: 20px;">הגיעה פנייה חדשה דרך אתר האינטרנט:</p>
          <table style="width: 100%; border-collapse: collapse; direction: rtl; text-align: right;">
            <tr style="border-bottom: 1px solid #f0ebe3;">
              <td style="padding: 10px 0; color: #4a8fa0; font-weight: bold; width: 100px;">שם:</td>
              <td style="padding: 10px 0; color: #3a3a4a;">${form.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0ebe3;">
              <td style="padding: 10px 0; color: #4a8fa0; font-weight: bold;">אימייל:</td>
              <td style="padding: 10px 0; color: #3a3a4a;">${form.email}</td>
            </tr>
            ${form.phone ? `<tr style="border-bottom: 1px solid #f0ebe3;">
              <td style="padding: 10px 0; color: #4a8fa0; font-weight: bold;">טלפון:</td>
              <td style="padding: 10px 0; color: #3a3a4a;">${form.phone}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 10px 0; color: #4a8fa0; font-weight: bold; vertical-align: top;">הודעה:</td>
              <td style="padding: 10px 0; color: #3a3a4a; line-height: 1.6;">${form.message.replace(/\n/g, "<br>")}</td>
            </tr>
          </table>
        </div>
        <div style="background: #f8f5f0; padding: 20px; text-align: right; border-top: 1px solid #e8e0d4; direction: rtl;">
          <p style="color: #888; font-size: 12px; margin: 0;">הודעה זו נשלחה מאתר sivanaltar.com</p>
        </div>
      </div>
    `;

    // Send to both admins — must succeed
    await Promise.all([
      base44.integrations.Core.SendEmail({
        to: "berenfeldran@gmail.com",
        subject: `פנייה חדשה מהאתר – ${form.name}`,
        body: emailHtml,
        from_name: "אתר סיון אלטרוביץ"
      }),
      base44.integrations.Core.SendEmail({
        to: "sivanaltar@gmail.com",
        subject: `פנייה חדשה מהאתר – ${form.name}`,
        body: emailHtml,
        from_name: "אתר סיון אלטרוביץ"
      })
    ]);

    // Try confirmation to sender — fail silently
    try {
      const confirmationHtml = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f5f0; padding: 0; border-radius: 12px; overflow: hidden; direction: rtl;">
          <div style="background: #4a8fa0; padding: 30px 20px; text-align: right; direction: rtl;">
            <img src="https://www.sivanaltar.com/images/logo.png" alt="לוגו" style="height: 60px; margin-bottom: 10px;" />
            <h1 style="color: white; margin: 0; font-size: 22px;">קיבלנו את פנייתך!</h1>
          </div>
          <div style="padding: 30px 24px; background: white; text-align: right; direction: rtl;">
            <p style="color: #3a3a4a; font-size: 16px;">שלום ${form.name},</p>
            <p style="color: #3a3a4a; line-height: 1.7;">תודה שפנית אלי! קיבלתי את הודעתך ואחזור אליך בהקדם האפשרי.</p>
            <p style="color: #3a3a4a; line-height: 1.7;">במידה ויש צורך דחוף, ניתן ליצור קשר ישיר בטלפון: <strong dir="ltr">054-5999671</strong></p>
            <p style="color: #4a8fa0; font-weight: bold; margin-top: 20px;">בברכה,<br/>סיון אלטרוביץ 🌿</p>
          </div>
          <div style="background: #f8f5f0; padding: 20px; text-align: right; border-top: 1px solid #e8e0d4; direction: rtl;">
            <p style="color: #888; font-size: 12px; margin: 0;">מאמנת רגשית בשיטת סאטיה | רמת השרון | פגישות אונליין</p>
          </div>
        </div>
      `;
      await base44.integrations.Core.SendEmail({
        to: form.email,
        subject: "קיבלנו את פנייתך – סיון אלטרוביץ",
        body: confirmationHtml,
        from_name: "סיון אלטרוביץ"
      });
    } catch (_) {
      // silent — user confirmation is best-effort
    }

    setSending(false);
    setSent(true);
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8f5f0]">
      <PageHeader 
        icon={Mail}
        title="צור קשר"
        subtitle="אשמח לשמוע מכם ולהתחיל את המסע יחד"
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#4a8fa0] mb-4">בואו לבקר</h2>
              <p className="text-[#555] leading-relaxed mb-6">
                פגשו את סיון וגלו את הזמנים המתאימים לכם לתחילת המסע האישי שלכם. מפגשים פנים אל פנים ברמת השרון, ומפגשי וידאו אונליין.
              </p>
              <Link
                to={createPageUrl("Calendar")}
                className="inline-block bg-[#4a8fa0] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#2d6b7a] transition-colors mb-6"
              >
                קבע פגישת הכרות
              </Link>
            </div>

            <div className="space-y-4">
              <a href="tel:+972545999671" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#f0f9fb] rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-[#4a8fa0]" />
                </div>
                <div>
                  <p className="text-xs text-[#999] mb-0.5">טלפון</p>
                  <p className="font-semibold text-[#3a3a4a]" dir="ltr">054-5999671</p>
                </div>
              </a>

              <a href="https://wa.me/972545999671" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#25D366]/15 border border-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                </div>
                <div>
                  <p className="text-xs text-[#999] mb-0.5">וואטסאפ</p>
                  <p className="font-semibold text-[#3a3a4a]" dir="ltr">054-5999671</p>
                </div>
              </a>

              <a href="mailto:sivanaltar@gmail.com" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-[#f0f9fb] rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-[#4a8fa0]" />
                </div>
                <div>
                  <p className="text-xs text-[#999] mb-0.5">אימייל</p>
                  <p className="font-semibold text-[#3a3a4a]">sivanaltar@gmail.com</p>
                </div>
              </a>

              <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-[#f0f9fb] rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-[#4a8fa0]" />
                </div>
                <div>
                  <p className="text-xs text-[#999] mb-0.5">מיקום</p>
                  <p className="font-semibold text-[#3a3a4a]">רמת השרון | פגישות אונליין</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            {sent ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-[#f0f9fb] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-[#4a8fa0]" />
                </div>
                <h3 className="text-xl font-bold text-[#3a3a4a] mb-2">ההודעה נשלחה!</h3>
                <p className="text-[#666]">תודה שפנית. אחזור אליך בהקדם האפשרי 🌿</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-[#4a8fa0] text-sm hover:underline"
                >
                  שלח הודעה נוספת
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                <h2 className="text-xl font-bold text-[#3a3a4a] mb-4">שלחו הודעה</h2>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg">{error}</div>
                )}

                <div>
                   <label className="block text-sm font-medium text-[#555] mb-1.5">שם מלא *</label>
                   <input
                     value={form.name}
                     onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                     autoComplete="name"
                     className="w-full border border-[#e8e0d4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4a8fa0] transition-colors"
                     placeholder="השם שלך"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-[#555] mb-1.5">כתובת אימייל *</label>
                   <input
                     type="email"
                     value={form.email}
                     disabled
                     className="w-full border border-[#e8e0d4] rounded-xl px-4 py-2.5 text-sm bg-[#f8f5f0] text-[#999] cursor-not-allowed"
                     dir="ltr"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-[#555] mb-1.5">טלפון (אופציונלי)</label>
                   <input
                     type="tel"
                     value={form.phone}
                     onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                     autoComplete="tel"
                     className="w-full border border-[#e8e0d4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4a8fa0] transition-colors"
                     placeholder="050-0000000"
                     dir="ltr"
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-[#555] mb-1.5">מטרת הפגישה *</label>
                   <p className="text-xs text-[#999] mb-2">מטרות הפגישה ונושאים שאתה רוצה להעלות בפגישה</p>
                   <textarea
                     value={form.message}
                     onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                     rows={5}
                     className="w-full border border-[#e8e0d4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4a8fa0] transition-colors resize-none"
                     placeholder="תאר לי את מה שמביא אותך..."
                   />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-[#4a8fa0] text-white py-3 rounded-xl font-semibold hover:bg-[#2d6b7a] transition-colors disabled:opacity-60"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Send size={16} /> שלח הודעה</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {loginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
            <h3 className="text-lg font-bold mb-2">התחבר למערכת</h3>
            <p className="text-[#777] mb-4">עליך להתחבר למערכת כדי לשלוח הודעה</p>
            <div className="flex gap-3">
              <button
                onClick={() => setLoginPrompt(false)}
                className="flex-1 py-2 px-4 border border-[#e8e0d4] rounded-lg hover:bg-[#f8f5f0]"
              >
                ביטול
              </button>
              <button
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="flex-1 py-2 px-4 bg-[#4a8fa0] text-white rounded-lg hover:bg-[#2d6b7a]"
              >
                התחבר
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}