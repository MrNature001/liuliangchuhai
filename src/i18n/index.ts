/**
 * i18n 统一出口
 * i18n public entry
 *
 * 服务端：import { getT } from '@/i18n/server';
 * 客户端：import { useT, useLocale } from '@/i18n/client';
 */

export * from './config';
export { createT, mergeDict, getList } from './core';
