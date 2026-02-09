import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { EventDialog } from "@/components/EventDialog";
import { format, parse } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { sendNotification, getOtherOurLifeUser, getOurLifeUserName } from "@/lib/notifications";

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
}

interface TimeSlotViewProps {
  selectedDate: Date;
  personName: "Raiana" | "Mohammad";
}

export function TimeSlotView({ selectedDate, personName }: TimeSlotViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();

  const timeSlots = Array.from({ length: 34 }, (_, i) => {
    const totalMinutes = (i * 30) + (6 * 60); // Start from 6 AM, 30-minute intervals
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const nextTotalMinutes = totalMinutes + 30;
    const nextHour = Math.floor(nextTotalMinutes / 60);
    const nextMinutes = nextTotalMinutes % 60;
    
    return {
      start: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      end: `${nextHour.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`,
      display: format(parse(`${hour}:${minutes}`, 'H:mm', new Date()), 'h:mm a')
    };
  });

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('our_calendar')
        .select('*')
        .eq('user_id', user.id)
        .eq('location', personName) // Using location to store person name
        .gte('start_time', `${dateStr}T00:00:00`)
        .lt('start_time', `${format(new Date(selectedDate.getTime() + 86400000), 'yyyy-MM-dd')}T00:00:00`)
        .order('start_time');

      if (error) throw error;
      
      // Map database format to CalendarEvent interface
      const mappedEvents: CalendarEvent[] = (data || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        start_time: new Date(e.start_time).toTimeString().slice(0, 8),
        end_time: new Date(e.end_time).toTimeString().slice(0, 8),
        description: e.description,
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDate, personName]);

  const getSlotStatus = (start: string, end: string) => {
    const slotStartTime = start + ":00";
    const slotEndTime = end + ":00";
    
    const overlappingEvents = events.filter(event => {
      const eventStart = event.start_time;
      const eventEnd = event.end_time;
      return (slotStartTime < eventEnd && slotEndTime > eventStart);
    });

    if (overlappingEvents.length === 0) {
      return { status: 'free', events: [] };
    }

    // Check if slot is completely occupied
    const isCompletelyOccupied = overlappingEvents.some(event => 
      event.start_time <= slotStartTime && event.end_time >= slotEndTime
    );

    if (isCompletelyOccupied) {
      return { status: 'occupied', events: overlappingEvents };
    }

    return { status: 'partial', events: overlappingEvents };
  };

  const getAvailableTimeInSlot = (start: string, end: string) => {
    const slotStartTime = start + ":00";
    const slotEndTime = end + ":00";
    
    const overlappingEvents = events.filter(event => {
      const eventStart = event.start_time;
      const eventEnd = event.end_time;
      return (slotStartTime < eventEnd && slotEndTime > eventStart);
    });

    if (overlappingEvents.length === 0) {
      return { start: slotStartTime, end: slotEndTime };
    }

    // Find the earliest available start time and latest available end time
    let availableStart = slotStartTime;
    let availableEnd = slotEndTime;

    overlappingEvents.forEach(event => {
      if (event.start_time <= slotStartTime && event.end_time > slotStartTime) {
        availableStart = event.end_time > slotEndTime ? slotEndTime : event.end_time;
      }
      if (event.start_time < slotEndTime && event.end_time >= slotEndTime) {
        availableEnd = event.start_time < slotStartTime ? slotStartTime : event.start_time;
      }
    });

    return availableStart < availableEnd ? { start: availableStart, end: availableEnd } : null;
  };

  const handleTimeSlotClick = (start: string, end: string) => {
    const slotStatus = getSlotStatus(start, end);
    
    if (slotStatus.status === 'occupied') {
      // If completely occupied, try to edit the event
      const slotStartTime = start + ":00";
      const slotEndTime = end + ":00";
      const event = slotStatus.events.find(e => e.start_time <= slotStartTime && e.end_time >= slotEndTime);
      if (event) {
        handleEventClick(event);
      }
      return;
    }
    
    if (slotStatus.status === 'partial') {
      // If partially occupied, find available time in this slot
      const availableTime = getAvailableTimeInSlot(start, end);
      if (availableTime) {
        setSelectedTimeSlot({ 
          start: availableTime.start.slice(0, 5), // Remove :00 seconds for form input
          end: availableTime.end.slice(0, 5) 
        });
        setEditingEvent(null);
        setIsDialogOpen(true);
      }
      return;
    }
    
    // If free, use the full slot
    setSelectedTimeSlot({ start, end });
    setEditingEvent(null);
    setIsDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedTimeSlot(null);
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: string, eventTitle?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('our_calendar')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      // Send notification for event deletion
      if (user) {
        const otherUserId = getOtherOurLifeUser(user.id);
        if (otherUserId) {
          const actorName = getOurLifeUserName(user.id);
          await sendNotification(
            '📅 Event Removed',
            `${actorName} removed "${eventTitle || 'an event'}" from ${format(selectedDate, 'MMM d')}`,
            [otherUserId],
            'calendar',
            '/our-calendar'
          );
        }
      }
      
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading schedule...</div>;
  }

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {timeSlots.map((slot, index) => {
        const slotStatus = getSlotStatus(slot.start, slot.end);
        const slotStartTime = slot.start + ":00";
        const slotEndTime = slot.end + ":00";
        
        // Find the main event to display - prioritize events that start earliest in or before this slot
        const mainEvent = slotStatus.events.length > 0 
          ? slotStatus.events.reduce((prev, current) => {
              // If one event completely covers this slot, prefer it
              if (current.start_time <= slotStartTime && current.end_time >= slotEndTime) {
                if (!(prev.start_time <= slotStartTime && prev.end_time >= slotEndTime)) {
                  return current;
                }
              }
              // Otherwise, prefer the event that starts earliest
              return current.start_time < prev.start_time ? current : prev;
            })
          : null;
        
        const availableTime = slotStatus.status === 'partial' ? getAvailableTimeInSlot(slot.start, slot.end) : null;
        
        return (
          <Card
            key={index}
            className={`p-2 transition-all duration-200 cursor-pointer ${
              slotStatus.status === 'occupied' 
                ? 'bg-primary/20 border-primary/30 hover:bg-primary/30' 
                : slotStatus.status === 'partial'
                ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-muted/30 border-primary/20 hover:from-primary/30 hover:via-primary/15 hover:to-muted/40'
                : 'bg-muted/30 hover:bg-muted/50 border-dashed'
            }`}
            onClick={() => handleTimeSlotClick(slot.start, slot.end)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-medium text-muted-foreground min-w-[70px]">
                  {slot.display}
                </span>
                {slotStatus.status === 'occupied' && mainEvent ? (
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{mainEvent.title}</p>
                    {mainEvent.description && (
                      <p className="text-xs text-muted-foreground mt-1">{mainEvent.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(parse(mainEvent.start_time, 'HH:mm:ss', new Date()), 'h:mm a')} - 
                      {format(parse(mainEvent.end_time, 'HH:mm:ss', new Date()), 'h:mm a')}
                    </p>
                  </div>
                ) : slotStatus.status === 'partial' ? (
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">Partially Booked</p>
                        <p className="text-xs text-muted-foreground">
                          {slotStatus.events.map(e => e.title).join(', ')}
                        </p>
                      </div>
                      {availableTime && (
                        <div className="text-xs text-green-600 font-medium">
                          Available: {format(parse(availableTime.start, 'HH:mm:ss', new Date()), 'h:mm a')} - 
                          {format(parse(availableTime.end, 'HH:mm:ss', new Date()), 'h:mm a')}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-muted-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="text-sm">Available - Click to add event</span>
                  </div>
                )}
              </div>
              {slotStatus.status === 'occupied' && mainEvent && (
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(mainEvent);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(mainEvent.id, mainEvent.title);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
      
      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedDate={selectedDate}
        personName={personName}
        selectedTimeSlot={selectedTimeSlot}
        editingEvent={editingEvent}
        onEventSaved={fetchEvents}
      />
    </div>
  );
}