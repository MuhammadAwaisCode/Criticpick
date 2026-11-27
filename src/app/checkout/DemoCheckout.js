'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useCart} from '@/context/CartContext';
import {beginDemo,submitDemo} from './demo-actions';

export default function DemoCheckout() {
  const {cartItems,subtotals,clearCart}=useCart();
  const [ready,setReady]=useState(false), [busy,setBusy]=useState(false);
  const [error,setError]=useState(''), [shipping,setShipping]=useState('Standard delivery');
  const router=useRouter();
  useEffect(()=>{ beginDemo().then(()=>setReady(true)).catch(()=>setError('Demo session unavailable.')); },[]);
  async function submit(e) {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);setError('');
    try {
      const payment=new FormData(e.currentTarget).get('payment');
      const lines=cartItems.map(({id,quantity})=>({id,quantity}));
      const signature=JSON.stringify([lines,shipping,payment]);
      const previous=JSON.parse(sessionStorage.getItem('demo-order-attempt') || 'null');
      const request=previous?.signature===signature ? previous.request : crypto.randomUUID();
      sessionStorage.setItem('demo-order-attempt',JSON.stringify({signature,request}));
      const result=await submitDemo({request,lines,shipping,payment});
      if (!result.id) throw Error(result.error);
      sessionStorage.removeItem('demo-order-attempt');
      clearCart();
      router.push('/demo/orders/confirmation?id='+encodeURIComponent(result.id));
    } catch(err) { setError(err.message || 'Please retry.');setBusy(false); }
  }
  return <main className="mx-auto max-w-2xl p-6 space-y-5">
    <h1 className="text-3xl font-bold">Synthetic demo checkout</h1>
    <p>Use fictional contact and address details. These fields stay in your browser. No payment or shipment occurs.</p>
    <Link className="underline" href="/cart">Review cart</Link>
    {cartItems.length>0 && <form onSubmit={submit} className="space-y-5">
      <fieldset className="grid gap-3"><legend className="font-bold">Delivery and contact</legend>
      {[['Name','text','Demo Customer'],['Email','email','customer@example.test'],['Phone','tel','0000000000'],
        ['Street address','text','1 Sample Street'],['City','text','Demo City']].map(([label,type,value])=>
          <label className="grid" key={label}>{label}<input autoComplete="off" required maxLength={120} type={type} className="rounded border p-2" defaultValue={value}/></label>)}
      </fieldset>
      <label className="grid">Shipping method<select className="border p-2" value={shipping} onChange={e=>setShipping(e.target.value)}>
        <option>Standard delivery</option><option>Collection</option></select></label>
      <label className="grid">Payment method<select key={shipping} className="border p-2" name="payment">
        {shipping==='Standard delivery' && <option>COD simulation</option>}<option>No payment simulation</option></select></label>
      <h2 className="font-bold">Demo order summary</h2>
      {cartItems.map(item=><p key={item.id}>{item.name} × {item.quantity}</p>)}
      {subtotals.map(([currency,amount])=><p key={currency}>Tentative merchandise subtotal: {currency} {amount.toLocaleString()}</p>)}
      <p>Shipping is simulated. No money is due.</p>
      <button disabled={!ready || busy} className="rounded bg-purple-800 px-4 py-2 text-white disabled:opacity-50">Place synthetic order</button>
    </form>}
    {!cartItems.length && !busy && <p>Your cart is empty.</p>}
    {error && <p role="alert">{error}</p>}
  </main>;
}
