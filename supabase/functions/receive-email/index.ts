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
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("WEBHOOK_SECRET is not configured");
    }

    const { from_email, from_name, to_email, subject, body_text, body_html, secret, has_attachment } = await req.json();

    // Verify webhook secret
    if (secret !== webhookSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!from_email || !to_email) {
      return new Response(JSON.stringify({ error: "Missing required fields: from_email, to_email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to bypass RLS for webhook inserts
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Look up user by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", to_email)
      .maybeSingle();

    const { error: insertError } = await supabase.from("emails").insert({
      user_id: profile?.id || null,
      from_email,
      from_name: from_name || null,
      to_email,
      subject: subject || "",
      body_text: body_text || null,
      body_html: body_html || null,
      direction: "inbound",
      status: "received",
      is_read: false,
      has_attachment: has_attachment || false,
    });

    if (insertError) {
      console.error("Error inserting inbound email:", insertError);
      throw new Error(`Failed to save inbound email: ${insertError.message}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in receive-email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
