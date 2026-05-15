import connectDb from "@/lib/db"
import { otpInput, otpSchema } from "@/lib/validators/auth"
import OTP from "@/model/otp.model"
import User from "@/model/user.model"

import { NextRequest, NextResponse } from "next/server"
import { success } from "zod"

export async function POST(req:NextRequest){
    await connectDb()
    const body = req.json()
    const parsed = otpSchema.safeParse(body)
        if(!parsed.success){
            return NextResponse.json(
                {error: parsed.error.flatten},
                {status:400})
        }
    const {otp, email}:otpInput = parsed.data
    const user = await User.findOne({email})
        if(!user){
            return NextResponse.json(
                {error:"Email is not found. Sign Up again"},
                {status:404}
            )
        }
    const record = await OTP.findOne({
        userId: user._id,
        code: otp,
        purpose: "VERIFY EMAIL",
        used:false
    })
        if(!record){
            return NextResponse.json(
                {error:"OTP invalid or Expired"},
                {status:400}
            )
        }
    user.isVerified = true;
    await user.save();
    record.used = true;
    await record.save();

    return NextResponse.json({success:true})
    



}