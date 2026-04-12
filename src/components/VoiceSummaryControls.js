import React, { useEffect, useMemo, useRef, useState } from 'react';
import './VoiceSummaryControls.css';

const DEFAULT_SPEEDS = [0.8, 1.0, 1.1, 1.2];

const buildUtteranceText = (sections) => sections.map((s) => s.text).join(' ');

const VoiceSummaryControls = ({
  apiBase,
  type,
  analysis,
  input,
  language = 'en',
  title = 'Voice Summary',
}) => {
  const [mode, setMode] = useState('default');
  const [lang, setLang] = useState(language === 'ur' ? 'ur-PK' : 'en-US');
  const [speed, setSpeed] = useState(1.0);
  const [sections, setSections] = useState([]);
  const [status, setStatus] = useState('idle');
  const [activeSectionId, setActiveSectionId] = useState('snapshot');
  const utteranceRef = useRef(null);

  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const payload = useMemo(() => ({
    type,
    analysis,
    input,
    options: { mode, lang: language },
  }), [analysis, input, lang, language, mode, type]);

  useEffect(() => {
    let isMounted = true;
    if (!analysis) return;

    const fetchSummary = async () => {
      try {
        setStatus('loading');
        const response = await fetch(`${apiBase}/api/analysis/voice-summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Language': language },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!isMounted) return;
        if (data?.success) {
          setSections(data.script?.sections || []);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      } catch {
        if (isMounted) setStatus('error');
      }
    };

    fetchSummary();
    return () => { isMounted = false; };
  }, [analysis, apiBase, language, payload]);

  useEffect(() => () => {
    if (canSpeak) window.speechSynthesis.cancel();
  }, [canSpeak]);

  const handlePlay = () => {
    if (!canSpeak || sections.length === 0) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus('playing');
      return;
    }

    window.speechSynthesis.cancel();
    const text = buildUtteranceText(sections);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = speed;
    utterance.onend = () => setStatus('ready');
    utterance.onerror = () => setStatus('error');
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setStatus('playing');
  };

  const handlePause = () => {
    if (!canSpeak) return;
    window.speechSynthesis.pause();
    setStatus('paused');
  };

  const handleRepeatSection = () => {
    if (!canSpeak || sections.length === 0) return;
    const section = sections.find((s) => s.id === activeSectionId) || sections[0];
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(section.text);
    utterance.lang = lang;
    utterance.rate = speed;
    utterance.onend = () => setStatus('ready');
    utterance.onerror = () => setStatus('error');
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setStatus('playing');
  };

  return (
    <section className="voice-summary">
      <div className="voice-summary-header">
        <div>
          <div className="voice-summary-kicker">{title}</div>
          <div className="voice-summary-sub">Concise 60-90 second narration</div>
        </div>
        <div className="voice-summary-status">{status}</div>
      </div>

      <div className="voice-summary-controls">
        <button type="button" className="voice-btn primary" onClick={handlePlay} disabled={!canSpeak || status === 'loading'}>
          Play
        </button>
        <button type="button" className="voice-btn" onClick={handlePause} disabled={!canSpeak || status !== 'playing'}>
          Pause
        </button>
        <button type="button" className="voice-btn" onClick={handleRepeatSection} disabled={!canSpeak || sections.length === 0}>
          Repeat Section
        </button>
        <div className="voice-control">
          <label htmlFor="voice-section">Section</label>
          <select id="voice-section" value={activeSectionId} onChange={(e) => setActiveSectionId(e.target.value)}>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>{section.title}</option>
            ))}
          </select>
        </div>
        <div className="voice-control">
          <label htmlFor="voice-speed">Speed</label>
          <select id="voice-speed" value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            {DEFAULT_SPEEDS.map((rate) => (
              <option key={rate} value={rate}>{rate.toFixed(1)}x</option>
            ))}
          </select>
        </div>
        <div className="voice-control">
          <label htmlFor="voice-lang">Language</label>
          <select id="voice-lang" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en-US">English</option>
            <option value="ur-PK">Urdu</option>
          </select>
        </div>
        <div className="voice-control">
          <label htmlFor="voice-mode">Mode</label>
          <select id="voice-mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="default">Default</option>
            <option value="full">Full report</option>
          </select>
        </div>
      </div>

      {sections.length > 0 && (
        <div className="voice-summary-script">
          {sections.map((section) => (
            <div key={section.id} className="voice-summary-section">
              <div className="voice-summary-title">{section.title}</div>
              <div className="voice-summary-text">{section.text}</div>
            </div>
          ))}
        </div>
      )}

      {!canSpeak && (
        <div className="voice-summary-note">Web Speech API is not supported in this browser.</div>
      )}
    </section>
  );
};

export default VoiceSummaryControls;
