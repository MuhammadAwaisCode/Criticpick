import { createClient } from '@/lib/supabase/client';
export async function addProductToBucketsAndDB({
  title,
  description,
  category,
  price,
  stock,
  imageFile,
  videoFile,
}) {
  const supabase = createClient();
  let publicImageUrl = null;
  let publicVideoUrl = null;

  if (imageFile) {
    if (imageFile.size > 3 * 1024 * 1024) {
      throw new Error('Image size must be less than 3 MB.');
    }
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const { error: imgErr } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile, { upsert: false });
    if (imgErr) throw new Error(`Image Upload Error: ${imgErr.message}`);
    const { data: imgData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    publicImageUrl = imgData.publicUrl;
  }
  if (videoFile) {
    if (videoFile.size > 15 * 1024 * 1024) {
      throw new Error('Video size must be less than 15 MB.');
    }
    const fileExt = videoFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const { error: vidErr } = await supabase.storage
      .from('product-videos')
      .upload(fileName, videoFile, { upsert: false });
    if (vidErr) throw new Error(`Video Upload Error: ${vidErr.message}`);
    const { data: vidData } = supabase.storage
      .from('product-videos')
      .getPublicUrl(fileName);

    publicVideoUrl = vidData.publicUrl;
  }

  const { data, error: dbErr } = await supabase
    .from('products')
    .insert([
      {
        title: title.trim(),
        description: description?.trim() || '',
        category,
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        image_url: publicImageUrl,
        video_url: publicVideoUrl,
        is_approved: true, 
      },
    ])
    .select()
    .single();

  if (dbErr) throw new Error(`Database Error: ${dbErr.message}`);

  return data;
}

export async function fetchFilteredProducts({
  search = '',
  category = 'All',
  minPrice = '',
  maxPrice = '',
  sortBy = 'newest',
} = {}) {
  const supabase = createClient();

  let query = supabase.from('products').select('*').eq('is_approved', true);


  if (search.trim() !== '') {
    query = query.ilike('title', `%${search.trim()}%`);
  }

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }


  if (minPrice !== '' && !isNaN(minPrice)) {
    query = query.gte('price', parseFloat(minPrice));
  }

  
  if (maxPrice !== '' && !isNaN(maxPrice)) {
    query = query.lte('price', parseFloat(maxPrice));
  }

  if (sortBy === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (sortBy === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error(`Fetch Error: ${error.message}`);

  return data || [];
}