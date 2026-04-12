import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Play, StopCircle, Globe, Gauge, HelpCircle, MessageCircle } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

const API_MODULE_ACTIONS = [
  { key: 'home', label: { en: 'Home', ur: 'ہوم' }, path: '/home', keywords: ['home', 'dashboard', 'main menu'] },
  { key: 'weather', label: { en: 'Climate Prediction', ur: 'موسمی پیشگوئی' }, path: '/prediction-results/weather', keywords: ['weather', 'climate', 'forecast', 'mosam', 'mausam', 'climate prediction'] },
  { key: 'soil', label: { en: 'Soil Analysis', ur: 'مٹی کا تجزیہ' }, path: '/soil-analysis', keywords: ['soil', 'zameen', 'zameen ka', 'soil analysis'] },
  { key: 'satellite', label: { en: 'Satellite & Field Analysis', ur: 'سیٹلائٹ اور فیلڈ تجزیہ' }, path: '/satellite-analysis', keywords: ['satellite', 'field', 'map', 'satellite analysis'] },
  { key: 'crop', label: { en: 'Crop Prediction', ur: 'فصل پیشگوئی' }, path: '/crop-prediction', keywords: ['crop', 'prediction', 'recommendation', 'crop prediction'] },
  { key: 'irrigation', label: { en: 'Smart Irrigation', ur: 'سمارٹ آبپاشی' }, path: '/prediction-results/irrigation', keywords: ['irrigation', 'pani', 'water schedule'] },
  { key: 'matrix', label: { en: 'Crop Matrix', ur: 'کراپ میٹرکس' }, path: '/prediction-results/matrix', keywords: ['matrix', 'comparison', 'compare crops'] },
  { key: 'report', label: { en: 'Generate Report', ur: 'رپورٹ بنائیں' }, path: '/prediction-results/report', keywords: ['report', 'pdf', 'download'] },
  { key: 'trends', label: { en: 'Past Trends', ur: 'گزشتہ رجحانات' }, path: '/past-trends', keywords: ['past trends', 'history', 'trends'] },
  { key: 'services', label: { en: 'Services', ur: 'سروسز' }, path: '/services', keywords: ['services', 'service'] },
  { key: 'contact', label: { en: 'Contact', ur: 'رابطہ' }, path: '/contact', keywords: ['contact', 'help desk'] },
];

const DEFAULT_SUGGESTIONS = [
  { en: 'How do I use this app?', ur: 'میں یہ ایپ کیسے استعمال کروں؟' },
  { en: 'Explain soil analysis', ur: 'مٹی کا تجزیہ سمجھائیں' },
  { en: 'How climate prediction module works?', ur: 'موسمی پیشگوئی کہاں ہے؟' },
  { en: 'How to use satellite analysis?', ur: 'سیٹلائٹ تجزیہ کیسے استعمال کریں؟' },
];

const EXTRA_SUGGESTIONS = [
  { en: 'How do I check past yields?', ur: 'ماضی کی پیداوار کیسے دیکھیں؟' },
  { en: 'Explain crop prediction results.', ur: 'کراپ پریڈکشن کے نتائج سمجھائیں۔' },
  { en: 'How does smart irrigation work?', ur: 'سمارٹ آبپاشی کیسے کام کرتی ہے؟' },
  { en: 'What is the crop comparison matrix?', ur: 'کراپ کمپیریزن میٹرکس کیا ہے؟' },
  { en: 'How do I generate a report?', ur: 'رپورٹ کیسے بنائیں؟' },
  { en: 'How to read the soil score?', ur: 'سوائل اسکور کیسے پڑھیں؟' },
  { en: 'What is field heatmap?', ur: 'فیلڈ ہیٹ میپ کیا ہے؟' },
  { en: 'Where can I see past trends?', ur: 'گزشتہ رجحانات کہاں دیکھیں؟' },
];

const LANG_OPTIONS = [
  { id: 'en-US', label: 'English' },
  { id: 'ur-PK', label: 'Urdu' },
];

const SPEED_OPTIONS = [0.8, 1.0, 1.2];

const normalizeText = (value) => String(value || '').toLowerCase();

const buildHowToUseResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Step 1: App open karein aur login ya register karein. (Link: /home)\n- Step 2: Main menu se feature select karein.\n- Step 3: Past yields aur crop prediction ke liye Crop Prediction page par jaein. (Link: /crop-prediction)\n- Step 4: Soil analysis ke liye Soil Analysis page open karein. (Link: /soil-analysis)\n- Step 5: Heatmaps aur real-time field analysis ke liye Satellite Analysis page par jaein. (Link: /satellite-analysis)';
  }
  return '- Step 1: Open the app and log in or register.\n- Step 2: Use the main menu to choose a feature.\n- Step 3: For past yields and crop prediction, open the Crop Prediction page.\n- Step 4: For soil analysis, open the Soil Analysis page.\n- Step 5: For heatmaps and real-time field analysis, open the Satellite Analysis page.';
};

const buildSoilAnalysisResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Soil Analysis page open karein. (Link: /soil-analysis)\n- City select karein aur apni crop enter karein.\n- Result main soil score, pH level, aur dusre indicators milte hain.\n- Detail dekhne ke liye isi page par complete breakdown check karein.';
  }
  return '- Open the Soil Analysis page.\n- Select your city and enter the crop you want to analyze.\n- The result shows soil score, pH, and other key indicators.\n- For full details, review the breakdown on the same page.';
};

const buildClimatePredictionResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Climate Prediction module real-time weather forecast deta hai.\n- Is ke base par best crop suggestion milti hai.\n- Is main smart irrigation calculations aur detailed weather dashboard hota hai.\n- Crop comparison matrix se crops ka muqabla kar sakte hain.\n- Is module ke liye Crop Prediction page open karein. (Link: /crop-prediction)';
  }
  return '- The Climate Prediction module provides real-time weather forecasts.\n- It suggests suitable crops based on upcoming conditions.\n- It also includes smart irrigation calculations and a detailed weather dashboard.\n- You can compare crops using the crop comparison matrix.\n- Open the Crop Prediction page to access this module.';
};

const buildSatelliteAnalysisResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Satellite Analysis page open karein.\n- Crop aur city select karein.\n- Apni coordinates enter karein.\n- Map par apna field highlight karein.\n- Aap ko field ke results mil jaenge.';
  }
  return '- Open the Satellite Analysis page.\n- Select crop and city.\n- Enter your coordinates.\n- Highlight your field on the map.\n- Then you will get the field results.';
};

const buildPastYieldsResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Past Trends page open karein.\n- Apni crop ya time range select karein.\n- Wahan past yields aur historical trends milte hain.';
  }
  return '- Open the Past Trends page.\n- Choose crop or time range.\n- You will see past yields and historical trends there.';
};

const buildCropPredictionResultsResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Crop Prediction run karein.\n- Prediction Results page par recommended crop aur details milti hain.\n- Wahan se aap detail sections open kar sakte hain.';
  }
  return '- Run Crop Prediction.\n- On the Prediction Results page you get recommended crops and details.\n- Open the detail sections from there.';
};

const buildIrrigationResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Smart Irrigation page open karein.\n- City aur crop select karein.\n- System aap ko irrigation schedule suggest karega.';
  }
  return '- Open the Smart Irrigation page.\n- Select city and crop.\n- The system suggests an irrigation schedule.';
};

const buildMatrixResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Crop Matrix page open karein.\n- Multiple crops compare karein.\n- Wahan comparative insights milti hain.';
  }
  return '- Open the Crop Matrix page.\n- Compare multiple crops.\n- You will see side-by-side insights.';
};

const buildReportResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Report Generator page open karein.\n- Required details select karein.\n- Report generate karke download kar lein.';
  }
  return '- Open the Report Generator page.\n- Select the required details.\n- Generate and download the report.';
};

const buildSoilScoreResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Soil Analysis page par soil score milta hai.\n- Score ke sath pH aur nutrients bhi dikhte hain.\n- High score better soil health show karta hai.';
  }
  return '- On the Soil Analysis page you will see the soil score.\n- It is shown with pH and nutrient indicators.\n- Higher score means better soil health.';
};

const buildFieldHeatmapResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Satellite Analysis main heatmap field ki condition dikhata hai.\n- Colors se stress aur variation samajh aati hai.\n- Map par area select karke details dekhein.';
  }
  return '- In Satellite Analysis, the heatmap shows field condition.\n- Colors indicate stress and variation.\n- Select the area on the map to see details.';
};

const buildPastTrendsResponse = (lang) => {
  if (lang === 'ur-PK') {
    return '- Past Trends page par historical data aur trends milte hain.\n- Crop aur time range choose karke insights dekhein.';
  }
  return '- The Past Trends page shows historical data and trends.\n- Choose crop and time range to view insights.';
};

const buildHelpResponse = (lang) => {
  if (lang === 'ur-PK') {
    return 'FasalGuard main aap ko crop prediction, soil analysis, satellite field analysis, aur climate forecast milta hai. Crop prediction ke liye Crop Prediction page kholen. Climate forecast Weather Visualizations main hai. Soil analysis ke liye Soil Analysis page kholen. Field analysis ke liye Satellite page kholen. Main aap ko relevant page tak guide kar sakta hoon.';
  }
  return 'In FasalGuard you can use Crop Prediction, Soil Analysis, Satellite Field Analysis, and Climate Forecast. Use Crop Prediction for crop guidance, Weather Visualizations for climate, Soil Analysis for soil reports, and Satellite for field stress. I can guide you to the right page.';
};

const buildIrrelevantResponse = (lang) => {
  if (lang === 'ur-PK') {
    return 'Yeh sawal app ke features se match nahi hota. Aap crop prediction, soil analysis, climate prediction, ya satellite analysis ke bare mein pooch sakte hain. Neeche se koi feature select karein.';
  }
  return 'That question does not match app features. You can ask about crop prediction, soil analysis, climate prediction, or satellite analysis. Pick a feature below.';
};

const buildModuleResponse = (lang, moduleLabels) => {
  if (!moduleLabels.length) return '';
  if (lang === 'ur-PK') {
    return `Aap ne ${moduleLabels.join(', ')} ke bare mein poocha. Main aap ko is module ka short summary aur sahi page par le ja sakta hoon.`;
  }
  return `You asked about ${moduleLabels.join(', ')}. I can summarize that module and take you to the right page.`;
};

export default function VoiceChat() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState(language === 'ur' ? 'ur-PK' : 'en-US');
  const [speed, setSpeed] = useState(1.0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [actions, setActions] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [cropLoading, setCropLoading] = useState(false);
  const recognitionRef = useRef(null);

  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const SpeechRecognition = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  const stopSpeak = () => {
    if (canSpeak) window.speechSynthesis.cancel();
  };

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const speak = (text) => {
    if (!canSpeak || !text) return;
    stopSpeak();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    utterance.rate = speed;
    window.speechSynthesis.speak(utterance);
  };

  const buildAnswer = (query) => {
    const text = normalizeText(query);
    const matched = API_MODULE_ACTIONS.filter((item) =>
      item.keywords.some((keyword) => text.includes(keyword))
    );

    const wantsHowTo = text.includes('how') || text.includes('use') || text.includes('guide') || text.includes('kaise') || text.includes('step by step') || text.includes('steps');
    const wantsSoil = text.includes('soil analysis') || (text.includes('soil') && text.includes('analysis')) || text.includes('zameen');
    const wantsClimate = text.includes('climate prediction') || text.includes('weather prediction') || text.includes('climate module') || text.includes('weather forecast');
    const wantsSatellite = text.includes('satellite') || text.includes('heatmap') || text.includes('heatmaps') || text.includes('field analysis');
    const wantsPastYields = text.includes('past yields') || (text.includes('past') && text.includes('yield'));
    const wantsCropResults = text.includes('crop prediction results') || (text.includes('crop') && text.includes('results'));
    const wantsIrrigation = text.includes('irrigation') || text.includes('water schedule');
    const wantsMatrix = text.includes('matrix') || text.includes('comparison matrix') || text.includes('compare crops');
    const wantsReport = text.includes('report') || text.includes('generate report');
    const wantsSoilScore = text.includes('soil score') || text.includes('score') && text.includes('soil');
    const wantsHeatmap = text.includes('heatmap') || text.includes('field heatmap');
    const wantsPastTrends = text.includes('past trends') || text.includes('history') && text.includes('trends');

    const moduleLabels = matched.map((item) => (selectedLang === 'ur-PK' ? item.label.ur : item.label.en));
    const moduleResponse = buildModuleResponse(selectedLang, moduleLabels);
    const helpResponse = buildHelpResponse(selectedLang);

    let finalResponse = '';
    let finalActions = matched;
    if (wantsPastYields) {
      finalResponse = buildPastYieldsResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) => item.key === 'trends');
    } else if (wantsCropResults) {
      finalResponse = buildCropPredictionResultsResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) => item.key === 'crop');
    } else if (wantsIrrigation) {
      finalResponse = buildIrrigationResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) => item.key === 'irrigation');
    } else if (wantsMatrix) {
      finalResponse = buildMatrixResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) => item.key === 'matrix');
    } else if (wantsReport) {
      finalResponse = buildReportResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) => item.key === 'report');
    } else if (wantsSoilScore) {
      finalResponse = buildSoilScoreResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) => item.key === 'soil');
    } else if (wantsHeatmap) {
      finalResponse = buildFieldHeatmapResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) => item.key === 'satellite');
    } else if (wantsPastTrends) {
      finalResponse = buildPastTrendsResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) => item.key === 'trends');
    } else if (wantsSatellite) {
      finalResponse = buildSatelliteAnalysisResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) => item.key === 'satellite');
    } else if (wantsSoil) {
      finalResponse = buildSoilAnalysisResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) => item.key === 'soil');
    } else if (wantsClimate) {
      finalResponse = buildClimatePredictionResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) => item.key === 'crop');
    } else if (wantsHowTo) {
      finalResponse = buildHowToUseResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) =>
        ['home', 'crop', 'soil', 'satellite'].includes(item.key)
      );
    } else if (moduleResponse) {
      finalResponse = `${moduleResponse} ${helpResponse}`;
    } else {
      finalResponse = buildIrrelevantResponse(selectedLang);
      finalActions = API_MODULE_ACTIONS.filter((item) =>
        ['crop', 'soil', 'satellite'].includes(item.key)
      );
    }

    return {
      response: finalResponse,
      actions: finalActions,
    };
  };

  const handleAsk = (query) => {
    if (!query) return;
    const { response: answer, actions: nextActions } = buildAnswer(query);
    setResponse(answer);
    setActions(nextActions);
    speak(answer);
  };

  const handleStartListening = () => {
    if (!SpeechRecognition) return;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      const combined = `${finalText} ${interimText}`.trim();
      setTranscript(combined);
      if (finalText.trim()) {
        handleAsk(finalText.trim());
      }
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const handleActionClick = (action) => {
    if (action.key === 'crop') {
      setCropLoading(true);
      setTimeout(() => {
        setCropLoading(false);
        navigate(action.path);
      }, 800);
      return;
    }
    navigate(action.path);
  };

  const styles = useMemo(() => ({
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7fbf8 0%, #eef6f0 100%)',
      color: '#0f172a',
      padding: '2rem 1.5rem',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '2rem',
      position: 'relative',
    },
    title: {
      fontSize: '2.1rem',
      fontWeight: 800,
      color: '#0f172a',
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 35%, #0ea5e9 70%, #6366f1 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    card: {
      background: '#ffffff',
      borderRadius: '18px',
      padding: '1.5rem',
      boxShadow: '0 14px 30px rgba(15, 23, 42, 0.08)',
      border: '1px solid rgba(34, 197, 94, 0.2)',
      animation: 'vcFadeLift 0.45s ease both',
    },
    controls: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      alignItems: 'center',
      marginTop: '1rem',
    },
    button: {
      background: '#22c55e',
      color: '#fff',
      border: 'none',
      padding: '0.7rem 1.2rem',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
    },
    ghost: {
      background: '#eef6f0',
      color: '#14532d',
      border: '1px solid rgba(34, 197, 94, 0.3)',
    },
    input: {
      width: '100%',
      padding: '0.8rem 1rem',
      borderRadius: '12px',
      border: '1px solid rgba(148, 163, 184, 0.4)',
      fontSize: '1rem',
      marginTop: '1rem',
    },
    response: {
      marginTop: '1rem',
      padding: '1rem',
      borderRadius: '14px',
      background: 'rgba(34, 197, 94, 0.12)',
      border: '1px solid rgba(34, 197, 94, 0.25)',
      color: '#1f2937',
      lineHeight: 1.6,
      whiteSpace: 'pre-line',
      animation: 'vcFadeLift 0.35s ease both',
    },
    actionRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.6rem',
      marginTop: '1rem',
    },
  }), []);

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes vcFadeLift {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .vc-loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(247, 251, 248, 0.92);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }
        .vc-loading-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: #ffffff;
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: 999px;
          padding: 0.9rem 1.2rem;
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
        }
        .vc-typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          animation: vcTyping 1s infinite ease-in-out;
        }
        .vc-loading-label {
          color: #1b4332;
          font-weight: 700;
          font-size: 0.95rem;
        }
        .vc-crop-overlay {
          position: fixed;
          inset: 0;
          background: rgba(247, 251, 248, 0.92);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          z-index: 2200;
          backdrop-filter: blur(4px);
        }
        .vc-clouds {
          position: relative;
          width: 180px;
          height: 80px;
        }
        .vc-cloud {
          position: absolute;
          background: #ffffff;
          border-radius: 999px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
          animation: vcFloat 1.8s ease-in-out infinite;
        }
        .vc-cloud.one {
          width: 120px;
          height: 44px;
          left: 0;
          top: 18px;
        }
        .vc-cloud.two {
          width: 90px;
          height: 34px;
          right: 0;
          top: 0;
          animationDelay: 0.2s;
        }
        .vc-drops {
          display: flex;
          gap: 10px;
          margin-top: 8px;
        }
        .vc-drop {
          width: 8px;
          height: 14px;
          background: #60a5fa;
          border-radius: 999px;
          animation: vcDrop 0.9s ease-in-out infinite;
        }
        .vc-drop:nth-child(2) { animationDelay: 0.2s; }
        .vc-drop:nth-child(3) { animationDelay: 0.4s; }
        @keyframes vcFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes vcDrop {
          0% { transform: translateY(-6px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }
        @keyframes vcTyping {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
      {pageLoading && (
        <div className="vc-loading-overlay">
          <div className="vc-loading-bubble">
            <span className="vc-typing-dot" style={{ animationDelay: '0s' }}></span>
            <span className="vc-typing-dot" style={{ animationDelay: '0.2s' }}></span>
            <span className="vc-typing-dot" style={{ animationDelay: '0.4s' }}></span>
          </div>
          <div className="vc-loading-label">Preparing voice assistant...</div>
        </div>
      )}
      {cropLoading && (
        <div className="vc-crop-overlay">
          <div className="vc-clouds">
            <span className="vc-cloud one"></span>
            <span className="vc-cloud two"></span>
          </div>
          <div className="vc-drops">
            <span className="vc-drop"></span>
            <span className="vc-drop"></span>
            <span className="vc-drop"></span>
          </div>
          <div className="vc-loading-label">Opening Crop Prediction...</div>
        </div>
      )}
      <div style={styles.header}>
        <div style={styles.title}>
          <MessageCircle size={32} color="#22c55e" />
          {t('voiceChat', 'Voice Help Chat')}
        </div>
        <button
          style={{ ...styles.button, ...styles.ghost, position: 'absolute', right: 0 }}
          type="button"
          onClick={() => navigate('/home')}
        >
          {t('backHome', 'Back to Home')}
        </button>
      </div>

      <div style={{ ...styles.card, animationDelay: '40ms' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={18} color="#22c55e" />
            <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
              {LANG_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gauge size={18} color="#22c55e" />
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
              {SPEED_OPTIONS.map((rate) => (
                <option key={rate} value={rate}>{rate.toFixed(1)}x</option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.controls}>
          <button style={styles.button} type="button" onClick={handleStartListening} disabled={!SpeechRecognition || listening}>
            <Mic size={16} /> {t('startListening', 'Start Listening')}
          </button>
          <button style={{ ...styles.button, ...styles.ghost }} type="button" onClick={handleStopListening} disabled={!listening}>
            <MicOff size={16} /> {t('stopListening', 'Stop')}
          </button>
          <button style={{ ...styles.button, ...styles.ghost }} type="button" onClick={() => speak(response)} disabled={!response}>
            <Play size={16} /> {t('playAnswer', 'Play Answer')}
          </button>
          <button style={{ ...styles.button, ...styles.ghost }} type="button" onClick={stopSpeak}>
            <StopCircle size={16} /> {t('stopAudio', 'Stop Audio')}
          </button>
        </div>

        <input
          style={styles.input}
          placeholder={t('askPlaceholder', 'Ask in Urdu or English...')}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAsk(transcript);
          }}
        />

        <div style={styles.controls}>
          <button style={{ ...styles.button, ...styles.ghost }} type="button" onClick={() => handleAsk(transcript)}>
            <HelpCircle size={16} /> {t('getHelp', 'Get Help')}
          </button>
        </div>

        {response && (
          <div style={styles.response}>
            {response}
          </div>
        )}

        {actions.length > 0 && (
          <div style={styles.actionRow}>
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                style={{ ...styles.button, ...styles.ghost }}
                onClick={() => handleActionClick(action)}
              >
                {selectedLang === 'ur-PK' ? action.label.ur : action.label.en}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ ...styles.card, marginTop: '1.5rem', animationDelay: '120ms' }}>
        <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#1f2937' }}>
          {t('suggestions', 'Try asking')}
        </div>
        <div style={styles.actionRow}>
          {DEFAULT_SUGGESTIONS.map((question) => {
            const label = selectedLang === 'ur-PK' ? question.ur : question.en;
            return (
              <button
                key={question.en}
                type="button"
                style={{ ...styles.button, ...styles.ghost }}
                onClick={() => handleAsk(label)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ ...styles.card, marginTop: '1.5rem', animationDelay: '180ms' }}>
        <div style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#1f2937' }}>
          {t('moreQuestions', 'More questions')}
        </div>
        <div style={styles.actionRow}>
          {EXTRA_SUGGESTIONS.map((question) => {
            const label = selectedLang === 'ur-PK' ? question.ur : question.en;
            return (
              <button
                key={question.en}
                type="button"
                style={{ ...styles.button, ...styles.ghost }}
                onClick={() => handleAsk(label)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {!SpeechRecognition && (
        <div style={{ marginTop: '1rem', color: '#ef4444' }}>
          {t('speechNotSupported', 'Speech recognition is not supported in this browser. Please type your question.')}
        </div>
      )}
    </div>
  );
}
