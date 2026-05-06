import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // @ts-ignore - Deno is a global in the Edge Function runtime, but not recognized by React TS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // @ts-ignore
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    // @ts-ignore
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');

    if (!sendgridApiKey) {
      throw new Error('SENDGRID_API_KEY is not set');
    }

    const { email, role } = await req.json();

    if (!email || !role) {
      throw new Error('Email and role are required');
    }

    // Initialize Supabase clients
    // 1. Client for verifying the caller's JWT
    const supabaseClient = createClient(
      supabaseUrl,
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    // Verify caller is super-admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error(`Unauthorized: ${authError?.message || 'No user found'}`);
    }

    const { data: callerProfile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (callerProfile?.role !== 'super-admin') {
      throw new Error('Forbidden: Only super-admins can create users');
    }

    // 2. Admin Client to create the user
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Generate random temporary password
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase() + '1!';

    // Create user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (createError) throw createError;

    // Update their role (wait 1 second to ensure trigger finished creating the profile)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        role,
        must_change_password: true 
      })
      .eq('id', newUser.user.id);

    if (updateError) throw updateError;

    // Send welcome email via SendGrid
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sendgridApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: {
          email: 'adityakhadatkar.apk@gmail.com',
          name: 'Tyco India Admin',
        },
        subject: 'Welcome to the Tyco India Admin Portal',
        content: [
          {
            type: 'text/html',
            value: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to Tyco India</h2>
                <p>An administrator has created an account for you in the Tyco India Admin Portal.</p>
                <p>Your login credentials are:</p>
                <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                  <strong>Email:</strong> ${email}<br/>
                  <strong>Temporary Password:</strong> ${tempPassword}
                </div>
                <p>Please log in and change your password immediately.</p>
                <p><a href="https://your-domain.com/admin/login" style="color: #2563eb;">Log in to the Admin Portal</a></p>
              </div>
            `,
          },
        ],
      }),
    });

    if (!sgResponse.ok) {
      const sgError = await sgResponse.text();
      console.error('SendGrid Error:', sgError);
      throw new Error(`User created, but failed to send email: ${sgError}`);
    }

    return new Response(
      JSON.stringify({ message: 'User created successfully' }),
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
