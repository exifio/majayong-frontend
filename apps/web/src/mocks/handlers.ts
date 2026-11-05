/* MSW 핸들러 — 공간별 API(/api/c · /api/s · /api/admin)를 시연 데이터로 흉내 낸다.
 * 화면을 만들 때 그 화면이 부를 엔드포인트를 여기에 더하고, 실제 API가 붙으면 지운다.
 * 응답은 반드시 @majayong/types 의 공간별 타입으로 만든다 — 공급자 응답에 금액 필드가 새지 않게. */
import { http, HttpResponse } from 'msw';
import type { NotificationItem, SupplierProjectCard } from '@majayong/types';
import { DEMO, DEMO_ADMIN_QUEUES, DEMO_NOTIFICATIONS } from './demo';

export const handlers = [
  http.get('/api/health', () => HttpResponse.json({ ok: true, mock: true })),

  http.get('/api/c/notifications', () => HttpResponse.json<NotificationItem[]>(DEMO_NOTIFICATIONS.CLIENT)),
  http.get('/api/s/notifications', () => HttpResponse.json<NotificationItem[]>(DEMO_NOTIFICATIONS.SUPPLIER)),

  http.get('/api/s/projects', () =>
    HttpResponse.json<SupplierProjectCard[]>([
      {
        id: DEMO.project.id, industry: '예약기반음식점', title: DEMO.project.title, itemNames: [...DEMO.project.items],
        itemCount: DEMO.project.items.length, budgetRange: '400~600만원', deadline: DEMO.project.deadline,
        requiredSkills: ['React', 'Next.js', 'Supabase'], matchedSkills: ['React', 'Next.js', 'Supabase'], bookmarked: false,
      },
    ]),
  ),

  http.get('/api/admin/queues', () => HttpResponse.json(DEMO_ADMIN_QUEUES)),
];
