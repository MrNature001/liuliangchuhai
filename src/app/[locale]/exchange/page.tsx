import type { Metadata } from 'next';
import { getT } from '@/i18n/server';
import ExchangeClient from './ExchangeClient';

/**
 * 服务端外壳
 * Server wrapper
 *
 * 页面主体（ExchangeClient）是客户端组件，Next.js 规定客户端组件不能导出 metadata，
 * 因此由这个服务端外壳负责产出跟随语言的 <title>/<description>，
 * 再渲染真正的客户端页面。
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { t } = getT(params.locale, 'exchange');
  return { title: t('meta.title'), description: t('meta.description') };
}

export default function Page() {
  return <ExchangeClient />;
}
