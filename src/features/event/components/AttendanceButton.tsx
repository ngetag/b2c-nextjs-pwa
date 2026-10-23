"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useIsMounted } from "@/hooks/useIsMounted";
import { cn } from "@/lib/cn";
import { useAttendanceStore } from "@/stores/attendance.store";
import { useCurrentUserStore } from "@/stores/currentUser.store";
import { useNotificationStore } from "@/stores/notification.store";
import { downloadIcs, type CalendarEventData } from "@/lib/calendar";

interface AttendanceButtonProps {
  event: CalendarEventData & { id: string };
  size?: "sm" | "default";
  className?: string;
}

export function AttendanceButton({
  event,
  size = "default",
  className,
}: AttendanceButtonProps) {
  const mounted = useIsMounted();
  const userId = useCurrentUserStore((state) => state.user.id);
  const storedAttending = useAttendanceStore((state) => state.isAttending(event.id));
  const toggleAttendance = useAttendanceStore((state) => state.toggle);
  const addNotification = useNotificationStore((state) => state.addNotification);
  
  const [feedback, setFeedback] = useState<string>();
  const attending = mounted ? storedAttending : false;

  function handleClick() {
    if (!mounted) return;
    
    if (!attending) {
      // Mark as attending, download ICS, and show notification
      toggleAttendance(event.id, userId);
      downloadIcs(event);
      setFeedback("Sip, kalender berhasil di-download.");
      toast.success("Event disimpan ke kalender", {
        description: "File .ics telah diunduh, silakan buka untuk menyimpan."
      });
      
      addNotification({
        title: "Event masuk ke kalender",
        description: `Pengingat untuk ${event.title} siap disimpan.`,
        detail: "Buka file .ics yang baru saja di-download.",
        href: `/events/${event.id}`,
        type: "calendar",
      });
    } else {
      // Un-attend
      toggleAttendance(event.id, userId);
      setFeedback("Oke, batal ikut event.");
      toast("Batal mengikuti event");
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Button
        type="button"
        size={size}
        variant={attending ? "default" : "outline"}
        onClick={handleClick}
        aria-pressed={attending}
        className="w-full"
      >
        {attending ? <Check className="h-4 w-4" aria-hidden /> : null}
        {attending ? "Sudah masuk daftar" : "Ikuti Event"}
      </Button>
      {feedback ? (
        <p className="text-xs text-[var(--color-muted-foreground)]" role="status">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
