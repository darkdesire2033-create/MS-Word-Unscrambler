import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Download,
  Terminal,
  Layers,
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AndroidAPKModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallPWA: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const AndroidAPKModal: React.FC<AndroidAPKModalProps> = ({
  isOpen,
  onClose,
  onInstallPWA,
  isInstallable,
  isInstalled,
}) => {
  const [activeTab, setActiveTab] = useState<'pwabuilder' | 'webapk' | 'cli'>('pwabuilder');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedCli, setCopiedCli] = useState<boolean>(false);

  if (!isOpen) return null;

  // Exact live preview/production URL of this application
  const liveAppUrl =
    typeof window !== 'undefined' && window.location.origin.includes('localhost')
      ? 'https://ais-pre-lqqk5smohfikudavcrr5wf-252283359665.asia-southeast1.run.app'
      : typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-lqqk5smohfikudavcrr5wf-252283359665.asia-southeast1.run.app';

  const pwabuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(
    liveAppUrl
  )}`;

  const cliSnippet = `# 1. Install Google's official Bubblewrap CLI
npm install -g @bubblewrap/cli

# 2. Initialize Android TWA package from this app manifest
bubblewrap init --manifest="${liveAppUrl}/manifest.json"

# 3. Compile the signed APK and AAB
bubblewrap build`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(liveAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliSnippet);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
              <Smartphone className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base md:text-lg">
                  Android APK & App Package
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/30 text-emerald-100 border border-emerald-300/30">
                  Android Ready
                </span>
              </div>
              <p className="text-xs text-emerald-100/90">
                Get Bharat Rail Fare Finder on your Android smartphone or tablet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 px-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`py-3 px-3 relative transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'pwabuilder'
                ? 'text-emerald-600 dark:text-emerald-400 font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Generate APK (PWABuilder)</span>
            {activeTab === 'pwabuilder' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('webapk')}
            className={`py-3 px-3 relative transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'webapk'
                ? 'text-emerald-600 dark:text-emerald-400 font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>1-Tap WebAPK (Instant)</span>
            {activeTab === 'webapk' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('cli')}
            className={`py-3 px-3 relative transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cli'
                ? 'text-emerald-600 dark:text-emerald-400 font-black'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-500" />
            <span>CLI / Bubblewrap</span>
            {activeTab === 'cli' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-xs md:text-sm text-gray-700 dark:text-gray-300">
          {/* TAB 1: PWABUILDER 1-CLICK APK GENERATION */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Official PWA-to-APK Generator (Recommended)</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Because this app contains a verified Web Manifest, Service Worker, and high-res maskable icons, you can convert it into an Android <strong>.apk</strong> or <strong>.aab</strong> package in seconds using Microsoft's open-source <strong>PWABuilder</strong>.
                </p>
              </div>

              {/* Target App URL Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Target Application Live URL:
                </label>
                <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 font-mono text-xs">
                  <span className="flex-1 truncate text-gray-800 dark:text-gray-200 select-all">
                    {liveAppUrl}
                  </span>
                  <button
                    onClick={handleCopyUrl}
                    className="p-1.5 px-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition flex items-center gap-1 cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] font-bold text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-[11px] font-medium">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 3 Step Instructions */}
              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Quick Steps to Download Your APK:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">
                      1
                    </div>
                    <div className="font-bold text-xs text-gray-900 dark:text-white">
                      Open PWABuilder
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Click the green button below. Your app URL is already pre-loaded and analyzed.
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">
                      2
                    </div>
                    <div className="font-bold text-xs text-gray-900 dark:text-white">
                      Select Android
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Click <strong>Package for Stores</strong> &gt; <strong>Android</strong> options.
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center">
                      3
                    </div>
                    <div className="font-bold text-xs text-gray-900 dark:text-white">
                      Download APK
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Download the generated <strong>.apk</strong> file and install it directly on any Android device.
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <a
                  href={pwabuilderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Generate APK on PWABuilder (Free &amp; Open Source)</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 2: 1-TAP WEBAPK (INSTANT ANDROID APP) */}
          {activeTab === 'webapk' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Native Android WebAPK (No APK File Download Required)</span>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Android devices running Chrome or Samsung Internet automatically synthesize and compile a <strong>native WebAPK</strong> directly in the background. It installs into your Android app drawer, shows the custom train icon, runs full-screen, and works 100% offline.
                </p>
              </div>

              {/* In-app install button if available */}
              {isInstallable && !isInstalled && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                      Ready to Install Now
                    </h5>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Your current browser supports direct 1-tap installation.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onInstallPWA();
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App</span>
                  </button>
                </div>
              )}

              {isInstalled && (
                <div className="p-3 bg-emerald-100/70 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>This app is already installed in Standalone mode on this device!</span>
                </div>
              )}

              {/* Steps for Chrome on Android */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  How to install on any Android phone:
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <strong>Open this website in Google Chrome</strong> on your Android phone.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      Tap the <strong>⋮ (three dots menu)</strong> in the top-right corner of Chrome.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      Tap <strong>"Install app"</strong> (or <strong>"Add to Home screen"</strong>).
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div>
                      Confirm <strong>"Install"</strong>. Android will build and pin the app icon onto your home screen!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLI & BUBBLEWRAP */}
          {activeTab === 'cli' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-200 text-sm">
                  <Terminal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Google Bubblewrap CLI (Command Line APK Compilation)</span>
                </div>
                <p className="text-xs text-purple-800 dark:text-purple-300">
                  Google's official CLI tool <strong>Bubblewrap</strong> reads this app's <code>manifest.json</code> and compiles a native Android Trusted Web Activity (TWA) project using your local Android SDK &amp; JDK.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Terminal Commands:
                  </span>
                  <button
                    onClick={handleCopyCli}
                    className="p-1.5 px-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition flex items-center gap-1 cursor-pointer text-xs font-semibold"
                  >
                    {copiedCli ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied to clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Commands</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto border border-gray-800 leading-relaxed">
                  {cliSnippet}
                </pre>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  • <strong>Output</strong>: Generates <code>app-release-signed.apk</code> and <code>app-release-bundle.aab</code>.
                </p>
                <p>
                  • <strong>Requirement</strong>: Node.js, Java JDK 17+, and Android SDK command-line tools installed on your local machine.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-5 bg-gray-50 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <QrCode className="w-4 h-4 text-gray-400" />
            <span>Open on mobile: Scan or visit URL in Chrome</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
