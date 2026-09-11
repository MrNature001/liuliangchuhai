import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/constants/config';

/**
 * 根路径重定向到默认语言
 * Root path redirects to default locale
 */
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
