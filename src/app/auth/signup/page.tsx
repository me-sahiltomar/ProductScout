import { SignupForm } from '@/components/auth/SignupForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Create Account — ProductScout',
  description: 'Create your ProductScout account to discover real software opportunities.',
};

export default function SignupPage({
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

  return <SignupForm initialRedirect={redirectTo} />;
}
