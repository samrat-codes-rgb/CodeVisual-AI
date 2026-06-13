// ============================================
// AI SERVICE — Gemini API integration
// ============================================

import { store } from '../store.js';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

class AIService {
  constructor() {
    this.apiKey = store.get('settings.apiKey') || null;
    this.userContext = store.get('user') || null;
  }

  setApiKey(key) { this.apiKey = key; }
  setUserContext(ctx) { this.userContext = ctx; }

  _systemInstruction(extra = '') {
    const ctx = this.userContext;
    const explLang = store.get('settings.explanationLanguage') || 'english';
    
    let languageInstruction = '';
    if (explLang === 'hindi') {
      languageInstruction = `You must write all explanations, descriptions, hints, code comments, and chat responses in Hindi language (using Devanagari script). Talk like a warm, supportive peer or elder brother explaining to a close friend. Standard coding terms (like variables, arrays, loop, recursion, stack, time complexity) should remain in English or Latin script where natural, but all description sentences must be in clear Hindi (Devanagari).`;
    } else if (explLang === 'hinglish') {
      languageInstruction = `Talk like a warm, supportive peer or classmate. Use a conversational Indian-English (Hinglish) style, naturally interspersing common friendly Indian terms (e.g., 'bhai', 'yaar', 'toh', 'ab', 'sahi hai', 'chalo', 'ek baat batao', 'samjhe?') in Latin script. Avoid formal, dry textbook language.`;
    } else {
      languageInstruction = `You must write all explanations, descriptions, hints, code comments, and chat responses in clear, clean standard English. Keep the tone warm, supportive, and friendly, but do not use any Hindi, Hinglish, or Indian slang terms (like 'bhai', 'yaar', 'toh', 'sahi hai', etc.).`;
    }

    const base = `You are "CodeMentor AI", a 25-30 year old Indian male coding tutor, representing a friendly, helpful elder brother or college senior explaining DSA to a friend.
${languageInstruction}
Use simple, everyday analogies as if you're pair-programming with a friend.
Always use markdown formatting: **bold**, \`code\`, code blocks with language identifiers.
${ctx ? `
Student profile:
- Name: ${ctx.name || 'Student'}
- Skill level: ${ctx.skillLevel || 'beginner'}
- Preferred language: ${ctx.language || 'Python'}
- Learning goal: ${ctx.goal || 'Learn DSA'}
- Weak topics: ${(ctx.weakTopics || []).join(', ') || 'none identified yet'}
Tailor your explanations to their skill level, showing coding solutions in their preferred language.` : ''}
${extra}`;
    return base;
  }

  async generate(prompt, systemExtra = '') {
    if (!this.apiKey) {
      return this._mockResponse(prompt);
    }
    try {
      const res = await fetch(`${GEMINI_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: this._systemInstruction(systemExtra) }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'API error');
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    } catch (e) {
      console.error('AI Error:', e);
      return `⚠️ AI Error: ${e.message || 'Unknown error occurred'}. Please verify your API key in Profile settings and check your network connection/Gemini region support.`;
    }
  }

  async explainProblem(problem) {
    const prompt = `Explain the following coding problem clearly:

Problem: ${problem.title}
Description: ${problem.description}
Examples: ${JSON.stringify(problem.examples || [])}
Constraints: ${(problem.constraints || []).join(', ')}

Please provide:
1. **Simple English Explanation** - What the problem is asking (ELI5 style)
2. **Key Insight** - The crucial observation that leads to the solution
3. **Brute Force Approach** - Simple but inefficient solution, with time/space complexity
4. **Optimal Approach** - Best solution with step-by-step explanation, complexity analysis
5. **Visual Example** - Walk through an example step by step
6. **Tips to Remember** - How to recognize similar problems`;

    return this.generate(prompt, 'Focus on clear, educational explanations suitable for interview preparation.');
  }

  async explainFromUrl(url, slug) {
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const source = url.includes('leetcode') ? 'LeetCode' : url.includes('geeksforgeeks') ? 'GeeksforGeeks' : 'a coding platform';
    const lang = this.userContext?.language || 'Python';
    const prompt = `The student pasted this link: ${url}
 
This appears to be the problem "${title}" from ${source}.
 
Please provide a FULL explanation of this coding problem:
1. **Problem Statement** — what the problem is asking, rewritten clearly
2. **Examples** — give 2-3 examples with input/output
3. **Key Insight** — the crucial observation to solve it
4. **Brute Force** — simple approach with complexity
5. **Optimal Solution** — best approach explained step-by-step with pseudocode
6. **Code** — write the optimal solution in ${lang} with comments
7. **Time & Space Complexity** — Big-O analysis of optimal solution
8. **Similar Problems** — 2-3 related problems to practice
 
If you don't recognize the exact problem, infer from the title and explain the most common version.`;
 
    return this.generate(prompt, 'You are explaining a coding problem from a URL. Be thorough, educational, and use a friendly classmate-to-friend tone.');
  }

  async tutorChat(messages, problem = null) {
    const history = messages.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n\n');
    const context = problem ? `\nContext: The student is working on "${problem.title}" (${problem.difficulty}).` : '';
    const prompt = `${context}\n\nConversation:\n${history}\n\nStudent's last message: ${messages[messages.length - 1]?.content || ''}\n\nTutor:`;
    return this.generate(prompt, 'Be conversational, encouraging, and pedagogical. Ask guiding questions rather than giving answers directly. If the student is stuck, provide a hint first.');
  }

  async reviewCode(code, language, problem) {
    const prompt = `Review this ${language} code for the problem "${problem?.title || 'unknown'}":

\`\`\`${language}
${code}
\`\`\`

Provide:
1. **Correctness** - Does it solve the problem? Any edge cases missed?
2. **Time Complexity** - What is the Big-O? Can it be improved?
3. **Space Complexity** - Memory usage analysis
4. **Code Quality** - Readability, naming, style
5. **Bugs Found** - Any errors or potential issues
6. **Improvement Suggestions** - How to make it better
7. **Rating** - /10 with brief justification`;

    return this.generate(prompt);
  }

  async generateHint(problem, level = 1) {
    const hints = ['very subtle', 'slightly more specific', 'fairly direct'];
    const prompt = `Give a Level ${level} hint (${hints[level - 1] || 'direct'}) for this problem:

Problem: ${problem.title}
Description: ${problem.description}

Level 1 hint: Very subtle, just a direction
Level 2 hint: Mention a data structure or technique
Level 3 hint: Nearly the full approach without code

Give ONLY a Level ${level} hint. Do not spoil higher levels.`;

    return this.generate(prompt);
  }

  async mockInterview(type, history, problem = null) {
    const histStr = history.map(m => `${m.role}: ${m.content}`).join('\n');
    let prompt = '';

    if (type === 'dsa') {
      prompt = `You are a technical interviewer at a top tech company.
${problem ? `The candidate is solving: ${problem.title}\nProblem: ${problem.description}` : 'Start a new DSA interview.'}

Interview so far:
${histStr}

As the interviewer, respond naturally. Ask follow-up questions, probe the candidate's thinking, give hints if they're very stuck (but not solutions), and evaluate their approach. Be professional but not too formal.`;
    } else if (type === 'behavioral') {
      prompt = `You are a behavioral interviewer. 
Use the STAR method to evaluate responses (Situation, Task, Action, Result).

Interview so far:
${histStr}

Ask behavioral questions relevant to software engineering roles. Topics: leadership, conflict resolution, teamwork, problem-solving, failure/learning.`;
    } else if (type === 'system-design') {
      prompt = `You are a system design interviewer.
Guide the candidate through designing a complex system.

Interview so far:
${histStr}

Ask about: requirements gathering, high-level design, database choice, scalability, API design, bottlenecks, trade-offs.`;
    }

    return this.generate(prompt, 'Stay in character as an interviewer. Keep responses concise and conversational.');
  }

  async generateDailyPlan(userProfile, progress) {
    const solved = progress?.solved?.length || 0;
    const prompt = `Create a personalized daily study plan for a coding student:

Profile:
- Name: ${userProfile.name}
- Level: ${userProfile.skillLevel}
- Goal: ${userProfile.goal}
- Available hours: ${userProfile.hours} per week
- Problems solved: ${solved}
- Language: ${userProfile.language}

Generate a focused 60-minute study plan for today with:
1. Warm-up (5-10 min) - concept review
2. Main learning (20-25 min) - specific topic
3. Practice (20-25 min) - 1-2 problems to solve
4. Review (5-10 min) - key takeaways

Make it specific, motivating, and achievable. Include problem suggestions from common DSA topics.`;

    return this.generate(prompt);
  }

  async explainConcept(concept) {
    const prompt = `Explain "${concept}" for a programming student.

Include:
1. **What it is** - Simple definition
2. **Why it matters** - Real-world use cases
3. **How it works** - Step-by-step breakdown
4. **Code Example** - Simple implementation in Python
5. **Time & Space Complexity** - Big-O analysis
6. **Common Interview Questions** - 3 popular problems using this concept
7. **Pro Tips** - Things experts know that beginners miss`;

    return this.generate(prompt);
  }

  _mockResponse(prompt) {
    const lower = prompt.toLowerCase();
    const explLang = store.get('settings.explanationLanguage') || 'english';

    if (explLang === 'hindi') {
      if (lower.includes('explain') && lower.includes('problem')) {
        return `## प्रॉब्लम एक्सप्लेनेशन 🎯

### सरल हिन्दी स्पष्टीकरण
भैया, इस प्रॉब्लम को एक साधारण उदाहरण से समझें। जैसे शेल्फ पर किताबों को व्यवस्थित करना होता है — बस हमें उन्हें सही करने का सबसे कुशल तरीका खोजना है। बिल्कुल सरल है!

### मुख्य विचार (Key Insight)
सबसे महत्वपूर्ण विचार यह है कि हम एक **हैश मैप (hash map)** का उपयोग कर सकते हैं। इससे हम पहले से देखे गए नंबरों को स्टोर कर सकते हैं और पूरक (complement) को O(1) समय में देख सकते हैं। बढ़िया है ना?

### ब्रूट फ़ोर्स दृष्टिकोण (Brute Force Approach)
सबसे बुनियादी तरीका यह है कि हम प्रत्येक जोड़ी (pair) की जाँच करें कि क्या उनका योग टारगेट के बराबर है।
- **समय जटिलता**: O(n²) — सभी जोड़ियों को जाँचना पड़ता है, थोड़ा धीमा है।
- **स्थान जटिलता**: O(1) — कोई अतिरिक्त मेमोरी की आवश्यकता नहीं होती।

\`\`\`python
# Brute Force
for i in range(len(nums)):
    for j in range(i+1, len(nums)):
        if nums[i] + nums[j] == target:
            return [i, j]
\`\`\`

### अनुकूलतम दृष्टिकोण (Optimal Approach)
अनुकूलतम तरीका: प्रत्येक संख्या और उसके इंडेक्स को हैश मैप में स्टोर करें। हर संख्या के लिए, जाँचे कि क्या पूरक (target - num) मैप में मौजूद है।
- **समय जटिलता**: O(n) — सिंगल पास में काम हो जाता है।
- **स्थान जटिलता**: O(n) — मैप स्टोरेज के लिए अतिरिक्त स्थान की आवश्यकता होती है।

\`\`\`python
# Optimal
seen = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        return [seen[complement], i]
    seen[num] = i
\`\`\`

### विज़ुअल वॉकथ्रू
आइए एक बार लॉजिक देखते हैं:
\`nums = [2, 7, 11, 15], target = 9\`
1. i=0, num=2, complement=7 → मैप में नहीं है → मैप={2:0} हो गया।
2. i=1, num=7, complement=2 → **मैप में मिल गया!** → return [0, 1] ✅

> 💡 **सलाह**: सेटिंग्स पेज पर जाकर अपनी Gemini API key जोड़ें, ताकि वास्तविक एआई उत्तर मिल सकें!`;
      }

      if (lower.includes('hint')) {
        return `💡 **संकेत**: सोचें कि कौन सा डेटा स्ट्रक्चर हमें O(1) समय में खोजने (lookup) की सुविधा देता है। यदि हम मैप का उपयोग करते हैं, तो हम पहले देखे गए तत्वों को ट्रैक कर सकते हैं!`;
      }

      if (lower.includes('review') || lower.includes('code')) {
        return `## कोड समीक्षा 🔍

**शुद्धता**: ✅ भैया, आपका कोड बिल्कुल सही काम कर रहा है, बहुत बढ़िया!

**समय जटिलता**: O(n) — एरे पर सिंगल पास हो रहा है, यह बहुत अच्छा है।

**स्थान जटिलता**: O(n) — मैप का आकार अधिकतम n तत्वों तक हो सकता है।

**सुझाव**:
1. एज केसेस को हमेशा चेक करें: जैसे खाली एरे या सिंगल एलिमेंट।
2. वेरिएबल के नाम थोड़े अधिक स्पष्ट रखें, जैसे \`seen\` के स्थान पर \`num_to_index\` बेहतर होगा।
3. कोड को साफ रखने के लिए एक कमेंट या डॉकस्ट्रिंग अवश्य जोड़ें।

**रेटिंग**: 8/10 — आपका कोड काफी कुशल है!

> 💡 प्रोफाइल सेटिंग्स में जाकर अपनी Gemini API key डालें भैया, ताकि बेहतरीन कोड समीक्षा मिल सके!`;
      }

      if (lower.includes('hello') || lower.includes('hi') || lower.includes('help')) {
        return `👋 **नमस्ते! मैं आपका CodeMentor AI हूँ!**

भैया, मैं आपका व्यक्तिगत DSA ट्यूटर हूँ। मैं इन सब चीज़ों में आपकी मदद कर सकता हूँ:

- 🧠 **प्रॉब्लम्स समझना** — "Explain Two Sum to me"
- 🐛 **कोड डीबग करना** — "Why is my solution wrong?"
- 💡 **हिंट्स देना** — "Give me a hint for Coin Change"
- 📚 **कॉन्सेप्ट्स सीखना** — "Explain Dynamic Programming"
- 🎯 **इंटरव्यू की तैयारी** — "What are common tree problems?"

**पूरी एआई क्षमता को अनलॉक करने के लिए**, प्रोफाइल सेटिंग्स में जाकर अपनी मुफ्त Gemini API key डालें!

अब बताइए, आज आप क्या सीखना चाहते हैं? 🚀`;
      }

      return `🤖 **CodeMentor AI** यहाँ है, भैया!

मैं आपको DSA सीखने, कोड की समीक्षा करने और इंटरव्यू की तैयारी करने में मदद करूँगा।

**आप कुछ भी पूछ सकते हैं, जैसे:**
- "Explain binary search step by step"
- "What's the difference between BFS and DFS?"
- "Give me a hint for the Two Sum problem"
- "How do I recognize a dynamic programming problem?"

> 💡 **संकेत**: प्रोफाइल -> सेटिंग्स में जाकर अपनी मुफ्त Gemini API key जोड़ें, ताकि व्यक्तिगत और विस्तृत स्पष्टीकरण मिल सकें!`;
    }

    if (explLang === 'english') {
      if (lower.includes('explain') && lower.includes('problem')) {
        return `## Problem Explanation 🎯

### Simple Explanation
Let's understand this problem with a simple analogy. Think of it like sorting books on a bookshelf — we just need to find the most efficient way to organize them. It's that simple!

### Key Insight
The main key insight is that we can use a **hash map** to store the elements we have already processed. This allows us to look up the complement in O(1) time.

### Brute Force Approach
The basic approach is to check every pair to see if their sum matches the target.
- **Time Complexity**: O(n²) — since we check all pairs.
- **Space Complexity**: O(1) — no extra memory is needed.

\`\`\`python
# Brute Force
for i in range(len(nums)):
    for j in range(i+1, len(nums)):
        if nums[i] + nums[j] == target:
            return [i, j]
\`\`\`

### Optimal Approach
The optimal way is to use a hash map to store each number and its index. For every element, check if the complement (target - num) exists in the map.
- **Time Complexity**: O(n) — we only need to pass through the array once.
- **Space Complexity**: O(n) — space is required for the hash map.

\`\`\`python
# Optimal
seen = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        return [seen[complement], i]
    seen[num] = i
\`\`\`

### Visual Walkthrough
Let's walk through the logic:
\`nums = [2, 7, 11, 15], target = 9\`
1. i=0, num=2, complement=7 → not in map → map={2:0}.
2. i=1, num=7, complement=2 → **found in map!** → return [0, 1] ✅

> 💡 **Tip**: Add your Gemini API key in the Settings page to unlock real, live AI explanations!`;
      }

      if (lower.includes('hint')) {
        return `💡 **Hint**: Think about which data structure provides O(1) lookup. If we use a hash map, we can store and check elements as we iterate!`;
      }

      if (lower.includes('review') || lower.includes('code')) {
        return `## Code Review 🔍

**Correctness**: ✅ Your code is fully correct, nice work!

**Time Complexity**: O(n) — a single pass over the array, which is optimal.

**Space Complexity**: O(n) — the hash map can grow up to n elements.

**Suggestions**:
1. Always check for edge cases: like an empty array or a single element.
2. Use descriptive variable names: for instance, \`num_to_index\` might be cleaner than \`seen\`.
3. Add a simple comment or docstring to explain the core logic.

**Rating**: 8/10 — Very clean and efficient code!

> 💡 Go to Profile -> Settings and add your Gemini API key for personalized, interactive code reviews!`;
      }

      if (lower.includes('hello') || lower.includes('hi') || lower.includes('help')) {
        return `👋 **Hello! I am CodeMentor AI!**

I am your personal DSA tutor. I can help you with:

- 🧠 **Explaining problems** — "Explain Two Sum to me"
- 🐛 **Debugging code** — "Why is my solution wrong?"
- 💡 **Providing hints** — "Give me a hint for Coin Change"
- 📚 **Teaching concepts** — "Explain Dynamic Programming"
- 🎯 **Interview preparation** — "What are common tree problems?"

**To unlock full AI capabilities**, please add your free Gemini API key in the Profile settings page.

What would you like to learn today? 🚀`;
      }

      return `🤖 **CodeMentor AI** here!

I am here to help you learn data structures and algorithms, review your code, and prepare for coding interviews.

**Feel free to ask questions like:**
- "Explain binary search step by step"
- "What's the difference between BFS and DFS?"
- "Give me a hint for the Two Sum problem"
- "How do I recognize a dynamic programming problem?"

> 💡 **Pro tip**: Add your free Gemini API key under Profile -> Settings to get live, detailed explanations!`;
    }

    // Default: Hinglish
    if (lower.includes('explain') && lower.includes('problem')) {
      return `## Problem Explanation 🎯

### Simple English Explanation
Bhai, is problem ko ek simple example se samjho. Jaise shelf par books ko sort karna hota hai na — bas humein sabse efficient tarika dhundhna hai unhe organize karne ka. Simple hai!

### Key Insight
Sabse important trick yeh hai ki hum ek **hash map** use kar sakte hain. Isse pehle se dekhi hui values ko store karke complement ko O(1) time mein check kar payenge. Cool na?

### Brute Force Approach
Sabse basic tarika toh yeh hai ki har ek pair ko check karo. Check if their sum equals the target.
- **Time**: O(n²) — check all pairs, thoda slow hai
- **Space**: O(1) — no extra memory needed

\`\`\`python
# Brute Force
for i in range(len(nums)):
    for j in range(i+1, len(nums)):
        if nums[i] + nums[j] == target:
            return [i, j]
\`\`\`

### Optimal Approach
Ab optimal tarika dekho: Ek hash map use karo to store each number and its index. Har element ke liye, check karo complement map mein hai ya nahi.
- **Time**: O(n) — single pass mein kaam ho jayega
- **Space**: O(n) — hash map storage ke liye space chahiye

\`\`\`python
# Optimal
seen = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        return [seen[complement], i]
    seen[num] = i
\`\`\`

### Visual Walkthrough
Chalo ek bar logic dekh lete hain:
\`nums = [2, 7, 11, 15], target = 9\`
1. i=0, num=2, complement=7 → map mein nahi hai → map={2:0} ho gaya.
2. i=1, num=7, complement=2 → **mil gaya seen mein!** → return [0, 1] ✅

> 💡 **Tip**: Settings page pe jaakar apni Gemini API key add karo bhai, tab real AI responses milenge!`;
    }

    if (lower.includes('hint')) {
      return `💡 **Hint**: Bhai, socho ki kaunsa data structure humein O(1) lookup deta hai. Agar hum map use karein toh hum elements ko check kar sakte hain as we iterate. Check karo jo elements pehle dekh chuke hain!`;
    }

    if (lower.includes('review') || lower.includes('code')) {
      return `## Code Review 🔍

**Correctness**: ✅ Bhai, code toh ekdum sahi chal raha hai, nice work!

**Time Complexity**: O(n) — array pe single pass ho raha hai, sahi hai.

**Space Complexity**: O(n) — hash map space le raha hai up to n elements.

**Suggestions**:
1. Edge cases check kar liya karo: like empty array ya single element.
2. Variable names thode aur descriptive rakho, jaise \`seen\` ki jagah \`num_to_index\` can be better.
3. Clean look ke liye ek comment ya docstring add kar do.

**Rating**: 8/10 — Mast aur efficient code hai!

> 💡 Profile settings mein jaakar apni Gemini API key daalo bhai, perfect code review mil jayega!`;
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('help')) {
      return `👋 **Hey there! Main hoon tera CodeMentor AI!**

Bhai, main tera personal DSA tutor hoon. In sab cheezon mein teri help kar sakta hoon:

- 🧠 **Explain problems** — "Explain Two Sum to me"
- 🐛 **Debug code** — "Why is my solution wrong?"
- 💡 **Give hints** — "Give me a hint for Coin Change"
- 📚 **Teach concepts** — "Explain Dynamic Programming"
- 🎯 **Interview prep** — "What are common tree problems?"

**Puri AI power unlock karne ke liye**, Profile settings me jaakar apni free Gemini API key daal de bhai!

Chalo, ab batao aaj kya seekhna hai? 🚀`;
    }

    return `🤖 **CodeMentor AI** here, bhai!

DSA aur algorithms seekhne mein, code review karne mein, ya interview prep mein main teri help karunga.

**Kuch bhi pooch sakte ho, jaise:**
- "Explain binary search step by step"
- "What's the difference between BFS and DFS?"
- "Give me a hint for the Two Sum problem"
- "How do I recognize a dynamic programming problem?"

> 💡 **Pro tip**: Profile → Settings mein jaakar apni free Gemini API key add kar do bhai, fir detailed aur personalized explanations milenge!`;
  }
}

export const ai = new AIService();
