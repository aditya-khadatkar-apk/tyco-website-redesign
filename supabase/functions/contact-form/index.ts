import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // @ts-ignore
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');

    if (!sendgridApiKey) {
      throw new Error('SENDGRID_API_KEY is not set');
    }

    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      throw new Error('Name, email, and message are required');
    }

    // Send email via SendGrid
    const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sendgridApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'astrophile7777777@gmail.com' }],
          },
        ],
        from: {
          email: 'adityakhadatkar.apk@gmail.com',
          name: 'Tyco India Website',
        },
        reply_to: {
          email: email,
          name: name,
        },
        subject: `New Contact Form Submission from ${name}`,
        content: [
          {
            type: 'text/html',
            value: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e293b;">New Contact Form Submission</h2>
                <hr style="border: 1px solid #e2e8f0;" />
                <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #64748b; width: 100px;">Name:</td>
                    <td style="padding: 8px 0; color: #1e293b;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #64748b;">Email:</td>
                    <td style="padding: 8px 0; color: #1e293b;"><a href="mailto:${email}">${email}</a></td>
                  </tr>
                </table>
                <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <p style="margin: 0 0 8px 0; font-weight: bold; color: #64748b;">Message:</p>
                  <p style="margin: 0; color: #1e293b; white-space: pre-wrap;">${message}</p>
                </div>
                <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
                  This email was sent from the Tyco India website contact form.
                  You can reply directly to this email to respond to ${name}.
                </p>
              </div>
            `,
          },
        ],
      }),
    });

    if (!sgResponse.ok) {
      const sgError = await sgResponse.text();
      console.error('SendGrid Error:', sgError);
      throw new Error(`Failed to send email: ${sgError}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Your message has been sent successfully!' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
