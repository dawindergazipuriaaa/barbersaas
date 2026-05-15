import connectDb from "@/lib/db";
import { validateBookingInput } from "@/lib/validators/booking";
import Barber from "@/model/barber";
import Booking from "@/model/booking.model";
import { BookingInput } from "@/types/booking";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req:NextRequest){
    try {
        await connectDb()
        const payload:BookingInput = await req.json()
        const validatedData = validateBookingInput(payload)
        const {name,phone,date,time, items} = validatedData

    // block past time slots
        const bookingDateTime = new Date(`${date}T${time}`)
        if(bookingDateTime < new Date()){
            return NextResponse.json(
                {success:false, message:"Cann't book Past time slots"},
                {status:400}
            )
        }
        const phoneCount = await Booking.countDocuments({
            phone,
            status:"open"
        });
        if (phoneCount>= 3){
            return NextResponse.json(
                {success:false, message: "Maximum three active bookings can be made per phone number. Please change the number for more Bookings"},
                {status:429}
            )
        }
    // Ip limiter to save from abuse
         const ipAddress =
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown";

            const today = new Date();
            const next30Days = new Date();
            next30Days.setDate(today.getDate() + 30)

            const ipCount = await Booking.countDocuments({
                ipAddress,
                status:'open',
                date:{
                    $gte : today.toISOString().split("T")[0],// gte means <=
                    $lte: next30Days.toISOString().split("T")[0], // lte = less than or equal
                }
            })// here we get  ip address and the status of open bookings/booked slots that we can control further
            if(ipCount>=50){
                return NextResponse.json(
                    {success:false, message:"More then 5 bookings are open under this network. Please change network for more bookings"},
                    {status:429}
                )}
    //Auto-assign barber
            const barbers = await Barber.find({isActive:true});
            let assignedBarber = null;
            
            for (const barber of barbers){
                //Check if barber is on scheduled Time Off
                const   isOnLeave = barber.timeOff?.some((leave:any)=>{
                    const isDateInRange = date>= leave.startDate && date <= leave.endDate;
                    if(!isDateInRange) return false;
                    if(leave.fullDay) return true;
                    if(leave.start && leave.end){
                        return time >= leave.start && time <= leave.end;
                    }
                    return false;
                })
                if (isOnLeave) continue;// Barber is on vacation, skip them!
                //to check if booking is outside their Working Hours
                if(barber.workingHours?.start && barber.workingHours?.end){
                    if(time<barber.workingHours.start || time>=barber.workingHours.end)
                        continue;
                }
                //to check if booking is during their Lunch Break
                if(barber.lunchBreak?.start && barber.lunchBreak?.end){
                    if(time>=barber.lunchBreak.start || time<=barber.lunchBreak.end){
                        continue;
                    }
                }

                const clash = await Booking.findOne({
                    barberId: barber._id,
                    date,
                    time,
                })
                if(!clash){
                    assignedBarber = barber;
                    break;
                }
            }
            if(!assignedBarber){
                return NextResponse.json(
                    {success:false, message:"All barbers are booked please try another slot"},
                    {status:409}
                )
            }
    // calculating total amount
            const totalAmount = items.reduce((sum,i)=>sum + i.price,0 )
    // create booking




        const booking = await Booking.create({
            ...validatedData,
            totalAmount,
            barberId: assignedBarber._id,
            ipAddress,
            status:'open'

        })
        return NextResponse.json(
            {success:true, message:"Booking Successful"},
            {status:200}
        )
    } catch (error:any) {
        //race condition handler
        if(error.code === 11000){
            return NextResponse.json(
                {success:false, message:"Slots are Booked please book another One"},
                {status:409}
            )
        }
        const message = error instanceof Error? error.message : "Something went wrong. Try again"
        return NextResponse.json(
            {success:false, message},
            {status:400}
        )
    }
}