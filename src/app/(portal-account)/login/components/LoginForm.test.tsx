import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from './LoginForm';

const navigation = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  cleanup();
  navigation.push.mockReset();
});

describe('LoginForm role choices', () => {
  it('offers only supported login portals', () => {
    render(<LoginForm />);

    expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('value'))).toEqual([
      'farmer',
      'bank',
      'dev-agent',
    ]);
    expect(screen.queryByText('Administrator')).not.toBeInTheDocument();
  });

  it('routes the Bank choice to the Bank login portal', () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('radio', { name: /Bank/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Next Step' }));

    expect(navigation.push).toHaveBeenCalledOnce();
    expect(navigation.push).toHaveBeenCalledWith('/login/bank-admin');
  });
});
