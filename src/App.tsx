import React, { useState, useEffect, useId } from 'react';
import { STATIONS, generateTrainsForRoute } from './data/stations';
import { TRANSLATIONS } from './data/i18n';
import { LanguageCode, Station, TrainSchedule, StoredTicket } from './types';
import { TicketCard } from './components/TicketCard';
import { OfflineTicketsList } from './components/OfflineTicketsList';
import { TTEVerifyModal } from './components/TTEVerifyModal';
import { AndroidAPKModal } from './components/AndroidAPKModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  Mic,
  ArrowRightLeft,
  Calendar,
  Users,
  Train,
  Check,
  AlertCircle,
  Sun,
  Moon,
  Compass,
  Download,
  Shield,
  Zap,
  Ticket as TicketIcon,
  Info,
  Smartphone,
} from 'lucide-react';

export default function App() {
  // Theme state: dark / light
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('rail_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rail_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rail_theme', 'light');
    }
  }, [isDark]);

  // Language state
  const [lang, setLang] = useState<LanguageCode>('en');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Tabs: Journey Fare vs Platform Fare
  const [activeTab, setActiveTab] = useState<'journey' | 'platform'>('journey');

  // Booking Form State
  const [fromInput, setFromInput] = useState<string>('SBC - KSR Bengaluru');
  const [toInput, setToInput] = useState<string>('MYS - Mysuru Jn');
  const [platformStationInput, setPlatformStationInput] = useState<string>('SBC - KSR Bengaluru');

  // Journey Extras
  const todayStr = new Date().toISOString().split('T')[0];
  const [journeyDate, setJourneyDate] = useState<string>(todayStr);
  const [passengers, setPassengers] = useState<number>(1);
  const [platformTicketCount, setPlatformTicketCount] = useState<number>(1);

  // Validation Error
  const [formError, setFormError] = useState<string | null>(null);

  // Search Results
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [resolvedFrom, setResolvedFrom] = useState<Station | null>(null);
  const [resolvedTo, setResolvedTo] = useState<Station | null>(null);
  const [trainList, setTrainList] = useState<TrainSchedule[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<TrainSchedule | null>(null);

  // Generating Ticket State (Simulated 600ms)
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeGeneratedTicket, setActiveGeneratedTicket] = useState<StoredTicket | null>(null);

  // Offline Tickets Stored in LocalStorage
  const [storedTickets, setStoredTickets] = useState<StoredTicket[]>(() => {
    try {
      const raw = localStorage.getItem('bharat_tickets');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  // TTE Verify Modal
  const [isTTEModalOpen, setIsTTEModalOpen] = useState<boolean>(false);

  // Voice recognition state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  // PWA Install hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);

  // Datalist IDs
  const fromDatalistId = useId();
  const toDatalistId = useId();
  const platformDatalistId = useId();

  // Helper to find station from query
  const findStation = (query: string): Station | undefined => {
    const q = query.trim().toUpperCase();
    if (!q) return undefined;
    // 1. Exact code match
    const byCode = STATIONS.find((s) => s.code === q);
    if (byCode) return byCode;

    // 2. Starts with code (e.g. "SBC - ...")
    const byCodePrefix = STATIONS.find((s) => q.startsWith(s.code));
    if (byCodePrefix) return byCodePrefix;

    // 3. Name or city includes
    const cleanQ = query.trim().toLowerCase();
    const byName = STATIONS.find(
      (s) =>
        s.name.toLowerCase().includes(cleanQ) ||
        s.city.toLowerCase().includes(cleanQ) ||
        (cleanQ.includes('bangalore') && s.code === 'SBC') ||
        (cleanQ.includes('mysore') && s.code === 'MYS') ||
        (cleanQ.includes('bengaluru') && s.code === 'SBC') ||
        (cleanQ.includes('mandya') && s.code === 'MKM') ||
        (cleanQ.includes('ramanagar') && s.code === 'RMM')
    );
    return byName;
  };

  // Swap Stations button
  const handleSwapStations = () => {
    const temp = fromInput;
    setFromInput(toInput);
    setToInput(temp);
  };

  // Web Speech API Handler
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceFeedback('Speech recognition not supported in this browser.');
      setTimeout(() => setVoiceFeedback(null), 3500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Language selection mapping as required
      let speechCode = 'en-IN';
      if (lang === 'kn') speechCode = 'kn-IN';
      else if (lang === 'hi') speechCode = 'hi-IN';
      else if (lang === 'ta') speechCode = 'ta-IN';
      else if (lang === 'te') speechCode = 'te-IN';
      else if (lang === 'ml') speechCode = 'ml-IN';
      else if (lang === 'mr') speechCode = 'mr-IN';
      else if (lang === 'bn') speechCode = 'bn-IN';
      else if (lang === 'gu') speechCode = 'gu-IN';

      recognition.lang = speechCode;

      setIsListening(true);
      setVoiceFeedback(`${t.listeningState} (${speechCode})`);

      recognition.onresult = (event: any) => {
        setIsListening(false);
        const transcript = event.results[0][0].transcript.trim();
        setVoiceFeedback(`Heard: "${transcript}"`);
        setTimeout(() => setVoiceFeedback(null), 3000);

        // Requirement: if transcript contains " to " split into from/to else put in from
        const lower = transcript.toLowerCase();
        let splitPhrase = '';
        if (lower.includes(' to ')) splitPhrase = ' to ';
        else if (lower.includes(' inda ')) splitPhrase = ' inda ';
        else if (lower.includes(' se ')) splitPhrase = ' se ';

        if (splitPhrase) {
          const parts = transcript.split(new RegExp(splitPhrase, 'i'));
          if (parts.length >= 2) {
            const fStation = findStation(parts[0]);
            const tStation = findStation(parts[1]);
            if (fStation) setFromInput(`${fStation.code} - ${fStation.name}`);
            else setFromInput(parts[0].trim());

            if (tStation) setToInput(`${tStation.code} - ${tStation.name}`);
            else setToInput(parts[1].trim());
            return;
          }
        }

        // Single station spoken
        const matched = findStation(transcript);
        if (matched) {
          setFromInput(`${matched.code} - ${matched.name}`);
        } else {
          setFromInput(transcript);
        }
      };

      recognition.onerror = (e: any) => {
        setIsListening(false);
        setVoiceFeedback(`Voice error: ${e.error || 'Check microphone'}`);
        setTimeout(() => setVoiceFeedback(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setVoiceFeedback('Failed to start microphone');
      setTimeout(() => setVoiceFeedback(null), 3000);
    }
  };

  // Search Trains & Fare Handler
  const handleSearchTrains = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(null);

    if (activeTab === 'journey') {
      const fromSt = findStation(fromInput);
      const toSt = findStation(toInput);

      if (!fromSt) {
        setFormError(`Origin station not recognized. Please choose from the list.`);
        return;
      }
      if (!toSt) {
        setFormError(`Destination station not recognized. Please choose from the list.`);
        return;
      }
      if (fromSt.code === toSt.code) {
        setFormError(`Origin and destination stations cannot be the same.`);
        return;
      }

      setResolvedFrom(fromSt);
      setResolvedTo(toSt);
      const trains = generateTrainsForRoute(fromSt, toSt);
      setTrainList(trains);
      setSelectedTrain(trains[0]);
      setHasSearched(true);
      setActiveGeneratedTicket(null);
    } else {
      // Platform Fare
      const st = findStation(platformStationInput);
      if (!st) {
        setFormError(`Please select a valid station for the platform ticket.`);
        return;
      }
      setResolvedFrom(st);
      setResolvedTo(st);

      // Create synthetic platform train representation
      const platformTrain: TrainSchedule = {
        id: `PLATFORM-${st.code}`,
        number: 'PLATFORM',
        name: `Platform Entry Ticket - ${st.name}`,
        type: 'PASSENGER',
        depTime: new Date().toTimeString().slice(0, 5),
        arrTime: new Date(Date.now() + 2 * 3600 * 1000).toTimeString().slice(0, 5),
        duration: '2h Valid',
        distanceKm: 0,
        farePerPax: 10,
      };

      setTrainList([platformTrain]);
      setSelectedTrain(platformTrain);
      setHasSearched(true);
      setActiveGeneratedTicket(null);
    }
  };

  // Generate Sample Ticket (Simulate 600ms as requested)
  const handleGenerateTicket = () => {
    if (!selectedTrain || !resolvedFrom || !resolvedTo) return;

    setIsGenerating(true);

    setTimeout(() => {
      const pnrNum = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const sampleId = 'SAMPLE' + Math.floor(100000000 + Math.random() * 900000000).toString();
      const issuedTime = new Date().toISOString();
      const hmacVal = btoa(pnrNum + issuedTime).slice(0, 16);
      const expiresAtTimestamp = Date.now() + 2 * 60 * 60 * 1000; // 2 hours countdown

      const count = activeTab === 'journey' ? passengers : platformTicketCount;
      const totalCost = selectedTrain.farePerPax * count;

      const newTicket: StoredTicket = {
        id: sampleId,
        pnr: pnrNum,
        fromCode: resolvedFrom.code,
        fromName: resolvedFrom.name,
        toCode: resolvedTo.code,
        toName: resolvedTo.name,
        trainName: selectedTrain.name,
        trainNumber: selectedTrain.number,
        trainType: selectedTrain.type,
        depTime: selectedTrain.depTime,
        arrTime: selectedTrain.arrTime,
        date: journeyDate,
        passengers: count,
        totalFare: totalCost,
        issued: issuedTime,
        hmac: hmacVal,
        expiresAt: expiresAtTimestamp,
        ticketType: activeTab === 'journey' ? 'JOURNEY' : 'PLATFORM',
      };

      // Save to localStorage key "bharat_tickets" array max 20, unshift
      const updatedList = [newTicket, ...storedTickets.slice(0, 19)];
      setStoredTickets(updatedList);
      try {
        localStorage.setItem('bharat_tickets', JSON.stringify(updatedList));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      setActiveGeneratedTicket(newTicket);
      setIsGenerating(false);

      // Smooth scroll to generated ticket
      setTimeout(() => {
        const el = document.getElementById('ticket-result-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 600);
  };

  // Offline ticket actions
  const handleViewTicket = (ticket: StoredTicket) => {
    setActiveGeneratedTicket(ticket);
    const el = document.getElementById('ticket-result-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteTicket = (ticketId: string) => {
    const updated = storedTickets.filter((t) => t.id !== ticketId);
    setStoredTickets(updated);
    localStorage.setItem('bharat_tickets', JSON.stringify(updated));
    if (activeGeneratedTicket?.id === ticketId) {
      setActiveGeneratedTicket(null);
    }
  };

  const handleClearAllTickets = () => {
    if (window.confirm('Clear all stored offline tickets from device storage?')) {
      setStoredTickets([]);
      localStorage.removeItem('bharat_tickets');
      setActiveGeneratedTicket(null);
    }
  };

  // Commuter corridor quick selector helper (Mandya Native SBC-MYS line)
  const setQuickCorridor = (fromCode: string, toCode: string) => {
    const fSt = STATIONS.find((s) => s.code === fromCode);
    const tSt = STATIONS.find((s) => s.code === toCode);
    if (fSt && tSt) {
      setFromInput(`${fSt.code} - ${fSt.name}`);
      setToInput(`${tSt.code} - ${tSt.name}`);
      setActiveTab('journey');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors">
      {/* 1. TOP DISCLAIMER BANNER (Red BG) */}
      <header className="bg-red-700 text-white py-2 px-4 shadow-sm border-b border-red-800">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center text-xs md:text-sm font-bold tracking-wide uppercase">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-200" />
          <span>{t.disclaimerTop}</span>
        </div>
      </header>

      {/* 2. HEADER */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            {/* Logo BR */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 flex items-center justify-center text-white font-black text-lg tracking-wider shadow-md shadow-blue-500/20 border border-blue-400/30">
              BR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg md:text-xl tracking-tight text-gray-900 dark:text-white">
                  {t.appTitle}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full">
                  V2 PWA
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Controls: Language Selector, Theme Toggle, Install PWA */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as LanguageCode)}
                className="text-xs font-semibold py-1.5 px-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                title="Select language"
              >
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
              </select>
            </div>

            {/* Dark / Light toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>

            {/* Android / APK Package Modal Button */}
            <button
              onClick={() => setShowAndroidModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Generate Android APK / Install on Android"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android / APK</span>
            </button>

            {/* PWA In-App Install Button */}
            {isInstallable && (
              <button
                onClick={install}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install PWA</span>
              </button>
            )}

            {isIOS && !isInstalled && (
              <button
                onClick={() => setShowIOSModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install iOS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Info Card - Prototype & Official booking disclaimer */}
        <div className="rail-card p-4 flex items-start gap-3 bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm text-blue-950 dark:text-blue-200 space-y-1">
            <p className="font-semibold">{t.aboutPrototype}</p>
            <p className="text-blue-800/80 dark:text-blue-300/80 text-xs">
              {t.gpsIssueCallout}
            </p>
          </div>
        </div>

        {/* Mandya Native Commuter Shortcuts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-gray-500 whitespace-nowrap flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.mandyaCommuterPreset}:</span>
          </span>
          <button
            onClick={() => setQuickCorridor('SBC', 'MYS')}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 whitespace-nowrap transition font-medium text-[11px]"
          >
            SBC (Bengaluru) ➔ MYS (Mysuru)
          </button>
          <button
            onClick={() => setQuickCorridor('SBC', 'MKM')}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 whitespace-nowrap transition font-medium text-[11px]"
          >
            SBC ➔ MKM (Mandya)
          </button>
          <button
            onClick={() => setQuickCorridor('MKM', 'MYS')}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 whitespace-nowrap transition font-medium text-[11px]"
          >
            MKM (Mandya) ➔ MYS
          </button>
          <button
            onClick={() => setQuickCorridor('SBC', 'RMM')}
            className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 whitespace-nowrap transition font-medium text-[11px]"
          >
            SBC ➔ RMM (Ramanagara)
          </button>
        </div>

        {/* Voice Feedback notification banner */}
        {voiceFeedback && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md animate-bounce">
            <Mic className="w-4 h-4 animate-pulse" />
            <span>{voiceFeedback}</span>
          </div>
        )}

        {/* MAIN GRID: 420px left + 1fr right (single col on mobile <980px) */}
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
          {/* LEFT CARD - BOOKING FORM */}
          <div className="rail-card p-5 md:p-6 space-y-5">
            {/* Tabs: [Journey Fare] [Platform Fare] active blue underline */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  setActiveTab('journey');
                  setFormError(null);
                }}
                className={`flex-1 py-3 text-sm font-bold text-center relative transition-colors ${
                  activeTab === 'journey'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                }`}
              >
                <span>{t.journeyFareTab}</span>
                {activeTab === 'journey' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('platform');
                  setFormError(null);
                }}
                className={`flex-1 py-3 text-sm font-bold text-center relative transition-colors ${
                  activeTab === 'platform'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
                }`}
              >
                <span>{t.platformFareTab}</span>
                {activeTab === 'platform' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
                )}
              </button>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* FORM BODY */}
            {activeTab === 'journey' ? (
              <form onSubmit={handleSearchTrains} className="space-y-4">
                {/* Field row: From Station + SWAP + Voice + To Station */}
                <div className="space-y-3">
                  {/* From Station */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      {t.fromStation}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        list={fromDatalistId}
                        value={fromInput}
                        onChange={(e) => setFromInput(e.target.value)}
                        placeholder={t.selectStationPlaceholder}
                        className="w-full text-sm font-semibold p-3 pl-3.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition"
                        required
                      />
                      <datalist id={fromDatalistId}>
                        {STATIONS.map((st) => (
                          <option key={`from-${st.code}`} value={`${st.code} - ${st.name}`}>
                            {st.city}, {st.state}
                          </option>
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Actions Row: Swap & Voice buttons */}
                  <div className="flex items-center justify-center gap-3 py-1">
                    <button
                      type="button"
                      onClick={handleSwapStations}
                      className="p-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition flex items-center gap-1 text-xs font-semibold"
                      title={t.swapStations}
                    >
                      <ArrowRightLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{t.swapStations}</span>
                    </button>

                    {/* Voice button (🎤 green) with Web Speech API */}
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`p-2 px-3 rounded-xl text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 ${
                        isListening
                          ? 'bg-rose-600 animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                      title={t.voiceTooltip}
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isListening ? 'Listening...' : 'Voice Search'}</span>
                    </button>
                  </div>

                  {/* To Station */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      {t.toStation}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        list={toDatalistId}
                        value={toInput}
                        onChange={(e) => setToInput(e.target.value)}
                        placeholder={t.selectStationPlaceholder}
                        className="w-full text-sm font-semibold p-3 pl-3.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition"
                        required
                      />
                      <datalist id={toDatalistId}>
                        {STATIONS.map((st) => (
                          <option key={`to-${st.code}`} value={`${st.code} - ${st.name}`}>
                            {st.city}, {st.state}
                          </option>
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Journey extras: Date input (today min) + Passengers stepper 1-6 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Date Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      {t.journeyDate}
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        min={todayStr}
                        value={journeyDate}
                        onChange={(e) => setJourneyDate(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Passengers Stepper 1-6 */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                      {t.passengers}
                    </label>
                    <div className="flex items-center rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1">
                      <button
                        type="button"
                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                        disabled={passengers <= 1}
                        className="w-9 h-8 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 text-gray-800 dark:text-white font-black text-sm flex items-center justify-center transition"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center font-bold text-sm text-gray-900 dark:text-white flex items-center justify-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>{passengers}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPassengers(Math.min(6, passengers + 1))}
                        disabled={passengers >= 6}
                        className="w-9 h-8 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 text-gray-800 dark:text-white font-black text-sm flex items-center justify-center transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Search Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Train className="w-4 h-4" />
                  <span>{t.findTrainsBtn}</span>
                </button>
              </form>
            ) : (
              /* Platform Ticket Form */
              <form onSubmit={handleSearchTrains} className="space-y-4">
                {/* Platform Station input */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {t.platformStation}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list={platformDatalistId}
                      value={platformStationInput}
                      onChange={(e) => setPlatformStationInput(e.target.value)}
                      placeholder={t.selectStationPlaceholder}
                      className="w-full text-sm font-semibold p-3 pl-3.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <datalist id={platformDatalistId}>
                      {STATIONS.map((st) => (
                        <option key={`plat-${st.code}`} value={`${st.code} - ${st.name}`}>
                          {st.city}, {st.state}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Ticket Count Stepper 1-6 */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {t.platformTickets} (1-6)
                  </label>
                  <div className="flex items-center rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1">
                    <button
                      type="button"
                      onClick={() => setPlatformTicketCount(Math.max(1, platformTicketCount - 1))}
                      disabled={platformTicketCount <= 1}
                      className="w-10 h-8 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 text-gray-800 dark:text-white font-black text-sm flex items-center justify-center transition"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center font-bold text-sm text-gray-900 dark:text-white">
                      {platformTicketCount} {t.passengerCount}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPlatformTicketCount(Math.min(6, platformTicketCount + 1))}
                      disabled={platformTicketCount >= 6}
                      className="w-10 h-8 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-30 text-gray-800 dark:text-white font-black text-sm flex items-center justify-center transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Info Box: Platform fare Rs 10 */}
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Fixed Platform Rate: ₹10 / person</span>
                  </div>
                  <p className="opacity-90">{t.platformFareInfo}</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TicketIcon className="w-4 h-4" />
                  <span>{t.findPlatformBtn}</span>
                </button>
              </form>
            )}

            {/* Station Database quick list info */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500">
              <span>Indexed Stations: 19 hubs including SBC, MYS, MKM, RMM, MAS, NDLS, CSTM, HWH, PUNE, HYB</span>
            </div>
          </div>

          {/* RIGHT CARD - STATES */}
          <div className="space-y-6">
            {!hasSearched ? (
              /* Empty State */
              <div className="rail-card p-10 text-center space-y-4 flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-4xl shadow-inner">
                  🚆
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {t.emptySearchPrompt}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {t.emptySearchSub}
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-2 justify-center">
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-medium">
                    ✓ Offline Caching
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-medium">
                    ✓ Rotating Dynamic QR
                  </span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-medium">
                    ✓ 9 Indian Languages
                  </span>
                </div>
              </div>
            ) : (
              /* Search Results State */
              <div className="space-y-5">
                {/* Header: FROM → TO • DATE + count badge */}
                <div className="rail-card p-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-base md:text-lg font-black tracking-tight">
                      <span>{resolvedFrom?.code}</span>
                      <span className="text-blue-300">➔</span>
                      <span>{resolvedTo?.code}</span>
                      <span className="text-xs font-normal opacity-80">
                        ({resolvedFrom?.name} to {resolvedTo?.name})
                      </span>
                    </div>
                    <div className="text-xs text-blue-200 flex items-center gap-3">
                      <span>Date: {journeyDate}</span>
                      <span>•</span>
                      <span>Distance: ~{selectedTrain?.distanceKm || 0} KM</span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
                    {trainList.length} {t.trainsAvailable}
                  </span>
                </div>

                {/* List 6 Train Cards */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Select Train / Schedule:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trainList.map((train) => {
                      const isSelected = selectedTrain?.id === train.id;
                      return (
                        <div
                          key={train.id}
                          onClick={() => setSelectedTrain(train)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/20 shadow-md'
                              : 'border-gray-200 dark:border-gray-800 bg-[var(--card)] hover:border-gray-300 dark:hover:border-gray-700'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          <div className="pr-6 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                                {train.name}
                              </span>
                              <span className="text-[10px] font-mono font-bold bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                                {train.number}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 block">
                              {train.type}
                            </span>
                          </div>

                          {/* Time / Duration / Distance */}
                          <div className="grid grid-cols-3 gap-1 text-xs mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="text-[10px] text-gray-400 block">Dep</span>
                              <span className="font-bold text-gray-900 dark:text-white">
                                {train.depTime}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] text-gray-400 block">Duration</span>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {train.duration}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-gray-400 block">Arr</span>
                              <span className="font-bold text-gray-900 dark:text-white">
                                {train.arrTime}
                              </span>
                            </div>
                          </div>

                          {/* Fare Badge (Green ₹) */}
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                            <span className="text-[11px] text-gray-500">General Unreserved</span>
                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                              ₹{train.farePerPax} <span className="text-[10px] font-normal">{t.farePerPerson}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. PAYMENT SECTION (Demo - No real money) */}
                {selectedTrain && (
                  <div className="rail-card p-5 space-y-4 border-dashed border-2 border-blue-300 dark:border-blue-900">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <TicketIcon className="w-5 h-5 text-blue-600" />
                        <span>{t.orderSummary}</span>
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Unreserved Demo
                      </span>
                    </div>

                    {/* Order summary breakdown */}
                    <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl space-y-2 text-xs text-gray-700 dark:text-gray-300">
                      <div className="flex justify-between">
                        <span>Selected Train:</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {selectedTrain.name} [{selectedTrain.number}]
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Route:</span>
                        <span className="font-bold">
                          {resolvedFrom?.code} ({resolvedFrom?.name}) ➔ {resolvedTo?.code} ({resolvedTo?.name})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date & Time:</span>
                        <span>
                          {journeyDate} • Dep {selectedTrain.depTime} hrs
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Class & Distance:</span>
                        <span>Class GEN • ~{selectedTrain.distanceKm} KM</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 font-bold text-sm">
                        <span>
                          Calculation: {activeTab === 'journey' ? passengers : platformTicketCount} x ₹
                          {selectedTrain.farePerPax}
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-base font-black">
                          Total: ₹
                          {selectedTrain.farePerPax *
                            (activeTab === 'journey' ? passengers : platformTicketCount)}
                        </span>
                      </div>
                    </div>

                    {/* Info box: Play Store-safe notice */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{t.playStoreSafeNotice}</span>
                    </div>

                    {/* Button: Generate Sample Ticket (Not Valid) 🎟️ -> 600ms */}
                    <button
                      onClick={handleGenerateTicket}
                      disabled={isGenerating}
                      className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm md:text-base shadow-lg shadow-emerald-600/20 transition active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t.generatingWait}</span>
                        </>
                      ) : (
                        <>
                          <span>{t.generateTicketBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* 6. TICKET SECTION (Sample - Not Valid) */}
                {activeGeneratedTicket && (
                  <TicketCard
                    ticket={activeGeneratedTicket}
                    t={t}
                    onNewSearch={() => {
                      setHasSearched(false);
                      setActiveGeneratedTicket(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* 7. OFFLINE & TTE FEATURES SECTION */}
        <OfflineTicketsList
          tickets={storedTickets}
          t={t}
          onViewTicket={handleViewTicket}
          onDeleteTicket={handleDeleteTicket}
          onClearAll={handleClearAllTickets}
          onOpenTTEVerify={() => setIsTTEModalOpen(true)}
        />
      </main>

      {/* TTE Diagnostic Modal */}
      <TTEVerifyModal
        isOpen={isTTEModalOpen}
        onClose={() => setIsTTEModalOpen(false)}
        activeTicket={activeGeneratedTicket}
      />

      {/* Android APK & Install Modal */}
      <AndroidAPKModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
        onInstallPWA={install}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
      />

      {/* iOS Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Install on iPhone / iPad
            </h3>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
              <p>1. Tap the <strong>Share</strong> button at the bottom of Safari.</p>
              <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
              <p>3. Tap <strong>Add</strong> in the top right corner.</p>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <footer className="mt-8 border-t border-[var(--border)] py-6 px-4 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2 bg-[var(--card)]">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            Bharat Rail Fare Finder V2 • Unofficial Educational PWA Demo
          </p>
          <p className="text-[11px] leading-relaxed">
            Designed for commuters on the SBC-MYS railway line. This independent prototype does NOT connect to Indian Railways / CRIS servers, collect funds, or issue valid travel permits. Real bookings must be made through the official UTS on Mobile or IRCTC Rail Connect apps.
          </p>
        </div>
      </footer>
    </div>
  );
}
