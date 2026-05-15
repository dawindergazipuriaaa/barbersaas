import connectDb from "@/lib/db";
import Barber from "@/model/barber";
import Booking from "@/model/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const { searchParams } = new URL(req.url);
        const date = searchParams.get("date");

        if (!date) {
            return NextResponse.json({ success: false, message: "Date required" }, { status: 400 });
        }

        // Define all possible slots
        const allSlots = [
            "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
            "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"
        ];

        const barbers = await Barber.find({ isActive: true }).lean();
        const bookings = await Booking.find({ date, status: { $ne: "cancelled" } }).lean();

        // Get the short Day name (e.g., "Mon", "Tue") to check against barber workingDays
        const dateObj = new Date(`${date}T12:00:00Z`); 
        const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "short" });

        // Get current time to block past slots if they are booking for today
        const now = new Date();
        const todayStr = now.toLocaleDateString("en-CA");
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const availableSlots = allSlots.filter(slotTime => {
            // 1. Block past times if the date is today
            if (date === todayStr && slotTime <= currentTime) {
                return false;
            }

            // 2. Check if at least ONE barber can take this slot
            const canAnyBarberTakeIt = barbers.some((barber: any) => {
                
                // A. Does the barber work on this day of the week?
                if (barber.workingDays && !barber.workingDays.includes(dayOfWeek)) return false;

                // B. Is it within their working shift?
                if (barber.workingHours?.start && barber.workingHours?.end) {
                    if (slotTime < barber.workingHours.start || slotTime >= barber.workingHours.end) return false;
                }

                // C. Is it during their lunch break?
                if (barber.lunchBreak?.start && barber.lunchBreak?.end) {
                    if (slotTime >= barber.lunchBreak.start && slotTime < barber.lunchBreak.end) return false;
                }

                // D. Is the barber on a scheduled Leave?
                const isOnLeave = barber.timeOff?.some((leave: any) => {
                    const isDateInRange = date >= leave.startDate && date <= leave.endDate;
                    if (!isDateInRange) return false;
                    if (leave.fullDay) return true;
                    if (leave.start && leave.end) {
                        return slotTime >= leave.start && slotTime <= leave.end;
                    }
                    return false;
                });
                if (isOnLeave) return false;

                // E. Is the barber already booked for this exact time?
                const hasBooking = bookings.some((b: any) => 
                    b.barberId.toString() === barber._id.toString() && b.time === slotTime
                );
                if (hasBooking) return false;

                // If they passed all checks, this barber is free!
                return true; 
            });

            return canAnyBarberTakeIt;
        });

        return NextResponse.json({ success: true, availableSlots });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}