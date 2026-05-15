import connectDb from "@/lib/db"
import Barber from "@/model/barber"
import { NextResponse } from "next/server"

export async function DELETE(req: Request,){

    try {
        const {id} = await req.json()
        await connectDb()
        const deleted = await Barber.findByIdAndDelete(id)
         if (!deleted) {
      return NextResponse.json({ success: false, message: "Not found" })
    }
        return NextResponse.json({success:true})
    } catch (error) {
        return NextResponse.json({success:false})
    }
}