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
    console.log('Starting letter analysis...');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided');
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Analyzing letter: ${file.name} (${file.type})`);

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert file to base64 for Gemini API
    const bytes = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));

    const prompt = `Please analyze this letter document and extract the following information in JSON format:
{
  "title": "A descriptive title for this letter (in the same language as the letter content)",
  "summary": "A brief summary of the letter's content and purpose (2-3 sentences, in the same language as the letter content)",
  "recipient_name": "Name of the person receiving the letter (extract from salutation or header)",
  "recipient_position": "Job title or position of the recipient (if mentioned)",
  "recipient_company": "Company or organization name of the recipient (if mentioned)",
  "date": "Date of the letter in YYYY-MM-DD format (extract from letter header or content, use current date if not found)",
  "user_request": "Main purpose, request, or content of the letter (what the sender is asking for or communicating)",
  "writer_name": "Name of the letter writer/sender (extract from signature or letter body, can be null if not found)"
}

Instructions:
- Extract information from the actual letter content, headers, salutations, and signatures
- Use the same language as the document content for text fields
- For date, convert any date format found to YYYY-MM-DD
- If specific information is not clearly mentioned, use null for that field
- Focus on accuracy - only extract information that is clearly present in the document`;

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: file.type,
              data: base64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4000,
      },
    };

    console.log('Sending request to Gemini API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to analyze letter' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected Gemini response structure');
      return new Response(JSON.stringify({ error: 'Failed to analyze letter content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResult = data.candidates[0].content.parts[0].text;
    console.log('AI analysis result:', aiResult);

    let analysisResult;
    try {
      // Clean the response to extract JSON
      const cleanedResult = aiResult.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
      analysisResult = JSON.parse(cleanedResult);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Enhanced fallback: try to extract all fields using regex
      const titleMatch = aiResult.match(/title["\s]*:["\s]*([^"]*)["\s]*/i);
      const summaryMatch = aiResult.match(/summary["\s]*:["\s]*([^"]*)["\s]*/i);
      const recipientNameMatch = aiResult.match(/recipient_name["\s]*:["\s]*([^"]*)["\s]*/i);
      const recipientPositionMatch = aiResult.match(/recipient_position["\s]*:["\s]*([^"]*)["\s]*/i);
      const recipientCompanyMatch = aiResult.match(/recipient_company["\s]*:["\s]*([^"]*)["\s]*/i);
      const dateMatch = aiResult.match(/date["\s]*:["\s]*([^"]*)["\s]*/i);
      const userRequestMatch = aiResult.match(/user_request["\s]*:["\s]*([^"]*)["\s]*/i);
      const writerNameMatch = aiResult.match(/writer_name["\s]*:["\s]*([^"]*)["\s]*/i);
      
      analysisResult = {
        title: titleMatch ? titleMatch[1] : `Letter Analysis - ${file.name}`,
        summary: summaryMatch ? summaryMatch[1] : 'AI analysis could not extract summary from this letter.',
        recipient_name: recipientNameMatch ? recipientNameMatch[1] : null,
        recipient_position: recipientPositionMatch ? recipientPositionMatch[1] : null,
        recipient_company: recipientCompanyMatch ? recipientCompanyMatch[1] : null,
        date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0],
        user_request: userRequestMatch ? userRequestMatch[1] : 'Letter content analysis',
        writer_name: writerNameMatch ? writerNameMatch[1] : null
      };
    }

    // Ensure we have required fields with proper defaults
    analysisResult = {
      title: analysisResult.title || `Letter Analysis - ${file.name}`,
      summary: analysisResult.summary || 'AI analysis completed successfully.',
      recipient_name: analysisResult.recipient_name || '',
      recipient_position: analysisResult.recipient_position || '',
      recipient_company: analysisResult.recipient_company || '',
      date: analysisResult.date || new Date().toISOString().split('T')[0],
      user_request: analysisResult.user_request || 'Letter analysis and processing',
      writer_name: analysisResult.writer_name || null
    };

    console.log('Final analysis:', analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-letter function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
