import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeSlotView } from "@/components/TimeSlotView";
import { format } from "date-fns";

interface PersonalCalendarSectionProps {
  personName: "Raiana" | "Mohammad";
}

export function PersonalCalendarSection({ personName }: PersonalCalendarSectionProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <Card className="glass-morphism border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-primary">
          {personName}'s Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border shadow-sm bg-card/50 pointer-events-auto"
          />
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Schedule for {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
          <TimeSlotView 
            selectedDate={selectedDate} 
            personName={personName} 
          />
        </div>
      </CardContent>
    </Card>
  );
}