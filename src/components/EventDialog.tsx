import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format, parse } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { sendNotification } from "@/lib/notifications";

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
}

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  personName: "Raiana" | "Mohammad";
  selectedTimeSlot: { start: string; end: string } | null;
  editingEvent: CalendarEvent | null;
  onEventSaved: () => void;
}

export function EventDialog({
  isOpen,
  onClose,
  selectedDate,
  personName,
  selectedTimeSlot,
  editingEvent,
  onEventSaved,
}: EventDialogProps) {
  const [eventTitle, setEventTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingEvent) {
      setEventTitle(editingEvent.title);
      // Handle both timestamp and time-only formats
      const startTimeStr = editingEvent.start_time.includes('T') 
        ? new Date(editingEvent.start_time).toTimeString().slice(0, 5)
        : editingEvent.start_time.slice(0, 5);
      const endTimeStr = editingEvent.end_time.includes('T')
        ? new Date(editingEvent.end_time).toTimeString().slice(0, 5)
        : editingEvent.end_time.slice(0, 5);
      setStartTime(startTimeStr);
      setEndTime(endTimeStr);
      setDescription(editingEvent.description || "");
    } else if (selectedTimeSlot) {
      setEventTitle("");
      setStartTime(selectedTimeSlot.start);
      setEndTime(selectedTimeSlot.end);
      setDescription("");
    }
  }, [editingEvent, selectedTimeSlot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Validate that end time is after start time
      if (startTime >= endTime) {
        toast({
          title: "Invalid Time Range",
          description: "End time must be after start time",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Build start and end timestamps
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const startTimestamp = `${dateStr}T${startTime}:00`;
      const endTimestamp = `${dateStr}T${endTime}:00`;

      // Check for conflicts with existing events (unless editing the same event)
      const { data: existingEvents, error: fetchError } = await supabase
        .from('our_calendar')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', `${dateStr}T00:00:00`)
        .lt('start_time', `${dateStr}T23:59:59`)
        .neq('id', editingEvent?.id || '00000000-0000-0000-0000-000000000000');

      if (fetchError) throw fetchError;

      const hasConflict = existingEvents?.some(event => {
        return (startTimestamp < event.end_time && endTimestamp > event.start_time);
      });

      if (hasConflict) {
        toast({
          title: "Time Conflict",
          description: "This time slot conflicts with an existing event",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const eventData = {
        user_id: user.id,
        title: eventTitle,
        start_time: startTimestamp,
        end_time: endTimestamp,
        description: description || null,
        location: personName, // Store person name in location field as a workaround
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('our_calendar')
          .update(eventData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Event updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('our_calendar')
          .insert([eventData]);
        
        if (error) throw error;

        // Get the other person's user ID to notify them about the new event using secure RPC
        const otherPersonEmail = personName === 'Mohammad' 
          ? 'raianasattari@gmail.com' 
          : 'mosba1991@gmail.com';
        
        const { data: otherProfileId } = await supabase
          .rpc('get_user_id_by_email', { lookup_email: otherPersonEmail });

        if (otherProfileId) {
          await sendNotification(
            '📅 New Calendar Event',
            `${personName} added: "${eventTitle}" on ${format(selectedDate, 'MMM d')} at ${startTime}`,
            [otherProfileId],
            'calendar',
            '/our-calendar'
          );
        }
        
        toast({
          title: "Success",
          description: "Event created successfully",
        });
      }

      onEventSaved();
      onClose();
      
      // Reset form
      setEventTitle("");
      setStartTime("");
      setEndTime("");
      setDescription("");
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? "Edit Event" : "Create New Event"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="eventTitle">Event Title</Label>
            <Input
              id="eventTitle"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add event description..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingEvent ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}