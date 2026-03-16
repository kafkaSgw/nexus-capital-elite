import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { subscription, userEmail } = await req.json();

    if (!subscription || !userEmail) {
      return NextResponse.json({ error: 'Missing subscription or userEmail' }, { status: 400 });
    }

    // Insert into Supabase push_subscriptions table
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({ 
        user_email: userEmail,
        endpoint: subscription.endpoint,
        keys_p256dh: subscription.keys.p256dh,
        keys_auth: subscription.keys.auth,
        created_at: new Date().toISOString()
      }, { onConflict: 'endpoint' });

    if (error) {
      console.error('Error inserting subscription:', error);
      // Depending on if the table exists, we don't want to crash the UI, just return a failure gracefully
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
