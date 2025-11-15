import VerifyEmailForm from '@/features/auth/components/VerifyEmailForm';

type Params = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: Params) {
    const sp = await searchParams; // ← unwrap the promise

    const emailParam = sp?.email;
    const initialEmail =
        Array.isArray(emailParam) ? (emailParam[0] ?? '') : (emailParam ?? '');

    return <VerifyEmailForm initialEmail={initialEmail} />;
}
