import type { Metadata } from 'next';
import Icon from '@/components/ui/Icon';
import { getT } from '@/i18n/server';
import { CONTACT_INFO } from '@/constants/config';
import ContactForm from './ContactForm';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'pages');
  return { title: t('meta.contact.title'), description: t('meta.contact.desc') };
}

export default function ContactPage({ params }: { params: { locale: string } }) {
  const { t } = getT(params.locale, 'pages');

  const channels: { icon: 'archive' | 'camera' | 'handshake'; title: string; body: string }[] = [
    { icon: 'archive', title: t('contact.content.title'), body: t('contact.content.body') },
    { icon: 'camera', title: t('contact.image.title'), body: t('contact.image.body') },
    { icon: 'handshake', title: t('contact.collab.title'), body: t('contact.collab.body') },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      <header className="relative py-20 bg-gradient-to-br from-zhuang-red to-zhuang-black text-white">
        <div className="container-custom max-w-4xl text-center">
          <div className="flex justify-center mb-5 text-zhuang-gold">
            <Icon name="handshake" size={56} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('contact.title')}</h1>
          <p className="text-lg opacity-90">{t('contact.lead')}</p>
        </div>
      </header>

      <div className="container-custom max-w-4xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {channels.map((c) => (
            <section key={c.title} className="card-cultural p-6">
              <div className="text-zhuang-blue mb-3">
                <Icon name={c.icon} size={28} />
              </div>
              <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{c.title}</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{c.body}</p>
            </section>
          ))}
        </div>

        <ContactForm />

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('contact.emailLabel')}：
          <a href={`mailto:${CONTACT_INFO.email}`} className="text-zhuang-blue hover:text-zhuang-red font-medium">
            {CONTACT_INFO.email}
          </a>
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">{t('contact.note')}</p>
      </div>
    </main>
  );
}
