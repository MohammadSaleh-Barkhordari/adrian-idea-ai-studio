import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AnalyzeRequest {
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
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing document: ${fileName} (${fileType})`);

    // Prepare the request for Gemini API
    let requestBody;
    
    if (fileType.startsWith('image/') || fileType === 'application/pdf') {
      // For images and PDFs, use multimodal capabilities
      requestBody = {
        contents: [{
          parts: [
            {
              text: `Analyze this document and provide:
1. A concise, descriptive title (max 60 characters) that captures the main topic or purpose
2. A brief summary (2-3 sentences) highlighting the key points or content

Respond in JSON format: {"title": "suggested title", "summary": "brief summary"}

Focus on being accurate and helpful. If it's a form, report, or specific document type, include that in the title.`
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
      // For text files, decode base64 and analyze text content
      const textContent = atob(fileData);
      requestBody = {
        contents: [{
          parts: [{
            text: `Analyze this document content and provide:
1. A concise, descriptive title (max 60 characters) that captures the main topic or purpose
2. A brief summary (2-3 sentences) highlighting the key points or content

Document content:
${textContent.substring(0, 4000)} ${textContent.length > 4000 ? '...' : ''}

Respond in JSON format: {"title": "suggested title", "summary": "brief summary"}

Focus on being accurate and helpful.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
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
      throw new Error('Failed to analyze document with AI');
    }

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data, null, 2));

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from AI service');
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    console.log('AI analysis result:', aiResponse);

    // Try to parse JSON from the AI response
    let analysis;
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = aiResponse
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      
      // Find JSON object (handles nested braces and newlines)
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        analysis = JSON.parse(jsonStr);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      
      // Fallback: extract title and summary from text
      const lines = aiResponse.split('\n').filter((line: string) => line.trim());
      analysis = {
        title: fileName.replace(/\.[^/.]+$/, ""), // Remove extension as fallback
        summary: lines.length > 0 ? lines[0].substring(0, 200) : "Document uploaded successfully"
      };
    }

    // Ensure we have reasonable fallbacks
    if (!analysis.title || analysis.title.length === 0) {
      analysis.title = fileName.replace(/\.[^/.]+$/, "");
    }
    
    if (!analysis.summary || analysis.summary.length === 0) {
      analysis.summary = "Document uploaded for analysis";
    }

    // Limit length to reasonable bounds
    analysis.title = analysis.title.substring(0, 60);
    analysis.summary = analysis.summary.substring(0, 300);

    console.log('Final analysis:', analysis);

    return new Response(
      JSON.stringify({
        suggestedTitle: analysis.title,
        suggestedSummary: analysis.summary
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Document analysis failed';
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze document',
        details: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
