import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeContractRequest {
  fileData: string; // base64 encoded file
  fileName: string;
  fileType: string;
}

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
        JSON.stringify({ error: 'Unauthorized', details: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('Invalid token or user not found:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { fileData, fileName, fileType }: AnalyzeContractRequest = await req.json();
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing contract: ${fileName} (${fileType}) for user: ${user.id}`);

    // Prepare the request for Gemini API
    let requestBody;
    
    if (fileType.startsWith('image/') || fileType === 'application/pdf') {
      // For images and PDFs, use multimodal capabilities
      requestBody = {
        contents: [{
          parts: [
            {
              text: `Analyze this employment contract document and extract the following information in JSON format:

{
  "contractId": "contract number or reference ID",
  "name": "employee first name only",
  "surname": "employee last name/family name only",
  "homeAddress": "complete home address",
  "phoneNumber": "personal phone number",
  "dateOfBirth": "date of birth in YYYY-MM-DD format",
  "nationalId": "national ID number or identification number",
  "jobTitle": "position or job title",
  "department": "department or division",
  "employmentType": "full_time/part_time/contractor/intern",
  "startDate": "employment start date in YYYY-MM-DD format",
  "endDate": "employment end date in YYYY-MM-DD format or null if permanent",
  "contractDuration": "contract duration if specified (e.g., '2 years', '18 months')",
  "salary": "salary amount (numbers only)",
  "payFrequency": "monthly/bi_weekly/weekly/annual",
  "workEmail": "company email address",
  "summary": "brief 2-3 sentence summary of key contract terms"
}

IMPORTANT: 
- Split full name into separate "name" and "surname" fields
- If end date is not specified but duration is mentioned, calculate end date from start date + duration
- Extract complete home address including street, city, postal code
- Format all dates as YYYY-MM-DD
- If any information is not found, use null for that field
- Focus on accuracy over completeness`
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
          temperature: 0.2,
          maxOutputTokens: 4000,
        }
      };
    } else {
      // For text files, decode base64 and analyze text content
      const textContent = atob(fileData);
      requestBody = {
        contents: [{
          parts: [{
          text: `Analyze this employment contract document and extract the following information in JSON format:

{
  "contractId": "contract number or reference ID",
  "name": "employee first name only",
  "surname": "employee last name/family name only",
  "homeAddress": "complete home address",
  "phoneNumber": "personal phone number",
  "dateOfBirth": "date of birth in YYYY-MM-DD format",
  "nationalId": "national ID number or identification number",
  "jobTitle": "position or job title",
  "department": "department or division",
  "employmentType": "full_time/part_time/contractor/intern",
  "startDate": "employment start date in YYYY-MM-DD format",
  "endDate": "employment end date in YYYY-MM-DD format or null if permanent",
  "contractDuration": "contract duration if specified (e.g., '2 years', '18 months')",
  "salary": "salary amount (numbers only)",
  "payFrequency": "monthly/bi_weekly/weekly/annual",
  "workEmail": "company email address",
  "summary": "brief 2-3 sentence summary of key contract terms"
}

Contract content:
${textContent.substring(0, 8000)} ${textContent.length > 8000 ? '...' : ''}

IMPORTANT: 
- Split full name into separate "name" and "surname" fields
- If end date is not specified but duration is mentioned, calculate end date from start date + duration
- Extract complete home address including street, city, postal code
- Format all dates as YYYY-MM-DD
- If any information is not found, use null for that field
- Focus on accuracy over completeness`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4000,
        }
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      throw new Error('Failed to analyze contract with AI');
    }

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from AI service');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    console.log('AI contract analysis result:', aiResponse);

    // Try to parse JSON from the AI response
    let contractData;
    try {
      // Clean the response to extract JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        contractData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      
      // Fallback with empty structure
      contractData = {
        contractId: null,
        name: null,
        surname: null,
        homeAddress: null,
        phoneNumber: null,
        dateOfBirth: null,
        nationalId: null,
        jobTitle: null,
        department: null,
        employmentType: "full_time",
        startDate: null,
        endDate: null,
        contractDuration: null,
        salary: null,
        payFrequency: "monthly",
        workEmail: null,
        summary: "Contract uploaded successfully - manual review required"
      };
    }

    console.log('Final contract analysis:', contractData);

    return new Response(
      JSON.stringify({
        extractedData: contractData,
        fileName: fileName
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-contract function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Contract analysis failed';
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze contract',
        details: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});