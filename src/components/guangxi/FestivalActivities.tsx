'use client';

/**
 * 三月三节日活动卡
 * Sanyuesan festival activities
 *
 * 每张卡可展开详情；抛绣球一项额外提供「去玩抛绣球」链接，
 * 直接跳到互动展厅的游戏区。
 */

import { useState } from 'react';
import Link from 'next/link';
import Icon, { CultureImage, type CultureImageName } from '@/components/ui/Icon';
import { useT, useLocale } from '@/i18n/client';

interface FestivalActivity {
  key: string;
  nameKey: string;
  image: CultureImageName;
  descriptionKey: string;
  detailKey: string;
  /** 配图实际内容的说明（避免图文不符被误读） */
  imageNoteKey?: string;
  /** 有对应小游戏时给出跳转目标 */
  playPath?: string;
  playKey?: string;
}

const ACTIVITIES: FestivalActivity[] = [
  {
    key: 'dialogueSong',
    nameKey: 'activity.dialogueSong.name',
    image: 'zhuangjin-wave',
    descriptionKey: 'activity.dialogueSong.description',
    detailKey: 'activity.dialogueSong.detail',
    imageNoteKey: 'activity.imageNote.brocade',
  },
  {
    key: 'embroideryBall',
    nameKey: 'activity.embroideryBall.name',
    image: 'embroidery-ball',
    descriptionKey: 'activity.embroideryBall.description',
    detailKey: 'activity.embroideryBall.detail',
    playPath: '/interactive#games',
    playKey: 'activity.embroideryBall.play',
  },
  {
    key: 'fiveColorRice',
    nameKey: 'activity.fiveColorRice.name',
    image: 'five-color-rice',
    descriptionKey: 'activity.fiveColorRice.description',
    detailKey: 'activity.fiveColorRice.detail',
  },
  {
    key: 'firecracker',
    nameKey: 'activity.firecracker.name',
    image: 'bronze-drum',
    descriptionKey: 'activity.firecracker.description',
    detailKey: 'activity.firecracker.detail',
    imageNoteKey: 'activity.imageNote.drum',
  },
  {
    key: 'eggTapping',
    nameKey: 'activity.eggTapping.name',
    image: 'zhuangjin-fret',
    descriptionKey: 'activity.eggTapping.description',
    detailKey: 'activity.eggTapping.detail',
    imageNoteKey: 'activity.imageNote.fret',
  },
  {
    key: 'boardShoe',
    nameKey: 'activity.boardShoe.name',
    image: 'stilt-house',
    descriptionKey: 'activity.boardShoe.description',
    detailKey: 'activity.boardShoe.detail',
    imageNoteKey: 'activity.imageNote.stilt',
  },
];

export default function FestivalActivities() {
  const { t } = useT('festival');
  const locale = useLocale();
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
      {ACTIVITIES.map((activity) => {
        const open = openKey === activity.key;
        return (
          <div key={activity.key} className="card-cultural flex flex-col">
            <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
              <CultureImage
                name={activity.image}
                label={t(activity.nameKey)}
                className="w-full h-full object-cover"
              />
            </div>
            {activity.imageNoteKey && (
              <p className="px-6 pt-3 text-[11px] text-gray-500 dark:text-gray-400">
                {t(activity.imageNoteKey)}
              </p>
            )}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                {t(activity.nameKey)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1">
                {t(activity.descriptionKey)}
              </p>

              {open && (
                <div className="mb-4 rounded-lg bg-pink-50 dark:bg-gray-800 p-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {t(activity.detailKey)}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setOpenKey(open ? null : activity.key)}
                  aria-expanded={open}
                  className="flex-1 min-w-[7rem] text-sm py-2 px-3 rounded-full border-2 border-zhuang-red/30 text-zhuang-red dark:text-zhuang-gold font-medium hover:bg-zhuang-red hover:text-white transition-colors"
                >
                  {open ? t('cta.close') : t('cta.interactive')}
                </button>

                {activity.playPath && activity.playKey && (
                  <Link
                    href={`/${locale}${activity.playPath}`}
                    className="flex-1 min-w-[7rem] text-center btn-embroidery text-sm py-2 px-3 inline-flex items-center justify-center gap-1.5"
                  >
                    <Icon name="gamepad" size={16} />
                    {t(activity.playKey)}
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
