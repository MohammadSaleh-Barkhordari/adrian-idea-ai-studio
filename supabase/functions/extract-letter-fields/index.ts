import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('Invalid token or user not found:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { text } = await req.json();
    
    if (!text) {
      throw new Error('No text provided for extraction');
    }

    console.log('Extracting letter fields from text:', text.substring(0, 100) + '...');

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not found');
    }

    const systemPrompt = `You are an AI assistant that extracts structured information for business letter composition from Persian (Farsi) speech text. 

Extract the following fields from the user's Persian speech and keep ALL information in Persian:
- recipientName: The name of the person receiving the letter (keep in Persian)
- recipientPosition: Their job title or position (keep in Persian)
- recipientCompany: The company they work for (keep in Persian)
- userRequest: The main request, purpose, or content for the letter (keep in Persian only)

Guidelines:
1. If information is not mentioned, use empty string ""
2. Keep ALL extracted information in original Persian format - DO NOT translate anything
3. Be as accurate as possible to what was actually said in Persian
4. Return ONLY valid JSON without any markdown formatting or code blocks
5. Preserve Persian text exactly as spoken

Example Persian input: "من باید نامه‌ای به جناب آقای احمد رضایی که مدیر پروژه در شرکت ABC است بنویسم و درخواست تمدید مهلت پروژه کنم"
Example output: {"recipientName": "جناب آقای احمد رضایی", "recipientPosition": "مدیر پروژه", "recipientCompany": "ABC", "userRequest": "درخواست تمدید مهلت پروژه"}

IMPORTANT: Return only the JSON object, no markdown code blocks, no explanations, just pure JSON.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser input: ${text}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const extractedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log('Raw extraction result:', extractedText);

    // Parse the JSON response with markdown cleanup
    let fields;
    try {
      // Clean the response by removing markdown code blocks
      let cleanedText = extractedText.trim();
      
      // Remove markdown code blocks (```json ... ```)
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('Cleaned text for parsing:', cleanedText);
      fields = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Original text:', extractedText);
      
      // Enhanced fallback: try to extract info using regex patterns
      const recipientNameMatch = extractedText.match(/"recipientName":\s*"([^"]*)"/) || 
                                extractedText.match(/نام:\s*([^\n,]+)/) ||
                                extractedText.match(/خانم\s+([^\s]+)/) ||
                                extractedText.match(/آقای\s+([^\s]+)/);
      
      const recipientPositionMatch = extractedText.match(/"recipientPosition":\s*"([^"]*)"/) ||
                                    extractedText.match(/مدیر\s+([^\n,]+)/);
      
      const recipientCompanyMatch = extractedText.match(/"recipientCompany":\s*"([^"]*)"/) ||
                                   extractedText.match(/شرکت\s+([^\n,]+)/) ||
                                   extractedText.match(/موتور/);
      
      fields = {
        recipientName: recipientNameMatch ? recipientNameMatch[1].trim() : "",
        recipientPosition: recipientPositionMatch ? recipientPositionMatch[1].trim() : "",
        recipientCompany: recipientCompanyMatch ? (recipientCompanyMatch[1] || recipientCompanyMatch[0]).trim() : "",
        userRequest: text.trim()
      };
    }

    // Ensure all required fields exist
    const finalFields = {
      recipientName: fields.recipientName || "",
      recipientPosition: fields.recipientPosition || "",
      recipientCompany: fields.recipientCompany || "",
      userRequest: fields.userRequest || text.trim()
    };

    console.log('Extracted fields:', finalFields);

    return new Response(
      JSON.stringify({ fields: finalFields }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in extract-letter-fields function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Field extraction failed';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});