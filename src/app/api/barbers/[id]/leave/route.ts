import connectDb from "@/lib/db";
import Barber from "@/model/barber";
import Booking from "@/model/booking.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    let session;
    try {
        await connectDb();
        const { id } = await params;
        const body = await req.json();
        const { startDate, endDate, fullDay, start, end, reason } = body;

        if (!startDate || !endDate || !id) {
            return NextResponse.json(
                { success: false, message: "Barber Id, Start Date, End Date are necessary. Please fill all." },
                { status: 400 }
            );
        }

        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Add multi-day leave
        const newLeave = { startDate, endDate, fullDay, start, end, reason };
        await Barber.findByIdAndUpdate(id, { $push: { timeOff: newLeave } }, { session });

        // 2. Cancel bookings
        let bookingQuery: any = {
            barberId: id,
            date: { $gte: startDate, $lte: endDate },
            status: { $ne: "cancelled" }
        };

        // For one day/partial hours leave
        if (!fullDay && start && end) {
            bookingQuery.time = { $gte: start, $lte: end };
        }

        const cancelResult = await Booking.updateMany(bookingQuery, {
            $set: {
                status: "cancelled",
                cancellationReason: reason || "Cancelled: Barber is on Leave" 
            }
        }, { session });

        // --- THIS WAS THE MISSING LINE! ---
        // If we don't commit, MongoDB deletes the data instantly.
        await session.commitTransaction(); 
        // ----------------------------------

        return NextResponse.json({
            success: true, 
            message: "Leave scheduled successfully", 
            cancelledCount: cancelResult.modifiedCount
        });

    } catch (error: any) {
        console.error("Leave scheduled failed. Error:", error);
        if (session) {
            await session.abortTransaction();
        }
        return NextResponse.json(
            { success: false, message: "Server Error: Process cancelled. Please try again after few minutes" }
        );    
    } finally {
        if (session) {
            session.endSession();
        }
    }
}

export async function DELETE(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDb();
        const { id } = await params;
        
        const { leaveId } = await req.json();

        if (!id || !leaveId) {
            return NextResponse.json({ success: false, message: "Missing IDs" }, { status: 400 });
        }

        await Barber.findByIdAndUpdate(id, {
            $pull: { timeOff: { _id: leaveId } }
        });

        return NextResponse.json({ success: true, message: "Leave removed successfully" });

    } catch (error: any) {
        console.error("Remove Leave Error:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}