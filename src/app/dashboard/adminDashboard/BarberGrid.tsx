'use client'

export default function BarberGrid({ 
  barbers, 
  bookingMap, 
  onSlotClick,
  selectedDate // NEW: We need the date to check Time Off
}: { 
  barbers: any[]; 
  bookingMap: Record<string, any>; 
  onSlotClick: (barber: any, slot: string, booking: any) => void;
  selectedDate: any;
}) {
  const timeSlots = [
    "10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30",
    "14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30",
    "18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30"
  ]

  // Safely format the date and get the Day of the Week (e.g. "Mon")
  let dateStr = "";
  let dayOfWeek = "";
  if (selectedDate instanceof Date) {
    const offset = selectedDate.getTimezoneOffset()
    const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000))
    dateStr = localDate.toISOString().split("T")[0]
    
    // Get short day name to check against workingDays array
    const dateObj = new Date(`${dateStr}T12:00:00Z`);
    dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  }

  // THE RADAR: Determines the exact status of a slot
  const getSlotStatus = (barber: any, slot: string) => {
    if (bookingMap[`${barber._id}-${slot}`]) return "booked";
    if (!dateStr) return "free";

    // 1. Is it their day off?
    if (barber.workingDays && !barber.workingDays.includes(dayOfWeek)) return "off-shift";

    // 2. Is it outside their working shift?
    if (barber.workingHours?.start && barber.workingHours?.end) {
        if (slot < barber.workingHours.start || slot >= barber.workingHours.end) return "off-shift";
    }

    // 3. Are they on Lunch?
    if (barber.lunchBreak?.start && barber.lunchBreak?.end) {
        if (slot >= barber.lunchBreak.start && slot < barber.lunchBreak.end) return "lunch";
    }

    // 4. Are they on Scheduled Leave?
    const isOnLeave = barber.timeOff?.some((leave: any) => {
        const isDateInRange = dateStr >= leave.startDate && dateStr <= leave.endDate;
        if (!isDateInRange) return false;
        if (leave.fullDay) return true;
        if (leave.start && leave.end) {
            return slot >= leave.start && slot <= leave.end;
        }
        return false;
    });
    if (isOnLeave) return "leave";

    // If it passes all checks, it's free!
    return "free";
  };

  return (
    <div className="mt-10 space-y-8">
      {barbers.map((barber: any) => (
        <div key={barber._id} className="border-t border-neutral-700 pt-6">
          <h3 className="text-xl text-white mb-4 font-bold flex items-center gap-2">
            <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
            {barber.name}
          </h3>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {timeSlots.map(slot => {
              const status = getSlotStatus(barber, slot);
              const booking = bookingMap[`${barber._id}-${slot}`]
              
              // Set styles based on status
              let styleClass = "";
              let label = "";

              if (status === "booked") {
                  styleClass = "bg-red-500/20 border border-red-500 text-red-500 hover:scale-105 cursor-pointer";
                  label = "Booked";
              } else if (status === "free") {
                  styleClass = "bg-emerald-500/20 border border-emerald-500 text-emerald-500 hover:scale-105 cursor-pointer";
                  label = "Free";
              } else if (status === "lunch") {
                  styleClass = "bg-orange-500/10 border border-orange-500/50 text-orange-500/50 cursor-not-allowed";
                  label = "Lunch";
              } else {
                  styleClass = "bg-neutral-800 border border-neutral-700 text-neutral-500 cursor-not-allowed";
                  label = status === "leave" ? "On Leave" : "Off Shift";
              }

              return (
                <button
                  key={slot}
                  // Prevent admin from clicking slots that are greyed out
                  onClick={() => (status === "booked" || status === "free") && onSlotClick(barber, slot, booking)}
                  className={`p-2 text-center rounded text-sm transition-all ${styleClass}`}
                >
                  {slot}
                  <div className="text-[10px] opacity-80 uppercase tracking-wider">{label}</div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}