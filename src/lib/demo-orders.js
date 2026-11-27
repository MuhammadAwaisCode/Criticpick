import 'server-only';
import { cookies } from 'next/headers';

export function demoEnabled() {
  return process.env.NEXT_PUBLIC_CEO_DEMO === '1' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'http://127.0.0.1:54321' &&
    !!process.env.CRITIPICK_DEMO_ORDER_SECRET;
}

export async function demoRequest(op, data) {
  if (!demoEnabled()) throw Error('Demo checkout unavailable.');
  const session = cookies().get('criticpick_walkthrough')?.value;
  if (!session) {
    if (op === 'list' || op === 'fulfilment') return [];
    throw Error('Refresh the demo checkout to start a session.');
  }
  const res = await fetch('http://127.0.0.1:54321/internal/demo-orders', {
    method:'POST', cache:'no-store',
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.CRITIPICK_DEMO_ORDER_SECRET},
    body:JSON.stringify({op,session,data}),
  });
  if (!res.ok) throw Error('Demo request declined. Review the cart and delivery options.');
  return (await res.json()).value;
}
