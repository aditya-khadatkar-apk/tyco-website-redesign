import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, x-client-info, apikey, content-type, x-caller-token',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const { userId, action } = await req.json(); // action: 'suspend' or 'reactivate'

    if (!userId || !action) {
      throw new Error('userId and action are required');
    }

    // Initialize Supabase client to verify the caller
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    // Verify caller's role using custom header to bypass gateway issues
    const callerToken = req.headers.get('x-caller-token');
    if (!callerToken) throw new Error('Missing authentication token');
    
    const { data: { user: caller }, error: authError } = await supabaseClient.auth.getUser(callerToken);
    if (authError || !caller) {
      throw new Error(`Unauthorized: ${authError?.message || 'Token verification failed'}`);
    }

    const { data: callerProfile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    const { data: targetProfile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!callerProfile || !targetProfile) throw new Error('Profile not found');

    // Check permissions
    const canManage = 
      callerProfile.role === 'super-admin' || 
      (callerProfile.role === 'admin' && targetProfile.role === 'user');

    if (!canManage) {
      throw new Error('Forbidden: Insufficient permissions');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    if (action === 'suspend') {
      // 1. Invalidate sessions
      const { error: signOutError } = await supabaseAdmin.auth.admin.signOut(userId);
      if (signOutError) throw signOutError;

      // 2. Set is_active = false
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);
      
      if (updateError) throw updateError;
    } else if (action === 'reactivate') {
      // Set is_active = true
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: true })
        .eq('id', userId);
      
      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({ message: `User ${action}ed successfully` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
