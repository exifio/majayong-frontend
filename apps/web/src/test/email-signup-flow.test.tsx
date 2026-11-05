/* 이메일 회원가입 전체 흐름 및 새로고침 세션 유지 검증 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { location, renderAt } from './render';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const registerResponse = (role: 'CLIENT' | 'SUPPLIER', email = 'newuser@example.com') => jsonResponse({
  data: {
    user: { id: 'user-new', email, role },
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-123',
    accessExpiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  },
}, 201);

afterEach(() => {
  vi.unstubAllGlobals();
  try { window.sessionStorage.clear(); } catch { /* ignore */ }
  try { window.localStorage.clear(); } catch { /* ignore */ }
});

describe('Email signup end-to-end & reload persistence', () => {
  it('의뢰인 흐름: /signup → /signup/role → 등록 → /signup/client → 프로필 저장 → /c', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);
      return url.endsWith('/api/v1/auth/register')
        ? registerResponse('CLIENT')
        : jsonResponse({ data: [] });
    });
    vi.stubGlobal('fetch', fetchMock);

    // 1단계: /signup
    const r1 = renderAt('/signup', null);
    const root1 = (await screen.findByRole('heading', { level: 1, name: '계정을 만듭니다' })).closest('[data-screen="Signup"]') as HTMLElement;

    fireEvent.change(within(root1).getByLabelText(/이메일/), { target: { value: 'newuser@example.com' } });
    const pwInputs = within(root1).getAllByLabelText(/비밀번호/);
    fireEvent.change(pwInputs[0]!, { target: { value: 'password1234' } });
    fireEvent.change(pwInputs[1]!, { target: { value: 'password1234' } });
    for (const c of within(root1).getAllByRole('checkbox')) {
      fireEvent.click(c);
    }

    fireEvent.click(within(root1).getByRole('button', { name: '다음' }));

    // 2단계: /signup/role 도착 및 유지 (되돌아가지 않음)
    await waitFor(() => expect(location.current.startsWith('/signup/role')).toBe(true));
    expect(screen.getByRole('heading', { level: 1, name: '어떤 쪽으로 시작하시나요?' })).toBeTruthy();
    r1.unmount();

    // 새로고침 시뮬레이션: initial session 없이 /signup/role 다시 마운트
    const r2 = renderAt('/signup/role', null);
    const roleHeading = await screen.findByRole('heading', { level: 1, name: '어떤 쪽으로 시작하시나요?' });
    expect(roleHeading).toBeTruthy();
    expect(location.current.startsWith('/signup/role')).toBe(true);

    // 역할 선택 후 "다음": POST /auth/register 호출, 이어서 ③ 프로필로 이동
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => expect(location.current.startsWith('/signup/client')).toBe(true));
    expect(screen.getByRole('heading', { level: 1, name: '의뢰인 프로필' })).toBeTruthy();

    const clientRoot = screen.getByRole('heading', { level: 1, name: '의뢰인 프로필' })
      .closest('[data-screen="Signup-Client"]') as HTMLElement;
    fireEvent.change(within(clientRoot).getByLabelText(/상호/), { target: { value: '실제 의뢰인 상호' } });
    fireEvent.change(within(clientRoot).getByLabelText(/업종/), { target: { value: '기타 (직접 입력)' } });
    fireEvent.change(within(clientRoot).getByLabelText(/한 줄 소개/), { target: { value: '실제 가게 소개' } });

    fireEvent.click(screen.getByRole('button', { name: '가입 완료' }));
    await waitFor(() => expect(location.current.startsWith('/c')).toBe(true));

    // register API 스키마 검증: { email, password, role, termsVersion: 'v0.7' }
    const registerCall = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/api/v1/auth/register'));
    expect(registerCall).toBeTruthy();
    expect(JSON.parse(String(registerCall![1]!.body))).toEqual({
      email: 'newuser@example.com',
      password: 'password1234',
      role: 'CLIENT',
      termsVersion: 'v0.7',
    });
    const profileCall = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/api/v1/me/client-profile'));
    expect(profileCall![1]?.method).toBe('PATCH');
    expect(JSON.parse(String(profileCall![1]?.body))).toEqual({
      businessName: '실제 의뢰인 상호',
      industryField: '기타 (직접 입력)',
      bio: '실제 가게 소개',
    });


    // 역할 선택 완료 즉시 평문 비밀번호 및 가입 세션 정리 확인
    expect(window.sessionStorage.getItem('mj.signup.password')).toBeNull();
    expect(window.sessionStorage.getItem('mj.signup.session')).toBeNull();
  });

  it('공급자 흐름: /signup/role → 등록 → /signup/supplier → 프로필 저장 → /s', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);
      return url.endsWith('/api/v1/auth/register')
        ? registerResponse('SUPPLIER', 'supplier@example.com')
        : jsonResponse({ data: [] });
    });
    vi.stubGlobal('fetch', fetchMock);

    window.sessionStorage.setItem('mj.signup.email', 'supplier@example.com');
    window.sessionStorage.setItem('mj.signup.password', 'password1234');
    window.sessionStorage.setItem('mj.signup.terms', 'v0.7');
    window.sessionStorage.setItem('mj.signup.session', 'signup');

    renderAt(`/signup/role?mock=${encodeURIComponent('공급자 선택')}`, null);
    await screen.findByRole('heading', { level: 1, name: '어떤 쪽으로 시작하시나요?' });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => expect(location.current.startsWith('/signup/supplier')).toBe(true));
    const supplierRoot = screen.getByRole('heading', { level: 1, name: '공급자 프로필' })
      .closest('[data-screen="Signup-Supplier"]') as HTMLElement;
    fireEvent.change(within(supplierRoot).getByLabelText(/활동 이름/), { target: { value: '실제 공급자' } });

    fireEvent.click(screen.getByRole('button', { name: '가입 완료' }));

    await waitFor(() => expect(location.current).toBe('/s'));

    const registerCall = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/api/v1/auth/register'));
    expect(JSON.parse(String(registerCall![1]!.body))).toEqual({
      email: 'supplier@example.com',
      password: 'password1234',
      role: 'SUPPLIER',
      termsVersion: 'v0.7',
    });
    const profileCall = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/api/v1/me/supplier-profile'));
    expect(profileCall![1]?.method).toBe('PATCH');
    expect(JSON.parse(String(profileCall![1]?.body))).toEqual({
      displayName: '실제 공급자',
      ndaConsent: true,
    });

    expect(window.sessionStorage.getItem('mj.signup.password')).toBeNull();
  });
  it('공급자 건너뛰기: 이메일 아이디를 활동 이름으로 보내고 NDA PATCH 후 /s로 이동한다', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(async (input) => {
      const url = String(input);
      return url.endsWith('/api/v1/auth/register')
        ? registerResponse('SUPPLIER', 'supplier@example.com')
        : jsonResponse({ data: { ndaAgreedAt: '2026-11-06T00:00:00.000Z', ndaVersion: 'v0.7' } });
    });
    vi.stubGlobal('fetch', fetchMock);

    window.sessionStorage.setItem('mj.signup.email', 'supplier@example.com');
    window.sessionStorage.setItem('mj.signup.password', 'password1234');
    window.sessionStorage.setItem('mj.signup.terms', 'v0.7');
    window.sessionStorage.setItem('mj.signup.session', 'signup');

    renderAt(`/signup/role?mock=${encodeURIComponent('공급자 선택')}`, null);
    await screen.findByRole('heading', { level: 1, name: '어떤 쪽으로 시작하시나요?' });
    fireEvent.click(screen.getByRole('button', { name: '다음' }));

    await waitFor(() => expect(location.current.startsWith('/signup/supplier')).toBe(true));
    const supplierRoot = screen.getByRole('heading', { level: 1, name: '공급자 프로필' })
      .closest('[data-screen="Signup-Supplier"]') as HTMLElement;
    expect((within(supplierRoot).getByLabelText(/활동 이름/) as HTMLInputElement).value).toBe('');
    fireEvent.click(within(supplierRoot).getByRole('button', { name: '나중에 입력하기' }));

    await waitFor(() => expect(location.current).toBe('/s'));
    const profileCall = fetchMock.mock.calls.find(([path]) => String(path).endsWith('/api/v1/me/supplier-profile'));
    expect(profileCall?.[1]?.method).toBe('PATCH');
    expect(JSON.parse(String(profileCall?.[1]?.body))).toEqual({
      displayName: 'supplier',
      ndaConsent: true,
    });
  });


  it('가입 세션이 없는 게스트의 직접 접속은 /signup으로 가드 리다이렉트된다', async () => {
    renderAt('/signup/role', null);
    await waitFor(() => expect(location.current).toBe('/signup'));

    renderAt('/signup/client', null);
    await waitFor(() => expect(location.current).toBe('/signup'));

    renderAt('/signup/supplier', null);
    await waitFor(() => expect(location.current).toBe('/signup'));
  });
});
