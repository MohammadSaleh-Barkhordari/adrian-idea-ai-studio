import { supabase } from '@/integrations/supabase/client';

export async function transcribeAudioBlob(blob: Blob): Promise<string | null> {
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64Audio = btoa(binary);

  const { data, error } = await supabase.functions.invoke('voice-to-text', {
    body: { audio: base64Audio }
  });

  if (error || !data?.text?.trim()) return null;
  return data.text;
}
