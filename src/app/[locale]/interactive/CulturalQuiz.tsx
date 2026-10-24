'use client';

/**
 * 文化知识问答
 * Cultural quiz
 *
 * 从题库不放回地抽 10 题（种子由轮次决定，避免 SSR/CSR 水合不一致），
 * 每题作答后立刻给出解析与出处，最后给成绩。
 */

import { useMemo, useState } from 'react';
import { useT, useLocale } from '@/i18n/client';
import { useProgress } from '@/lib/hooks/useProgress';
import { QUIZ_QUESTIONS, type QuizQuestion } from '@/lib/data/interactiveData';
import type { LocalizedText } from '@/lib/data/aseanCountries';

const ROUND_SIZE = 10;

/** 确定性抽样：同一轮次在服务端与客户端抽到同一组题 */
function sampleQuestions(round: number): QuizQuestion[] {
  const pool = [...QUIZ_QUESTIONS];
  let seed = round * 9301 + 49297;
  for (let i = pool.length - 1; i > 0; i -= 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(ROUND_SIZE, pool.length));
}

export default function CulturalQuiz({ onComplete }: { onComplete?: (score: number) => void }) {
  const { t } = useT('interactive');
  const locale = useLocale();
  const { record } = useProgress();

  const [round, setRound] = useState(1);
  const questions = useMemo(() => sampleQuestions(round), [round]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const current = questions[index];
  const L = (v: LocalizedText) => (locale === 'zh' ? v.zh : v.en);

  const choose = (option: number) => {
    if (picked !== null) return;
    setPicked(option);
    if (option === current.answer) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setDone(true);
      if (correctCount >= 5) record('quiz-5');
      if (correctCount === questions.length) record('quiz-perfect');
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  };

  const restart = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setPicked(null);
    setCorrectCount(0);
    setDone(false);
  };

  if (done) {
    const percent = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="text-center py-8">
        <p className="text-5xl font-bold text-purple-600 mb-2">
          {correctCount} / {questions.length}
        </p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {percent >= 80 ? t('quiz.remarkGreat') : percent >= 50 ? t('quiz.remarkOk') : t('quiz.remarkKeep')}
        </p>
        <button type="button" onClick={restart} className="btn-embroidery px-6 py-2">
          {t('play.restart')}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
        <span>{t('quiz.questionNo', { n: index + 1, total: questions.length })}</span>
        <span>{t('play.score')}: {correctCount}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
          style={{ width: `${((index + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <h4 className="text-lg font-bold mb-4">{L(current.question)}</h4>

      <div className="space-y-3">
        {current.options.map((option, i) => {
          const isCorrect = i === current.answer;
          const isPicked = i === picked;
          const state =
            picked === null
              ? 'border-gray-200 dark:border-gray-600 hover:border-purple-500'
              : isCorrect
                ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                : isPicked
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700 opacity-60';
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={picked !== null}
              aria-pressed={isPicked}
              className={`w-full text-left px-5 py-4 rounded-lg border-2 transition-all ${state}`}
            >
              <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
              {L(option)}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-5 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-sm" role="status" aria-live="polite">
          <p className="font-bold mb-1">
            {picked === current.answer ? t('quiz.correct') : t('quiz.incorrect')}
          </p>
          <p className="mb-2">{L(current.explain)}</p>
          <p className="text-xs opacity-80">{t('quiz.source')}: {L(current.source)}</p>
        </div>
      )}

      <div className="mt-6 text-right">
        <button
          type="button"
          onClick={next}
          disabled={picked === null}
          className="btn-embroidery px-6 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {index + 1 >= questions.length ? t('quiz.seeResult') : t('quiz.nextQuestion')}
        </button>
      </div>
    </div>
  );
}
