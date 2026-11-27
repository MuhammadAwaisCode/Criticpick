import Link from 'next/link';
import {notFound} from 'next/navigation';
import {demoEnabled,demoRequest} from '@/lib/demo-orders';
import {packDemo} from '@/app/checkout/demo-actions';

const titles={confirmation:'Synthetic order confirmation',customer:'Customer demo orders',vendor:'Demo fulfilment',admin:'Admin demo overview'};
export default async function Orders({params,searchParams}) {
  const view=params.view;
  if (!demoEnabled() || !Object.hasOwn(titles,view)) notFound();
  const rows=await demoRequest(view==='vendor'?'fulfilment':'list');
  const groups=new Map();
  for (const row of rows) {
    if (view==='confirmation' && row.id!==searchParams.id) continue;
    if (!groups.has(row.id)) groups.set(row.id,[]);
    groups.get(row.id).push(row);
  }
  if (view==='confirmation' && !groups.size) notFound();
  return <main className="mx-auto max-w-3xl p-6 space-y-5">
    <h1 className="text-3xl font-bold">{titles[view]}</h1>
    <p>SYNTHETIC / DEMO · This browser session only. No payment, inventory movement or shipment.</p>
    <nav className="flex gap-4 flex-wrap text-purple-800 underline">
      {['customer','vendor','admin'].map(key=><Link key={key} href={'/demo/orders/'+key}>{titles[key]}</Link>)}
      <Link href="/products">Catalogue</Link>
    </nav>
    {!groups.size && <p>No synthetic orders in this session.</p>}
    {[...groups].map(([id,items])=>{
      const totals=new Map();
      for(const item of items) totals.set(item.currency,(totals.get(item.currency)||0)+item.amount*item.quantity);
      return <section key={id} className="rounded border p-4 space-y-2">
        <h2 className="font-bold">Demo order {id.slice(0,8)}</h2>
        <p>{items[0].shipping} · {items[0].payment}</p>
        {items.map((item,index)=><p key={index}>{item.title} × {item.quantity} · {item.seller} · {item.status}</p>)}
        {[...totals].map(([currency,minor])=><p key={currency}>Synthetic merchandise subtotal: {currency} {(minor/100).toLocaleString()}</p>)}
        {view==='vendor' && items.some(item=>item.status==='Placed') && <form action={packDemo}>
          <input type="hidden" name="id" value={id}/><button className="underline text-purple-800">Mark packed in demo</button>
        </form>}
      </section>;
    })}
  </main>;
}
