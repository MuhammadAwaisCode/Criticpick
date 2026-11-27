import Link from 'next/link';
import { notFound } from 'next/navigation';

const portals = {
  customer: ['Customer', '/customerportal', 'Review synthetic orders from this browser.', '/demo/orders/customer', 'Open customer order history'],
  vendor: ['Vendor', '/vendoradmin/profile', 'Review CRITICPICK first-party demo items.', '/demo/orders/vendor', 'Open demo fulfilment'],
  affiliate: ['Affiliate', '/affiliaterdashboard', 'Open the test link, then return here to see the landing count.', '/go/demo-creator', 'Open synthetic referral'],
  admin: ['Super Admin', '/seapanel', 'Review synthetic orders from this walkthrough.', '/demo/orders/admin', 'Open demo order overview'],
};

export default async function DemoPortal({ params }) {
  if (process.env.NEXT_PUBLIC_CEO_DEMO !== '1' || !Object.hasOwn(portals, params.role)) notFound();
  const [title, portal, description, action, label] = portals[params.role];
  let landings;
  if (params.role === 'affiliate') {
    const response = await fetch('http://127.0.0.1:54321/demo/referral-count', { cache: 'no-store' });
    if (response.ok) landings = await response.json();
  }
  return <main className="mx-auto max-w-3xl space-y-6 p-8">
    <nav aria-label="Demo dashboards" className="flex flex-wrap gap-4 text-purple-700">
      {Object.entries(portals).map(([role, [name]]) => <Link key={role} href={'/demo/' + role}>{name}</Link>)}
    </nav>
    <h1 className="text-3xl font-bold">{title} dashboard preview</h1>
    <p>Demonstration with synthetic data. Private account access requires sign-in.</p>
    <p>{description}</p>
    {landings != null && <p>Demo referral landings this session: {landings}. No financial attribution.</p>}
    <div className="flex flex-wrap gap-4 text-purple-700 underline">
      <a href={action}>{label}</a><Link href={portal}>Open protected portal</Link><Link href="/">Marketplace home</Link>
    </div>
  </main>;
}
