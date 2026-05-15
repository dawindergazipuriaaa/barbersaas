import connectDb from "@/lib/db";
import Barber from "@/model/barber";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
    try {
        await connectDb();
        const {id} = await params;
        const {isActive} = await req.json();
        if(!id){
            return NextResponse.json(
                {success:false, message:"Barber Id is required."},
                {status:400}
            )
        }
        const barber = await Barber.findByIdAndUpdate(
            id,{isActive},{new:true}
        )
        if(!barber){
            return NextResponse.json(
                {success:false, message:"Barber didn't found."},
                {status:400}
            )
        }
        return NextResponse.json(
            {success:true, message:"Status Updated"},
            {status:200}
        )

    } catch (error:any) {
        return NextResponse.json(
            {success:false, message:"Server Error."},
            {status:500}
        )
    }
}