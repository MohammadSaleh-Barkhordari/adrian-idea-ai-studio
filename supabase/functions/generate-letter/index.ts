import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to safely convert ArrayBuffer to base64 without stack overflow
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192; // 8KB chunks to avoid stack overflow
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  
  return btoa(binary);
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication - extract userId from JWT token instead of trusting client
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's token to verify identity
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError || !user) {
      console.log('Invalid token or user not found:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the verified user ID from JWT token, NOT from request body
    const userId = user.id;
    console.log('Authenticated user:', userId);

    const { 
      letterId,
      recipientName,
      recipientPosition,
      recipientCompany,
      userRequest,
      projectId,
      documentId
    } = await req.json();

    console.log('Generate letter request:', { letterId, recipientName, userRequest, documentId, userId, projectId });

    // Validate that the user owns the project or is an admin
    if (projectId) {
      // Check if user is admin
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      const isAdmin = userRole?.role === 'admin';

      if (!isAdmin) {
        // If not admin, check project ownership
        const { data: project, error: projectError } = await supabase
          .from('adrian_projects')
          .select('user_id')
          .eq('project_id', projectId)
          .single();

        if (projectError || !project) {
          console.error('Project validation error:', projectError);
          throw new Error('Project not found or access denied');
        }

        if (project.user_id !== userId) {
          console.error('User does not own the project:', { userId, projectUserId: project.user_id });
          throw new Error('Access denied: User does not own the project');
        }
      }

      console.log('Project access validated successfully', { isAdmin });
    }

    let documentContent = '';
    let documentFile = null;
    let documentProcessingError = null;
    
    // Fetch document content if document is selected
    if (documentId) {
      try {
        console.log('=== DOCUMENT PROCESSING START ===');
        console.log('Fetching document for ID:', documentId);
        
        // Fetch document from database with enhanced validation
        // Using service role key bypasses RLS, but we validate user ownership above
        const { data: documents, error: docError } = await supabase
          .from('documents')
          .select('id, title, file_url, mime_type, content, file_name, user_id')
          .eq('id', documentId);

        if (docError) {
          console.error('Database query error:', docError);
          documentProcessingError = `Database error: ${docError.message}`;
        } else if (!documents || documents.length === 0) {
          console.error('No document found with ID:', documentId);
          documentProcessingError = `Document not found with ID: ${documentId}`;
        } else {
          const document = documents[0];
          
          // Additional security check: ensure the document belongs to the user
          if (document.user_id !== userId) {
            console.error('Document access denied: User does not own the document', { 
              documentUserId: document.user_id, 
              requestUserId: userId 
            });
            documentProcessingError = `Access denied: Document does not belong to user`;
          } else {
            console.log('Document retrieved successfully:', {
              id: document.id,
              title: document.title,
              file_url: document.file_url,
              mime_type: document.mime_type,
              file_name: document.file_name,
              has_content: !!document.content,
              user_id: document.user_id
            });
          
            documentContent = `Document: ${document.title}`;
          
            // Process document file if available
            if (document.file_url && document.file_url.trim()) {
            console.log('=== FILE DOWNLOAD START ===');
            console.log('File URL from database:', document.file_url);
            console.log('Using storage bucket: Documents');
            
            try {
              // Clean the file path and handle edge cases
              let cleanPath = document.file_url.trim();
              
              // Remove any leading slashes that might cause issues
              if (cleanPath.startsWith('/')) {
                console.log('Removing leading slash from path');
                cleanPath = cleanPath.substring(1);
              }
              
              console.log('Attempting download with path:', cleanPath);
              
              const { data: fileData, error: fileError } = await supabase
                .storage
                .from('documents')
                .download(cleanPath);

              if (fileError) {
                console.error('Primary download failed:', fileError);
                console.log('Error details:', JSON.stringify(fileError, null, 2));
                
                // Try alternative approaches for file path handling
                const alternatives = [
                  cleanPath.replace(/^\/+/, ''), // Remove all leading slashes
                  cleanPath.replace(/\/+/g, '/'), // Normalize multiple slashes
                  document.file_url // Try original unchanged
                ];
                
                let fileDownloaded = false;
                for (const altPath of alternatives) {
                  if (altPath === cleanPath) continue; // Skip if same as already tried
                  
                  console.log('Trying alternative path:', altPath);
                  const { data: retryData, error: retryError } = await supabase
                    .storage
                    .from('documents')
                    .download(altPath);
                    
                  if (!retryError && retryData) {
                    console.log('Success with alternative path:', altPath);
                    // Process successful download
                    const arrayBuffer = await retryData.arrayBuffer();
                    const base64 = arrayBufferToBase64(arrayBuffer);
                    
                    documentFile = {
                      mimeType: document.mime_type || 'application/pdf',
                      data: base64
                    };
                    
                    console.log('Document file loaded via alternative path, size:', base64.length);
                    documentContent += ` (File attached: ${document.file_name || 'document'})`;
                    fileDownloaded = true;
                    break;
                  } else {
                    console.log('Alternative path failed:', altPath, retryError?.message);
                  }
                }
                
                if (!fileDownloaded) {
                  console.error('All download attempts failed for document:', documentId);
                  documentProcessingError = `Failed to download document file: ${fileError.message}`;
                }
              } else if (fileData) {
                console.log('Primary download successful, processing file...');
                console.log('File size (bytes):', fileData.size);
                
                // Convert file to base64 using chunked approach to prevent stack overflow
                const arrayBuffer = await fileData.arrayBuffer();
                const base64 = arrayBufferToBase64(arrayBuffer);
                
                documentFile = {
                  mimeType: document.mime_type || 'application/pdf',
                  data: base64
                };
                
                console.log('Document file processed successfully:');
                console.log('- MIME type:', documentFile.mimeType);
                console.log('- Base64 size:', base64.length);
                console.log('- Original filename:', document.file_name);
                
                documentContent += ` (File attached: ${document.file_name || 'document'})`;
              } else {
                console.error('No file data received from storage');
                documentProcessingError = 'No file data received from storage';
              }
              
            } catch (fileProcessingError) {
              console.error('File processing exception:', fileProcessingError);
              if (fileProcessingError instanceof Error) {
                console.error('Stack trace:', fileProcessingError.stack);
                documentProcessingError = `File processing error: ${fileProcessingError.message}`;
              } else {
                documentProcessingError = 'File processing error: Unknown error';
              }
            }
            } else {
              console.log('Document has no file_url, checking for text content...');
              if (document.content && document.content.trim()) {
                console.log('Using document text content instead of file');
                documentContent += `\nContent: ${document.content}`;
              } else {
                console.log('No file or content available for document');
              }
            }
          }
        }
        
        console.log('=== DOCUMENT PROCESSING END ===');
        console.log('Final state:', {
          documentContent: documentContent.substring(0, 100) + '...',
          hasDocumentFile: !!documentFile,
          processingError: documentProcessingError
        });
        
      } catch (overallError) {
        console.error('Overall document processing error:', overallError);
        if (overallError instanceof Error) {
          console.error('Stack trace:', overallError.stack);
          documentProcessingError = `Document processing failed: ${overallError.message}`;
        } else {
          documentProcessingError = 'Document processing failed: Unknown error';
        }
      }
    }

    // Prepare context for letter generation
    const recipientInfo = [
      recipientName,
      recipientPosition,
      recipientCompany
    ].filter(Boolean).join(' - ');

    const prompt = `You are a professional Persian business letter writer. Generate ONLY the core content for a business letter:

1. subject_line: Create a concise, professional subject line in Persian (NO prefixes like "موضوع:")
2. body: Write ONLY the main content paragraph in Persian

Context:
- Recipient: ${recipientInfo}
- User Request: ${userRequest}
${documentContent ? `- Related Document Context: ${documentContent}` : ''}

CRITICAL REQUIREMENTS:
- subject_line: Generate ONLY the subject text, no prefixes, no "موضوع:" label
- body: Generate ONLY the core content paragraph that addresses the request
- Do NOT include: "احتراماً", "با سلام و احترام", "با تشکر", closing phrases, signatures
- Do NOT include: any greetings, openings, closings, or formal letter elements
- Write in professional Persian business language
- Keep subject_line under 50 words
- Body should be 1-3 paragraphs maximum, focused only on the main request

${documentFile ? `DOCUMENT ANALYSIS INSTRUCTIONS:
- Carefully analyze the attached document for contract details, numbers, dates, terms, and specific information
- Include relevant contract numbers, project names, dates, and specific details from the document in your letter
- Reference specific clauses, amounts, or terms from the document when relevant to the user request
- Use the document content to make the letter more contextually accurate and specific` : ''}

Example of what NOT to include in body:
❌ "احتراماً،"
❌ "با سلام و احترام،"
❌ "با تشکر و سپاس فراوان"
❌ "پیشاپیش از حسن توجه جنابعالی سپاسگزارم"

Return only a JSON object with this exact format:
{
  "subject_line": "your clean subject line in Persian",
  "body": "your clean body content in Persian"
}

Do not include any markdown formatting or code blocks, just pure JSON.`;

    console.log('Sending prompt to Gemini...');

    // Prepare the request parts
    const requestParts = [{ text: prompt }];
    
    // Add document file if available
    if (documentFile) {
      console.log('=== GEMINI FILE ATTACHMENT ===');
      console.log('Including document file in Gemini request');
      console.log('- MIME type:', documentFile.mimeType);
      console.log('- File size (base64):', documentFile.data.length);
      
      requestParts.push({
        inline_data: {
          mime_type: documentFile.mimeType,
          data: documentFile.data
        }
      } as any);
      
      // Add comprehensive document analysis instruction
      requestParts.push({
        text: `

=== CRITICAL DOCUMENT ANALYSIS INSTRUCTIONS ===

The attached document contains important contract/business information. You MUST:

1. CAREFULLY READ AND ANALYZE the entire document
2. EXTRACT key information including:
   - Contract numbers, reference numbers, agreement IDs
   - Project names, titles, descriptions
   - Dates (contract dates, deadlines, completion dates)
   - Amounts, budgets, financial terms
   - Company names, client names, contact details
   - Specific clauses, terms, conditions
   - Any relevant business details

3. USE THIS EXTRACTED INFORMATION to make your letter:
   - Specific and contextually accurate
   - Include relevant contract/project numbers
   - Reference specific dates from the document
   - Mention specific amounts or terms when relevant
   - Use proper names and titles from the document

4. The user request "${userRequest}" should be addressed using the context from this document

DO NOT generate a generic letter. The letter MUST reflect the specific information found in the attached document.`
      });
      
      console.log('Document analysis instructions added to Gemini request');
    } else {
      console.log('No document file to attach - generating generic letter');
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: requestParts
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response:', geminiData);

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    const generatedText = geminiData.candidates[0].content.parts[0].text;
    console.log('Generated text:', generatedText);

    let letterData;
    try {
      // Clean the response in case Gemini adds markdown formatting
      const cleanedText = generatedText.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
      letterData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Invalid JSON response from Gemini');
    }

    if (!letterData.subject_line || !letterData.body) {
      throw new Error('Missing required fields in Gemini response');
    }

    // Update the letter in the database with generated content and status
    const { error: updateError } = await supabase
      .from('letters')
      .update({
        generated_subject: letterData.subject_line,
        generated_body: letterData.body,
        status: 'letter_generated',
        updated_at: new Date().toISOString()
      })
      .eq('id', letterId);

    if (updateError) {
      console.error('Error updating letter:', updateError);
      throw new Error('Failed to save generated letter');
    }

    console.log('Letter updated successfully');

    return new Response(JSON.stringify({
      success: true,
      subject_line: letterData.subject_line,
      body: letterData.body,
      document_processed: !!documentFile,
      document_processing_error: documentProcessingError,
      debug_info: {
        had_document_id: !!documentId,
        document_content_length: documentContent.length,
        file_attached: !!documentFile
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-letter function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});