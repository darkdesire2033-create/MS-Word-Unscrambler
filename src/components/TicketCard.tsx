import React, { useEffect, useState, useRef } from 'react';
import { StoredTicket } from '../types';
import { Translation } from '../data/i18n';
import { PseudoQR } from './PseudoQR';
import { Download, Printer, RotateCcw, ShieldCheck, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface TicketCardProps {
  ticket: StoredTicket;
  t: Translation;
  onNewSearch: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, t, onNewSearch }) => {
  const [timeLeft, setTimeLeft] = useState<string>('02:00:00');
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const remainingMs = ticket.expiresAt - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft('00:00:00');
        setIsExpired(true);
        return;
      }
      const totalSecs = Math.floor(remainingMs / 1000);
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [ticket.expiresAt]);

  const handleDownloadPNG = () => {
    // Generate 800x400 canvas PNG
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 400);

    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 788, 388);

    // Top Header bar
    ctx.fillStyle = '#111827';
    ctx.fillRect(8, 8, 784, 42);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('SAMPLE - NOT VALID FOR TRAVEL', 24, 34);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('OFFLINE OK ✓', 670, 34);

    // Watermark
    ctx.save();
    ctx.translate(400, 220);
    ctx.rotate(-0.25);
    ctx.fillStyle = 'rgba(220, 38, 38, 0.07)';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAMPLE • NOT VALID FOR TRAVEL', 0, 0);
    ctx.fillText('UTS PROTOTYPE DEMO', 0, 45);
    ctx.restore();

    // Route title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`${ticket.fromCode} (${ticket.fromName})  ➔  ${ticket.toCode} (${ticket.toName})`, 28, 85);

    // Train details
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText(`${ticket.trainName} [${ticket.trainNumber}] • ${ticket.trainType}`, 28, 115);

    // Grid details
    ctx.fillStyle = '#374151';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Date: ${ticket.date}`, 28, 150);
    ctx.fillText(`Dep Time: ${ticket.depTime} hrs`, 28, 175);
    ctx.fillText(`Arr Time: ${ticket.arrTime} hrs`, 28, 200);

    ctx.fillText(`Class: GEN (Second Class Unreserved)`, 28, 230);
    ctx.fillText(`Passengers: ${ticket.passengers} Adult(s)`, 28, 255);

    // Fare badge
    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`Total Fare: ₹${ticket.totalFare}`, 28, 295);

    // PNR & HMAC
    ctx.fillStyle = '#4b5563';
    ctx.font = '12px monospace';
    ctx.fillText(`Ticket ID: ${ticket.id}`, 28, 325);
    ctx.fillText(`HMAC: ${ticket.hmac}  |  Issued: ${new Date(ticket.issued).toLocaleTimeString()}`, 28, 345);

    // Verification Box
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(480, 70, 290, 48);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('TTE VERIFY: VALID • EXPIRES IN', 495, 92);
    ctx.font = 'bold 16px monospace';
    ctx.fillText(timeLeft, 495, 110);

    // Draw Pseudo QR Representation on canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(550, 140, 150, 150);

    // Finder squares on canvas
    const drawFinder = (x: number, y: number) => {
      ctx.fillStyle = '#000';
      ctx.fillRect(x, y, 40, 40);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 6, y + 6, 28, 28);
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 12, y + 12, 16, 16);
    };
    drawFinder(558, 148);
    drawFinder(652, 148);
    drawFinder(558, 242);

    // QR label
    ctx.fillStyle = '#4b5563';
    ctx.font = '11px sans-serif';
    ctx.fillText('Rotating Pseudo QR (30s Cycle)', 545, 310);

    // Footer
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px sans-serif';
    ctx.fillText('Offline-First UTS Demo • Stored in LocalStorage • Pitch for SWR/CRIS', 28, 380);

    // Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `BharatRail_${ticket.id}.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4" id="ticket-result-section">
      {/* Success header disclaimer */}
      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 flex items-center gap-3 text-amber-900 dark:text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="text-sm">
          <span className="font-bold">{t.sampleTicketHeader}</span>
          <p className="text-xs opacity-90">
            Created for demonstration purposes only. Showcasing offline token validation and rotating dynamic QR security.
          </p>
        </div>
      </div>

      {/* Main Ticket Card - High Fidelity UTS Ticket */}
      <div
        id="printable-ticket"
        className="relative overflow-hidden bg-white text-gray-900 border-2 border-black rounded-2xl shadow-xl transition-all"
      >
        {/* Animated Background Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-5 flex flex-col justify-around rotate-[-16deg] overflow-hidden select-none ticket-watermark">
          <div className="text-3xl font-black text-center text-red-900 tracking-wider">
            SAMPLE • NOT VALID FOR TRAVEL • UTS DEMO
          </div>
          <div className="text-3xl font-black text-center text-red-900 tracking-wider">
            BHARAT RAIL FARE FINDER • EDUCATIONAL PROTOTYPE
          </div>
          <div className="text-3xl font-black text-center text-red-900 tracking-wider">
            SAMPLE • NOT VALID FOR TRAVEL • OFFLINE OK
          </div>
        </div>

        {/* Top Black Bar */}
        <div className="bg-gray-950 text-white px-4 py-2.5 flex items-center justify-between font-mono text-xs md:text-sm font-semibold tracking-wider">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold">
              DEMO
            </span>
            <span>{t.sampleNotValidBar}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.offlineOk}</span>
          </div>
        </div>

        {/* Ticket Body: 2 Columns */}
        <div className="p-5 md:p-6 grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-6 relative z-10">
          {/* Left Details Column */}
          <div className="space-y-4">
            {/* Route Header */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Journey Route / ಪ್ರಯಾಣದ ಮಾರ್ಗ
              </div>
              <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
                <span className="text-xl md:text-2xl font-black text-gray-950 tracking-tight">
                  {ticket.fromCode}
                </span>
                <span className="text-sm text-gray-600 font-medium">({ticket.fromName})</span>
                <span className="text-blue-600 font-bold px-1">➔</span>
                <span className="text-xl md:text-2xl font-black text-gray-950 tracking-tight">
                  {ticket.toCode}
                </span>
                <span className="text-sm text-gray-600 font-medium">({ticket.toName})</span>
              </div>
            </div>

            {/* Train Info */}
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="font-bold text-blue-900 text-sm md:text-base">
                  {ticket.trainName}
                </div>
                <span className="text-xs font-mono font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                  {ticket.trainNumber}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-blue-800">
                <span>Type: <strong>{ticket.trainType}</strong></span>
                <span>•</span>
                <span>Class: <strong>GEN (Unreserved)</strong></span>
              </div>
            </div>

            {/* Timing and Date Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs border-y border-gray-200 py-3">
              <div>
                <span className="text-gray-500 block">Date</span>
                <span className="font-bold text-gray-900">{ticket.date}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Dep Time</span>
                <span className="font-bold text-gray-900">{ticket.depTime} hrs</span>
              </div>
              <div>
                <span className="text-gray-500 block">Arr Time</span>
                <span className="font-bold text-gray-900">{ticket.arrTime} hrs</span>
              </div>
            </div>

            {/* Passengers & Fare row */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs text-gray-500 block">Passengers</span>
                <span className="font-bold text-gray-900 text-sm">
                  {ticket.passengers} Adult{ticket.passengers > 1 ? 's' : ''} (General)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Total Fare</span>
                <span className="text-2xl font-black text-emerald-700">
                  ₹{ticket.totalFare}
                </span>
              </div>
            </div>

            {/* TTE Verify Status Box */}
            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
              isExpired
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold">{t.tteVerifyBox}</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.tteExpiresIn}: {timeLeft}</span>
              </div>
            </div>

            {/* Cryptographic ID and HMAC */}
            <div className="text-[11px] font-mono text-gray-600 bg-gray-100 p-2.5 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span>Sample ID: <strong>{ticket.id}</strong></span>
                <span>PNR: <strong>{ticket.pnr}</strong></span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>HMAC: <code className="font-bold text-gray-700">{ticket.hmac}</code></span>
                <span>Issued: {new Date(ticket.issued).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Rotating Pseudo QR Box (132px) */}
          <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-[10px] font-bold text-gray-600 uppercase mb-1 tracking-wider text-center">
              Scan To Verify
            </div>
            <PseudoQR seed={ticket.pnr} size={112} showTimer={true} />
            <div className="mt-2 text-[9px] text-gray-500 text-center leading-tight">
              Anti-Screenshot Dynamic Matrix
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-5 py-2.5 border-t border-gray-300 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-600 gap-1">
          <div>
            🔒 <strong>Offline-first</strong> • LocalStorage / IndexedDB Stored
          </div>
          <div className="text-gray-500">
            Demo for SWR/CRIS pitch • Commuter UTS prototype
          </div>
        </div>
      </div>

      {/* Action Buttons (no-print) */}
      <div className="no-print flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={handleDownloadPNG}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>{t.downloadTicket}</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-semibold transition"
        >
          <Printer className="w-4 h-4" />
          <span>{t.printTicket}</span>
        </button>

        <button
          onClick={onNewSearch}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.newSearch}</span>
        </button>
      </div>
    </div>
  );
};
