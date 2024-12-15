import { Toaster } from '@/components/ui/toaster';

export default function ImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
} 