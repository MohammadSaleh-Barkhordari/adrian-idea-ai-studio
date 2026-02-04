import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AnalyzeRequest {
  fileData: string;
  fileName: string;
  fileType: string;
}

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

    const { fileData, fileName, fileType }: AnalyzeRequest = await req.json();

    if (!fileData || !fileName || !fileType) {
      throw new Error('Missing required fields: fileData, fileName, or fileType');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log(`Analyzing financial document: ${fileName} (${fileType})`);

    // Prepare request for Gemini API
    let requestBody: any;

    if (fileType.startsWith('image/') || fileType === 'application/pdf') {
      // For images and PDFs, use multimodal approach
      requestBody = {
        contents: [{
          parts: [
            {
              text: `Analyze this financial document (bill, receipt, invoice, or financial statement) and extract the following information in JSON format:

{
  "from_entity": "Name of the company/person who issued the bill or paid",
  "to_entity": "Name of the company/person who received the bill or was paid to", 
  "amount": "Numeric amount (number only, no currency symbols)",
  "currency": "Currency code (USD, EUR, IRR, etc.)",
  "transaction_type": "income, expense, or investment",
  "description": "Brief description of what this transaction is about",
  "transaction_date": "Date in YYYY-MM-DD format if visible, or today's date"
}

Extract only factual information from the document. If any field is not clearly visible, use reasonable defaults:
- For transaction_type: "expense" for bills/invoices, "income" for receipts showing money received
- For currency: "USD" if not specified
- For transaction_date: today's date if not visible

Be precise and extract exact names and amounts as shown in the document.`
            },
            {
              inline_data: {
                mime_type: fileType,
                data: fileData
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000,
        }
      };
    } else {
      // For text files, use text-only approach
      const textContent = atob(fileData);
      requestBody = {
        contents: [{
          parts: [{
            text: `Analyze this financial document content and extract financial information in JSON format:

Document content: ${textContent}

Extract the following information in JSON format:
{
  "from_entity": "Name of the company/person who issued the bill or paid",
  "to_entity": "Name of the company/person who received the bill or was paid to",
  "amount": "Numeric amount (number only, no currency symbols)",
  "currency": "Currency code (USD, EUR, IRR, etc.)",
  "transaction_type": "income, expense, or investment", 
  "description": "Brief description of what this transaction is about",
  "transaction_date": "Date in YYYY-MM-DD format if visible, or today's date"
}

Extract only factual information. Use reasonable defaults for missing information.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000,
        }
      };
    }

    console.log('Sending request to Gemini API for financial analysis...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Gemini API response received');

    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('No candidates returned from Gemini API');
    }

    const generatedText = result.candidates[0].content.parts[0].text;
    console.log('Generated analysis:', generatedText);

    // Clean the response to extract JSON
    let cleanedText = generatedText.trim();
    
    // Remove markdown code blocks if present
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let extractedData;
    try {
      extractedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse JSON, attempting fallback extraction');
      
      // Fallback extraction using regex
      const extractField = (field: string, defaultValue: any = '') => {
        const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, 'i');
        const match = cleanedText.match(regex);
        return match ? match[1] : defaultValue;
      };

      extractedData = {
        from_entity: extractField('from_entity', 'Unknown'),
        to_entity: extractField('to_entity', 'Unknown'),
        amount: parseFloat(extractField('amount', '0')) || 0,
        currency: extractField('currency', 'USD'),
        transaction_type: extractField('transaction_type', 'expense'),
        description: extractField('description', `Financial document: ${fileName}`),
        transaction_date: extractField('transaction_date', new Date().toISOString().split('T')[0])
      };
    }

    // Validate and set defaults for required fields
    const validatedData = {
      from_entity: extractedData.from_entity || 'Unknown',
      to_entity: extractedData.to_entity || 'Unknown', 
      amount: parseFloat(extractedData.amount) || 0,
      currency: extractedData.currency || 'USD',
      transaction_type: extractedData.transaction_type || 'expense',
      description: extractedData.description || `Financial document: ${fileName}`,
      transaction_date: extractedData.transaction_date || new Date().toISOString().split('T')[0]
    };

    console.log('Financial data extracted successfully:', validatedData);

    return new Response(JSON.stringify({
      success: true,
      extractedData: validatedData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-financial-document function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
