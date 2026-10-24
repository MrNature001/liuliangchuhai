import type { Metadata } from 'next';
import { getT } from '@/i18n/server';
import { normalizeLocale } from '@/i18n/config';
import { ARTIFACTS, ARTIFACT_CATEGORIES, ARTIFACT_ERAS } from '@/lib/data/artifacts';
import { localized } from '@/lib/data/aseanProfiles';
import ArchiveClient, { type ArchiveArtifact } from './ArchiveClient';

/**
 * 服务端外壳
 * Server wrapper
 *
 * 页面主体（ArchiveClient）是客户端组件，Next.js 规定客户端组件不能导出 metadata，
 * 因此由这个服务端外壳负责产出跟随语言的 <title>/<description>，
 * 并把「已按语言解析好的」文物数据传给客户端，避免把整份多语言数据打进浏览器包。
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'archive');
  return { title: t('meta.title'), description: t('meta.description') };
}

export default function Page({ params }: { params: { locale: string } }) {
  const locale = normalizeLocale(params.locale);

  const artifacts: ArchiveArtifact[] = ARTIFACTS.map((a) => {
    const categoryLabel = localized(
      ARTIFACT_CATEGORIES.find((c) => c.key === a.category)?.label ?? { zh: '', en: '' },
      locale
    );
    return {
      id: a.id,
      category: a.category,
      era: a.era,
      image: a.image,
      has3d: a.has3d,
      playPath: a.playPath,
      displayName: localized(a.name, locale),
      displayOrigin: localized(a.origin, locale),
      displayPeriod: localized(a.period, locale),
      displayDesc: localized(a.description, locale),
      displayCaption: localized(a.imageCaption, locale),
      displayMaterial: localized(a.material, locale),
      displaySize: a.size ? localized(a.size, locale) : undefined,
      categoryLabel,
      searchText: [a.name.zh, a.name.en, categoryLabel, a.description.zh, a.origin.zh].join(' '),
    };
  });

  const categories = ARTIFACT_CATEGORIES.map((c) => ({
    key: c.key,
    label: localized(c.label, locale),
  }));

  const eraLabels = ARTIFACT_ERAS.map((e) => ({
    key: e.key,
    label: localized(e.label, locale),
  }));

  return <ArchiveClient artifacts={artifacts} categories={categories} eraLabels={eraLabels} />;
}
