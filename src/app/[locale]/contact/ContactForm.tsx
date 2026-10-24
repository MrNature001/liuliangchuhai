'use client';

/**
 * 联系表单
 * Contact form
 *
 * 本站没有后端，因此不「提交」到服务器，而是在本机拼出邮件草稿：
 * 有 mailto 就唤起邮件客户端，没有就复制到剪贴板。
 * 这样既能真正送到人手里，又不引入表单服务与隐私风险。
 */

import { useState } from 'react';
import { useT, useLocale } from '@/i18n/client';
import { LOCALES, LOCALE_META } from '@/i18n/config';
import { Toast } from '@/components/ui/Dialog';
import { CONTACT_INFO } from '@/constants/config';

const CONTACT_EMAIL = CONTACT_INFO.email;

const TOPICS = ['content', 'image', 'collab', 'other'] as const;
type Topic = (typeof TOPICS)[number];

export default function ContactForm() {
  const { t } = useT('pages');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState<Topic>('content');
  const [message, setMessage] = useState('');
  const [replyLocale, setReplyLocale] = useState(locale);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const topicLabel = (key: Topic) =>
    t(`form.topic${key.charAt(0).toUpperCase()}${key.slice(1)}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !message.trim()) {
      setError(t('form.required'));
      return;
    }
    if (message.trim().length < 10) {
      setError(t('form.tooShort'));
      return;
    }

    const subject = t('form.mailSubject', { topic: topicLabel(topic), name: name.trim() });
    const body = t('form.mailBody', {
      name: name.trim(),
      topic: topicLabel(topic),
      language: LOCALE_META[replyLocale].nativeName,
      message: message.trim(),
    });

    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setToast(t('form.localNote'));
  };

  const copyBody = async () => {
    const subject = t('form.mailSubject', { topic: topicLabel(topic), name: name.trim() || '—' });
    const body = t('form.mailBody', {
      name: name.trim() || '—',
      topic: topicLabel(topic),
      language: LOCALE_META[replyLocale].nativeName,
      message: message.trim(),
    });
    try {
      await navigator.clipboard.writeText(`To: ${CONTACT_EMAIL}\nSubject: ${subject}\n\n${body}`);
      setToast(t('form.copied'));
    } catch {
      setToast(t('form.copied'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-cultural p-8 space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            {t('form.name')} <span className="text-zhuang-red" aria-hidden>*</span>
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('form.namePlaceholder')}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-zhuang-red focus:outline-none"
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="contact-topic" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            {t('form.topic')}
          </label>
          <select
            id="contact-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value as Topic)}
            className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-zhuang-red focus:outline-none"
          >
            {TOPICS.map((key) => (
              <option key={key} value={key}>
                {topicLabel(key)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-lang" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          {t('form.language')}
        </label>
        <select
          id="contact-lang"
          value={replyLocale}
          onChange={(e) => setReplyLocale(e.target.value as typeof locale)}
          className="w-full sm:w-64 px-4 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-zhuang-red focus:outline-none"
        >
          {LOCALES.map((code) => (
            <option key={code} value={code}>
              {LOCALE_META[code].nativeName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          {t('form.message')} <span className="text-zhuang-red" aria-hidden>*</span>
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder={t('form.messagePlaceholder')}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-zhuang-red focus:outline-none resize-y"
          aria-required="true"
          aria-describedby={error ? 'contact-error' : undefined}
        />
        <p id="contact-error" aria-live="polite" className="text-sm text-red-600 mt-2 min-h-[1.25rem]">
          {error ?? ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <button type="submit" className="btn-embroidery px-6 py-3">
          {t('form.submit')}
        </button>
        <button
          type="button"
          onClick={copyBody}
          className="px-6 py-3 rounded-full border-2 border-gray-200 dark:border-gray-700 font-medium hover:border-zhuang-red transition-colors"
        >
          {t('form.copyInstead')}
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">{t('form.localNote')}</span>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </form>
  );
}
