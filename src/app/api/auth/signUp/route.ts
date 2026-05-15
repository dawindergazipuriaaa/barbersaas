import connectDb from "@/lib/db";
import { signUpInput, signUpSchema } from "@/lib/validators/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user.model";
import OTP from "@/model/otp.model";

export async function POST(req:NextRequest){
    await connectDb()
    const body = await req.json()
    const parsed = signUpSchema.safeParse(body)
        if(!parsed.success){
            const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]// this is important for detailed errors like symbol missing capital small letters missing etc
            return NextResponse.json(
                {error:firstError},
                {status:400}  )}

    const {name, password}:signUpInput = parsed.data
    const email = parsed.data.email.toLowerCase().trim()
    
    const existingUser = await User.findOne({email})
        if(existingUser){
            return NextResponse.json(
                {error: "Email Already Exists"},
                {status:400}
            )
        }
    //Owner email logic 
    const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase().trim()

    const role = email === ownerEmail? "ADMIN" : "USER"
    // this will differenciate the user and admin and push them to their assigned dashboards

    const hashedPassword = await bcrypt.hash(password,10)
    const user = await User.create({
        name, email, password: hashedPassword, role:role
    })

    const otp = Math.floor(100000+(Math.random()*900000)).toString();
    await OTP.create({
        userId : user._id,
        code: otp,
        purpose: "VERIFY EMAIL",
        expiresAt: new Date(Date.now()+1000*60*10)
    })
    console.log("email OTP ", otp)
    return NextResponse.json({success:true})
}