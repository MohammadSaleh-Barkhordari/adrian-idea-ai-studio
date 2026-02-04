import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceRecorderProps {
  onFieldsExtracted: (fields: {
    recipientName: string;
    recipientPosition: string;
    recipientCompany: string;
    userRequest: string;
  }) => void;
}

const VoiceRecorder = ({ onFieldsExtracted }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly about your letter requirements",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert audio to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64Audio = btoa(binary);
      
      // Step 1: Convert voice to text
      const transcriptResponse = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });
      
      if (transcriptResponse.error) {
        throw new Error('Failed to transcribe audio');
      }
      
      const { text } = transcriptResponse.data;
      
      if (!text || text.trim().length === 0) {
        throw new Error('No speech detected in the recording');
      }
      
      // Step 2: Extract letter fields from text
      const fieldsResponse = await supabase.functions.invoke('extract-letter-fields', {
        body: { text }
      });
      
      if (fieldsResponse.error) {
        throw new Error('Failed to extract fields from speech');
      }
      
      const extractedFields = fieldsResponse.data.fields;
      
      // Apply extracted fields
      onFieldsExtracted(extractedFields);
      
      toast({
        title: "Voice Processing Complete",
        description: "Fields have been extracted from your voice. Review and edit as needed.",
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process voice recording",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Voice Input Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Record your letter requirements and let AI fill the fields automatically
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isRecording ? (
                <>
                  <MicOff className="h-5 w-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
          
          {(isRecording || isProcessing) && (
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {isRecording ? 'Recording...' : 'Processing...'}
                </span>
                {isRecording && (
                  <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
                )}
              </div>
              
              {isRecording && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-destructive/70 rounded-full animate-pulse animation-delay-100"></div>
                  <div className="w-2 h-2 bg-destructive/50 rounded-full animate-pulse animation-delay-200"></div>
                </div>
              )}
              
              {isProcessing && (
                <Progress value={66} className="w-full" />
              )}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Speak naturally about who you're writing to, their role and company, 
            and what you want to request or discuss in the letter.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;