import VerifyEmailForm from '@/features/auth/components/VerifyEmailForm';

export default function Page({
    searchParams,
}: {
    searchParams: { email?: string };
}) {
    const initialEmail =
        typeof searchParams?.email === 'string' ? searchParams.email : '';
    return <VerifyEmailForm initialEmail={initialEmail} />;
}
