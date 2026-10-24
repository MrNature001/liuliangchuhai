/**
 * 模块解析钩子：允许测试直接导入无扩展名的 TS 模块
 * Resolve hook so tests can import extensionless TS paths
 *
 * 项目 tsconfig 使用 moduleResolution: "bundler"，源码里的相对导入不带 .ts 后缀。
 * Node 的 ESM 解析要求显式扩展名，因此在测试运行时补一个解析钩子，
 * 不改动应用源码，也不引入额外的构建工具。
 */

import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') || specifier.startsWith('@/')) {
    let base = specifier;
    if (base.startsWith('@/')) {
      const root = new URL('../src/', import.meta.url);
      return nextResolve(new URL(base.slice(2), root).href, context);
    }
    // 相对路径：父模块所在目录
    const parent = context.parentURL ? new URL('.', context.parentURL) : null;
    if (parent) {
      const candidates = ['.ts', '.tsx', '/index.ts'];
      for (const ext of candidates) {
        const candidate = new URL(base + ext, parent);
        if (existsSync(fileURLToPath(candidate))) {
          return nextResolve(candidate.href, context);
        }
      }
    }
  }
  return nextResolve(specifier, context);
}
