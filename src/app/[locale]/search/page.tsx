import type { Metadata } from 'next';
import { getT } from '@/i18n/server';
import { normalizeLocale } from '@/i18n/config';
import { SEARCH_DOCS, sectionLabel } from '@/lib/data/searchIndex';
import SearchResults from './SearchResults';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'common');
  return {
    title: t('search.title'),
    description: t('search.hint'),
    robots: { index: false, follow: true },
  };
}

/**
 * 搜索结果页
 *
 * 查询串来自 ?q=，在服务端按语言取好「已本地化」的文档快照，
 * 再交给客户端做匹配：这样静态渲染结果里没有原始多语言数据，
 * 中文页面也不会把英文摘要打进首屏包。
 */
export default function SearchPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string };
}) {
  const locale = normalizeLocale(params.locale);
  const docs = SEARCH_DOCS.map((d) => ({
    id: d.id,
    path: d.path,
    title: locale === 'zh' ? d.title : d.titleEn,
    summary: locale === 'zh' ? d.summary : d.summaryEn,
    section: sectionLabel(d.section, locale),
    keywords: d.keywords.join(' '),
  }));

  return <SearchResults docs={docs} initialQuery={searchParams.q ?? ''} />;
}
