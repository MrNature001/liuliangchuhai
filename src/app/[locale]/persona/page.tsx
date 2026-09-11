'use client';

import { useState } from 'react';
import Link from 'next/link';
import { personaQuestions, calculatePersona, type PersonaResult } from '@/lib/data/personaData';

export default function PersonaPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<PersonaResult | null>(null);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentStep < personaQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 计算结果
      const scores = {
        tradition: 0,
        innovation: 0,
        art: 0,
        social: 0,
        adventure: 0
      };

      newAnswers.forEach((answerIndex, questionIndex) => {
        const selectedOption = personaQuestions[questionIndex].options[answerIndex];
        scores.tradition += selectedOption.scores.tradition;
        scores.innovation += selectedOption.scores.innovation;
        scores.art += selectedOption.scores.art;
        scores.social += selectedOption.scores.social;
        scores.adventure += selectedOption.scores.adventure;
      });

      const persona = calculatePersona(scores);
      setResult(persona);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
  };

  // 结果页面
  if (result) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container-custom py-20">
          <div className="max-w-4xl mx-auto">
            {/* 结果卡片 */}
            <div className="card-cultural overflow-hidden animate-slide-up">
              {/* 顶部渐变条 */}
              <div className={`h-2 bg-gradient-to-r ${result.color}`}></div>

              <div className="p-8 md:p-12">
                {/* 人设标题 */}
                <div className="text-center mb-8">
                  <div className="text-8xl mb-4 animate-embroidery-bounce">{result.icon}</div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {result.name}
                  </h1>
                  <p className="text-xl text-gray-500 dark:text-gray-400">{result.nameEn}</p>
                </div>

                {/* 人设描述 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg mb-8">
                  <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    {result.description}
                  </p>
                </div>

                {/* 特质标签 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span>✨</span> 你的文化特质
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.traits.map((trait, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium border-2 border-purple-200 dark:border-purple-700"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 推荐展厅 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span>🎯</span> 为你推荐的展厅
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.matchingExhibitions.map((exhibitionKey) => {
                      const exhibitions = {
                        guangxi: { name: '壮乡之韵', path: '/zh/guangxi', icon: '🎭' },
                        guilin: { name: '山水桂林', path: '/zh/guilin', icon: '🏔️' },
                        asean: { name: '东盟十国', path: '/zh/asean', icon: '🌏' },
                        exchange: { name: '丝路新章', path: '/zh/exchange', icon: '🤝' },
                        archive: { name: '数字遗产', path: '/zh/archive', icon: '📚' },
                        interactive: { name: '互动体验', path: '/zh/interactive', icon: '🎮' }
                      };
                      const exhibition = exhibitions[exhibitionKey as keyof typeof exhibitions];

                      return (
                        <Link
                          key={exhibitionKey}
                          href={exhibition.path}
                          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-lg transition-all hover:-translate-y-1"
                        >
                          <span className="text-3xl">{exhibition.icon}</span>
                          <span className="font-medium">{exhibition.name}</span>
                          <span className="ml-auto text-purple-600">→</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* 分享区域 */}
                <div className="border-t pt-8">
                  <h3 className="text-lg font-bold mb-4 text-center">分享你的文化人设</h3>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => {
                        const text = `我是【${result.name}】！快来测测你的文化人设 👉 ${window.location.href}`;
                        if (navigator.share) {
                          navigator.share({ title: '我的文化人设', text });
                        } else {
                          navigator.clipboard.writeText(text);
                          alert('分享文案已复制到剪贴板！');
                        }
                      }}
                      className="btn-embroidery px-6 py-3"
                    >
                      📱 分享到社交媒体
                    </button>
                    <button
                      onClick={resetQuiz}
                      className="px-6 py-3 bg-white dark:bg-gray-800 rounded-full font-medium hover:shadow-lg transition-all"
                    >
                      🔄 重新测试
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 返回首页 */}
            <div className="text-center mt-8">
              <Link
                href="/zh"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                ← 返回首页
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 测试页面
  const currentQuestion = personaQuestions[currentStep];

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-20">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              发现你的文化人设
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              回答 5 个问题，揭示你独特的文化身份
            </p>
          </div>

          {/* 进度条 */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>问题 {currentStep + 1} / {personaQuestions.length}</span>
              <span>{Math.round(((currentStep + 1) / personaQuestions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / personaQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* 问题卡片 */}
          <div className="card-cultural p-8 animate-slide-up">
            <h2 className="text-2xl font-bold mb-8 text-center">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full text-left p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-1">{option.text}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{option.textEn}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 返回 */}
          {currentStep > 0 && (
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setAnswers(answers.slice(0, -1));
                }}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                ← 上一题
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
