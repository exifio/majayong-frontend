/* 프로필 이미지 업로드 — presign → Storage PUT → 프로필 PATCH → 고정 공개 경로 저장 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderAt } from '@/test/render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const me = {
  id: 'user-1',
  email: 'owner@example.com',
  role: 'CLIENT',
  name: '정민재',
  profileImageUrl: null,
  bio: null,
  termsVersion: 'v0.7',
  termsAgreedAt: '2026-08-01T00:00:00.000Z',
  createdAt: '2026-08-01T00:00:00.000Z',
};

afterEach(() => vi.unstubAllGlobals());

describe('LiveProfileImage — 프로필 이미지', () => {
  it('presign으로 올린 파일을 고정 공개 경로로 저장하고 미리보기를 바꾼다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === '/api/v1/me' && (!init?.method || init.method === 'GET')) return jsonResponse({ data: me });
      if (url.endsWith('/me/client-profile') && (!init?.method || init.method === 'GET')) {
        return jsonResponse({ data: { name: '정민재', profileImageUrl: null, bio: null } });
      }
      if (url.endsWith('/me/client-profile') && init?.method === 'PATCH') {
        return jsonResponse({ data: { name: '정민재', profileImageUrl: 'saved', bio: null } });
      }
      if (url.endsWith('/me/notification-settings')) {
        return jsonResponse({
          data: { contract: true, chat: true, recruiting: true, review: true, support: true, marketing: false },
        });
      }
      if (url.endsWith('/me/payment-statements')) {
        return jsonResponse({ data: { simulated: true, transferNote: '시뮬레이션', statements: [] } });
      }
      if (url.endsWith('/uploads/presign') && init?.method === 'POST') {
        return jsonResponse({
          data: { fileId: 'file-1', uploadUrl: 'https://upload.example.test/put', objectKey: 'k', expiresInSec: 300 },
        }, 201);
      }
      if (url === 'https://upload.example.test/put' && init?.method === 'PUT') {
        return new Response('', { status: 200 });
      }
      return jsonResponse({ data: null });
    });
    vi.stubGlobal('fetch', fetchMock);

    renderAt('/c/account', 'client', undefined, 'test-token');
    const input = await screen.findByLabelText('프로필 이미지 파일 선택');
    const file = new File(['png'], 'me.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    const image = await screen.findByAltText('프로필 이미지');
    await waitFor(() => expect(image.getAttribute('src')).toMatch(/\/api\/v1\/uploads\/file-1\/avatar$/));
    const patch = fetchMock.mock.calls.find(([url, init]) =>
      String(url).endsWith('/me/client-profile') && init?.method === 'PATCH');
    expect(JSON.parse(String(patch?.[1]?.body))).toEqual({
      profileImageUrl: `${window.location.origin}/api/v1/uploads/file-1/avatar`,
    });
  });
});
