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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')!;

    const { email } = await req.json();
    console.log(`Password reset requested for: ${email}`);

    if (!email) {
      console.error('Email missing from request');
      throw new Error('Email is required');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fallback for origin if header is missing
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'https://tyco-india.com';
    let redirectTo = '';
    try {
      redirectTo = `${new URL(origin).origin}/admin/change-password`;
    } catch (e) {
      console.warn('Invalid origin header, using fallback redirection');
      redirectTo = `${origin}/admin/change-password`;
    }

    console.log(`Generating reset link with redirect: ${redirectTo}`);

    // Generate reset link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectTo,
      },
    });

    if (error) {
      console.warn(`Link generation failed for ${email}:`, error.message);
      // Return 200 anyway to prevent user enumeration
      return new Response(
        JSON.stringify({ message: 'If an account exists, a reset link has been sent.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const resetLink = data.properties.action_link;
    console.log('Reset link generated successfully');

    // Send email via SendGrid
    console.log('Attempting to send email via SendGrid...');

    // Fetch sender details from settings table
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('key, value')
      .in('key', ['sender_email', 'sender_name']);

    const settingsMap = Object.fromEntries(settings?.map(s => [s.key, s.value]) || []);
    const fromEmail = settingsMap.sender_email || Deno.env.get('SENDER_EMAIL') || 'adityakhadatkar.apk@gmail.com';
    const fromName = settingsMap.sender_name || 'Tyco India Admin';

    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sendgridApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: 'Reset Your Tyco India Admin Password',
        content: [
          {
            type: 'text/html',
            value: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Password Reset Request</h2>
                <p>Someone requested a password reset for your account in the Tyco India Admin Portal.</p>
                <p>If this was you, please click the button below to set a new password:</p>
                <div style="margin: 32px 0; text-align: center;">
                  <a href="${resetLink}" style="background-color: #ea580c; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p style="font-size: 12px; color: #64748b; margin-top: 32px;">
                  This link will expire in 24 hours.
                </p>
              </div>
            `,
          },
        ],
      }),
    });

    if (!sgResponse.ok) {
      const sgError = await sgResponse.text();
      console.error('SendGrid API Error:', sgError);
      return new Response(
        JSON.stringify({ error: 'Mail delivery service failure', details: sgError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Reset email sent successfully to:', email);
    return new Response(
      JSON.stringify({ message: 'If an account exists, a reset link has been sent.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Unhandled edge function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
