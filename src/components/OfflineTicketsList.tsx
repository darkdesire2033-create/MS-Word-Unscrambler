import React from 'react';
import { StoredTicket } from '../types';
import { Translation } from '../data/i18n';
import { Ticket, Trash2, Eye, ShieldCheck, WifiOff, Clock } from 'lucide-react';

interface OfflineTicketsListProps {
  tickets: StoredTicket[];
  t: Translation;
  onViewTicket: (ticket: StoredTicket) => void;
  onDeleteTicket: (ticketId: string) => void;
  onClearAll: () => void;
  onOpenTTEVerify: () => void;
}

export const OfflineTicketsList: React.FC<OfflineTicketsListProps> = ({
  tickets,
  t,
  onViewTicket,
  onDeleteTicket,
  onClearAll,
  onOpenTTEVerify,
}) => {
  return (
    <div className="rail-card p-5 md:p-6 space-y-4">
      {/* Header with Title and TTE Verify Mode button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-xl">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">
              {t.offlineTicketsTitle}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cached tickets available even in Airplane Mode (Offline PWA)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tickets.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearAll}</span>
            </button>
          )}

          <button
            onClick={onOpenTTEVerify}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.tteVerifyModeBtn}</span>
          </button>
        </div>
      </div>

      {/* Tickets List Container */}
      <div id="offlineList" className="space-y-3">
        {tickets.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm space-y-2">
            <Ticket className="w-10 h-10 mx-auto opacity-30" />
            <p className="max-w-md mx-auto">{t.noOfflineTickets}</p>
          </div>
        ) : (
          tickets.map((item) => {
            const isExpired = Date.now() > item.expiresAt;
            return (
              <div
                key={item.id}
                className="p-3.5 md:p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Route and Train info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-950 dark:text-white text-sm">
                      {item.fromCode} ➔ {item.toCode}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({item.fromName} to {item.toName})
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        isExpired
                          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {isExpired ? 'EXPIRED' : 'VALID'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
                    <span>Train: <strong>{item.trainName}</strong> ({item.trainNumber})</span>
                    <span>•</span>
                    <span>Date: <strong>{item.date}</strong> ({item.depTime})</span>
                    <span>•</span>
                    <span>Pax: <strong>{item.passengers}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      ₹{item.totalFare}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-gray-400 flex items-center gap-3">
                    <span>ID: {item.id}</span>
                    <span>HMAC: {item.hmac}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => onViewTicket(item)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t.viewTicket}</span>
                  </button>

                  <button
                    onClick={() => onDeleteTicket(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                    title={t.deleteTicket}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
