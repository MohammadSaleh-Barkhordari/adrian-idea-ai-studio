import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // JWT Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !authData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = authData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    // Use service role client for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { letterId, includeSignature, includeStamp, isPreview = false, isFinal = false } = await req.json();

    if (!letterId) {
      throw new Error('Letter ID is required');
    }

    console.log('Processing letter image generation:', { letterId, includeSignature, includeStamp, isPreview, isFinal });

    // Fetch letter details
    const { data: letter, error: letterError } = await supabaseClient
      .from('letters')
      .select('*')
      .eq('id', letterId)
      .single();

    if (letterError || !letter) {
      throw new Error('Letter not found');
    }

    // Create HTML template for the letter
    const letterHTML = `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Business Letter</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Vazirmatn', Arial, sans-serif;
            line-height: 1.8;
            color: #2c3e50;
            background: white;
            direction: rtl;
            padding: 60px;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
          }
          
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 20px;
          }
          
          .company-info {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
          }
          
          .letter-date {
            text-align: left;
            margin-bottom: 30px;
            font-size: 14px;
            color: #7f8c8d;
            direction: ltr;
          }
          
          .recipient-info {
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-right: 4px solid #3498db;
          }
          
          .recipient-title {
            font-weight: 600;
            margin-bottom: 10px;
            color: #2c3e50;
          }
          
          .subject-line {
            font-weight: 700;
            font-size: 16px;
            margin: 30px 0;
            text-align: center;
            background: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            color: #2c3e50;
          }
          
          .letter-body {
            text-align: justify;
            margin-bottom: 40px;
            font-size: 14px;
            line-height: 2;
            white-space: pre-wrap;
          }
          
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .signature-box {
            width: 200px;
            text-align: center;
          }
          
          .signature-line {
            border-top: 1px solid #bdc3c7;
            margin-bottom: 10px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #95a5a6;
          }
          
          .stamp-box {
            width: 150px;
            height: 100px;
            border: 2px dashed #bdc3c7;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #95a5a6;
            border-radius: 8px;
          }
          
          .writer-name {
            font-weight: 600;
            font-size: 14px;
            color: #2c3e50;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
            border-top: 1px solid #ecf0f1;
            padding-top: 20px;
          }
          
          .preview-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72px;
            color: rgba(52, 152, 219, 0.1);
            font-weight: bold;
            z-index: -1;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        ${isPreview ? '<div class="preview-watermark">PREVIEW</div>' : ''}
        
        <div class="header">
          <div class="company-info">نامه تجاری</div>
        </div>
        
        <div class="letter-date">
          تاریخ: ${letter.date ? new Date(letter.date).toLocaleDateString('fa-IR') : new Date().toLocaleDateString('fa-IR')}
        </div>
        
        <div class="recipient-info">
          <div class="recipient-title">
            ${letter.recipient_position ? `${letter.recipient_position} محترم` : 'جناب آقای/سرکار خانم'} ${letter.recipient_name}
          </div>
          ${letter.recipient_company ? `<div>شرکت ${letter.recipient_company}</div>` : ''}
        </div>
        
        <div class="subject-line">
          موضوع: ${letter.generated_subject || letter.subject || 'موضوع نامه'}
        </div>
        
        <div class="letter-body">
${letter.generated_body || letter.body || 'متن نامه'}
        </div>
        
        <div class="signature-section">
          ${includeSignature ? `
            <div class="signature-box">
              <div class="signature-line">امضا</div>
              <div class="writer-name">${letter.writer_name || 'نام نویسنده'}</div>
            </div>
          ` : `
            <div class="writer-name">${letter.writer_name || 'نام نویسنده'}</div>
          `}
          
          ${includeStamp ? `
            <div class="stamp-box">
              مهر شرکت
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          این نامه به صورت الکترونیکی تولید شده است.
        </div>
      </body>
      </html>
    `;

    // For this implementation, we'll return the HTML and let the frontend handle image generation
    // In a production environment, you might use Puppeteer to generate actual images
    
    // Generate a simple data URL for the image (placeholder implementation)
    const canvas = `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
        <rect width="100%" height="100%" fill="white"/>
        <text x="400" y="100" text-anchor="middle" font-family="Arial" font-size="24" fill="#2c3e50">نامه تجاری</text>
        <text x="50" y="200" font-family="Arial" font-size="16" fill="#2c3e50">گیرنده: ${letter.recipient_name}</text>
        <text x="50" y="250" font-family="Arial" font-size="14" fill="#7f8c8d">تاریخ: ${letter.date ? new Date(letter.date).toLocaleDateString('fa-IR') : new Date().toLocaleDateString('fa-IR')}</text>
        <text x="400" y="350" text-anchor="middle" font-family="Arial" font-size="18" fill="#2c3e50" font-weight="bold">موضوع: ${(letter.generated_subject || letter.subject || 'موضوع نامه').substring(0, 30)}...</text>
        <foreignObject x="50" y="400" width="700" height="400">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial; font-size: 14px; line-height: 1.6; text-align: justify; direction: rtl;">
            ${(letter.generated_body || letter.body || 'متن نامه').substring(0, 200)}...
          </div>
        </foreignObject>
        ${includeSignature ? `<text x="150" y="850" font-family="Arial" font-size="14" fill="#2c3e50">امضا: ${letter.writer_name || 'نام نویسنده'}</text>` : ''}
        ${includeStamp ? `<rect x="600" y="800" width="120" height="80" fill="none" stroke="#bdc3c7" stroke-width="2" stroke-dasharray="5,5"/><text x="660" y="845" text-anchor="middle" font-family="Arial" font-size="12" fill="#95a5a6">مهر شرکت</text>` : ''}
        ${isPreview ? `<text x="400" y="500" text-anchor="middle" font-family="Arial" font-size="48" fill="rgba(52, 152, 219, 0.3)" transform="rotate(-45 400 500)">PREVIEW</text>` : ''}
      </svg>
    `)}`;

    // Store the image URL in the database
    const updateData = isPreview ? {
      preview_image_url: canvas,
      needs_signature: includeSignature,
      needs_stamp: includeStamp,
      status: 'preview_generated',
      preview_generated_at: new Date().toISOString()
    } : {
      final_image_url: canvas,
      needs_signature: includeSignature,
      needs_stamp: includeStamp,
      status: 'final_generated',
      final_generated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabaseClient
      .from('letters')
      .update(updateData)
      .eq('id', letterId);

    if (updateError) {
      throw new Error('Failed to update letter with image URL');
    }

    console.log('Letter image generated successfully');

    return new Response(JSON.stringify({
      success: true,
      letterData: {
        id: letterId,
        recipientName: letter.recipient_name,
        recipientPosition: letter.recipient_position,
        recipientCompany: letter.recipient_company,
        date: letter.date,
        writerName: letter.writer_name || 'نامعلوم',
        generatedSubject: letter.generated_subject || letter.subject,
        generatedBody: letter.generated_body || letter.body,
        includeSignature,
        includeStamp
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-letter-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Image creation failed';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
