import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { question, anonymousId } = await req.json();

    if (!question || !question.trim()) {
      return Response.json({ error: 'Question is required' }, { status: 400 });
    }

    // Try to get logged-in user, fall back to anonymous
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}

    const sessionKey = user ? user.email : (anonymousId || 'anonymous');
    const sessionEmail = user ? user.email : `anon_${sessionKey}@chat`;
    const sessionName = user ? user.full_name : 'אורח';

    // Fetch or create the user's guidance session
    const sessions = await base44.asServiceRole.entities.UserGuidanceSession.filter({
      user_email: sessionEmail,
      status: 'active'
    });

    let session = sessions.length > 0 ? sessions[0] : null;

    if (!session) {
      session = await base44.asServiceRole.entities.UserGuidanceSession.create({
        user_email: sessionEmail,
        user_full_name: sessionName,
        qa_history: []
      });
    }

    // Enforce 3-question limit for non-admin users
    const isAdmin = user && user.role === 'admin';
    const questionsSoFar = (session.qa_history || []).length;
    if (!isAdmin && questionsSoFar >= 3) {
      return Response.json({ error: 'LIMIT_REACHED' }, { status: 403 });
    }

    // Fetch the AI config
    // Fetch all AI configs at once
    const allConfigs = await base44.asServiceRole.entities.AiConfig.list();
    const configMap = {};
    for (const c of allConfigs) configMap[c.key] = c;

    if (!configMap['guidance_system_prompt'] || !configMap['guidance_meta_prompt']) {
      return Response.json({ error: 'AI configuration not found' }, { status: 500 });
    }

    // Apply forbidden word replacements from meta config
    const forbiddenWords = configMap['guidance_meta_prompt']?.forbidden_words || [];
    let systemPrompt = configMap['guidance_system_prompt'].system_prompt;
    for (const { word, replacement } of forbiddenWords) {
      systemPrompt = systemPrompt.replace(new RegExp(word, 'g'), replacement);
    }

    // Build conversation history
    const questionNumber = (session.qa_history || []).length + 1;
    const conversationHistory = (session.qa_history || []).map(qa => ({
      role: qa.role || 'user',
      content: qa.role === 'user' ? qa.question : qa.answer
    }));
    conversationHistory.push({ role: 'user', content: question });

    const conversationText = conversationHistory
      .map((msg, idx) => {
        const isUserMsg = msg.role === 'user';
        if (isUserMsg && idx === conversationHistory.length - 1) {
          return `[שאלה מספר ${questionNumber}] המשתמש: ${msg.content}`;
        } else if (isUserMsg) {
          const prevQNum = Math.floor(idx / 2) + 1;
          return `[שאלה מספר ${prevQNum}] המשתמש: ${msg.content}`;
        } else {
          const answerQNum = Math.floor((idx - 1) / 2) + 1;
          return `[תשובה לשאלה ${answerQNum}] אני: ${msg.content}`;
        }
      })
      .join('\n\n');

    // Detect user gender from Hebrew language markers
    const detectGender = (text) => {
      // Female markers: verbs/adjectives ending in ה, ית, ית, feminine pronouns
      const femalePatterns = [
        /אני\s+\w+ה\b/,  // "אני [verb]ה" (feminine verb forms)
        /\w+ית\b/,        // feminine adjective/participle ending in ית
        /היא\b/,           // "she"
        /שלי\b.*\w+ה\b/,   // possession + feminine form
        /\w+ה\s+אני\b/,    // "[noun/adj]ה אני" (feminine ending)
      ];
      
      // Male markers: masculine verb forms, pronouns
      const malePatterns = [
        /אני\s+\w+י\b/,    // masculine participle ending in י
        /הוא\b/,            // "he"
        /שלי\b.*\w+י\b/,    // possession + masculine form
        /\w+י\s+אני\b/,     // masculine ending
        /חורות/,            // "girls" suggests male speaker
        /בחורות/,           // "with girls" suggests male perspective
      ];
      
      const maleScore = malePatterns.filter(p => p.test(text)).length;
      const femaleScore = femalePatterns.filter(p => p.test(text)).length;
      
      if (maleScore > femaleScore) return 'male';
      if (femaleScore > maleScore) return 'female';
      return 'neutral'; // default neutral for ambiguous cases
    };

    const userGender = detectGender(question);
    const genderInstruction = userGender === 'male' 
      ? '\n[הערה חשובה: המשתמש הוא זכר - השתמש בכינויים וצורות נשוניות תואמות בתשובתך]'
      : userGender === 'female'
      ? '\n[הערה חשובה: המשתמשת היא נקבה - השתמש בכינויים וצורות נשוניות תואמות בתשובתך]'
      : '';

    // Build meta prompt from AiConfig, substituting dynamic values
    const shouldSuggestContinue = questionNumber >= 3;
    const suggestContinueText = shouldSuggestContinue
      ? `\n4. ${configMap['guidance_suggest_continue']?.system_prompt || ''}`
      : '';

    let metaPrompt = configMap['guidance_meta_prompt'].system_prompt
      .replace(/{question_number}/g, questionNumber)
      .replace(/{suggest_continue_placeholder}/g, suggestContinueText) + genderInstruction;

    const hebrewPrompt = `${metaPrompt}\n\n---\n\n${systemPrompt}\n\n--- Conversation ---\n${conversationText}\n\nתשובתך:`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: hebrewPrompt,
      add_context_from_internet: false
    });

    const finalAnswer = aiResponse;

    // Log the interaction for tracking
    await base44.asServiceRole.entities.AiInteractionLog.create({
      session_id: session.id,
      user_email: sessionEmail,
      user_name: sessionName,
      question_number: questionNumber,
      user_question: question,
      full_prompt: hebrewPrompt,
      llm_answer: finalAnswer,
      model: 'InvokeLLM (default)',
      timestamp: new Date().toISOString()
    });

     // Update session with new Q&A
     const updatedQaHistory = session.qa_history ? [...session.qa_history] : [];
     updatedQaHistory.push({
       question: question,
       answer: aiResponse,
       timestamp: new Date().toISOString(),
       role: 'user'
     });

     await base44.entities.UserGuidanceSession.update(session.id, {
       qa_history: updatedQaHistory
     });

     // Send email to admins with Q&A history
     const qaHistoryHtml = updatedQaHistory
       .map((qa, idx) => `
         <div style="margin-bottom: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px; direction: rtl; text-align: right;">
           <p><strong>שאלה ${idx + 1}:</strong> ${qa.question}</p>
           <p><strong>תשובה:</strong> ${qa.answer}</p>
         </div>
       `)
       .join('');

     const displayName = user ? user.full_name : sessionName;
     const displayEmail = user ? user.email : sessionEmail;

     const emailBody = `
        <div dir="rtl" style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
          <h2>סשן הכוונה ראשונית חדש - ${displayName}</h2>
          <p><strong>אימייל:</strong> ${displayEmail}</p>
          <p><strong>שם מלא:</strong> ${displayName}</p>
          <hr />
          <h3>היסטוריית שאלות ותשובות:</h3>
          ${qaHistoryHtml}
        </div>
      `;

     await Promise.all([
       base44.integrations.Core.SendEmail({
         to: 'berenfeldran@gmail.com',
         subject: `הכוונה ראשונית - ${displayName}`,
         body: emailBody
       }),
       base44.integrations.Core.SendEmail({
         to: 'sivanaltar@gmail.com',
         subject: `הכוונה ראשונית - ${displayName}`,
         body: emailBody
       })
     ]);

     return Response.json({
       answer: finalAnswer,
       sessionId: session.id
     });
  } catch (error) {
    console.error('Error in invokeAiGuidance:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});