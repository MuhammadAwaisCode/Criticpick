import { guardPortal } from '@/lib/portal-access';

export default async function Layout({ children }) {
  await guardPortal('customer');
  return children;
}
