import { format } from "date-fns";
import { he } from "date-fns/locale";

export function generateAppointmentEmail(appointment, user) {
  const locationLabel = appointment.appointment_location === "clinic" ? "בקליניקה - רמת השרון" : "אונליין";
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);

  // Google Calendar URL
  const gcalStart = startTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const gcalEnd = endTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const gcalTitle = encodeURIComponent(`פגישה עם סיון אלטרוביץ`);
  const gcalDetails = encodeURIComponent(`מיקום: ${locationLabel}`);
  const gcalLocation = encodeURIComponent(locationLabel);
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${gcalStart}/${gcalEnd}&details=${gcalDetails}&location=${gcalLocation}`;

  // Outlook Calendar URL
  const outlookStart = startTime.toISOString();
  const outlookEnd = endTime.toISOString();
  const outlookTitle = encodeURIComponent(`פגישה עם סיון אלטרוביץ`);
  const outlookBody = encodeURIComponent(`מיקום: ${locationLabel}`);
  const outlookLocation = encodeURIComponent(locationLabel);
  const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${outlookTitle}&startdt=${outlookStart}&enddt=${outlookEnd}&body=${outlookBody}&location=${outlookLocation}&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent`;
  
  const dateStr = format(startTime, "EEEE, d MMMM yyyy", { locale: he });
  const timeStr = `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`;

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Arial Hebrew', Arial, sans-serif;
      background-color: #f8f5f0;
      color: #3a3a4a;
      direction: rtl;
      text-align: right;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
    }
    .header {
      background-color: #2d6b7a;
      padding: 20px;
      text-align: center;
      direction: rtl;
    }
    .logo {
      max-width: 100px;
      height: auto;
      margin-bottom: 10px;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
      direction: rtl;
      text-align: right;
    }
    .greeting {
      color: #4a8fa0;
      font-size: 20px;
      margin-bottom: 20px;
      font-weight: bold;
      direction: rtl;
      text-align: right;
    }
    .appointment-box {
      background-color: #f0ebe3;
      border: 2px solid #4a8fa0;
      border-radius: 10px;
      padding: 20px;
      margin: 20px 0;
      direction: rtl;
      text-align: right;
    }
    .appointment-box h3 {
      margin-top: 0;
      color: #2d6b7a;
      text-align: right;
    }
    .detail-row {
      margin: 10px 0;
      padding: 8px 0;
      border-bottom: 1px solid #e8e0d4;
      direction: rtl;
      text-align: right;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #4a8fa0;
      font-weight: bold;
      display: inline-block;
      min-width: 100px;
    }
    .detail-value {
      color: #3a3a4a;
    }
    .footer {
      background-color: #f8f5f0;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e8e0d4;
      font-size: 12px;
      color: #999;
      direction: rtl;
    }
    .button {
      display: inline-block;
      background-color: #4a8fa0;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      margin-top: 15px;
      font-weight: bold;
    }
    .notes {
      background-color: #f0f9fb;
      padding: 15px;
      border-right: 4px solid #4a8fa0;
      margin: 15px 0;
      border-radius: 5px;
      direction: rtl;
      text-align: right;
    }
    p {
      direction: rtl;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.sivanaltar.com/images/logo.png" alt="סיון אלטרוביץ" class="logo" onerror="this.style.display='none'">
      <h1>סיון אלטרוביץ</h1>
      <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">מאמנת רגשית בשיטת סאטיה</p>
    </div>

    <div class="content">
      <div class="greeting">שלום ${appointment.user_name},</div>
      
      <p>תודה על קביעת הפגישה! הנה פרטי הפגישה שלך:</p>

      <div class="appointment-box">
        <h3>פרטי הפגישה</h3>
        <div class="detail-row">
          <span class="detail-label">תאריך:</span>
          <span class="detail-value">${dateStr}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">שעה:</span>
          <span class="detail-value">${timeStr}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">מיקום:</span>
          <span class="detail-value">${locationLabel}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">מחיר:</span>
          <span class="detail-value">₪${appointment.price_nis}</span>
        </div>
      </div>

      ${appointment.notes ? `
      <div class="notes">
        <strong>הערות שלך:</strong><br/>
        ${appointment.notes}
      </div>
      ` : ''}

      <p>אם יש צורך לשנות את הפגישה או לבטל אותה, אנא צור קשר איתי בטלפון <strong>054-599-9671</strong> או בדוא"ל <strong>sivanaltar@gmail.com</strong>.</p>

      <p>אני שמחה שבחרת לעבוד יחד! בפגישה שלנו נתחיל בשיחה פתוחה ועמוקה, ונחקור יחד את אשר עיצב אותך ואת הערכים המניעים אותך.</p>

      <p style="margin-top: 30px; text-align: center; direction: rtl;">
        <a href="${googleCalendarUrl}" class="button" style="display: inline-block; background-color: #4285F4; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin: 5px; font-weight: bold;">הוסף ל-Gmail Calendar</a>
        <a href="${outlookCalendarUrl}" class="button" style="display: inline-block; background-color: #0078D4; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin: 5px; font-weight: bold;">הוסף ל-Outlook Calendar</a>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0; direction: rtl; text-align: right;">סיון אלטרוביץ | מאמנת רגשית בשיטת סאטיה</p>
      <p style="margin: 0; direction: rtl; text-align: right;">054-599-9671 | sivanaltar@gmail.com</p>
      <p style="margin: 10px 0 0 0; direction: rtl; text-align: right;">© 2026 כל הזכויות שמורות</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateCancellationEmail(appointment) {
  const locationLabel = appointment.appointment_location === "clinic" ? "בקליניקה - רמת השרון" : "אונליין";
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  const dateStr = format(startTime, "EEEE, d MMMM yyyy", { locale: he });
  const timeStr = `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`;

  // Google Calendar remove URL (search for event by title)
  const gcalTitle = encodeURIComponent(`פגישה עם סיון אלטרוביץ`);
  const googleCalendarRemoveUrl = `https://calendar.google.com/calendar/r/search?q=${gcalTitle}`;

  // Outlook Calendar search URL
  const outlookTitle = encodeURIComponent(`פגישה עם סיון אלטרוביץ`);
  const outlookCalendarRemoveUrl = `https://outlook.live.com/calendar/0/search?q=${outlookTitle}`;

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Arial Hebrew', Arial, sans-serif; background-color: #f8f5f0; color: #3a3a4a; direction: rtl; text-align: right; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background-color: #b94a4a; padding: 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; direction: rtl; text-align: right; }
    .greeting { color: #b94a4a; font-size: 20px; margin-bottom: 20px; font-weight: bold; }
    .appointment-box { background-color: #fdf0f0; border: 2px solid #b94a4a; border-radius: 10px; padding: 20px; margin: 20px 0; direction: rtl; text-align: right; }
    .appointment-box h3 { margin-top: 0; color: #b94a4a; }
    .detail-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e8e0d4; direction: rtl; text-align: right; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #b94a4a; font-weight: bold; display: inline-block; min-width: 100px; }
    .footer { background-color: #f8f5f0; padding: 20px; text-align: right; direction: rtl; border-top: 1px solid #e8e0d4; font-size: 12px; color: #999; }
    p { direction: rtl; text-align: right; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://www.sivanaltar.com/images/logo.png" alt="סיון אלטרוביץ" style="max-width:100px;height:auto;margin-bottom:10px;" onerror="this.style.display='none'">
      <h1>סיון אלטרוביץ</h1>
      <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">מאמנת רגשית בשיטת סאטיה</p>
    </div>

    <div class="content">
      <div class="greeting">שלום ${appointment.user_name},</div>
      <p>הפגישה שלך בוטלה. להלן פרטי הפגישה המבוטלת:</p>

      <div class="appointment-box">
        <h3>פגישה מבוטלת</h3>
        <div class="detail-row">
          <span class="detail-label">תאריך:</span>
          <span>${dateStr}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">שעה:</span>
          <span>${timeStr}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">מיקום:</span>
          <span>${locationLabel}</span>
        </div>
      </div>

      <p>אם ברצונך לקבוע פגישה חדשה, ניתן ליצור קשר בטלפון <strong>054-599-9671</strong> או בדוא"ל <strong>sivanaltar@gmail.com</strong>.</p>

      <p style="margin-top: 30px; text-align: center; direction: rtl;">
        <a href="${googleCalendarRemoveUrl}" style="display: inline-block; background-color: #4285F4; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin: 5px; font-weight: bold;">הסר מ-Gmail Calendar</a>
        <a href="${outlookCalendarRemoveUrl}" style="display: inline-block; background-color: #0078D4; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin: 5px; font-weight: bold;">הסר מ-Outlook Calendar</a>
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;">סיון אלטרוביץ | מאמנת רגשית בשיטת סאטיה</p>
      <p style="margin: 0;">054-599-9671 | sivanaltar@gmail.com</p>
      <p style="margin: 10px 0 0 0;">© 2026 כל הזכויות שמורות</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateICS(appointment) {
  const start = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  // Format dates for ICS (YYYYMMDDTHHmmssZ)
  const startStr = start.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const endStr = end.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const locationLabel = appointment.appointment_location === "clinic" ? "קליניקה - רמת השרון" : "אונליין";
  const typeLabel = appointment.appointment_type === "introduction" ? "פגישת היכרות" : "קורס";

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sivan Altar//Satya Method//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:סיון אלטרוביץ - פגישה
X-WR-TIMEZONE:Asia/Jerusalem
BEGIN:VEVENT
UID:${appointment.id}@sivanaltar.com
DTSTAMP:${now}
DTSTART:${startStr}
DTEND:${endStr}
SUMMARY:${typeLabel} - ${appointment.user_name}
DESCRIPTION:סוג: ${typeLabel}\\nמיקום: ${locationLabel}\\nמחיר: ₪${appointment.price_nis}${appointment.notes ? "\\n\\nהערות: " + appointment.notes.replace(/\n/g, "\\n") : ""}
LOCATION:${locationLabel}
ORGANIZER;CN=סיון אלטרוביץ:mailto:sivanaltar@gmail.com
ATTENDEE;CN=${appointment.user_name}:mailto:${appointment.user_email}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}