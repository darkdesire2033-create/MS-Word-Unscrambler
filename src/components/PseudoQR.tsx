import React, { useEffect, useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';

interface PseudoQRProps {
  seed: string;
  size?: number; // default 120px
  showTimer?: boolean;
}

export const PseudoQR: React.FC<PseudoQRProps> = ({ seed, size = 120, showTimer = true }) => {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeSlice = Math.floor(now / 30000); // 30s rotation window
  const secondsRemaining = 30 - (Math.floor(now / 1000) % 30);

  // Generate 21x21 module grid based on seed + timeSlice
  const grid = useMemo(() => {
    const matrix: boolean[][] = Array.from({ length: 21 }, () => Array(21).fill(false));

    // Helper: mark 7x7 finder pattern
    const setFinderPattern = (startRow: number, startCol: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[startRow + r][startCol + c] = isBorder || isCenter;
        }
      }
    };

    // 1. Top-Left finder
    setFinderPattern(0, 0);
    // 2. Top-Right finder
    setFinderPattern(0, 14);
    // 3. Bottom-Left finder
    setFinderPattern(14, 0);

    // Separators (white space around finders)
    for (let i = 0; i < 8; i++) {
      if (matrix[7]) matrix[7][i] = false;
      if (matrix[i]) matrix[i][7] = false;
      if (matrix[7]) matrix[7][13 + i] = false;
      if (matrix[i]) matrix[i][13] = false;
      if (matrix[13]) matrix[13][i] = false;
      if (matrix[13 + i]) matrix[13 + i][7] = false;
    }

    // Timing lines (alternating along row 6 and col 6)
    for (let i = 8; i < 13; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Alignment marker at (14, 14) for 21x21 (small 3x3)
    // Pseudo random data generation with hash seed
    let hash = 0;
    const combinedSeed = `${seed}_${timeSlice}`;
    for (let i = 0; i < combinedSeed.length; i++) {
      hash = (hash * 31 + combinedSeed.charCodeAt(i)) >>> 0;
    }

    // Linear congruential generator for reproducible noise
    let rngState = hash;
    const nextRand = () => {
      rngState = (rngState * 1664525 + 1013904223) >>> 0;
      return rngState / 4294967296;
    };

    // Fill data cells
    for (let r = 0; r < 21; r++) {
      for (let c = 0; c < 21; c++) {
        // Skip finder zones
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= 13;
        const inBottomLeft = r >= 13 && c < 8;
        const inTiming = r === 6 || c === 6;

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
          matrix[r][c] = nextRand() > 0.48;
        }
      }
    }

    return matrix;
  }, [seed, timeSlice]);

  return (
    <div className="flex flex-col items-center select-none" id="pseudo-qr-container">
      {/* 21x21 QR Grid container */}
      <div
        className="p-1.5 bg-white border border-gray-900 rounded shadow-inner"
        style={{ width: `${size + 12}px`, height: `${size + 12}px` }}
      >
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: 'repeat(21, 1fr)',
            gridTemplateRows: 'repeat(21, 1fr)',
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          {grid.map((row, rIdx) =>
            row.map((isBlack, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className={isBlack ? 'b qr-pixel-b' : 'w qr-pixel-w'}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            ))
          )}
        </div>
      </div>

      {showTimer && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono font-medium text-gray-600 dark:text-gray-400">
          <RefreshCw className="w-2.5 h-2.5 animate-spin text-blue-600" />
          <span>QR refreshes in {secondsRemaining}s</span>
        </div>
      )}
    </div>
  );
};
