import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
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
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { text } = await req.json();

    if (!text) {
      throw new Error('No text provided');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('extract-financial-fields function called');
    console.log('Processing text:', text.substring(0, 100) + '...');

    const systemPrompt = `You are a financial data extraction assistant. Extract financial transaction information from the provided Persian or English text.

Extract the following fields and return them in JSON format:
{
  "from_entity": "Name of the company/person who paid or issued the bill",
  "to_entity": "Name of the company/person who received payment or the bill",
  "amount": "Numeric amount (number only, no currency symbols)",
  "currency": "Currency mentioned (USD, EUR, IRR, Toman, Dollar, etc.)",
  "transaction_type": "income, expense, or investment",
  "description": "Brief description of what this transaction is about",
  "transaction_date": "Date mentioned in YYYY-MM-DD format, or today's date if not specified"
}

Guidelines:
- If the user mentions paying someone, transaction_type should be "expense"
- If the user mentions receiving money, transaction_type should be "income"
- If the user mentions investing, transaction_type should be "investment"
- Extract names exactly as mentioned
- For Persian currency terms like "تومان", use "IRR" for currency
- For "dollar" or "دلار", use "USD"
- If no specific date is mentioned, use today's date

Be precise and extract only factual information mentioned in the text.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt
            }
          ]
        },
        {
          parts: [
            {
              text: `Text to analyze: "${text}"`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4000,
      }
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
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Gemini API response received');

    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No response generated from Gemini');
    }

    const generatedText = result.candidates[0].content.parts[0].text;
    console.log('Generated response:', generatedText);

    // Clean the response text to extract JSON
    let cleanedText = generatedText.trim();
    
    // Remove markdown formatting if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let extractedFields;
    try {
      extractedFields = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse JSON response, attempting regex fallback');
      
      // Fallback regex extraction
      const extractWithRegex = (field: string, defaultValue: any) => {
        const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, 'i');
        const match = cleanedText.match(regex);
        return match ? match[1] : defaultValue;
      };

      extractedFields = {
        from_entity: extractWithRegex('from_entity', 'Unknown'),
        to_entity: extractWithRegex('to_entity', 'Unknown'),
        amount: parseFloat(extractWithRegex('amount', '0')) || 0,
        currency: extractWithRegex('currency', 'USD'),
        transaction_type: extractWithRegex('transaction_type', 'expense'),
        description: extractWithRegex('description', text.substring(0, 100)),
        transaction_date: extractWithRegex('transaction_date', new Date().toISOString().split('T')[0])
      };
    }

    // Ensure all fields have valid defaults
    const validatedFields = {
      from_entity: extractedFields.from_entity || 'Unknown',
      to_entity: extractedFields.to_entity || 'Unknown',
      amount: parseFloat(extractedFields.amount) || 0,
      currency: extractedFields.currency || 'USD',
      transaction_type: extractedFields.transaction_type || 'expense',
      description: extractedFields.description || text.substring(0, 100),
      transaction_date: extractedFields.transaction_date || new Date().toISOString().split('T')[0]
    };

    console.log('Extracted financial fields:', validatedFields);

    return new Response(JSON.stringify({
      success: true,
      fields: validatedFields
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in extract-financial-fields function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});