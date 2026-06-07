import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const he = {
  // Nav
  nav_blog: 'בלוג',
  nav_gallery: 'גלריה',
  nav_calendar: 'יומן',
  nav_contact: 'צור קשר',

  // Auth
  login: 'התחבר',
  logout: 'התנתק',
  admin_badge: 'מנהל',
  logout_confirm_title: 'התנתקות',
  logout_confirm_message: 'האם אתה בטוח שברצונך להתנתק?',
  logout_confirm_btn: 'התנתק',

  // Page titles (document.title)
  page_title_blog: 'בלוג',
  page_title_gallery: 'גלריה',
  page_title_calendar: 'יומן',
  page_title_contact: 'צור קשר',
  site_name: 'סיון אלטרוביץ מאמנת רגשית בשיטת סאטיה',

  // Footer
  footer_name: 'סיון אלטרוביץ',
  footer_subtitle: 'מאמנת רגשית בשיטת סאטיה',
  footer_copyright: '© 2026 סיון אלטרוביץ. כל הזכויות שמורות.',

  // Home hero
  home_quote: '"מי שמביט החוצה חולם, מי שמביט פנימה מתעורר"',
  home_quote_author: 'קרל יונג',
  home_hero_text: 'גלה את הפוטנציאל הטמון בך וחווה חיים מלאים ומשמעותיים בעזרת אימון רגשי',
  home_hero_sub: 'דרך מפגשי אימון אישיים המותאמים לצרכים שלך, ובשיתוף פעולה מלא, נתווה דרך להשגת המטרות האישיות והמקצועיות שלך',
  home_cta_book: 'קבע פגישת הכרות',
  home_cta_contact: 'צרו קשר',
  home_cta_title: 'מוכנ/ת להתחיל את המסע?',
  home_cta_sub: 'אני מזמינה אותך לפגישת היכרות ראשונה',

  // Home sections
  home_section_about_title: 'בקצרה עלי',
  home_section_satya_title: 'מהי שיטת סאטיה',
  home_section_howworks_title: 'איך זה עובד בעצם',
  home_section_value_title: 'הערך באימון בשיטת סאטיה',

  // Gallery page
  gallery_title: 'גלריה',
  gallery_subtitle: 'רגעים ותמונות',
  gallery_no_images: 'אין תמונות להצגה',
  gallery_upload_btn: 'העלאת תמונה',
  gallery_edit_btn: 'עריכה',
  gallery_delete_btn: 'מחיקה',
  gallery_save_btn: 'שמור',
  gallery_cancel_btn: 'בטל',
  gallery_add_title: 'הוסף תמונה',
  gallery_image_title_label: 'כותרת',
  gallery_image_subtitle_label: 'תת כותרת',

  // Blog page
  blog_title: 'בלוג',
  blog_subtitle: 'מאמרים ורשומות',
  blog_read_more: 'קרא עוד',
  blog_no_posts: 'אין פוסטים',
  blog_new_post: 'פוסט חדש',
  blog_published: 'פורסם',
  blog_draft: 'טיוטה',
  blog_edit: 'עריכה',
  blog_delete: 'מחיקה',
  blog_back: 'חזרה לבלוג',

  // Calendar page
  calendar_title: 'יומן תורים',
  calendar_book_btn: 'קביעת תור',
  calendar_today: 'היום',
  calendar_no_slots: 'אין זמינות',

  // Contact page
  contact_title: 'צור קשר',
  contact_name: 'שם',
  contact_email: 'אימייל',
  contact_phone: 'טלפון',
  contact_message: 'הודעה',
  contact_send: 'שלח הודעה',
  contact_sent_ok: 'ההודעה נשלחה בהצלחה!',

  // Floating chat
  chat_placeholder: 'כתוב הודעה...',
  chat_send: 'שלח',

  // General
  save: 'שמור',
  cancel: 'בטל',
  edit: 'עריכה',
  delete: 'מחיקה',
  confirm: 'אישור',
  loading: 'טוען...',
  error: 'שגיאה',
};

const en = {
  // Nav
  nav_blog: 'Blog',
  nav_gallery: 'Gallery',
  nav_calendar: 'Calendar',
  nav_contact: 'Contact',

  // Auth
  login: 'Sign In',
  logout: 'Sign Out',
  admin_badge: 'Admin',
  logout_confirm_title: 'Sign Out',
  logout_confirm_message: 'Are you sure you want to sign out?',
  logout_confirm_btn: 'Sign Out',

  // Page titles
  page_title_blog: 'Blog',
  page_title_gallery: 'Gallery',
  page_title_calendar: 'Calendar',
  page_title_contact: 'Contact',
  site_name: 'Sivan Altar — Emotional Coaching',

  // Footer
  footer_name: 'Sivan Altar',
  footer_subtitle: 'Emotional Coach — Satya Method',
  footer_copyright: '© 2026 Sivan Altar. All rights reserved.',

  // Home hero
  home_quote: '"Who looks outside, dreams; who looks inside, awakes."',
  home_quote_author: 'Carl Jung',
  home_hero_text: 'Discover your potential and experience a full, meaningful life through emotional coaching',
  home_hero_sub: 'Through personalized coaching sessions tailored to your needs, we will chart a path to achieving your personal and professional goals together',
  home_cta_book: 'Book a Meeting',
  home_cta_contact: 'Contact Us',
  home_cta_title: 'Ready to Start Your Journey?',
  home_cta_sub: 'I invite you to a first introductory meeting',

  // Home sections
  home_section_about_title: 'About Me',
  home_section_satya_title: 'What is the Satya Method?',
  home_section_howworks_title: 'How Does It Work?',
  home_section_value_title: 'The Value of Satya Coaching',

  // Gallery page
  gallery_title: 'Gallery',
  gallery_subtitle: 'Moments & Images',
  gallery_no_images: 'No images to display',
  gallery_upload_btn: 'Upload Image',
  gallery_edit_btn: 'Edit',
  gallery_delete_btn: 'Delete',
  gallery_save_btn: 'Save',
  gallery_cancel_btn: 'Cancel',
  gallery_add_title: 'Add Image',
  gallery_image_title_label: 'Title',
  gallery_image_subtitle_label: 'Subtitle',

  // Blog page
  blog_title: 'Blog',
  blog_subtitle: 'Articles & Posts',
  blog_read_more: 'Read More',
  blog_no_posts: 'No posts',
  blog_new_post: 'New Post',
  blog_published: 'Published',
  blog_draft: 'Draft',
  blog_edit: 'Edit',
  blog_delete: 'Delete',
  blog_back: 'Back to Blog',

  // Calendar page
  calendar_title: 'Appointment Calendar',
  calendar_book_btn: 'Book Appointment',
  calendar_today: 'Today',
  calendar_no_slots: 'No availability',

  // Contact page
  contact_title: 'Contact',
  contact_name: 'Name',
  contact_email: 'Email',
  contact_phone: 'Phone',
  contact_message: 'Message',
  contact_send: 'Send Message',
  contact_sent_ok: 'Message sent successfully!',

  // Floating chat
  chat_placeholder: 'Type a message...',
  chat_send: 'Send',

  // General
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  delete: 'Delete',
  confirm: 'Confirm',
  loading: 'Loading...',
  error: 'Error',
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      he: { translation: he },
      en: { translation: en },
    },
    lng: 'he',
    fallbackLng: 'he',
    interpolation: { escapeValue: false },
  });

export default i18n;
