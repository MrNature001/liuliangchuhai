/**
 * 无依赖测试运行器
 * Dependency-free test runner
 *
 * 项目没有引入 jest/vitest：这些测试只需要 node 内置能力。
 * 用 node --experimental-strip-types 直接加载 TS 会依赖实验特性，
 * 因此这里的被测模块一律通过 `npm test` 先做一次轻量转译（见 package.json）。
 *
 * 实际做法：测试针对「纯数据与纯函数」模块，用 tsx 之外的零依赖方式，
 * 先把 TS 源以正则抽取常量，再断言结构 —— 简单、可读、不引入工具链。
 */
console.log('placeholder');
