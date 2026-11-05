/* 시연 데이터 — PRD v0.7 최종본 9.6. 캔버스 전 보드가 쓰는 값과 같다.
 * 날짜는 서울 기준을 UTC ISO로 적는다(서울 = UTC+9). */
import type { AdminQueueCounts, NotificationItem } from '@majayong/types';

export const DEMO = {
  client: { name: '정민재', business: '온도 다이닝', industry: '카운터 코스 레스토랑', seats: 10, joined: '2026년 8월', rating: 4.5, completed: 2 },
  project: {
    id: 'p-ondo',
    title: '예약 달력, 예약금 결제 외 2개 기능',
    items: ['예약 달력', '예약금 결제', '노쇼 기록', '리마인드 알림'],
    excluded: ['단골 등급 관리'],
    hopeBudget: 5_000_000,
    recruitStart: '2026-10-26T15:00:00Z', // 10월 27일
    deadline: '2026-11-02T15:00:00Z',     // 11월 3일
    detailViews: 5,
    conditionsTotal: 10,
  },
  suppliers: [
    { id: 's-junho', name: '최준호', career: 5, rating: 4.8, reviews: 12, business: 'BUSINESS' as const, quote: 3_000_000, revised: 3_100_000, days: 42, questions: 2 },
    { id: 's-sera', name: '김세라', career: null, rating: null, reviews: 0, business: 'INDIVIDUAL' as const, quote: 2_800_000, revised: null, days: 35, questions: 0 },
    { id: 's-nut', name: '스튜디오 넛', career: null, rating: null, reviews: 0, business: 'BUSINESS' as const, quote: 4_500_000, revised: null, days: 56, questions: 0, unavailable: ['리마인드 알림'] },
  ],
  contract: {
    id: 'c-ondo',
    agreed: 3_100_000,
    clientFee: 155_000,
    deposit: 3_255_000,
    decided: 9,
    conditions: 10,
    provisionalAt: '2026-11-02T15:00:00Z',   // 11월 3일 임시 계약
    consentDeadline: '2026-11-09T15:00:00Z', // 11월 10일
    signedAt: '2026-11-03T15:00:00Z',        // 11월 4일 양측 서명
    depositDeadline: '2026-11-07T14:59:00Z', // 11월 7일 23:59
    depositedAt: '2026-11-04T05:20:00Z',     // 11월 4일 14:20
    workDueAt: '2026-12-15T15:00:00Z',       // 12월 16일
    installment: 1_550_000,
    supplierPayout: 1_472_500,               // 1,550,000 − 77,500
    finalDeliveredAt: '2026-12-11T15:00:00Z',
    inspectionDueAt: '2026-12-18T15:00:00Z', // 12월 19일
  },
  operator: { company: '로켓단', phone: '1600-0000', email: 'help@majayong.example' },
} as const;

export const DEMO_ADMIN_QUEUES: AdminQueueCounts = { blocks: 3, payments: 1, refunds: 1, disputes: 1, reports: 2 };

export const DEMO_NOTIFICATIONS: Record<'CLIENT' | 'SUPPLIER', NotificationItem[]> = {
  CLIENT: [
    { id: 'n1', type: 'NEW_MESSAGE', message: '최준호 님이 메시지를 보냈습니다', target: DEMO.project.title, targetUrl: '/c/chat/p-ondo/s-junho', isRead: false, createdAt: '2026-11-03T02:10:00Z' },
    { id: 'n2', type: 'APPLICATION_RECEIVED', message: '스튜디오 넛 님이 지원했습니다', target: DEMO.project.title, targetUrl: '/c/projects/p-ondo/proposals', isRead: false, createdAt: '2026-11-01T01:00:00Z' },
    { id: 'n3', type: 'DEPOSIT_DUE', message: '내일까지 예치해 주세요 · 지나면 자동 결렬', target: '계약 — 최준호', targetUrl: '/c/contracts/c-ondo/escrow', isRead: true, createdAt: '2026-11-06T00:00:00Z' },
  ],
  SUPPLIER: [
    { id: 'n4', type: 'APPLICATION_ACCEPTED', message: '이 사람과 계약 — 11월 10일까지 서명해 주세요', target: DEMO.project.title, targetUrl: '/s/contracts/c-ondo', isRead: false, createdAt: '2026-11-02T15:10:00Z' },
    { id: 'n5', type: 'NEW_MESSAGE', message: '정민재 님이 메시지를 보냈습니다', target: DEMO.project.title, targetUrl: '/s/chat/p-ondo', isRead: true, createdAt: '2026-11-01T03:00:00Z' },
  ],
};
