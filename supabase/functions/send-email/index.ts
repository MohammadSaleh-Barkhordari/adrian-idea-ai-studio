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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { to, to_name, subject, body_html, body_text, from_email, from_name, reply_to_id, attachments } = await req.json();

    if (!to || !subject) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, subject" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const senderName = from_name || "Adrian Idea";

    // Resolve the user's real email for reply_to and storage
    let userEmail = from_email;
    if (!userEmail) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .maybeSingle();
      userEmail = profile?.email || "noreply@send.adrianidea.ir";
    }

    // Process attachments: download from storage and convert to base64
    const resendAttachments: Array<{ filename: string; content: string }> = [];
    const attachmentMeta: Array<{ filename: string; storage_path: string; bucket: string; size: number; content_type: string }> = [];

    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        const bucket = att.bucket || 'email-attachments';
        const { data, error: dlError } = await serviceClient.storage
          .from(bucket)
          .download(att.storage_path);
        if (dlError) {
          console.error(`Failed to download attachment ${att.storage_path}:`, dlError);
          continue;
        }
        if (data) {
          const arrayBuffer = await data.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          resendAttachments.push({ filename: att.filename, content: base64 });
          attachmentMeta.push({
            filename: att.filename,
            storage_path: att.storage_path,
            bucket,
            size: bytes.length,
            content_type: data.type || 'application/octet-stream',
          });
        }
      }
    }

    // Send via Resend API
    const resendPayload: Record<string, unknown> = {
      from: `${senderName} <${userEmail}>`,
      to: [to],
      subject,
      html: body_html || undefined,
      text: body_text || undefined,
    };
    if (resendAttachments.length > 0) {
      resendPayload.attachments = resendAttachments;
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
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
        from_email: userEmail,
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

    // Save attachment records
    if (emailRecord && attachmentMeta.length > 0) {
      const attachmentRows = attachmentMeta.map((m) => ({
        email_id: emailRecord.id,
        file_name: m.filename,
        file_size: m.size,
        content_type: m.content_type,
        storage_path: m.storage_path,
      }));
      const { error: attError } = await supabase
        .from("email_attachments")
        .insert(attachmentRows);
      if (attError) {
        console.error("Error saving attachment records:", attError);
      }
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
