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
            return NextResponse.json(
                { success: false, message: "Date is required" },
                { status: 400 }
            );
        }

        const bookings = await Booking.find({ date, status: { $ne: "cancelled" } })
            .populate("barberId", "name")
            .lean();
            
        const barbers = await Barber.find({ isActive: true }).lean();
        
        return NextResponse.json({
            success: true,
            bookings,
            barbers,
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Server Error" },
            { status: 500 }
        );
    }
}

// Updated POST route to match your strict Booking Schema
export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const body = await req.json();
        const { customerName, service, contact, barberId, time, date } = body;

        // Check if slot is already taken
        const existing = await Booking.findOne({ 
            date, 
            time, 
            barberId, 
            status: { $ne: "cancelled" } 
        });

        if (existing) {
            return NextResponse.json(
                { success: false, message: "Slot already booked" }, 
                { status: 400 }
            );
        }

        // Map data to match the Schema precisely
        const newBooking = await Booking.create({
            name: customerName,                // Schema requires 'name'
            phone: contact || "No phone",      // Schema requires 'phone'
            date,
            time,
            barberId,
            userId: null,                      // Null for admin entries
            status: "open",                    // Schema enum expects 'open'
            ipAddress: "ADMIN_MANUAL_ENTRY",   // Schema requires 'ipAddress'
            totalAmount: 0,                    // Schema requires 'totalAmount'
            items: [                           // Schema requires 'items' array
                {
                    id: service.toLowerCase().replace(/\s+/g, '-'), 
                    name: service,
                    type: "service", 
                    price: 0
                }
            ]
        });

        return NextResponse.json({ success: true, booking: newBooking });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || "Server Error" }, 
            { status: 500 }
        );
    }
}

// import connectDb from "@/lib/db";
// import Barber from "@/model/barber";
// import Booking from "@/model/booking.model";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req:NextRequest){
//     try {
//         await connectDb()
//         const {searchParams} = new URL(req.url);
//         const date = searchParams.get("date")
//         if(!date){
//             return NextResponse.json(
//                 {success:false, message:"Date is required"},
//                 {status:400}
//             )
//         }
//         const bookings = await Booking.find({date}).populate("barberId","name").lean();
//         const barbers = await Barber.find({isActive: true}).lean()
//         return NextResponse.json({
//             success:true,
//             bookings,
//             barbers,
//         })
//     } catch (error) {
//         return NextResponse.json(
//             {success:false, message:"Server Error"},
//             {status:500}
//         )
        
//     }
// }