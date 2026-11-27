'use server';
import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { demoEnabled, demoRequest } from '@/lib/demo-orders';

export async function beginDemo() {
  if (!demoEnabled()) throw Error('Demo unavailable.');
  if (!cookies().has('criticpick_walkthrough')) cookies().set('criticpick_walkthrough',randomUUID(),
    {httpOnly:true,sameSite:'strict',path:'/'});
}
export async function submitDemo(input) {
  try { return {id:await demoRequest('place',input)}; }
  catch { return {error:'Demo order declined. Only reviewed, priced catalogue items can be placed.'}; }
}
export async function packDemo(form) {
  await demoRequest('pack',{id:form.get('id')});
  revalidatePath('/demo/orders/[view]','page');
}
