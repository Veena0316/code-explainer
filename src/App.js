import { useState } from 'react';

function App() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedResult, setCopiedResult] = useState(false);

  const explainCode = async () => {
    if (!code.trim()) {
      alert('Please paste some code first!');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const prompt = "Analyze this code and return ONLY valid JSON: { \"language\": \"detected language\", \"summary\": \"one line what this code does\", \"explanation\": [{ \"line\": \"code line\", \"desc\": \"what it does\" }], \"concepts\": [\"concept1\"], \"tips\": [\"tip1\"], \"difficulty\": \"Beginner or Intermediate or Advanced\", \"complexity\": { \"time\": \"O(n) etc\", \"space\": \"O(n) etc\", \"score\": 1-10, \"rating\": \"Simple or Moderate or Complex\" }, \"bugs\": [\"potential bug or none\"] }. Code: " + code;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " +  process.env.REACT_APP_GROQ_API_KEY
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await res.json();
      if (!data.choices) {
        setError('API Error: ' + JSON.stringify(data));
        setLoading(false);
        return;
      }
      const txt = data.choices[0].message.content;
      const jsonMatch = txt.match(/\{[\s\S]*\}/);
      const clean = jsonMatch ? jsonMatch[0] : txt;
      setResult(JSON.parse(clean));
    } catch(err) {
      setError('Error: ' + err.message);
    }
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyResult = () => {
    if (!result) return;
    const text = "CODE EXPLANATION\n================\nLanguage: " + result.language + "\nDifficulty: " + result.difficulty + "\n\nSUMMARY:\n" + result.summary + "\n\nCONCEPTS:\n" + result.concepts.join('\n') + "\n\nTIPS:\n" + result.tips.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  function getDiffColor(d) {
    if (d === 'Beginner') return '#10b981';
    if (d === 'Intermediate') return '#f59e0b';
    return '#ef4444';
  }

  function getScoreColor(s) {
    if (s <= 3) return '#10b981';
    if (s <= 6) return '#f59e0b';
    return '#ef4444';
  }

  const examples = [
    { label: '🐍 Python', code: 'def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n-1)\n\nprint(factorial(5))' },
    { label: '⚡ JavaScript', code: 'const arr = [1,2,3,4,5];\nconst doubled = arr.map(x => x * 2);\nconsole.log(doubled);' },
    { label: '🗄️ SQL', code: 'SELECT name, age FROM users\nWHERE age > 18\nORDER BY age DESC\nLIMIT 10;' },
    { label: '☕ Java', code: 'public class Hello {\n  public static void main(String[] args) {\n    for(int i=0; i<5; i++) {\n      System.out.println("Hello " + i);\n    }\n  }\n}' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: 'Arial, sans-serif', color: '#e2e8f0' }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#020617 100%)', padding: '48px 40px 40px', borderBottom: '1px solid #1e293b', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at center,rgba(99,102,241,0.1) 0%,transparent 70%)' }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#818cf8', marginBottom: '20px', letterSpacing: '2px' }}>
            ✨ AI POWERED CODE EXPLAINER
          </div>
          <h1 style={{ fontSize: '52px', fontWeight: '900', margin: '0 0 12px', background: 'linear-gradient(90deg,#818cf8,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Code Explainer
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px', margin: '0 0 32px' }}>Paste any code — AI explains it line by line in simple English!</p>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['🌐', 'Multi Language'], ['⚡', 'Instant Results'], ['📊', 'Complexity Score'], ['💡', 'Improvement Tips']].map(([icon, label], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px' }}>
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Example Buttons */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Try an example:</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button key={i} onClick={() => setCode(ex.code)}
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Input */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {/* Editor Top Bar */}
          <div style={{ background: '#020617', padding: '12px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}/>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}/>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}/>
              <span style={{ color: '#334155', fontSize: '13px', marginLeft: '8px' }}>code.js</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={copyCode}
                style={{ background: copied ? '#10b981' : 'rgba(99,102,241,0.15)', color: copied ? 'white' : '#818cf8', border: '1px solid ' + (copied ? '#10b981' : 'rgba(99,102,241,0.3)'), borderRadius: '8px', padding: '5px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button onClick={() => { setCode(''); setResult(null); }}
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '5px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Line Numbers + Textarea */}
          <div style={{ display: 'flex' }}>
            <div style={{ background: '#020617', padding: '20px 12px', borderRight: '1px solid #1e293b', minWidth: '40px', textAlign: 'right' }}>
              {(code || '').split('\n').map((_, i) => (
                <div key={i} style={{ color: '#334155', fontSize: '13px', lineHeight: '1.6', fontFamily: 'monospace' }}>{i + 1}</div>
              ))}
              {!code && <div style={{ color: '#334155', fontSize: '13px', lineHeight: '1.6', fontFamily: 'monospace' }}>1</div>}
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={"// Paste your code here...\n// Supports Python, JavaScript, Java, C++, SQL, React and more!"}
              style={{ flex: 1, minHeight: '240px', background: '#0f172a', border: 'none', color: '#7dd3fc', padding: '20px 16px', fontSize: '14px', fontFamily: 'monospace', lineHeight: '1.6', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Bottom bar */}
          <div style={{ background: '#020617', padding: '8px 20px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#334155', fontSize: '12px' }}>{code.split('\n').length} lines • {code.length} characters</span>
            <span style={{ color: '#334155', fontSize: '12px' }}>Auto-detect language</span>
          </div>
        </div>

        {/* Explain Button */}
        <button onClick={explainCode}
          style={{ width: '100%', background: loading ? '#1e293b' : 'linear-gradient(135deg,#6366f1,#a855f7)', color: 'white', padding: '18px', border: 'none', borderRadius: '14px', fontSize: '18px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '24px', boxShadow: loading ? 'none' : '0 8px 25px rgba(99,102,241,0.4)', transition: 'all 0.3s' }}>
          {loading ? '⏳ AI is analyzing your code...' : '🔍 Explain This Code'}
        </button>

        {error && (
          <div style={{ background: '#fee2e2', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* RESULTS */}
        {result && (
          <div>
            {/* Top Summary */}
            <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '28px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#6366f1', color: 'white', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>{result.language}</span>
                  <span style={{ background: getDiffColor(result.difficulty) + '20', color: getDiffColor(result.difficulty), padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', border: '1px solid ' + getDiffColor(result.difficulty) + '40' }}>{result.difficulty}</span>
                </div>
                <button onClick={copyResult}
                  style={{ background: copiedResult ? '#10b981' : 'rgba(99,102,241,0.15)', color: copiedResult ? 'white' : '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                  {copiedResult ? '✓ Copied!' : '📋 Copy Results'}
                </button>
              </div>
              <h3 style={{ color: '#e2e8f0', margin: '0 0 8px', fontSize: '16px' }}>What this code does:</h3>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '15px', lineHeight: '1.8' }}>{result.summary}</p>
            </div>

            {/* Complexity Score */}
            {result.complexity && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
                <h3 style={{ color: '#f59e0b', margin: '0 0 20px', fontSize: '16px' }}>📊 Complexity Analysis</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '16px' }}>
                  <div style={{ background: '#020617', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Time</div>
                    <div style={{ color: '#f59e0b', fontSize: '22px', fontWeight: '900' }}>{result.complexity.time}</div>
                  </div>
                  <div style={{ background: '#020617', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Space</div>
                    <div style={{ color: '#a855f7', fontSize: '22px', fontWeight: '900' }}>{result.complexity.space}</div>
                  </div>
                  <div style={{ background: '#020617', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Score</div>
                    <div style={{ color: getScoreColor(result.complexity.score), fontSize: '22px', fontWeight: '900' }}>{result.complexity.score}/10</div>
                  </div>
                  <div style={{ background: '#020617', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Rating</div>
                    <div style={{ color: getScoreColor(result.complexity.score), fontSize: '16px', fontWeight: '900' }}>{result.complexity.rating}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Line by Line */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ color: '#818cf8', margin: '0 0 20px', fontSize: '16px' }}>📝 Line by Line Explanation</h3>
              {result.explanation && result.explanation.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px', padding: '16px', background: '#020617', borderRadius: '12px', border: '1px solid #1e293b' }}>
                  <div>
                    <div style={{ color: '#334155', fontSize: '10px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Code</div>
                    <code style={{ color: '#7dd3fc', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{item.line}</code>
                  </div>
                  <div>
                    <div style={{ color: '#334155', fontSize: '10px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Meaning</div>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '13px', lineHeight: '1.6' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Concepts, Tips, Bugs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: '#10b981', margin: '0 0 16px', fontSize: '15px' }}>✅ Concepts Used</h3>
                {result.concepts && result.concepts.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }}/>
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>{c}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                <h3 style={{ color: '#f59e0b', margin: '0 0 16px', fontSize: '15px' }}>💡 Tips to Improve</h3>
                {result.tips && result.tips.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ color: '#f59e0b', flexShrink: 0 }}>→</span>
                    <span style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>{t}</span>
                  </div>
                ))}
              </div>
              {result.bugs && result.bugs.length > 0 && (
                <div style={{ background: '#0f172a', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ color: '#ef4444', margin: '0 0 16px', fontSize: '15px' }}>⚠️ Potential Issues</h3>
                  {result.bugs.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ color: '#ef4444', flexShrink: 0 }}>!</span>
                      <span style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid #1e293b', padding: '24px 40px', textAlign: 'center', marginTop: '60px' }}>
        <p style={{ color: '#334155', fontSize: '14px', margin: 0 }}>Built with ❤️ by <span style={{ color: '#6366f1', fontWeight: '700' }}>Veena Siva Jyothi</span> • Powered by Groq AI</p>
      </div>
    </div>
  );
}

export default App;