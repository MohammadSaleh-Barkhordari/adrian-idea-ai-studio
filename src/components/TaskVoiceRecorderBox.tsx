import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TaskVoiceRecorderBoxProps {
  label: string;
  onAudioReady?: (blob: Blob) => void;
  disabled?: boolean;
}

const TaskVoiceRecorderBox = ({ label, onAudioReady, disabled }: TaskVoiceRecorderBoxProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioSaved, setAudioSaved] = useState(false);
  const [audioSize, setAudioSize] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        setAudioSaved(true);
        setAudioSize(audioBlob.size);
        onAudioReady?.(audioBlob);
        toast({
          title: "Recording saved",
          description: "Audio will be transcribed when you save the task.",
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioSaved(false);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [onAudioReady]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
      <div className="flex flex-col items-center space-y-3">
        <Mic className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">{label}</p>

        <Button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          variant={isRecording ? "destructive" : "outline"}
          size="sm"
          className="flex items-center gap-1.5"
        >
          {isRecording ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>

        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-mono text-muted-foreground">{formatTime(recordingTime)}</span>
          </div>
        )}

        {audioSaved && audioSize !== null && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>Audio recorded ({formatSize(audioSize)})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskVoiceRecorderBox;
