import { LoginForm } from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign In — ProductScout',
  description: 'Sign in to access your ProductScout research radar and saved opportunities.',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const redirectTo =
    typeof searchParams.redirectTo === 'string'
      ? searchParams.redirectTo
      : typeof searchParams.next === 'string'
      ? searchParams.next
      : undefined;
  const error = typeof searchParams.error === 'string' ? searchParams.error : undefined;

  return <LoginForm initialRedirect={redirectTo} initialError={error} />;
}
