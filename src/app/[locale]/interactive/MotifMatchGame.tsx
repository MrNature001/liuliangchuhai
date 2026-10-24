'use client';

/**
 * 纹样连连看
 * Motif matching game
 */

import { useEffect, useMemo, useState } from 'react';
import { useT, useLocale } from '@/i18n/client';
import { useProgress } from '@/lib/hooks/useProgress';
import { MOTIF_PAIRS, type MotifCard } from '@/lib/data/interactiveData';

function shuffleDeck(seed: number): MotifCard[] {
  const cards = MOTIF_PAIRS.flatMap((p) => p.cards);
  let s = seed;
  for (let i = cards.length - 1; i > 0; i -= 1) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MotifMatchGame({ onComplete }: { onComplete?: (score: number) => void }) {
  const { t } = useT('interactive');
  const locale = useLocale();
  const { record } = useProgress();

  const [round, setRound] = useState(1);
  const deck = useMemo(() => shuffleDeck(round * 7919), [round]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const done = matched.length === deck.length;

  useEffect(() => {
    if (!done) return;
    record('match-complete');
  }, [done, record]);

  const flip = (card: MotifCard) => {
    if (done || flipped.includes(card.id) || matched.includes(card.pair)) return;
    if (flipped.length === 2) return;

    const next = [...flipped, card.id];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      const cardA = deck.find((c) => c.id === a)!;
      const cardB = deck.find((c) => c.id === b)!;
      if (cardA.pair === cardB.pair) {
        setMatched((m) => [...m, cardA.pair]);
        setFlipped([]);
      } else {
        window.setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  const restart = () => {
    setRound((r) => r + 1);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const nameOf = (card: MotifCard) => (locale === 'zh' ? card.label.zh : card.label.en);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
        <span>{t('match.moves', { n: moves })}</span>
        <span>{t('match.found', { n: matched.length, total: MOTIF_PAIRS.length })}</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {deck.map((card) => {
          const isUp = flipped.includes(card.id) || matched.includes(card.pair);
          const isMatched = matched.includes(card.pair);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(card)}
              disabled={isUp}
              aria-label={isUp ? nameOf(card) : t('match.hidden')}
              className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                isMatched
                  ? 'border-green-600 ring-2 ring-green-600/30'
                  : isUp
                    ? 'border-purple-500'
                    : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {isUp ? (
                <span className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/culture/${card.image}.jpg`} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[11px] px-1 py-0.5 text-center">
                    {nameOf(card)}
                  </span>
                </span>
              ) : (
                <span className="absolute inset-0 grid place-items-center bg-gradient-to-br from-purple-600 to-pink-500 text-white text-xl font-bold">
                  ?
                </span>
              )}
            </button>
          );
        })}
      </div>

      {done && (
        <div className="mt-5 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm" role="status">
          <p className="font-bold mb-2">{t('match.complete', { n: moves })}</p>
          <button type="button" onClick={restart} className="btn-embroidery px-5 py-2">
            {t('play.restart')}
          </button>
        </div>
      )}
    </div>
  );
}
