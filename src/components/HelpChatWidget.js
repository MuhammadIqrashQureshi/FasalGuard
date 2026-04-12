import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function HelpChatWidget({ user }) {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const displayName = user?.name || user?.username || 'Farmer';

  useEffect(() => {
    const handleOpen = () => setChatOpen(true);
    window.addEventListener('open-help-chat', handleOpen);
    return () => window.removeEventListener('open-help-chat', handleOpen);
  }, []);

  const normalizeText = (value) => String(value || '').toLowerCase();

  const buildChatReply = (message) => {
    const text = normalizeText(message);
    const reply = { text: '', actions: [] };

    if (text.includes('hi') || text.includes('hello') || text.includes('hye')) {
      reply.text = 'Hi! How are you? How can I help you?';
      return reply;
    }

    if (text.includes('crop prediction') || text.includes('crop')) {
      reply.text = 'Use Crop Prediction to get AI-based crop recommendations and yield guidance.';
      reply.actions = [
        { label: 'Crop Prediction', path: '/crop-prediction' }
      ];
      return reply;
    }

    if (text.includes('soil analysis') || (text.includes('soil') && text.includes('analysis'))) {
      reply.text = 'Soil Analysis shows soil score, pH, and nutrient insights for your crop.';
      reply.actions = [
        { label: 'Soil Analysis', path: '/soil-analysis' }
      ];
      return reply;
    }

    if (text.includes('satellite') || text.includes('heatmap')) {
      reply.text = 'Satellite Analysis provides field heatmaps and real-time crop health insights.';
      reply.actions = [
        { label: 'Satellite Analysis', path: '/satellite-analysis' }
      ];
      return reply;
    }

    if (text.includes('weather') || text.includes('climate')) {
      reply.text = 'Weather Visualizations show the climate forecast used for recommendations.';
      reply.actions = [
        { label: 'Weather Dashboard', path: '/prediction-results/weather' }
      ];
      return reply;
    }

    if (text.includes('irrigation')) {
      reply.text = 'Smart Irrigation gives a water schedule based on crop and weather.';
      reply.actions = [
        { label: 'Smart Irrigation', path: '/prediction-results/irrigation' }
      ];
      return reply;
    }

    if (text.includes('matrix') || text.includes('comparison')) {
      reply.text = 'Crop Matrix helps you compare crops side by side.';
      reply.actions = [
        { label: 'Crop Matrix', path: '/prediction-results/matrix' }
      ];
      return reply;
    }

    if (text.includes('report')) {
      reply.text = 'Generate Report creates a professional PDF with AI insights.';
      reply.actions = [
        { label: 'Generate Report', path: '/prediction-results/report' }
      ];
      return reply;
    }

    if (text.includes('past trends') || text.includes('past yields')) {
      reply.text = 'Past Trends shows historical yield patterns and data insights.';
      reply.actions = [
        { label: 'Past Trends', path: '/past-trends' }
      ];
      return reply;
    }

    if (text.includes('voice chat') || text.includes('voice')) {
      reply.text = 'Voice Chat lets you ask questions by voice and get guided answers.';
      reply.actions = [{ label: 'Open Voice Chat', path: '/voice-chat' }];
      return reply;
    }

    reply.text = 'Sorry, I can only answer FasalGuard app questions. Try Crop Prediction, Soil Analysis, or Satellite Analysis.';
    return reply;
  };

  const handleChatSend = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const userMessage = { id: Date.now(), role: 'user', text: trimmed };
    const reply = buildChatReply(trimmed);
    const botMessage = {
      id: Date.now() + 1,
      role: 'bot',
      text: reply.text,
      actions: reply.actions
    };
    setChatMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setTimeout(() => {
      setChatMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
    setChatInput('');
  };

  const styles = useMemo(() => ({
    chatToggle: {
      position: 'fixed',
      right: '1.5rem',
      bottom: '1rem',
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
      border: 'none',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 24px rgba(16, 185, 129, 0.35)',
      cursor: 'pointer',
      zIndex: 1200,
    },
    chatPanel: {
      position: 'fixed',
      right: '1.5rem',
      bottom: '6.25rem',
      width: '380px',
      maxHeight: '520px',
      background: '#ffffff',
      borderRadius: '18px',
      boxShadow: '0 18px 40px rgba(15, 23, 42, 0.2)',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1200,
    },
    chatHeader: {
      padding: '1rem 1.2rem',
      background: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontWeight: 600,
      fontSize: '0.95rem',
    },
    chatBody: {
      padding: '1rem',
      background: '#f8fafc',
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    chatBubble: {
      maxWidth: '80%',
      padding: '0.7rem 0.9rem',
      borderRadius: '14px',
      fontSize: '0.85rem',
      lineHeight: 1.5,
    },
    chatTypingBubble: {
      maxWidth: '70%',
      padding: '0.6rem 0.9rem',
      borderRadius: '14px',
      background: '#ffffff',
      color: '#0f172a',
      display: 'flex',
      gap: '0.35rem',
      alignItems: 'center',
    },
    chatTypingDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: '#10b981',
      display: 'inline-block',
      animation: 'helpTyping 1s infinite ease-in-out',
    },
    chatInputRow: {
      display: 'flex',
      gap: '0.5rem',
      padding: '0.85rem',
      background: '#ffffff',
      borderTop: '1px solid rgba(148, 163, 184, 0.25)',
    },
    chatInput: {
      flex: 1,
      borderRadius: '999px',
      border: '1px solid rgba(148, 163, 184, 0.4)',
      padding: '0.65rem 0.9rem',
      fontSize: '0.85rem',
      outline: 'none',
      minHeight: '64px',
      resize: 'none',
      color: '#0f172a',
      background: '#ffffff',
    },
    chatSend: {
      background: '#10b981',
      color: '#ffffff',
      border: 'none',
      padding: '0.6rem 1.1rem',
      borderRadius: '999px',
      fontSize: '0.85rem',
      fontWeight: 600,
      cursor: 'pointer',
    },
    chatActions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.4rem',
      marginTop: '0.5rem',
    },
    chatActionBtn: {
      background: '#e8f5ee',
      color: '#0f766e',
      border: '1px solid rgba(16, 185, 129, 0.3)',
      padding: '0.3rem 0.6rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      cursor: 'pointer',
    },
  }), []);

  return (
    <>
      <style>{`
        @keyframes helpTyping {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            style={styles.chatPanel}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div style={styles.chatHeader}>
              <span>Hi {displayName}</span>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
            <div style={styles.chatBody}>
              {chatMessages.length === 0 && (
                <div style={{ ...styles.chatBubble, background: '#ffffff', color: '#0f172a' }}>
                  Hi {displayName}! Ask me about Crop Prediction, Soil Analysis, Satellite, or Voice Chat.
                </div>
              )}
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    ...styles.chatBubble,
                    alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                    background: message.role === 'user' ? '#22c55e' : '#ffffff',
                    color: message.role === 'user' ? '#ffffff' : '#0f172a'
                  }}
                >
                  {message.text}
                  {message.role === 'bot' && message.actions?.length > 0 && (
                    <div style={styles.chatActions}>
                      {message.actions.map((action) => (
                        <button
                          key={action.path}
                          type="button"
                          style={styles.chatActionBtn}
                          onClick={() => navigate(action.path)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div style={styles.chatTypingBubble}>
                  <span style={{ ...styles.chatTypingDot, animationDelay: '0s' }}></span>
                  <span style={{ ...styles.chatTypingDot, animationDelay: '0.2s' }}></span>
                  <span style={{ ...styles.chatTypingDot, animationDelay: '0.4s' }}></span>
                </div>
              )}
            </div>
            <div style={styles.chatInputRow}>
              <textarea
                style={styles.chatInput}
                placeholder="Ask about FasalGuard..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSend();
                  }
                }}
              />
              <button style={styles.chatSend} type="button" onClick={handleChatSend}>
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        style={styles.chatToggle}
        type="button"
        onClick={() => setChatOpen((prev) => !prev)}
        aria-label="Open help chat"
      >
        <MessageCircle size={26} />
      </button>
    </>
  );
}
