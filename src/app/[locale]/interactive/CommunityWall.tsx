'use client';

/**
 * 社区留言墙
 * Community note wall
 *
 * 留言只保存在访客本机 localStorage，不上传服务器。
 */

import { useState } from 'react';
import { useT, useLocale } from '@/i18n/client';
import { STORAGE_PREFIX, useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Toast } from '@/components/ui/Dialog';

interface Note {
  id: string;
  name: string;
  text: string;
  topic: string;
  at: number;
}

const TOPICS = ['zhuang', 'asean', 'heritage', 'sanyuesan', 'conservation'] as const;

const SEED: Note[] = [
  { id: 'seed-1', name: 'Nguyễn', text: '第一次知道壮族和泰族同源，看到铜鼓和泰北的鼓几乎一样，很震撼。', topic: 'asean', at: 0 },
  { id: 'seed-2', name: '小林', text: '在桂林读了四年书，看到喀斯特那一页还是想回去。', topic: 'zhuang', at: 0 },
];

export default function CommunityWall() {
  const { t } = useT('interactive');
  const locale = useLocale();
  const { value: notes, setValue: setNotes, hydrated } = useLocalStorage<Note[]>(`${STORAGE_PREFIX}notes`, SEED);
  const [draft, setDraft] = useState('');
  const [name, setName] = useState('');
  const [topic, setTopic] = useState<string>('zhuang');
  const [toast, setToast] = useState<string | null>(null);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const tooLong = draft.length > 500;

  const submit = () => {
    const text = draft.trim();
    if (!text || tooLong) {
      if (tooLong) setToast(t('community.tooLong'));
      return;
    }
    setNotes((prev) => [
      { id: `n-${Date.now()}`, name: name.trim().slice(0, 24) || t('community.noName'), text, topic, at: Date.now() },
      ...prev,
    ]);
    setDraft('');
    setToast(t('community.posted'));
  };

  const remove = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  const ordered = [...notes].sort((a, b) => (sort === 'newest' ? b.at - a.at : a.at - b.at));

  return (
    <div className="card-cultural p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="note-name" className="block text-sm font-medium mb-1">{t('community.composerName')}</label>
          <input
            id="note-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="note-topic" className="block text-sm font-medium mb-1">{t('community.composerTitle')}</label>
          <select
            id="note-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          >
            {TOPICS.map((tp) => (
              <option key={tp} value={tp}>{t(`topic.${tp}`)}</option>
            ))}
          </select>
        </div>
      </div>

      <label htmlFor="note-text" className="sr-only">{t('community.composerPlaceholder')}</label>
      <textarea
        id="note-text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        placeholder={t('community.composerPlaceholder')}
        aria-invalid={tooLong}
        className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm ${tooLong ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
      />

      <div className="flex items-center justify-between mt-2 mb-5">
        <span className={`text-xs ${tooLong ? 'text-red-600' : 'text-gray-500'}`}>
          {t('community.charCount', { n: draft.length })}
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setDraft('')} className="px-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700">
            {t('community.cancel')}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || tooLong}
            className="btn-embroidery px-5 py-2 text-sm disabled:opacity-40"
          >
            {t('community.post')}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{hydrated ? t('play.played', { count: notes.length }) : ''}</span>
        <button
          type="button"
          onClick={() => setSort(sort === 'newest' ? 'oldest' : 'newest')}
          className="text-xs text-purple-600 hover:underline"
        >
          {sort === 'newest' ? t('community.sortNewest') : t('community.sortOldest')}
        </button>
      </div>

      {ordered.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">{t('community.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {ordered.map((note) => (
            <li key={note.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{note.name}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  #{t(`topic.${note.topic}`)}
                </span>
                {note.at > 0 && (
                  <time className="ml-auto text-[11px] text-gray-400">{new Date(note.at).toLocaleDateString(locale)}</time>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">{note.text}</p>
              {note.at > 0 && (
                <button type="button" onClick={() => remove(note.id)} className="mt-2 text-[11px] text-gray-400 hover:text-red-600">
                  {t('community.delete')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-[11px] text-gray-400">{t('community.localOnly')}</p>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
