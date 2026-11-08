import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

function CurrentPath() {
  const { pathname, hash } = useLocation();
  return <output>{pathname + hash}</output>;
}

describe('Button 링크', () => {
  it('fragment 목적지는 현재 경로를 붙이지 않는 네이티브 앵커로 렌더링한다', () => {
    render(
      <MemoryRouter initialEntries={['/supplier']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Button to="#how" variant="ghost" className="hero-cta">견적 방식 보기</Button>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: '견적 방식 보기' });
    expect(link.getAttribute('href')).toBe('#how');
    expect(link.getAttribute('data-btn')).toBe('ghost');
    expect(link.classList.contains('hero-cta')).toBe(true);
  });

  it('경로 목적지는 React Router 안에서 해당 경로로 이동한다', () => {
    render(
      <MemoryRouter initialEntries={['/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Button to="/signup">화면 초안 받아보기</Button>
        <CurrentPath />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: '화면 초안 받아보기' }));

    expect(screen.getByText('/signup')).toBeTruthy();
  });
});
