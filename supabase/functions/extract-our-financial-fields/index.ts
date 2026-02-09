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
    return new Response('ok', { headers: corsHeaders });
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

    const { text } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    // Get the Gemini API key from environment variables
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    // Prepare the prompt for Gemini to extract our financial fields
    const prompt = `
    Extract the following financial information from this text: "${text}"

    Please provide a JSON response with these exact fields:
    - payment_for: what the payment was for (e.g., "Costco", "Uber", "groceries", etc.)
    - transaction_type: "income", "expense", or "investment"
    - who_paid: who made the payment ("Barkhordari", "Sattari", or "Both")
    - for_who: who the payment was for ("Barkhordari", "Sattari", or "Both")
    - amount: numeric amount (just the number, no currency symbol)
    - currency: currency code (USD, EUR, IRR, etc.)
    - description: brief description of the transaction
    - transaction_date: date in YYYY-MM-DD format (use today's date if not specified)

    Rules:
    - If "who_paid" is not clear, try to infer from context or use "Both"
    - If "for_who" is not clear, use "Both" as default
    - For Iranian currency, use "IRR" and convert toman to rial (*10)
    - Extract the payment purpose into "payment_for" field
    - Be case-sensitive for names: use exactly "Barkhordari" or "Sattari"

    Return only valid JSON, no additional text.
    `;

    console.log('Sending request to Gemini API for our financial fields extraction');

    // Send request to Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 4000,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    let extractedText = data.candidates[0].content.parts[0].text;
    console.log('Extracted text from Gemini:', extractedText);

    // Clean up JSON response
    extractedText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let extractedData;
    try {
      extractedData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('JSON parsing failed, attempting to extract with regex');
      
      // Fallback: use regex to extract fields
      extractedData = {
        payment_for: (extractedText.match(/payment_for["\s]*:["\s]*([^",}]+)/i) || [])[1] || '',
        transaction_type: (extractedText.match(/transaction_type["\s]*:["\s]*([^",}]+)/i) || [])[1] || 'expense',
        who_paid: (extractedText.match(/who_paid["\s]*:["\s]*([^",}]+)/i) || [])[1] || 'Both',
        for_who: (extractedText.match(/for_who["\s]*:["\s]*([^",}]+)/i) || [])[1] || 'Both',
        amount: parseFloat((extractedText.match(/amount["\s]*:["\s]*([0-9.]+)/i) || [])[1]) || 0,
        currency: (extractedText.match(/currency["\s]*:["\s]*([^",}]+)/i) || [])[1] || 'USD',
        description: (extractedText.match(/description["\s]*:["\s]*([^",}]+)/i) || [])[1] || '',
        transaction_date: (extractedText.match(/transaction_date["\s]*:["\s]*([^",}]+)/i) || [])[1] || new Date().toISOString().split('T')[0]
      };
    }

    // Validate and sanitize extracted data
    const validatedData = {
      payment_for: extractedData.payment_for || '',
      transaction_type: ['income', 'expense', 'investment'].includes(extractedData.transaction_type) 
        ? extractedData.transaction_type : 'expense',
      who_paid: ['Barkhordari', 'Sattari', 'Both'].includes(extractedData.who_paid) 
        ? extractedData.who_paid : 'Both',
      for_who: ['Barkhordari', 'Sattari', 'Both'].includes(extractedData.for_who) 
        ? extractedData.for_who : 'Both',
      amount: parseFloat(extractedData.amount) || 0,
      currency: extractedData.currency || 'USD',
      description: extractedData.description || '',
      transaction_date: extractedData.transaction_date || new Date().toISOString().split('T')[0]
    };

    console.log('Validated our financial data:', validatedData);

    return new Response(JSON.stringify({
      success: true,
      fields: validatedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-our-financial-fields function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
