import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Pencil, Check, X } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

const ADMIN_EMAILS = ["berenfeldran@gmail.com", "sivanaltar@gmail.com"];

const DEFAULT_SECTIONS = [
  {
    key: "about_me",
    title: "בקצרה עלי",
    image: "/images/main-1.jpeg",
    defaultContent: `<p>נעים מאוד, אני סיון, מאמנת רגשית בשיטת סאטיה, המלווה אנשים בתהליכי צמיחה וחופש ומנהלת משאבי אנוש המחזיקה את המרחב שבו ארגון ואנשיו פועלים ומתפתחים.</p>
<p>את חיי אני חולקת עם רן, בן זוגי ושותפי לחיים, ואני אמא גאה לשלושה ילדים. הם המורים הגדולים ביותר שלי לשהות ונוכחות.</p>
<p>הרקע המקצועי שלי נשען על חיבור בין עומק רגשי להבנה ארגונית רחבה:</p>
<p>אני בעלת תואר ראשון בפסיכולוגיה וחינוך, תואר שני בהתנהגות ארגונית וניהול משאבי אנוש (אוניברסיטת תל אביב), והכשרות משלימות בגישור ובחשבות שכר. את הכשרתי כמאמנת רגשית רכשתי בבית הספר 'אימושיין'. השילוב הזה מאפשר לי להביא לקליניקה ולארגון מבט רחב, מדויק וחומל על המורכבות האנושית.</p>
<p>תחומי העניין שלי כוללים הכרות עם אנשים חדשים, תרבויות מגוונות, טיולים בטבע, יוגה, שנורקלינג, צילום, אופנה וקיימות.</p>
<p>במשך יותר מעשור שאני מנחה עובדים ומנהלים בתהליכי צמיחה ושינוי. יש לי הבנה עמוקה באתגרים העומדים בפני אנשים במקום העבודה המודרני, בהתפתחות קריירה ובאיזון החיוני בין החיים המקצועיים והאישיים.</p>
<p>אני מאמינה שלכל אחד יש נושא או תחום שמעסיק אותו. שהוא היה רוצה לשפר בחיים, להתבונן להעמיק ו/או לפעול אחרת. עבורי, בעקבות משבר שעברתי בחיים, פניתי לאימון רגשי.</p>
<p>בחרתי לעשות זאת בשיטת סאטיה, המאפשרת חקירה עצמית עמוקה דרך הקשבה, הכרות עם מנגנוני ההגנה והסרת האוטומטים שמנהלים אותנו.</p>
<p>האימון והתרגול אפשרו לי לפתח נינוחות ושמחה בחיי ולדייק את הבחירות שלי מתוך חופש פנימי.</p>
<p>חוויה זו הניעה אותי להעמיק בשיטה ולהפוך בעצמי למאמנת רגשית, כדי להעניק לאחרים את המרחב שבו יוכלו גם הם למצוא את העוצמה שבשקט ובנוכחות.</p>
<p>המטרה שלי היא להעניק לאחרים כלים נוספים למסעותיהם האישיים, בדומה למסע שלי.</p>
<p>אני משלבת את הידע והכלים שרכשתי משני התחומים ומציעה את כישורי ההקשבה שלי כדי לעזור למתאמנים שלי לקבל בהירות, להתחבר מחדש לעצמם ולקבל החלטות טובות יותר הן בחיים האישיים והן בקריירה.</p>`
  },
  {
    key: "satya_method",
    title: "מהי שיטת סאטיה",
    image: "/images/main-2.png",
    defaultContent: `<p>שיטת סאטיה היא שיטת עבודה הממוקדת במתן קשב עמוק וחומל לגוף ולנפש האדם.</p>
<p>מדובר על דרך אינטגרטיבית המבוססת על כלים מהפילוסופיה הבודהיסטית, הפילוסופיה האקזיסטנציאליסטית, ותרפיה מבוססת גוף, בשילוב עם כלים מעולם האימון המודרני.</p>
<p>מטרתה של שיטת סאטיה ללמד את האדם להיות ער לעצמו ולהכיר את האופן שבו הוא חי ופועל בחייו על מנת שיוכל לפתח חוסן נפשי, חמלה, שמחה ולהיות שלם עם בחירותיו תוך לקיחת אחריות אישית.</p>
<p>המפגשים מתנהלים במרחב בטוח וקשוב, תוך התמקדות בתחושות הגופניות, ברגשות ובתפיסות עולם המרכיבות את חוויות החיים של הלקוח.</p>
<p>באמצעות חקירה משותפת, הפניית תשומת הלב דרך הגוף תוך כדי התבוננות ומיקוד במקומות שנחווים כקשים ומאתגרים, ישנה הסתכלות עמוקה על האופן שבו מקומות אלו מעצבים את המציאות שלנו בחיי היומיום ובמערכות היחסים בחיינו.</p>
<p>שיטת סאטיה מציעה דרך חומלת, מכבדת וטרנספורמטיבית לריפוי, כך שתתפתח גישה לחופש פנימי ויצירה של אפשרויות חדשות.</p>
<p>שיטת סאטיה פותחה על ידי נטאלי בן דוד אלחנן העוסקת בהתפתחותו האפשרית של האדם וביצירת דרכי גישה וכלים להפחתת סבל על כל גווניו מתוך חזון ליצור עולם מיטיב יותר.</p>`
  },
  {
    key: "how_it_works",
    title: "איך זה עובד בעצם",
    image: "/images/main-4.jpeg",
    defaultContent: `<p>אז מה קורה בחדר האימון ואיך זה עובד בעצם?</p>
<h3>השלב הראשון: פגישת ההיכרות – מי אני? 🧭</h3>
<p>בשיחת הכרות קצרה תגלה כיצד שיטת סאטיה יכולה לתרום לך.</p>
<p>הכל מתחיל בשיחה אישית, מעמיקה ופתוחה בינינו. זו לא שיחת "פסיכולוג", אלא שיחה של הקשבה, הבנה והתבוננות משותפת. דרך סדרת שאלות מדויקות. אנחנו יוצאים יחד למסע גילוי שבו נבין:</p>
<p>מה עיצב אתכם? נבחן אירועים, חוויות ורגעים משמעותיים בחייכם שהפכו אתכם למי שאתם היום, עם כל החוזקות והעוצמות הייחודיות לכם.</p>
<p>מה באמת חשוב לכם בחיים? מהם הערכים שמניעים אתכם? מהם הרצונות העמוקים, השאיפות והחלומות שלכם לעתיד?</p>
<p>זוהי פגישה עוצמתית ונדירה, שתהווה את היסודות לכל העבודה המשותפת שלנו.</p>
<h3>השלב השני: מיפוי ותכנון הצמיחה האישית 🗺️</h3>
<p>אחרי שהכרנו לעומק, נמפה ונתכנן יחד את הצמיחה האישית באמצעות כלי עבודה יחודי שפותח למטרה זאת. חשבו עליו כמפה אישית שמציגה את החזון שלכם לעתיד ואת התחומים המרכזיים בחייכם שבהם תרצו ליצור שינוי ושיפור. הוא הופך את הרצונות והשאיפות שלכם למסלול פעולה ברור וממוקד.</p>
<h3>השלב השלישי: עבודה מעשית וצמיחה – צעד אחר צעד 👣</h3>
<p>במפגשים הבאים, נרד לעבודה קונקרטית על הנושאים שבחרתם בתכנון הצמיחה האישית. אתם מוזמנים להביא איתכם כל אתגר, דילמה, קושי רגשי או רצון לשינוי שעולה בכם. בחדר שלנו (פיזית או וירטואלית בוידאו), תמצאו:</p>
<ul>
<li>הקשבה מלאה ונוכחת: אני שם לכל מילה, לכל תחושה ולכל מה שעולה בכם.</li>
<li>הבנה עניינית וממוקדת: נדייק ונבין יחד את שורש הדברים.</li>
<li>התייחסות רגשית ואמפתית: ניתן מקום לכל רגש שעולה, נאפשר לו להיות ונלמד ממנו.</li>
</ul>
<p>הכל במרחב בטוח, מכיל ודיסקרטי לחלוטין.</p>
<p>במפגשים שלנו, קיימים רק אתם ואני, עם מטרה משותפת אחת: הטובה והצמיחה האישית שלכם.</p>`
  },
  {
    key: "coaching_value",
    title: "הערך באימון בשיטת סאטיה",
    image: "/images/main-3.jpeg",
    defaultContent: `<p>החיים הם כאן ועכשיו, פעם אחת ויחידה (לפחות בסיבוב הזה)!</p>
<p>המרחק בין חיים של פשרה לחיים מחוברים ומלאי השראה הוא דק כמו קרן אור.</p>
<p>יש בנו תשוקה עמוקה לחיות באמת, להרגיש חופש פנימי, ליצור קשרים עמוקים ומשמעותיים</p>
<p>אבל משהו תמיד עוצר אותנו - דפוסים ישנים, פחדים נסתרים, או פשוט הרגל להסתפק ב"בסדר"</p>
<p>ואולי זה בדיוק הזמן לעצור רגע ולשאול - מה היה קורה אם היינו מרשים לעצמנו להיות פגיעים, אותנטיים, אמיתיים?</p>
<h3>מה מאפשר האימון?</h3>
<ul>
<li>פיתוח חוסן מול אתגרים ותסכולים בחיי היום-יום</li>
<li>התמודדות עם שינויים ומשברים, למשל בקריירה</li>
<li>שיפור מערכות יחסים</li>
<li>עבודה על איזון פנימי וניהול לחצים</li>
<li>קידום התפתחות אישית וצמיחה</li>
</ul>
<p>אם קראת והתחברת, ואת או אתה מוכנ/ה לתהליך של צמיחה והתפתחות, אני מזמינה אותך לעצור ולעבור תהליך אישי במרחב שלי.</p>`
  }
];

function Section({ section, content, isAdmin, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content || section.defaultContent);
  const isEven = DEFAULT_SECTIONS.indexOf(section) % 2 === 0;

  return (
    <div className={`py-14 px-6 md:px-16 ${isEven ? "bg-white" : "bg-[#f8f5f0]"}`}>
      <div className="max-w-5xl mx-auto">
        <div className={`flex flex-col md:flex-row gap-10 items-start ${isEven ? "" : "md:flex-row-reverse"}`}>
          <div className="w-full md:w-[30%] flex-shrink-0 md:mt-[3.25rem]">
            <img
              src={section.image}
              alt={section.title}
              className="w-full h-72 object-cover rounded-2xl shadow-md"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-[#4a8fa0]">{section.title}</h2>
              {isAdmin && !editing && (
                <button
                  onClick={() => { setDraft(content || section.defaultContent); setEditing(true); }}
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
                    <Check size={14} /> שמור
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm"
                  >
                    <X size={14} /> בטל
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="prose prose-lg max-w-none text-[#3a3a4a] leading-relaxed [&>ul]:list-disc [&>ul]:pr-6 [&>li]:mb-1"
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: content || section.defaultContent }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [pageContents, setPageContents] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
    loadContents();
  }, []);

  const loadContents = async () => {
    const items = await base44.entities.PageContent.list();
    const map = {};
    items.forEach(item => { map[item.key] = item.content; });
    setPageContents(map);
  };

  const handleSave = async (key, content) => {
    const existing = await base44.entities.PageContent.filter({ key });
    if (existing.length > 0) {
      await base44.entities.PageContent.update(existing[0].id, { content });
    } else {
      await base44.entities.PageContent.create({ key, content });
    }
    setPageContents(prev => ({ ...prev, [key]: content }));
  };

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  return (
    <div dir="rtl">
      {/* Hero */}
      <section
        className="relative min-h-[40vh] md:min-h-[45vh] flex items-center justify-center bg-cover bg-center py-8"
        style={{ backgroundImage: "url('/images/main-3.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <blockquote className="text-2xl md:text-3xl font-bold text-[#f0e8c0] mb-3 leading-relaxed">
            "מי שמביט החוצה חולם, מי שמביט פנימה מתעורר"
          </blockquote>
          <p className="text-lg text-white/80 mb-6">קרל יונג</p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-5 text-white text-lg leading-relaxed mb-8">
            <p>גלה את הפוטנציאל הטמון בך וחווה חיים מלאים ומשמעותיים בעזרת אימון רגשי</p>
            <p className="mt-2 text-sm opacity-90">דרך מפגשי אימון אישיים המותאמים לצרכים שלך, ובשיתוף פעולה מלא, נתווה דרך להשגת המטרות האישיות והמקצועיות שלך</p>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to={createPageUrl("Calendar")}
              className="inline-block bg-[#c8a96e] hover:bg-[#b8994e] text-white font-semibold px-8 py-3 rounded-full text-lg transition-colors shadow-lg"
            >
              קבע פגישת הכרות
            </Link>
            <Link
              to={createPageUrl("Contact")}
              className="inline-block border-2 border-white hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-full text-lg transition-colors"
            >
              צרו קשר
            </Link>
          </div>
        </div>
      </section>



      {/* Content Sections */}
      {DEFAULT_SECTIONS.map(section => (
        <Section
          key={section.key}
          section={section}
          content={pageContents[section.key]}
          isAdmin={isAdmin}
          onSave={handleSave}
        />
      ))}

      {/* CTA */}
      <div className="bg-[#4a8fa0] text-white text-center py-12 px-6">
        <h2 className="text-2xl font-bold mb-3">מוכנ/ת להתחיל את המסע?</h2>
        <p className="mb-6 opacity-90">אני מזמינה אותך לפגישת היכרות ראשונה</p>
        <Link
          to={createPageUrl("Calendar")}
          className="inline-block bg-white text-[#4a8fa0] font-semibold px-8 py-3 rounded-full text-lg hover:bg-[#f0f9fb] transition-colors"
        >
          קבע פגישת הכרות
        </Link>
      </div>
    </div>
  );
}