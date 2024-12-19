import { SignInForm } from "@/components/auth/SignInForm";
import { ReadonlyURLSearchParams } from "next/navigation";

interface SignInPageProps {
  searchParams: { [key: string]: string | string[] | undefined } | ReadonlyURLSearchParams;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const error = searchParams && typeof searchParams === 'object' ? searchParams.error : null;
  
  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        {error && typeof error === 'string' && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {decodeURIComponent(error)}
          </div>
        )}
        <SignInForm />
      </div>
    </div>
  );
}