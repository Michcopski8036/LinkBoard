import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mchikdltrcbovhdzdhhf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 계정 삭제는 앱 안에서도 부른다 — 네이티브는 로컬 스킴이라 크로스오리진이고,
  // POST + Content-Type: application/json 은 프리플라이트를 부른다. OPTIONS 에 200 을
  // 돌려주지 않으면 요청이 아예 나가지 않는다(스토어 심사에서 요구하는 기능이다).
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId } = req.body as { userId: string };
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    // Delete all user data in dependency order
    await supabase.from('shared_boards').delete().eq('owner_id', userId);
    await supabase.from('links').delete().eq('user_id', userId);
    await supabase.from('boards').delete().eq('owner_id', userId);
    await supabase.from('subscriptions').delete().eq('user_id', userId);

    // Delete storage files
    const { data: files } = await supabase.storage.from('pdfs').list(userId);
    if (files && files.length > 0) {
      await supabase.storage.from('pdfs').remove(files.map(f => `${userId}/${f.name}`));
    }

    // Delete auth user
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;

    return res.json({ success: true });
  } catch (err: any) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: err.message });
  }
}
