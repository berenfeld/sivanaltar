const EN_CONTENT = {
  about_me: `<p>Hi, I'm Sivan Altarovici — an emotional coach using the Satya method, accompanying people through growth and inner freedom, and an HR professional holding the space where organizations and their people thrive.</p>
<p>I share my life with Ran, my partner, and I'm a proud mother of three. They are my greatest teachers in presence and being.</p>
<p>My professional background bridges emotional depth with broad organizational understanding:</p>
<p>I hold a Bachelor's degree in Psychology and Education, a Master's degree in Organizational Behavior and Human Resources (Tel Aviv University), and additional training in mediation and payroll. I completed my emotional coaching training at the 'Imushion' school. This combination allows me to bring a wide, precise, and compassionate perspective to both the coaching room and the workplace.</p>
<p>My personal interests include meeting new people, exploring diverse cultures, nature hikes, yoga, snorkeling, photography, fashion, and sustainability.</p>
<p>For over a decade, I've been guiding employees and managers through growth and change. I have a deep understanding of the challenges people face in the modern workplace, in career development, and in finding the vital balance between professional and personal life.</p>
<p>I believe everyone has something they'd like to improve, explore more deeply, or approach differently. For me, following a personal crisis, I turned to emotional coaching.</p>
<p>I chose to do so through the Satya method, which enables deep self-inquiry through listening, recognizing defense mechanisms, and releasing the automatic patterns that run our lives.</p>
<p>The coaching and practice allowed me to develop ease and joy in my life and to make choices from a place of inner freedom.</p>
<p>This experience motivated me to deepen my work in the method and become an emotional coach myself — to offer others the space where they too can find the strength in stillness and presence.</p>
<p>My goal is to give others additional tools for their personal journeys, much like the journey I've taken myself.</p>
<p>I combine the knowledge and tools I've gained from both fields and offer my listening skills to help clients gain clarity, reconnect with themselves, and make better decisions — both in their personal lives and in their careers.</p>`,

  satya_method: `<p>The Satya method is a practice centered on offering deep, compassionate attention to the human body and mind.</p>
<p>It is an integrative approach rooted in Buddhist philosophy, existentialist philosophy, and body-based therapy, combined with tools from modern coaching.</p>
<p>The goal of the Satya method is to teach people to be awake to themselves — to recognize the way they live and act — so they can develop resilience, compassion, joy, and integrity in their choices, while taking personal responsibility.</p>
<p>Sessions take place in a safe, attentive space, focusing on bodily sensations, emotions, and worldviews that make up the client's lived experience.</p>
<p>Through shared inquiry, directing attention through the body, and observing the places experienced as difficult or challenging, we gain a deep look at how these places shape our daily reality and our relationships.</p>
<p>The Satya method offers a compassionate, respectful, and transformative path to healing — one that opens access to inner freedom and the creation of new possibilities.</p>
<p>The Satya method was developed by Natalie Ben David Elhanani, who is dedicated to the possible development of the human being and to creating pathways and tools for reducing suffering in all its forms, with a vision of creating a better world.</p>`,

  how_it_works: `<p>So what actually happens in the coaching room and how does it work?</p>
<h3>Phase One: The Introductory Meeting — Who am I? 🧭</h3>
<p>In a brief introductory conversation, you'll discover how the Satya method can benefit you.</p>
<p>Everything begins with a personal, in-depth, and open conversation between us. This is not a "therapist" session — it's a conversation of listening, understanding, and shared reflection. Through a series of precise questions, we set out together on a journey of discovery where we explore:</p>
<p>What shaped you? We examine significant events, experiences, and moments in your life that made you who you are today — with all your unique strengths and qualities.</p>
<p>What truly matters to you in life? What are the values that drive you? What are your deep desires, aspirations, and dreams for the future?</p>
<p>This is a powerful and rare meeting that will form the foundation of all our work together.</p>
<h3>Phase Two: Mapping and Planning Personal Growth 🗺️</h3>
<p>After getting to know each other deeply, we'll map and plan your personal growth together using a unique tool developed specifically for this purpose. Think of it as a personal map that presents your vision for the future and the key areas of your life where you'd like to create change and improvement. It turns your desires and aspirations into a clear, focused plan of action.</p>
<h3>Phase Three: Practical Work and Growth — Step by Step 👣</h3>
<p>In the following sessions, we'll dive into concrete work on the topics you chose in your personal growth plan. You're invited to bring any challenge, dilemma, emotional difficulty, or desire for change that arises. In our space (in person or via video), you'll find:</p>
<ul>
<li>Full and present listening: I'm attuned to every word, every feeling, and everything that arises within you.</li>
<li>Focused understanding: We'll clarify and understand the root of things together.</li>
<li>Empathetic emotional response: We make space for every emotion that arises, allow it to be, and learn from it.</li>
</ul>
<p>All within a completely safe, containing, and confidential space.</p>
<p>In our sessions, there is only you and me, with one shared goal: your wellbeing and personal growth.</p>`,

  coaching_value: `<p>Life is here and now — once and only once (at least in this cycle)!</p>
<p>The distance between a life of compromise and a life of connection and inspiration is as thin as a ray of light.</p>
<p>There is a deep longing within us to truly live, to feel inner freedom, to create deep and meaningful connections.</p>
<p>But something always holds us back — old patterns, hidden fears, or simply the habit of settling for "okay."</p>
<p>And maybe now is exactly the right time to pause and ask — what would happen if we allowed ourselves to be vulnerable, authentic, real?</p>
<h3>What does coaching make possible?</h3>
<ul>
<li>Developing resilience in the face of everyday challenges and frustrations</li>
<li>Navigating change and crisis — for example, in a career transition</li>
<li>Improving relationships</li>
<li>Working on inner balance and stress management</li>
<li>Promoting personal development and growth</li>
</ul>
<p>If this resonated with you and you're ready for a process of growth and development, I invite you to pause and embark on a personal journey within my space.</p>`
};

exports.up = async (pgm) => {
  // Add lang column
  await pgm.db.query(`ALTER TABLE page_content ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'he'`);
  // Mark all existing rows as Hebrew
  await pgm.db.query(`UPDATE page_content SET lang = 'he' WHERE lang IS NULL OR lang = ''`);

  // Drop any existing unique constraint on key alone, replace with (key, lang)
  await pgm.db.query(`
    DO $$
    DECLARE r RECORD;
    BEGIN
      FOR r IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class cls ON cls.oid = con.conrelid
        JOIN pg_attribute att ON att.attrelid = cls.oid AND att.attnum = ANY(con.conkey)
        WHERE cls.relname = 'page_content'
          AND con.contype = 'u'
          AND att.attname = 'key'
          AND array_length(con.conkey, 1) = 1
      LOOP
        EXECUTE 'ALTER TABLE page_content DROP CONSTRAINT ' || quote_ident(r.conname);
      END LOOP;
    END $$;
  `);

  await pgm.db.query(`
    ALTER TABLE page_content ADD CONSTRAINT page_content_key_lang_unique UNIQUE (key, lang)
  `);

  // Insert English content for all 4 sections
  for (const [key, value] of Object.entries(EN_CONTENT)) {
    await pgm.db.query(
      `INSERT INTO page_content (key, content, lang) VALUES ($1, $2, 'en') ON CONFLICT (key, lang) DO NOTHING`,
      [key, value]
    );
  }
};

exports.down = async (pgm) => {
  await pgm.db.query(`DELETE FROM page_content WHERE lang = 'en'`);
  await pgm.db.query(`ALTER TABLE page_content DROP CONSTRAINT IF EXISTS page_content_key_lang_unique`);
  await pgm.db.query(`ALTER TABLE page_content DROP COLUMN IF EXISTS lang`);
};
