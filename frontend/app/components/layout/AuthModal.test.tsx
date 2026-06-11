import { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthModal } from './AuthModal';

const {
  mockLogin,
  mockRegister,
  mockCompleteLoginChallenge,
  mockForgotPassword,
  mockResendVerificationEmail,
  mockOnClose,
  mockOnTabChange,
} = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockRegister: vi.fn(),
  mockCompleteLoginChallenge: vi.fn(),
  mockForgotPassword: vi.fn(),
  mockResendVerificationEmail: vi.fn(),
  mockOnClose: vi.fn(),
  mockOnTabChange: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    completeLoginChallenge: mockCompleteLoginChallenge,
  }),
}));

vi.mock('@/lib/auth-security', () => ({
  forgotPassword: mockForgotPassword,
  resendVerificationEmail: mockResendVerificationEmail,
  getSecurityErrorMessage: (code: string | undefined, fallback: string) =>
    code ? `mapped:${code}` : fallback,
}));

vi.mock('react-google-recaptcha', () => ({
  default: ({ onChange }: { onChange: (value: string) => void }) => (
    <button type="button" onClick={() => onChange('captcha-token')}>
      solve-captcha
    </button>
  ),
}));

vi.mock('framer-motion', async (importOriginal) => {
  const React = await import('react');
  const actual = await importOriginal<typeof import('framer-motion')>();
  const MockDiv = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >((props, ref) => <div ref={ref} {...props} />);
  const MockP = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
  >((props, ref) => <p ref={ref} {...props} />);

  MockDiv.displayName = 'MockMotionDiv';
  MockP.displayName = 'MockMotionP';

  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    m: {
      div: MockDiv,
      p: MockP,
    },
  };
});

describe('AuthModal', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_RECAPTCHA_SITE_KEY', 'test-site-key');
    mockLogin.mockReset();
    mockRegister.mockReset();
    mockCompleteLoginChallenge.mockReset();
    mockForgotPassword.mockReset();
    mockResendVerificationEmail.mockReset();
    mockOnClose.mockReset();
    mockOnTabChange.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('показує inline login challenge без переходу на окрему сторінку', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      status: 'challenge_required',
      email: 'user@example.com',
      challengeId: 77,
      waitSeconds: 30,
      message: 'Потрібно підтвердити вхід.',
    });

    render(
      <AuthModal
        showAuth
        activeTab="login"
        authModalRef={createRef<HTMLDivElement>()}
        onClose={mockOnClose}
        onTabChange={mockOnTabChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'solve-captcha' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Увійти' })[1]!);

    await waitFor(() =>
      expect(screen.getByText('Підтвердження входу')).toBeInTheDocument(),
    );
    expect(screen.getByPlaceholderText('Код із листа')).toBeInTheDocument();
    expect(screen.getByText(/Потрібно підтвердити вхід/i)).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('вбудовує forgot-password прямо в модалку', async () => {
    mockForgotPassword.mockResolvedValue({
      success: true,
      message:
        'Якщо акаунт з таким email існує, інструкції для скидання пароля вже надіслані.',
    });

    render(
      <AuthModal
        showAuth
        activeTab="login"
        authModalRef={createRef<HTMLDivElement>()}
        onClose={mockOnClose}
        onTabChange={mockOnTabChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Забули пароль?' }));
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Надіслати інструкції' }));

    await waitFor(() =>
      expect(mockForgotPassword).toHaveBeenCalledWith('user@example.com'),
    );
    expect(
      screen.getByText(/інструкції для скидання пароля вже надіслані/i),
    ).toBeInTheDocument();
  });

  it('показує verification-required inline після реєстрації', async () => {
    mockRegister.mockResolvedValue({
      success: false,
      status: 'verification_required',
      email: 'new@example.com',
      message:
        'Ми надіслали лист для підтвердження email. Після підтвердження акаунт буде створено остаточно.',
    });

    render(
      <AuthModal
        showAuth
        activeTab="register"
        authModalRef={createRef<HTMLDivElement>()}
        onClose={mockOnClose}
        onTabChange={mockOnTabChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Ім'я"), {
      target: { value: 'Новий користувач' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Пароль (мін. 8 символів, літера і цифра)'),
      {
        target: { value: 'password123' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'solve-captcha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Продовжити' }));

    await waitFor(() => expect(mockRegister).toHaveBeenCalled());
    await screen.findByText('Підтвердження email');
    expect(
      screen.getByRole('button', { name: 'Надіслати лист повторно' }),
    ).toBeInTheDocument();
    expect(screen.getByText('new@example.com')).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('блокує реєстрацію зі слабким паролем до запиту на backend', async () => {
    render(
      <AuthModal
        showAuth
        activeTab="register"
        authModalRef={createRef<HTMLDivElement>()}
        onClose={mockOnClose}
        onTabChange={mockOnTabChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Ім'я"), {
      target: { value: 'Новий користувач' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('Пароль (мін. 8 символів, літера і цифра)'),
      {
        target: { value: 'short1' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: 'solve-captcha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Продовжити' }));

    await waitFor(() =>
      expect(
        screen.getByText('Пароль повинен містити щонайменше 8 символів.'),
      ).toBeInTheDocument(),
    );
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('показує форму реєстрації після перемикання з вкладки входу', () => {
    render(
      <AuthModal
        showAuth
        activeTab="login"
        authModalRef={createRef<HTMLDivElement>()}
        onClose={mockOnClose}
        onTabChange={mockOnTabChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Реєстрація' }));

    expect(screen.getByPlaceholderText("Ім'я")).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Пароль (мін. 8 символів, літера і цифра)'),
    ).toBeInTheDocument();
    expect(mockOnTabChange).toHaveBeenCalledWith('register');
  });
});
