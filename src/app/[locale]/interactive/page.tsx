'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

const metadata: Metadata = {
  title: '互动体验 - 文化游戏与社区广场',
  description: '参与文化游戏、互动挑战、社区讨论与虚拟活动',
};

export default function InteractiveHallPage() {
  // 游戏状态
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  // 抛绣球游戏状态
  const [ballScore, setBallScore] = useState(0);
  const [ballAttempts, setBallAttempts] = useState(10);
  const [ballTimer, setBallTimer] = useState(30);

  // 问答状态
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);

  // 社区帖子状态
  const [posts, setPosts] = useState(communityPosts);

  // 开始游戏
  const handleStartGame = (gameTitle: string) => {
    alert(`🎮 ${gameTitle}\n\n游戏正在加载中...\n\n这是演示版本，完整版将包含：\n• 互动游戏玩法\n• 积分奖励系统\n• 排行榜竞争\n• 成就解锁`);
  };

  // 抛绣球游戏
  const handleThrowBall = () => {
    if (ballAttempts > 0) {
      const hit = Math.random() > 0.5;
      if (hit) {
        setBallScore(ballScore + 10);
        alert('🎯 命中！+10分');
      } else {
        alert('😅 未命中，再试一次！');
      }
      setBallAttempts(ballAttempts - 1);
    } else {
      alert(`🏆 游戏结束！\n\n最终得分：${ballScore}分\n\n${ballScore >= 50 ? '太棒了！你是抛绣球高手！' : '继续努力，多多练习！'}`);
      // 重置
      setBallScore(0);
      setBallAttempts(10);
    }
  };

  // 提交问答答案
  const handleSubmitAnswer = () => {
    if (quizAnswer === null) {
      alert('⚠️ 请先选择一个答案');
      return;
    }
    const correct = quizAnswer === 1; // 正确答案是B (index 1)
    setQuizCorrect(correct);

    if (correct) {
      alert('✅ 回答正确！\n\n左江花山岩画于2016年被列入UNESCO世界文化遗产名录。\n\n+10积分');
    } else {
      alert('❌ 回答错误\n\n正确答案是：2016年\n\n左江花山岩画是广西首个世界文化遗产。');
    }

    // 重置
    setTimeout(() => {
      setQuizAnswer(null);
      setQuizCorrect(null);
    }, 2000);
  };

  // 点赞帖子
  const handleLikePost = (postIndex: number) => {
    const newPosts = [...posts];
    newPosts[postIndex].likes += 1;
    setPosts(newPosts);
  };

  // 报名活动
  const handleRegisterEvent = (eventTitle: string) => {
    alert(`✅ 报名成功！\n\n活动：${eventTitle}\n\n报名确认邮件已发送\n活动开始前将通过短信提醒您`);
  };

  // 分享帖子
  const handleSharePost = (postTitle: string) => {
    const shareText = `${postTitle} - 广西-东盟文化展`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('📋 分享链接已复制到剪贴板！');
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-gray-900">
      {/* 展厅标题 */}
      <section className="relative h-[60vh] flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0">
          {/* 动态粒子背景 */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-50 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
            互动体验
          </h1>
          <p className="text-2xl md:text-3xl mb-2 animate-slide-up animation-delay-200">
            Interactive Experience Center
          </p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto animate-slide-up animation-delay-300">
            文化游戏 • 社区广场 • 虚拟活动 • 成就系统
          </p>
        </div>
      </section>

      {/* 展区导航 */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom">
          <div className="flex overflow-x-auto scrollbar-hidden py-4 gap-4">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-purple-600 hover:text-white transition-colors text-sm font-medium"
              >
                {section.icon} {section.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 文化游戏中心 */}
      <section id="games" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="🎮"
            title="文化游戏中心"
            subtitle="Learn Through Play"
            description="通过游戏的方式学习和体验广西与东盟文化"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {culturalGames.map((game, idx) => (
              <div key={idx} className="card-cultural overflow-hidden group">
                <div className={`aspect-video bg-gradient-to-br ${game.gradient} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full">
                      {game.difficulty}
                    </span>
                    <span className="bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full">
                      {game.players}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>👥 {game.playCount}</span>
                      <span>⭐ {game.rating}</span>
                    </div>
                    <button
                      onClick={() => handleStartGame(game.title)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-700 transition-colors"
                    >
                      开始游戏
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 三月三节日游戏专区 */}
      <section id="sanyuesan-games" className="py-20 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container-custom">
          <SectionHeader
            icon="🎊"
            title="三月三节日游戏"
            subtitle="Sanyuesan Festival Games"
            description="体验壮族传统节日的经典游戏活动"
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 抛绣球游戏 */}
            <div className="card-cultural p-8">
              <div className="text-center mb-6">
                <div className="text-8xl mb-4 animate-embroidery-bounce">🏀</div>
                <h3 className="text-2xl font-bold mb-2">抛绣球挑战</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  瞄准目标，完美抛掷，体验壮族传统求爱方式
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-lg mb-6">
                <div className="aspect-video flex items-center justify-center text-6xl">
                  🎯
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{ballScore}</div>
                  <div className="text-xs text-gray-500">得分</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{ballAttempts}</div>
                  <div className="text-xs text-gray-500">剩余次数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">00:{ballTimer}</div>
                  <div className="text-xs text-gray-500">倒计时</div>
                </div>
              </div>

              <button
                onClick={handleThrowBall}
                className="w-full btn-embroidery py-3"
              >
                {ballAttempts > 0 ? '投掷绣球' : '重新开始'}
              </button>
            </div>

            {/* 对歌挑战 */}
            <div className="card-cultural p-8">
              <div className="text-center mb-6">
                <div className="text-8xl mb-4">🎤</div>
                <h3 className="text-2xl font-bold mb-2">对歌挑战</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  学习壮族山歌，与AI对唱，展现歌唱才华
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {songChallenges.map((challenge, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{challenge.level}</span>
                      <span className="text-sm text-gray-500">{challenge.songs} 首歌曲</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => alert('🎤 对歌系统\n\n即将推出：\n• 壮族山歌学习\n• AI智能对唱\n• 节奏打分系统\n• 录音分享功能')}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                进入挑战
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 文化知识问答 */}
      <section id="quiz" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="🧠"
            title="文化知识问答"
            subtitle="Cultural Quiz"
            description="测试你对广西和东盟文化的了解程度"
          />

          <div className="mt-12 max-w-4xl mx-auto">
            <div className="card-cultural p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">每日挑战</h3>
                  <p className="text-sm text-gray-500">回答10个问题，赢取徽章奖励</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">
                    {quizCorrect !== null ? '1/10' : '0/10'}
                  </div>
                  <div className="text-xs text-gray-500">已完成</div>
                </div>
              </div>

              {/* 示例问题 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg mb-6">
                <div className="text-sm text-purple-600 font-medium mb-3">问题 1/10</div>
                <h4 className="text-lg font-bold mb-4">
                  左江花山岩画于哪一年被列入UNESCO世界文化遗产名录？
                </h4>

                <div className="space-y-3">
                  {['2014年', '2016年', '2018年', '2020年'].map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setQuizAnswer(index)}
                      className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                        quizAnswer === index
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setQuizAnswer(null);
                    alert('⏭️ 已跳过此题');
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  跳过
                </button>
                <button
                  onClick={handleSubmitAnswer}
                  className="flex-1 btn-embroidery py-3"
                >
                  提交答案
                </button>
              </div>
            </div>

            {/* 排行榜 */}
            <div className="card-cultural p-6 mt-8">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                🏆 本周排行榜
              </h4>
              <div className="space-y-3">
                {leaderboard.map((user, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className={`text-2xl ${idx < 3 ? 'font-bold' : ''}`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600">{user.score}</div>
                      <div className="text-xs text-gray-500">积分</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 虚拟活动日历 */}
      <section id="events" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <SectionHeader
            icon="📅"
            title="虚拟活动日历"
            subtitle="Online Events"
            description="参加线上展览、讲座、工作坊和文化活动"
          />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, idx) => (
              <div key={idx} className="card-cultural overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${event.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold text-purple-600">{event.day}</div>
                      <div className="text-xs text-gray-500">{event.month}</div>
                    </div>
                    <div>
                      <div className="text-sm text-purple-600 font-medium">{event.time}</div>
                      <div className="text-xs text-gray-500">{event.duration}</div>
                    </div>
                  </div>

                  <h4 className="font-bold mb-2">{event.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>👥 {event.participants}</span>
                    </div>
                    <button
                      onClick={() => handleRegisterEvent(event.title)}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      报名参加 →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 成就系统 */}
      <section id="achievements" className="py-20">
        <div className="container-custom">
          <SectionHeader
            icon="🏅"
            title="成就徽章系统"
            subtitle="Achievements & Badges"
            description="完成挑战，收集徽章，成为文化探索专家"
          />

          <div className="mt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {achievements.map((achievement, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (achievement.unlocked) {
                      alert(`🏆 ${achievement.title}\n\n${achievement.description}\n\n已于 ${new Date().toLocaleDateString()} 解锁`);
                    } else {
                      alert(`🔒 ${achievement.title}\n\n${achievement.description}\n\n进度：${achievement.progress || 0}%\n\n继续努力即可解锁！`);
                    }
                  }}
                  className={`card-cultural p-6 text-center hover:shadow-lg transition-all ${
                    achievement.unlocked ? '' : 'opacity-50 grayscale'
                  }`}
                >
                  <div className="text-5xl mb-3">{achievement.icon}</div>
                  <div className="font-bold text-sm mb-1">{achievement.title}</div>
                  <div className="text-xs text-gray-500 mb-2">{achievement.description}</div>
                  {achievement.unlocked && (
                    <div className="text-xs text-green-600 font-medium">✓ 已解锁</div>
                  )}
                  {!achievement.unlocked && achievement.progress && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div
                          className="bg-purple-600 h-1.5 rounded-full"
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{achievement.progress}%</div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 社区广场 */}
      <section id="community" className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container-custom">
          <SectionHeader
            icon="💬"
            title="社区广场"
            subtitle="Community Forum"
            description="与其他文化爱好者交流、分享、讨论"
          />

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 热门讨论 */}
            <div className="lg:col-span-2 space-y-4">
              {posts.map((post, idx) => (
                <div key={idx} className="card-cultural p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xl flex-shrink-0">
                      {post.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold">{post.author}</span>
                        <span className="text-xs text-gray-500">{post.time}</span>
                        {post.verified && (
                          <span className="text-blue-500">✓</span>
                        )}
                      </div>
                      <h4 className="font-bold mb-2">{post.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <button
                          onClick={() => handleLikePost(idx)}
                          className="hover:text-purple-600 transition-colors"
                        >
                          👍 {post.likes}
                        </button>
                        <button
                          onClick={() => alert('💬 评论功能\n\n即将推出评论系统')}
                          className="hover:text-purple-600 transition-colors"
                        >
                          💬 {post.comments}
                        </button>
                        <button
                          onClick={() => handleSharePost(post.title)}
                          className="hover:text-purple-600 transition-colors"
                        >
                          🔗 分享
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              <div className="card-cultural p-6">
                <h4 className="font-bold mb-4">📌 热门话题</h4>
                <div className="space-y-2">
                  {hotTopics.map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => alert(`🔍 话题：#${topic.name}\n\n${topic.count} 条讨论`)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    >
                      #{topic.name}
                      <span className="text-xs text-gray-500 ml-2">{topic.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-cultural p-6">
                <h4 className="font-bold mb-4">📊 社区统计</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">注册用户</span>
                    <span className="font-bold">10,245</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">讨论帖</span>
                    <span className="font-bold">2,150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">今日活跃</span>
                    <span className="font-bold text-green-600">856</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 返回导航 */}
      <section className="py-12">
        <div className="container-custom text-center">
          <Link
            href="/zh"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-pink-600 transition-colors font-medium"
          >
            ← 返回首页
          </Link>
        </div>
      </section>
    </main>
  );
}

// 辅助组件
function SectionHeader({ icon, title, subtitle, description }: {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
}) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-4xl font-bold mb-2">{title}</h2>
      <p className="text-sm text-purple-600 font-medium mb-3">{subtitle}</p>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

// 数据定义
const sections = [
  { id: 'games', title: '文化游戏', icon: '🎮' },
  { id: 'sanyuesan-games', title: '三月三游戏', icon: '🎊' },
  { id: 'quiz', title: '知识问答', icon: '🧠' },
  { id: 'events', title: '虚拟活动', icon: '📅' },
  { id: 'achievements', title: '成就系统', icon: '🏅' },
  { id: 'community', title: '社区广场', icon: '💬' },
];

const culturalGames = [
  {
    icon: '🧩',
    title: '壮锦拼图',
    description: '拼接传统壮锦图案，学习纹样知识',
    gradient: 'from-red-500 to-pink-600',
    difficulty: '简单',
    players: '单人',
    playCount: '5.2k',
    rating: '4.8'
  },
  {
    icon: '🗺️',
    title: '文化寻宝',
    description: '探索虚拟桂林，寻找隐藏的文化宝藏',
    gradient: 'from-blue-500 to-cyan-500',
    difficulty: '中等',
    players: '多人',
    playCount: '8.1k',
    rating: '4.9'
  },
  {
    icon: '🎨',
    title: '岩画创作',
    description: '模仿花山岩画风格，创作自己的作品',
    gradient: 'from-amber-600 to-orange-600',
    difficulty: '中等',
    players: '单人',
    playCount: '3.7k',
    rating: '4.6'
  },
  {
    icon: '🥁',
    title: '铜鼓节奏',
    description: '跟随铜鼓的节奏，体验壮族音乐',
    gradient: 'from-yellow-500 to-amber-600',
    difficulty: '困难',
    players: '单人',
    playCount: '6.5k',
    rating: '4.7'
  },
  {
    icon: '🌏',
    title: '东盟探险',
    description: '环游东盟十国，收集文化徽章',
    gradient: 'from-green-500 to-emerald-600',
    difficulty: '中等',
    players: '单人',
    playCount: '4.9k',
    rating: '4.8'
  },
  {
    icon: '📚',
    title: '文字记忆',
    description: '学习和记忆壮文、东南亚语言',
    gradient: 'from-purple-500 to-indigo-600',
    difficulty: '困难',
    players: '单人',
    playCount: '2.8k',
    rating: '4.5'
  },
];

const songChallenges = [
  { level: '初级', songs: 5, progress: 80 },
  { level: '中级', songs: 8, progress: 40 },
  { level: '高级', songs: 10, progress: 0 },
];

const leaderboard = [
  { avatar: '👑', name: '文化达人', title: '探索大师', score: 2580 },
  { avatar: '🎯', name: '知识渊博', title: '文化学者', score: 2340 },
  { avatar: '🌟', name: '游戏高手', title: '挑战者', score: 2190 },
  { avatar: '🎨', name: '艺术爱好者', title: '创作者', score: 1980 },
  { avatar: '🎵', name: '音乐迷', title: '节奏大师', score: 1850 },
];

const upcomingEvents = [
  {
    day: '15',
    month: '9月',
    time: '19:00',
    duration: '2小时',
    title: '壮族织锦工艺线上工作坊',
    description: '跟随非遗传承人学习壮锦织造技艺',
    participants: 120,
    color: 'from-red-500 to-pink-600'
  },
  {
    day: '18',
    month: '9月',
    time: '14:00',
    duration: '1.5小时',
    title: '东盟文化讲座：泰国水灯节',
    description: '了解泰国传统节日的历史与习俗',
    participants: 85,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    day: '22',
    month: '9月',
    time: '20:00',
    duration: '3小时',
    title: '虚拟音乐会：壮族山歌之夜',
    description: '线上欣赏传统壮族山歌表演',
    participants: 200,
    color: 'from-purple-500 to-pink-600'
  },
];

const achievements = [
  { icon: '🎓', title: '初学者', description: '完成新手教程', unlocked: true },
  { icon: '🏆', title: '知识达人', description: '答对100题', unlocked: true, progress: 100 },
  { icon: '🎮', title: '游戏高手', description: '完成10个游戏', unlocked: false, progress: 60 },
  { icon: '🌟', title: '探索者', description: '访问所有展厅', unlocked: true },
  { icon: '💬', title: '社交达人', description: '发布10个帖子', unlocked: false, progress: 40 },
  { icon: '🎨', title: '创作者', description: '上传作品', unlocked: false, progress: 0 },
];

const communityPosts = [
  {
    avatar: '👨',
    author: '文化探索者',
    time: '2小时前',
    verified: true,
    title: '左江花山岩画探访心得分享',
    content: '上周末去实地探访了花山岩画，震撼！虚拟展厅还原度很高，但现场感受更震撼。建议大家有机会一定要去现场看看。',
    likes: 128,
    comments: 24
  },
  {
    avatar: '👩',
    author: '东盟文化爱好者',
    time: '5小时前',
    verified: false,
    title: '泰国泼水节和壮族三月三的相似之处',
    content: '发现泰国泼水节和壮族三月三有很多相似的地方，都是在春天举行，都有泼水、对歌等活动。这说明壮泰文化同源不是空穴来风...',
    likes: 95,
    comments: 18
  },
];

const hotTopics = [
  { name: '壮族文化', count: '1.2k' },
  { name: '东盟交流', count: '856' },
  { name: '非遗传承', count: '642' },
  { name: '文物保护', count: '531' },
  { name: '三月三', count: '489' },
];
