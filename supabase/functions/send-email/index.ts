import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { to, to_name, subject, body_html, body_text, from_name, reply_to_id } = await req.json();

    if (!to || !subject) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, subject" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const senderName = from_name || "Adrian Idea";

    // Send via Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${senderName} <noreply@send.adrianidea.ir>`,
        to: [to],
        subject,
        html: body_html || undefined,
        text: body_text || undefined,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API failed: ${errorData}`);
    }

    const resendData = await resendResponse.json();

    // Insert email record
    const { data: emailRecord, error: insertError } = await supabase
      .from("emails")
      .insert({
        user_id: userId,
        from_email: "noreply@send.adrianidea.ir",
        from_name: senderName,
        to_email: to,
        to_name: to_name || null,
        subject,
        body_text: body_text || null,
        body_html: body_html || null,
        direction: "outbound",
        status: "sent",
        is_read: true,
        resend_id: resendData.id || null,
        in_reply_to: reply_to_id || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting email record:", insertError);
      throw new Error(`Failed to save email record: ${insertError.message}`);
    }

    // Auto-save contact
    await supabase.from("email_contacts").upsert(
      {
        user_id: userId,
        email: to,
        name: to_name || null,
      },
      { onConflict: "user_id,email" }
    );

    return new Response(JSON.stringify(emailRecord), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
