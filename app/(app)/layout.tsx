import { ClientLayout } from '@/components/client-layout';

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
