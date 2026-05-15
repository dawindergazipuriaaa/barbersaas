import connectDb from "@/lib/db";
import Booking from "@/model/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> } // Next 16 standard
) {
    try {
        await connectDb();
        const { reason } = await req.json();
        
        // NEXT.JS 16 FIX: You MUST await params before using the id
        const { id } = await params;

        console.log("Next 16 parsed ID:", id); // Check your terminal to confirm!

        if (!id || id === "undefined") {
            return NextResponse.json(
                { success: false, message: "Server received undefined ID." },
                { status: 400 }
            );
        }

        const booking = await Booking.findByIdAndUpdate(id, {
            status: "cancelled",
            cancellationReason: reason || "Cancelled by Admin"
        }, { new: true });

        if (!booking) {
            return NextResponse.json(
                { success: false, message: "Booking didn't found in database" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Booking Cancelled" }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, messsage: "Booking didn't get cancelled, Server Error" },
            { status: 500 }
        );
    }
}