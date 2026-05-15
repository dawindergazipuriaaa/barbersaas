'use client'
import { FcGoogle } from "react-icons/fc";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { useState } from "react"
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const page = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()


  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();  
    setIsLoading(true)  
    setErrorMsg("")
    
    try {
      const result = await signIn('credentials',{email, password, redirect:false})
      if(result?.error){
        setErrorMsg(result.error)
      }else{
        router.push('/dashboard')
      }
    } catch (error:any) {
      setErrorMsg("Login failed. Please try again")      
    }
    finally{
      setIsLoading(false)
    }
  }
  const isPasswordVisible=()=>{
    setShowPassword((prev)=>!prev)
  }


  return (
    <div className='min-h-screen flex items-center justify-center bg-neutral-900'>
      <div className="flex flex-col border-2 border-white/40 gap-5 items-center">
      <div className=" text-3xl items-center flex flex-col font-bold tracking-widest pt-15">
        Log In
      </div>  
        {errorMsg && ( <p className="mb-3 text-red-400 font-semibold text-center">
              {errorMsg}
            </p>)} 
      <form className="flex flex-col items-center border-white/40 pb-10 px-10 gap-10"
       onSubmit={handleSubmit}>  
           
      <input type="text" 
       placeholder="Email"
       value={email}
       onChange={(e)=>setEmail(e.target.value)}
       className="mt-2 flex border-b w-xl h-12 text-lg px-2 border-white/55 pb-1 tracking-widest placeholder:text-xl placeholder:text-pink-50 focus:outline-none"
       />


       <div className="flex items-center border-b border-white/55 pb-1 w-xl">
      <input type={showPassword? "text":"password"} placeholder="Password"
      value={password}
      onChange={(e)=>setPassword(e.target.value)}
       className="flex w-full h-12 text-lg px-2  tracking-widest placeholder:text-xl placeholder:text-pink-50 focus:outline-none"/>
       <button type="button" 
       className="pr-5 hover:cursor-pointer"
       onClick={isPasswordVisible}>
        
        {showPassword? <FaRegEye /> : <FaRegEyeSlash />}
       </button>

       </div>
      
      <button type="submit"
      disabled={isLoading}
      className={`self-center px-15 active:scale-95 mt-7 py-3 bg-goldenbg rounded-4xl text-xl font-semibold tracking-wider
        ${isLoading? "opacity-70 cursor-not-allowed scale-95":"hover:cursor-pointer"}
      `}>
        Submit</button>
      </form>



      <div className="flex items-center gap-5 justify-center w-full px-5">
          <hr className="flex-1 border-white/40"/>
             OR
          <hr className="flex-1 border-white/40" />
      </div>

      <div className="flex items-center gap-2"> <p>Log In with</p>
      <button 
      className=" hover:cursor-pointer flex items-center gap-2 font-semibold">
        <FcGoogle size={30} />GOOGLE</button>
      </div>
      <div className="w-full px-5 my-5 items-center gap-5 flex flex-col">
        <hr className="flex-1 w-full border-white/40"/>
      <p className="tracking-wider gap">Don't have an account
        <span onClick={()=>router.push('/signUp')}
         className="text-blue-300 hover:cursor-pointer mx-2 font-semibold underline"> Sign Up </span> here</p>
       
      
      </div>
      </div>
    </div>
  )
}

export default page
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
}import connectDb from "@/lib/db";
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
// }import NextAuth from "next-auth";
import authOptions from "@/lib/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
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
}import connectDb from "@/lib/db"
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
    



}import connectDb from "@/lib/db";
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
}import connectDb from "@/lib/db";
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
}import connectDb from "@/lib/db";
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
}import { auth } from "@/lib/auth";
import connectDb from "@/lib/db";
import Barber from "@/model/barber";
import { NextResponse } from "next/server";


export async function POST(req:Request){
    try {
        const session = await auth()
        if(!session || session.user.role !== "ADMIN"){
            return NextResponse.json(
                { message:"Unauthorized" },
                {status:401})
        }
        const body = await req.json();
        const {name, email, phone, workingDays, workingHours, lunchBreak, services} = body;
        if( !name || !email || !phone || !workingDays || !workingHours || !lunchBreak || !services){
            return NextResponse.json(
                {message: "Some field/fields is/are Missing."},
                {status:400})
        }
        await connectDb();
        const barber = await Barber.create({
            name, email, phone,isActive:true, workingDays, workingHours, lunchBreak, services
        })
        return NextResponse.json(
            {message: "Barber Added Successfully", barber},
            {status:201})
    } catch (error) {
        console.error("error while adding barber",error);
        return NextResponse.json(
            {message:"Server Error"},
            {status:500}
        )
    }
}import { auth } from "@/lib/auth";
import connectDb from "@/lib/db";
import Barber from "@/model/barber";
import { NextResponse } from "next/server";


export async function POST(req:Request){
    try {
        const session = await auth()
        if(!session || session.user.role !== "ADMIN"){
            return NextResponse.json(
                { message:"Unauthorized" },
                {status:401})
        }
        const body = await req.json();
        const {name, email, phone, workingDays, workingHours, lunchBreak, services} = body;
        if( !name || !email || !phone || !workingDays || !workingHours || !lunchBreak || !services){
            return NextResponse.json(
                {message: "Some field/fields is/are Missing."},
                {status:400})
        }
        await connectDb();
        const barber = await Barber.create({
            name, email, phone,isActive:true, workingDays, workingHours, lunchBreak, services
        })
        return NextResponse.json(
            {message: "Barber Added Successfully", barber},
            {status:201})
    } catch (error) {
        console.error("error while adding barber",error);
        return NextResponse.json(
            {message:"Server Error"},
            {status:500}
        )
    }
}import connectDb from "@/lib/db";
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
}import connectDb from "@/lib/db"
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
}import authOptions from "@/lib/authOptions";
import { getServerSession } from "next-auth";

export async function GET(){
    try {
        const session = await getServerSession(authOptions)
        if(!session)
    } catch (error) {
        
    }
}import authOptions from "@/lib/authOptions";
import { getServerSession } from "next-auth";

export async function GET(){
    try {
        const session = await getServerSession(authOptions)
        if(!session)
    } catch (error) {
        
    }
}"use client";
  import { useEffect, useState } from "react";
  import { useCart } from "@/context/cartContext";
  import { PACKAGES } from "@/data/packages";
  import { useSearchParams } from "next/navigation";

  const page = () => {
    const searchParams = useSearchParams();
    const packageFromUrl = searchParams.get("package")
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const {cart, addToCart, removeFromCart, clearCart} = useCart();
    const [number, setNumber] = useState('')
    const [name, setName] = useState('')
    
    const [bookingDate, setBookingDate] = useState(new Date().toLocaleDateString("en-CA"))
    
    // NEW: State to hold available slots and a loading indicator
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)

    useEffect(()=>{
      if(!packageFromUrl) return;

    const selectedPackage = 
      PACKAGES[packageFromUrl as keyof typeof PACKAGES]
      if (!selectedPackage) return;

      addToCart({
        id: selectedPackage.id,
        name: selectedPackage.name,
        price:selectedPackage.price
      })
    },[packageFromUrl])

    // NEW: Fetch availability whenever the bookingDate changes
    useEffect(() => {
        const fetchAvailability = async () => {
          setIsLoadingSlots(true);
          try {
            const res = await fetch(`/api/availability?date=${bookingDate}`);
            const data = await res.json();
            if (data.success) {
              setAvailableSlots(data.availableSlots);
              // If the user previously selected a slot that is no longer available on this new date, deselect it
              if (selectedSlot && !data.availableSlots.includes(selectedSlot)) {
                setSelectedSlot(null);
              }
            } else {
              setAvailableSlots([]);
            }
          } catch (error) {
            console.error("Failed to fetch slots", error);
          }
          setIsLoadingSlots(false);
        };
  
        if (bookingDate) {
          fetchAvailability();
        }
      }, [bookingDate]);

    const timeSlots = [
      { label: "10:00 AM", value: "10:00" }, { label: "10:30 AM", value: "10:30" },
      { label: "11:00 AM", value: "11:00" }, { label: "11:30 AM", value: "11:30" },
      { label: "12:00 PM", value: "12:00" }, { label: "12:30 PM", value: "12:30" },
      { label: "01:00 PM", value: "13:00" }, { label: "01:30 PM", value: "13:30" },
      { label: "02:00 PM", value: "14:00" }, { label: "02:30 PM", value: "14:30" },
      { label: "03:00 PM", value: "15:00" }, { label: "03:30 PM", value: "15:30" },
      { label: "04:00 PM", value: "16:00" }, { label: "04:30 PM", value: "16:30" },
      { label: "05:00 PM", value: "17:00" }, { label: "05:30 PM", value: "17:30" },
      { label: "06:00 PM", value: "18:00" }, { label: "06:30 PM", value: "18:30" },
      { label: "07:00 PM", value: "19:00" }, { label: "07:30 PM", value: "19:30" },
      { label: "08:00 PM", value: "20:00" }, { label: "08:30 PM", value: "20:30" },
      { label: "09:00 PM", value: "21:00" }, { label: "09:30 PM", value: "21:30" },
    ];

    const totalPrice = cart.reduce((total, item)=>{
      return total + item.price
    },0)
    
    const handleConfirmBooking= async ()=>{
      if(!selectedSlot) return;
      const payload = {
        name,
        phone:number,
        date: bookingDate, 
        time: selectedSlot,
        items:cart.map((i)=>({
          id: i.id,
          name: i.name,
          price: i.price,
          type: i.type || "service",
        }))
      }
      try {
        const res = await fetch("/api/booking",{
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body: JSON.stringify(payload)
        })
        const result = await res.json();
            if (!res.ok) {
        throw new Error(result.message);
      }

      clearCart();
      setSelectedSlot(null); 
      setName("");
      setNumber("");
      
      // NEW: Refresh slots after a successful booking so the just-booked slot greys out
      const newAvailRes = await fetch(`/api/availability?date=${bookingDate}`);
      const newAvailData = await newAvailRes.json();
      if(newAvailData.success) setAvailableSlots(newAvailData.availableSlots);

      alert("Booking confirmed!");
      } catch (err) {
        alert(
          err instanceof Error ? err.message : "Something went wrong"
        );
      }
    };

    return (
      <div className="min-h-screen bg-neutral-900 px-[17%] py-[1.3%]">
        <div className="bg-graybg text-white min-h-[94vh] max-h-[94vh] overflow-y-auto rounded-2xl">
          {/* Header */}
          <div className="pt-14 pb-8 text-center">
            <h2 className="text-golden text-5xl font-bold tracking-widest">
              BOOK APPOINTMENT
            </h2>
            <p className="pt-3 tracking-wider">
              Professional grooming tailored to your schedule
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-2 px-10 gap-16 items-start">
            {/* LEFT COLUMN */}
            <div className="flex flex-col ">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  className="border w-full bg-black/40 border-white/30 py-3 pl-5 placeholder-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="tel"
                  placeholder="Number"
                  value={number}
                  onChange={(e)=>setNumber(e.target.value)}
                  className="border w-full bg-black/40 border-white/30 py-3 pl-5 placeholder-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="top-300 pt-7">
                <h4 className="pb-3 text-gray-400 uppercase">Select Date</h4>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toLocaleDateString("en-CA")} 
                  className="border border-white/40 p-3.5 bg-black/40 w-full focus:outline-none focus:border-amber-500 [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
               <div className="pt-7">
          <h4 className="pb-3 text-gray-400 uppercase ">Selected Service</h4>
          <div className="flex flex-col gap-3 h-[33vh] overflow-scroll ">
            {cart.map((ca,i)=>(
            <div key={i}
            className="text-white/80 flex justify-between text-xl ">
                <span> {i+1}. {ca.name}</span>
                <div>
                  <span className="text-golden">$ {ca.price}</span>
                  <button className="hover:cursor-pointer px-5 text-red-400 hover:text-red-500 transition-colors"
                  onClick={()=>removeFromCart(ca.id)}> - </button>
                </div>
              </div>
          )) }
          </div>
          <div className="flex justify-between px-3 py-2 text-xl font-semibold">
            <p className="text-golden ">Final Price</p>
            <p className="text-amber-500"> {totalPrice}</p>
          </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-10 text-gray-400">
              <div className="flex justify-between items-center">
                  <h4>3. Preferred Time</h4>
                  {isLoadingSlots && <span className="text-xs text-amber-500 animate-pulse">Checking Availability...</span>}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const isAvailable = availableSlots.includes(slot.value);
                  const isSelected = selectedSlot === slot.value;
                  
                  return (
                    <button
                      key={slot.value}
                      onClick={() => isAvailable && setSelectedSlot(slot.value)}
                      disabled={!isAvailable || isLoadingSlots}
                      className={`px-3 py-3 font-semibold border transition-all
                        ${isSelected
                          ? "bg-amber-500 text-black border-amber-500 scale-95"
                          : !isAvailable || isLoadingSlots
                          ? "border-white/10 text-white/20 bg-black/20 cursor-not-allowed" // Greyed out styling!
                          : "border-white/30 hover:border-amber-400 text-white"
                        }
                      `}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>

              <button
               onClick={handleConfirmBooking}
                disabled={!selectedSlot || !name.trim() || !number.trim() || cart.length === 0}
                className="bg-amber-600 py-4 font-semibold tracking-wider text-white/80 text-xl
                  disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 hover:cursor-pointer transition-all"
              >
                CONFIRM BOOKING
              </button>
            </div>

            {/* FULL WIDTH BOOKING POLICY */}
            <div className="col-span-2 border-dashed border border-gray-400 py-6 px-8 rounded-md mt-6 mb-10">
              <h4 className="text-golden font-bold text-lg pb-3 text-center tracking-wider">
                Booking Policy
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed text-center max-w-3xl mx-auto">
                Please arrive at least 5 minutes before your scheduled time.
                Cancellations must be made a minimum of 24 hours in advance. Late
                arrivals may result in reduced service time.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    );
  };

  export default page;'use client'
import { MdCancel } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import React, { useState } from 'react'
import { service } from "@/data/services";
import axios from "axios";

const AddNewBarber =  () => {
    const [barberName, setBarberName] = useState("")
    const [barberPhoneNumber, setBarberPhoneNumber] = useState("")
    const [barberEmail, setBarberEmail] = useState("")
    const [addBarber, setAddBarber] = useState(false)
    const [workingDays, setWorkingDays] = useState<string[]>([])
    const [startingTime, setStartingTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [breakStart, setBreakStart] = useState("")
    const [breakEnd, setBreakEnd] = useState("")

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const [selectedServices,setSelectedServices] = useState<string[]>([])
    const allServicesSelected = selectedServices.length === service.length
    
    const toggleAllServices =()=>{
      setSelectedServices( allServicesSelected ? []: service.map(s =>s.id))
    }
    const toggleService = (id:string)=>{
      setSelectedServices(prev=> prev.includes(id)? prev.filter(s=> s !== id) : [...prev,id])
    }
    const toggleDays =(day:string)=>{
      setWorkingDays((prev)=>!prev.includes(day)
    ? [...prev,day]
    : prev.filter((d)=> d !== day))
    }

    const handleSubmit= async (e:React.FormEvent)=>{
      e.preventDefault()
      if(!barberName || !barberEmail || !barberPhoneNumber || workingDays.length === 0 || !startingTime || !breakStart || !breakEnd || !endTime || selectedServices.length===0  ){
        alert("Please fill all the fields")
        return;
      }
      try {
        let res = await axios.post("/api/barbers",{
        name: barberName,
        email: barberEmail,
        phone: barberPhoneNumber,
        workingDays,
        workingHours: {
          start: startingTime,
          end: endTime,
        },
        lunchBreak:{
          start: breakStart,
          end: breakEnd,
        },
        services:selectedServices
      })
      alert("Congrats, Barber added Successfully")
      setBarberEmail("");
      setBarberName("");
      setBarberPhoneNumber("");
      setWorkingDays([]);
      setStartingTime("");
      setEndTime("");
      setSelectedServices([]);
      setBreakStart("");
      setBreakEnd("");
      setAddBarber(false)                
      } catch (error:any) {
        alert(error.response?.data?.message || "Something Went wrong")                
      }
    }
       
  return (<>
        <div className='relative'>   
          <button onClick={()=>setAddBarber(true)}
          className='text-golden flex items-center gap-2 hover:cursor-pointer active:scale-90'>
            <p>Add New Barber</p><FaPlus />
          </button>
        </div>

        {addBarber && (
            <div className="fixed inset-0 bg-neutral-800 flex flex-col itmes-center m-10 overflow-y-auto no-scrollbar">
                <div className="flex justify-end p-5 w-full ">
                    <MdCancel onClick={()=>setAddBarber(false)}
                    className="bg-white rounded-full hover:cursor-pointer active:scale-90 text-red-700" size={35}/>
                    </div>
                    <div className="flex justify-center text-4xl font-semibold pb-10">Add New Barber</div>
                    <form onSubmit={handleSubmit} className="px-20 pb-15 gap-15">
                      <div className="grid grid-cols-3 py-10 gap-15">
                        <div className="flex flex-col gap-5 bg-transparent">
                           <label > Barber Name: </label>
                            <input 
                            value={barberName}
                            onChange={(e)=>setBarberName(e.target.value)}
                            id="barberName"
                            type="text"
                            placeholder="Barber Name" 
                            className="border-b border-white  focus:outline-none"
                        />
                        </div>
                        <div className="flex flex-col gap-5 bg-transparent">
                           <label> Email: </label>
                            <input 
                            value={barberEmail}
                            onChange={(e)=>setBarberEmail(e.target.value)}
                            id="barberEmail"
                            type="text"
                            placeholder="Barber's Email" 
                            className="border-b border-white flex-1 focus:outline-none"
                        />
                        </div>
                        <div className="flex flex-col gap-5 bg-transparent">
                           <label> Barber Phone Number: </label>
                            <input 
                            value={barberPhoneNumber}
                            onChange={(e)=>setBarberPhoneNumber(e.target.value)}
                            id="barberPhoneName"
                            type="tel"
                            placeholder="Barber Phone Number" 
                            className="border-b border-white flex-1 focus:outline-none"
                        />
                        </div>
                        
                        </div>

                        
                       <div  className="flex flex-col gap-10">
                        {/* Working Days  */}
                        <div className="flex items-center gap-10">
                          <h3 className="text-xl min-w-fit">Working Days:</h3>
                        {days.map((day)=>(
                          <button
                          type="button"
                          onClick={()=>toggleDays(day)}
                          key={day}
                          className={`px-6 py-2 border rounded-full m-2 hover:cursor-pointer active:scale-95
                          ${workingDays.includes(day)? "bg-green-900 text-white font-semibold":"bg-white text-black"}`}>
                            {day}

                          </button>
                        ))}
                        
                       </div>
                       {/* services */}
                       <div className="flex  items-start  ">
                        <h3 className="text-xl min-w-fit tracking-wider">Services :</h3>
                        {/* to select/deselect all services */}
                        <div className="flex-wrap flex items-start ml-10 gap-6">
                        <button
                        type="button"
                        onClick={toggleAllServices}
                        className={`border rounded-4xl px-4 py-2 hover:cursor-pointer active:scale-95
                          ${allServicesSelected? "bg-golden text-white": "bg-goldenbg text-white"}`}
                        >
                          {allServicesSelected ? "Clear all Services":" Select all Services"}
                        </button>
                        {/* single service  */}
                         {service.map(s => (
                          <label key={s.id}
                          className={`border flex  px-4 py-2 gap-8 rounded-4xl 
                          ${selectedServices.includes(s.id) ? "bg-green-800 font-bold text-white": ""}`}>
                            <button
                            key={s.id}
                            type="button" 
                            onClick={()=>toggleService(s.id)}
                            >  {s.name}
                            </button>
                          </label>
                         ))}
                        </div>
                       </div>
                       {/* working hours  and lunch break*/}
                       <div className="flex items-start pt-10 gap-10">
                        {/* working hours */}
                       <div className="flex">
                         <h3 className="text-xl font-bold min-w-fit pt-2">Working Hours:</h3>

                       <div className="ml-10 gap-4 flex flex-col">
                       
                        <div className="flex items-center gap-4 text-xl ">
                          <p>Starting Hours : </p>
                          <input type="time"
                          value={startingTime}
                          onChange={(e)=> setStartingTime(e.target.value)}
                          className="border pl-4 py-2 pr-2 rounded-xl hover:cursor-pointer bg-gray-800 text-white font-semibold" />
                        </div>
                        <div className="flex items-center gap-4 text-xl">
                          <p>Ending Hours :</p>
                          <input type="time" 
                          value={endTime}
                          onChange={(e)=>setEndTime(e.target.value)}
                          className="border ml-1.5 pl-4 py-2 pr-2 rounded-xl hover:cursor-pointer bg-gray-800 text-white font-semibold"
                          />
                        </div>

                       </div>
                       </div>
                       {/* lunch break */}
                       <div className="flex items-start">
                        
                        <h3 className="text-xl font-bold min-w-fit pt-2">Lunch Break :</h3>

                       <div className="ml-10 gap-4 flex flex-col">
                       
                        <div className="flex items-center gap-4 text-xl ">
                          <p>Lunch Starts : </p>
                          <input type="time"
                          value={breakStart}
                          onChange={(e)=> setBreakStart(e.target.value)}
                          className="border pl-4 py-2 pr-2 rounded-xl hover:cursor-pointer bg-gray-800 text-white font-semibold" />
                        </div>
                        <div className="flex items-center gap-4 text-xl">
                          <p>Lunch Ends :</p>
                          <input type="time" 
                          value={breakEnd}
                          onChange={(e)=>setBreakEnd(e.target.value)}
                          className="border ml-1.5 pl-4 py-2 pr-2 rounded-xl hover:cursor-pointer bg-gray-800 text-white font-semibold"
                          />
                        </div>

                       </div>
                       </div>
                       </div>
                       
                       {/* Lunch Hours */}
                        
                       </div>

                        <div className="justify-center flex mt-20">
                          
                    <button type="submit"
                    className="border px-10 py-3 rounded-full text-xl bg-green-900 font-semibold active:scale-95 hover:cursor-pointer">
                      Submit
                    </button>
                        </div>
                    </form>
            </div>
          )}
          </>
    
  )
}

export default AddNewBarber'use client'

import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import BookingModal from "./bookingModel" // Adjust import path if needed
import BarberGrid from "./BarberGrid"     // Adjust import path if needed

type ValuePiece = Date | null
type date = ValuePiece | [ValuePiece, ValuePiece]

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState<date>(new Date())
  const [bookings, setBookings] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{ barber: any, time: string, booking?: any } | null>(null)
  const [newBooking, setNewBooking] = useState({ customerName: '', service: '', contact: '' })

  useEffect(() => {
    if (selectedDate instanceof Date) {
      const offset = selectedDate.getTimezoneOffset()
      const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000))
      fetchbookings(localDate.toISOString().split("T")[0])
    }
  }, [selectedDate])

  const fetchbookings = async (dateStr: string) => {
    try {
      const res = await fetch(`/api/admin/bookings?date=${dateStr}`)
      const data = await res.json()
      if (data.success) {
        setBookings(data.bookings)
        setBarbers(data.barbers)
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error)
    }
  }

  const handleAction = async (action: 'cancel' | 'add') => {
    if (!selectedSlot) return;
    
    let dateStr = "";
    if (selectedDate instanceof Date) {
      const offset = selectedDate.getTimezoneOffset()
      const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000))
      dateStr = localDate.toISOString().split("T")[0]
    }
    
    let res;
    if (action === 'cancel') {
      const reason = prompt("Enter reason for cancellation (optional):") || "Cancelled by Admin";
      res = await fetch(`/api/admin/bookings/${selectedSlot.booking._id}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
    } else if (action === 'add') {
      res = await fetch(`/api/admin/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBooking,
          barberId: selectedSlot.barber._id,
          time: selectedSlot.time,
          date: dateStr
        })
      });
    }

    const data = await res?.json();
    if (data?.success) {
      fetchbookings(dateStr);
      setSelectedSlot(null);
      setNewBooking({ customerName: '', service: '', contact: '' });
    } else {
      alert("Action failed: " + data?.message);
    }
  }

  const bookingMap = bookings.reduce((acc: any, booking: any) => {
    const barberId = booking.barberId?._id || booking.barberId
    const key = `${barberId}-${booking.time}`
    acc[key] = booking
    return acc
  }, {})

  return (
    <div className="flex flex-col items-center w-full px-4 md:px-8  bg-neutral-900 min-h-screen">
      <div className="w-full max-w-4xl rounded-2xl bg-neutral-800 p-6  shadow-xl">
        
        <div className="custom-dark-calendar">
          <Calendar
            onChange={(val) => setSelectedDate(val as date)}
            value={selectedDate}
            showNeighboringMonth={false}
            next2Label={null}
            prev2Label={null}
          />
        </div>

        <div className="mt-6 flex justify-between items-center bg-neutral-700/50 p-4 rounded-lg">
          <span className="text-neutral-300 font-medium">
            📅 {selectedDate instanceof Date ? selectedDate.toDateString() : "None"}
          </span>
          <span className="bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold">
            {bookings.length} Bookings
          </span>
        </div>

        {/* REPLACED LARGE CHUNK WITH ONE LINE */}
        <BarberGrid 
          barbers={barbers} 
          bookingMap={bookingMap} 
          selectedDate={selectedDate}
          onSlotClick={(barber, time, booking) => setSelectedSlot({ barber, time, booking })} 
        />
      </div>

      {/* REPLACED LARGE CHUNK WITH ONE LINE */}
      <BookingModal 
        selectedSlot={selectedSlot}
        newBooking={newBooking}
        setNewBooking={setNewBooking}
        onAction={handleAction}
        onClose={() => setSelectedSlot(null)}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-dark-calendar .react-calendar { width: 100%; background: transparent; border: none; font-family: inherit; }
        .custom-dark-calendar .react-calendar__navigation { display: flex; margin-bottom: 1rem; }
        .custom-dark-calendar .react-calendar__navigation button { color: white; min-width: 44px; background: transparent; font-size: 1.125rem; font-weight: 600; }
        .custom-dark-calendar .react-calendar__navigation button:enabled:hover { background-color: #404040; border-radius: 8px; }
        .custom-dark-calendar .react-calendar__month-view__weekdays { color: #a3a3a3; text-transform: uppercase; font-size: 0.75rem; text-align: center; }
        .custom-dark-calendar .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; }
        .custom-dark-calendar .react-calendar__tile { color: #e5e5e5; padding: 1rem; border-radius: 8px; margin-top: 4px; }
        .custom-dark-calendar .react-calendar__tile:enabled:hover { background-color: #404040; }
        .custom-dark-calendar .react-calendar__tile--now { background-color: #2563eb; color: white; }
        .custom-dark-calendar .react-calendar__tile--active { background-color: #f59e0b !important; color: black !important; font-weight: bold; }
      `}} />
    </div>
  )
}


// 'use client'

// import Booking from "@/model/booking.model"
// import { useState } from "react"
// import Calendar from "react-calendar"
// import "react-calendar/dist/Calendar.css"

// type ValuePiece = Date | null
// type date = ValuePiece | [ValuePiece, ValuePiece]//either one date or [startdate, end date] but the range is not true so only one date will be used but the range here so typescript won't throw error

// export default function AdminCalendar() {
//   const [selectedDate, setSelectedDate] = useState<date>(new Date())
//   const [bookings, setBookings] = useState<any[]>([])
//   const [barbers, setBarbers] = useState<any[]>([])

//   const timeSlots = [
//   "10:00","10:30","11:00","11:30",
//   "12:00","12:30","13:00","13:30",
//   "14:00","14:30","15:00","15:30",
//   "16:00","16:30","17:00","17:30",
//   "18:00","18:30","19:00","19:30",
//   "20:00","20:30","21:00","21:30"
// ]

//   const handleDateClick = (value: date) => {
//     setSelectedDate(value)

//     if (value instanceof Date) {
//       const formatted = value.toISOString().split("T")[0]
//       fetchbookings(formatted)
//     }
//   }
//   const fetchbookings = async(date:string)=>{
//     try {
//       const res = await fetch(`/api/admin/bookings?date=${date}`)
//       const data = await res.json()
//       if(data.success){
//         setBookings(data.bookings)
//         setBarbers(data.barbers)
//       }
//     } catch (error) {
//       console.error("Failed to fetch bookings", error)
//     }
//   }
//   const bookingMap = bookings.reduce((acc:any,booking:any)=>{
//     const key =`${booking.barberId._}-${booking.time}`
//     acc[key] = booking
//     return acc
//   },{})

//   return (
//     <div className="flex w-full justify-center px-8">
//       <div className="rounded-2xl bg-neutral-800 p-6 shadow-xl">
        
//         {/* The wrapper class limits our custom styles to just this calendar */}
//         <div className="custom-dark-calendar">
//           <Calendar
//             onChange={handleDateClick}
//             value={selectedDate}
//             showNeighboringMonth={false} // Hides next/prev month days
//             next2Label={null} // Removes '>>'
//             prev2Label={null} // Removes '<<'
//           />
//         </div>

//         <div className="mt-6 rounded-lg bg-neutral-700/50 p-3 text-center text-sm font-medium text-neutral-300">
//           Selected: {selectedDate instanceof Date ? selectedDate.toDateString() : "None"}
//         </div>
//         <div className="mt-4 text-center text-white">
//           Total Bookings: {bookings.length}
//         </div>
//         <div className="mt-10">
//   {barbers.map((barber:any) => (
//     <div key={barber._id} className="mb-6">

//       <h3 className="text-lg text-white mb-2 font-semibold">
//         {barber.name}
//       </h3>

//       <div className="grid grid-cols-6 gap-2">

//         {timeSlots.map(slot => {

//           const booking = bookingMap[`${barber._id}-${slot}`]

//           return (
//             <div
//               key={slot}
//               className={`p-2 text-center rounded text-sm
//                 ${booking
//                   ? "bg-red-600 text-white"
//                   : "bg-green-600 text-white"}
//               `}
//             >
//               {slot}
//             </div>
//           )
//         })}

//       </div>

//     </div>
//   ))}
// </div>
//       </div>

//       {/* Injecting standard CSS directly into the component.
//         This uses exact Tailwind hex colors for seamless integration.
//       */}
//       <style dangerouslySetInnerHTML={{ __html: `
//         .custom-dark-calendar .react-calendar {
//           width: 100%;
//           background: transparent;
//           border: none;
//           font-family: inherit;
//         }
        
//         /* Header Navigation */
//         .custom-dark-calendar .react-calendar__navigation {
//           display: flex;
//           margin-bottom: 1rem;
//           gap: 0.25rem;
//         }
//         .custom-dark-calendar .react-calendar__navigation button {
//           color: white;
//           min-width: 44px;
//           background: transparent;
//           border-radius: 0.5rem;
//           padding: 0.5rem;
//           font-size: 1.125rem;
//           font-weight: 600;
//           transition: background-color 0.2s;
//         }
//         .custom-dark-calendar .react-calendar__navigation button:enabled:hover,
//         .custom-dark-calendar .react-calendar__navigation button:enabled:focus {
//           background-color: #404040; /* neutral-700 */
//         }
        
//         /* Weekdays (Sun, Mon, Tue) */
//         .custom-dark-calendar .react-calendar__month-view__weekdays {
//           color: #a3a3a3; /* neutral-400 */
//           font-weight: 500;
//           text-transform: uppercase;
//           font-size: 0.75rem;
//           margin-bottom: 0.75rem;
//           text-align: center;
//         }
//         .custom-dark-calendar .react-calendar__month-view__weekdays__weekday abbr {
//           text-decoration: none;
//         }
        
//         /* Day Tiles */
//         .custom-dark-calendar .react-calendar__tile {
//           color: #e5e5e5; /* neutral-200 */
//           background: transparent;
//           border-radius: 0.5rem;
//           padding: 0.75rem;
//           transition: all 0.2s;
//           outline: none;
//           margin-top: 0.25rem;
//         }
//         .custom-dark-calendar .react-calendar__tile:enabled:hover,
//         .custom-dark-calendar .react-calendar__tile:enabled:focus {
//           background-color: #404040; /* neutral-700 */
//         }
        
//         /* Today's Date (Blue) */
//         .custom-dark-calendar .react-calendar__tile--now {
//           background-color: #2563eb; /* blue-600 */
//           color: white;
//           font-weight: bold;
//         }
//         .custom-dark-calendar .react-calendar__tile--now:enabled:hover,
//         .custom-dark-calendar .react-calendar__tile--now:enabled:focus {
//           background-color: #3b82f6; /* blue-500 */
//         }
        
//         /* Selected Date (Amber) */
//         .custom-dark-calendar .react-calendar__tile--active,
//         .custom-dark-calendar .react-calendar__tile--hasActive {
//           background-color: #f59e0b !important; /* amber-500 */
//           color: black !important;
//           font-weight: bold;
//           box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
//         }
//         .custom-dark-calendar .react-calendar__tile--active:enabled:hover,
//         .custom-dark-calendar .react-calendar__tile--active:enabled:focus {
//           background-color: #fbbf24 !important; /* amber-400 */
//         }
//       `}} />
//     </div>
//   )
// }'use client'

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
}'use client'
import { useState } from "react"
import { MdDeleteForever, MdEventBusy, MdFormatListBulleted, MdEmail, MdPhone } from "react-icons/md"; // Added Email and Phone icons
import AddNewBarber from "./AddNewBarber";

const BarberListShow = ({initialBarbers}:any) => {
  const [barbers, setBarbers] = useState(initialBarbers)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<any>(null)
  const [undoItem, setUndoItem] = useState<any>(null)
  const [leaveModel, setLeaveModel] = useState<any>(null)
  const [viewLeavesModel, setViewLeavesModel] = useState<any>(null) 
  const [leaveData, setLeaveData] = useState({startDate:"", endDate:"", fullDay:true, start:"",end:"",reason:""})
  
  const handleDeleteClick = (barber:any)=>{
    setPendingDelete(barber)
    setShowConfirm(true)
  }

  const confirmDelete = ()=>{
    setShowConfirm(false)
    setBarbers((prev:any)=>prev.map((b:any)=>b._id === pendingDelete._id ? {...b, isDeleted:true} : b))
    
    const timer = setTimeout(()=>{
      deleteFromDatabase(pendingDelete._id)
      setUndoItem(null)
    },10000)
    setUndoItem({...pendingDelete, timer})
  }

  const undoDelete =()=>{
    clearTimeout(undoItem.timer)
    setBarbers((prev:any) =>prev.map((b:any)=>b._id === undoItem._id ? {...b, isDeleted:false} : b))
    setUndoItem(null)
  }
  
const deleteFromDatabase = async(id:string) =>{
  await fetch("/api/delete-barber",{
    method:"DELETE",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({id})
  })
}

const toggleActiveStatus = async(id:string, currentStatus:boolean) =>{
  const newStatus = currentStatus === false ? true:false
  setBarbers((prev:any)=>prev.map((b:any)=>b._id === id? {...b, isActive:newStatus} :b))
  try {
    const res = await fetch(`/api/barbers/${id}/status`,{
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({isActive:newStatus})
    })
    const data = await res.json()
    if(!data.success){
      setBarbers((prev:any)=>prev.map((b:any)=>b._id === id? {...b, isActive:currentStatus}:b));
      alert("Failed to update Status. Please try again")
    }
  } catch (error:any) {
    setBarbers((prev:any)=>prev.map((b:any)=>b._id === id? {...b, isActive:currentStatus}:b ))
    console.error("Failed to change Barber Status",error)
  }
}

const handleScheduleLeave = async()=>{
  if(!leaveData.startDate) return alert("Start Date is required")
  const payload = {
    ...leaveData,
    endDate:leaveData.endDate|| leaveData.startDate
  }
  try {
    const res = await fetch(`/api/barbers/${leaveModel._id}/leave`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const data = await res.json()
    if(data.success){
      alert(`Leave scheduled! Auto-cancelled ${data.cancelledCount} existing appointments.`);
      
      const newLeaveObj = { ...payload, _id: Math.random().toString() };
      setBarbers((prev:any) => prev.map((b:any) => b._id === leaveModel._id ? {...b, timeOff: [...(b.timeOff || []), newLeaveObj]} : b));
      
      setLeaveModel(null);
      setLeaveData({startDate:"", endDate:"", fullDay:true, start:"",end:"",reason:""}); 
    } else {
      alert("Error: " + data.message);
    }
    
  } catch (error) {
    alert("Failed to schedule leave");    
  }
}

const handleRemoveLeave = async (barberId: string, leaveId: string) => {
    setBarbers((prev:any) => prev.map((b:any) => b._id === barberId ? {...b, timeOff: b.timeOff.filter((l:any) => l._id !== leaveId)} : b));
    setViewLeavesModel((prev:any) => ({...prev, timeOff: prev.timeOff.filter((l:any) => l._id !== leaveId)}));

    try {
        const res = await fetch(`/api/barbers/${barberId}/leave`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ leaveId })
        });
        const data = await res.json();
        if(!data.success) {
            alert("Failed to remove leave from database.");
        }
    } catch (error) {
        console.error("Failed to remove leave", error);
    }
}

  return (
   <>
    <div className="border border-neutral-700/50 rounded-2xl overflow-hidden shadow-2xl ml-4 bg-[#0F172A]">
      <div className="flex justify-center py-8 tracking-wider font-bold text-4xl text-amber-500 bg-neutral-900/50 border-b border-neutral-800">
          Our Barbers
      </div>
      
      {barbers.length === 0 ? (
       <div className="py-12 px-6 flex flex-col items-center justify-center gap-6">
         <p className="text-gray-400 text-xl">No barbers added yet.</p> 
         <AddNewBarber/>
       </div>
      ) : (
        <div className="min-h-126 py-8 px-6">
            <div className="flex justify-end pb-8 pr-2">
                <AddNewBarber/>
            </div>            
            
            <div className="flex flex-col gap-6">
            {barbers.map((barber:any, index:number)=>(
                <div key={barber._id} className="bg-neutral-800/40 hover:bg-neutral-800/80 transition-all duration-300 border border-neutral-700 rounded-2xl p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-lg group">
                    
                    {/* LEFT SIDE: Info */}
                    <div className="flex gap-6 items-center">
                        {/* Avatar / Initial */}
                        <div className="flex items-center justify-center min-w-[60px] h-[60px] bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-full text-2xl font-bold shadow-md">
                            {barber.name ? barber.name.charAt(0).toUpperCase() : "?"}
                        </div>

                        {barber.isDeleted ? (
                            <div className="flex items-center gap-6">
                                <p className="text-red-400 font-semibold text-lg">Barber Deleted</p>
                                <button className="text-blue-400 text-sm underline hover:text-blue-300 transition-colors" onClick={undoDelete}>Undo Delete</button>
                            </div>
                        ):(
                            <div className="flex flex-col gap-1">
                                <p className="text-2xl font-bold text-gray-100 tracking-wide">{barber.name}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1 text-sm text-gray-400 font-medium">
                                    <span className="flex items-center gap-2"><MdEmail className="text-gray-500" size={16}/> {barber.email}</span>
                                    <span className="flex items-center gap-2"><MdPhone className="text-gray-500" size={16}/> {barber.phone}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE: Buttons */}
                    {!barber.isDeleted && (
                    <div className="flex flex-wrap gap-3 items-center pt-4 xl:pt-0 border-t border-neutral-700 xl:border-none">
                        
                        <button onClick={()=>setViewLeavesModel(barber)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-purple-300 bg-purple-900/30 hover:bg-purple-600 hover:text-white transition-all border border-purple-800/50">
                            <MdFormatListBulleted size={18} /> Leaves
                        </button>

                        <button onClick={()=>setLeaveModel(barber)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-300 bg-blue-900/30 hover:bg-blue-600 hover:text-white transition-all border border-blue-800/50">
                            <MdEventBusy size={18} /> Time Off
                        </button>

                        <button
                            onClick={()=>toggleActiveStatus(barber._id, barber.isActive)}
                            className={`flex items-center justify-center min-w-[100px] px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                                barber.isActive === false 
                                ? "bg-red-900/30 text-red-300 border-red-800/50 hover:bg-red-600 hover:text-white"
                                : "bg-emerald-900/30 text-emerald-300 border-emerald-800/50 hover:bg-emerald-600 hover:text-white"
                            }`}>
                            {barber.isActive === false ? "On Leave" : "Active"}
                        </button>

                        <button 
                            onClick={()=>handleDeleteClick(barber)}
                            className="p-2 ml-1 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all border border-transparent hover:border-red-600 group-hover:opacity-100">
                            <MdDeleteForever size={24} />
                        </button>
                    </div>
                    )}
                </div>
            ))}
            </div>
        </div>
    )}

    {/* VIEW LEAVES MODAL */}
    {viewLeavesModel && (
        <div className="flex fixed inset-0 bg-black/80 backdrop-blur-sm z-50 items-center justify-center p-4">
            <div className="bg-gray-900 p-8 rounded-3xl flex flex-col gap-6 border border-gray-700 w-full max-w-lg shadow-2xl max-h-[80vh]">
                <h3 className="text-2xl font-semibold text-amber-500 tracking-wider border-b border-gray-700 pb-4">
                    Scheduled Leaves: {viewLeavesModel.name}
                </h3>
                
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                    {(!viewLeavesModel.timeOff || viewLeavesModel.timeOff.length === 0) ? (
                        <p className="text-gray-400 text-center py-6">No leaves scheduled.</p>
                    ) : (
                        viewLeavesModel.timeOff.map((leave: any, i: number) => (
                            <div key={leave._id || i} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <p className="text-white font-medium">
                                        {leave.startDate} {leave.startDate !== leave.endDate && `to ${leave.endDate}`}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {leave.fullDay ? "Full Day" : `${leave.start} - ${leave.end}`}
                                    </p>
                                    {leave.reason && <p className="text-xs text-amber-500 mt-1">Reason: {leave.reason}</p>}
                                </div>
                                <button 
                                    onClick={() => handleRemoveLeave(viewLeavesModel._id, leave._id)}
                                    className="bg-red-900/50 text-red-400 p-2 rounded-lg hover:bg-red-900 hover:text-white transition-colors cursor-pointer active:scale-95"
                                    title="Remove Leave"
                                >
                                    <MdDeleteForever size={24} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
                    <button className="bg-neutral-700 text-white rounded-xl py-2 px-6 font-semibold hover:bg-neutral-600 cursor-pointer active:scale-95 transition-all" 
                            onClick={() => setViewLeavesModel(null)}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* SCHEDULE LEAVE MODAL */}
    {leaveModel && (
        <div className="flex fixed inset-0 bg-black/80 backdrop-blur-sm z-50 items-center justify-center p-4">
            <div className="bg-gray-900 p-10 rounded-3xl flex flex-col gap-6 border border-gray-700 w-full max-w-lg shadow-2xl">
                <h3 className="text-3xl font-semibold text-amber-500 tracking-wider">Schedule Leave: {leaveModel.name}</h3>
                
                <div className="flex gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-gray-400 text-sm tracking-wide">Start Date</label>
                        <input type="date" className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500/50"
                               value={leaveData.startDate} onChange={(e) => setLeaveData({...leaveData, startDate: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-gray-400 text-sm tracking-wide">End Date (Optional)</label>
                        <input type="date" className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500/50"
                               value={leaveData.endDate} onChange={(e) => setLeaveData({...leaveData, endDate: e.target.value})} />
                    </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                    <input type="checkbox" id="fullday" className="w-5 h-5 accent-amber-500" 
                           checked={leaveData.fullDay} onChange={(e) => setLeaveData({...leaveData, fullDay: e.target.checked})} />
                    <label htmlFor="fullday" className="text-gray-300 font-medium tracking-wide">Full Day Off</label>
                </div>

                {!leaveData.fullDay && (
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-gray-400 text-sm tracking-wide">Start Time</label>
                            <input type="time" className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500/50"
                                   value={leaveData.start} onChange={(e) => setLeaveData({...leaveData, start: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-gray-400 text-sm tracking-wide">End Time</label>
                            <input type="time" className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500/50"
                                   value={leaveData.end} onChange={(e) => setLeaveData({...leaveData, end: e.target.value})} />
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-sm tracking-wide">Reason (Optional)</label>
                    <input type="text" placeholder="e.g. Sick Leave, Doctor Appt" className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500/50"
                           value={leaveData.reason} onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})} />
                </div>

                <div className="flex gap-6 mt-6">
                    <button className="flex-1 bg-emerald-900 border border-emerald-700 text-white rounded-2xl py-3 font-semibold text-lg hover:bg-emerald-800 active:scale-95 transition-all cursor-pointer" onClick={handleScheduleLeave}>
                        Confirm Leave
                    </button>
                    <button className="flex-1 bg-red-900 border border-red-700 text-white rounded-2xl py-3 font-semibold text-lg hover:bg-red-800 active:scale-95 transition-all cursor-pointer" onClick={() => setLeaveModel(null)}>
                        Cancel
                    </button>
                </div>
                <p className="text-sm text-red-400 text-center tracking-wide">Warning: This will automatically cancel existing appointments during this time.</p>
            </div>
        </div>
    )}
    
    {showConfirm && (
      <div className="flex fixed inset-0 bg-black/80 backdrop-blur-sm items-center justify-center z-50 p-4">
        <div className="bg-gray-900 p-10 rounded-3xl flex flex-col gap-6 border border-gray-700 w-full max-w-md shadow-2xl text-center">
            <p className="text-2xl font-semibold text-white">Do you want to remove <br/><b className="text-amber-500 capitalize">{pendingDelete?.name}</b>?</p>
            <div className="text-lg font-bold flex gap-4 mt-4">
            <button className="flex-1 rounded-xl bg-neutral-800 text-white border border-neutral-700 py-3 hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer" onClick={()=>setShowConfirm(false)}>Cancel</button>
            <button className="flex-1 rounded-xl bg-red-600 text-white py-3 hover:bg-red-500 active:scale-95 transition-all cursor-pointer shadow-lg shadow-red-900/50" onClick={confirmDelete}>Delete</button>
            </div> 
        </div>
      </div>
    )}
    </div>
   </>
  )
}
export default BarberListShow'use client'

import { PACKAGES } from "@/data/packages"
import { service } from "@/data/services"

export default function BookingModal({
  selectedSlot,
  newBooking,
  setNewBooking,
  onAction,
  onClose
}: {
  selectedSlot: any;
  newBooking: any;
  setNewBooking: (data: any) => void;
  onAction: (action: 'cancel' | 'add') => void;
  onClose: () => void;
}) {
  if (!selectedSlot) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-2xl max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-1">{selectedSlot.time} Slot</h2>
        <p className="text-neutral-400 mb-6">Barber: {selectedSlot.barber.name}</p>

        {selectedSlot.booking ? (
          <div className="space-y-4">
            <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-700">
              <p className="text-sm text-neutral-400">Customer</p>
              <p className="text-white font-semibold text-lg">{selectedSlot.booking.name || "Unknown"}</p>
              <p className="text-amber-500 text-sm">{selectedSlot.booking.phone || 'No contact info'}</p>
              
              <div className="mt-3 pt-3 border-t border-neutral-800">
                <p className="text-sm text-neutral-400">Service(s)</p>
                <p className="text-white">
                  {selectedSlot.booking.items && selectedSlot.booking.items.length > 0 
                    ? selectedSlot.booking.items.map((item: any) => item.name).join(", ") 
                    : "Standard Service"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => onAction('cancel')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold transition-colors">
                Cancel Booking
              </button>
              <button 
                onClick={onClose}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-lg font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-emerald-500 text-sm font-medium">Add Manual Booking:</p>
            
            <input 
              type="text" placeholder="Customer Name" 
              value={newBooking.customerName}
              className="w-full bg-neutral-900 border border-neutral-700 p-2 rounded text-white"
              onChange={(e) => setNewBooking({...newBooking, customerName: e.target.value})}
            />
            
            <select 
              className="w-full bg-neutral-900 border border-neutral-700 p-2 rounded text-white"
              value={newBooking.service}
              onChange={(e) => setNewBooking({...newBooking, service: e.target.value})}
            >
              <option value="">Select a Service</option>
              <optgroup label="Packages">
                 {Object.values(PACKAGES || {}).map(pkg => (
                   <option key={pkg.id} value={pkg.name}>{pkg.name} - ${pkg.price}</option>
                 ))}
              </optgroup>
              <optgroup label="Individual Services">
                 {(service || []).map(s => (
                   <option key={s.id} value={s.name}>{s.name} - ${s.price}</option>
                 ))}
              </optgroup>
            </select>

            <input 
              type="text" placeholder="Phone Number" 
              value={newBooking.contact}
              className="w-full bg-neutral-900 border border-neutral-700 p-2 rounded text-white"
              onChange={(e) => setNewBooking({...newBooking, contact: e.target.value})}
            />
            
            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => onAction('add')}
                disabled={!newBooking.customerName || !newBooking.service || !newBooking.contact}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-600 disabled:text-neutral-400 text-white py-2 rounded-lg font-bold">
                Confirm Booking
              </button>
              <button onClick={onClose} className="flex-1 text-neutral-400">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}import ShowBarber from '@/app/dashboard/adminDashboard/ShowBarber'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminCalendar from './AdminCalendar'
const page = async() => {
 
   const session = await auth()
   if(!session || session.user.role !== "ADMIN"){
    redirect ('/dashboard/userDashboard')
   }
  return (
    <div className='min-h-screen bg-neutral-900 '>
     <div className='flex items-center justify-between px-20 text-golden/80 bg-neutral-800'>
       <h4 className='text-4xl font-semibold flex justify-center py-5 '>Admin Dashboard</h4>
      <div className='flex gap-10 tracking-wide'>
        <span>
          Name : {session.user.name}
        </span>
        <span>
          Email : {session.user.email}
        </span>
      </div>
     </div>
     <div className='flex flex-col '>
       <div className=' flex flex-col '>
        <div className=' flex  py-15 justify-center text-4xl font-semibold tracking-wider'>Barbers</div>
      <div className="flex flex-col mx-30 gap-4 ">
            <ShowBarber/>
          </div>
      </div>
      <div className='flex flex-col '>
      <div className=' flex py-15 justify-center text-4xl font-semibold tracking-wider'>Bookings</div>
        <AdminCalendar/>
      </div>
     </div>
      <div>
                

      </div>
      <div>
      </div>
    </div>
  )
}

export default page



         





// import { auth } from "@/lib/auth";
// import { redirect } from "next/navigation";
// import LogoutButton from "../LogoutButton";

// export default async function AdminDashboard() {
  // const session = await auth();

  // // Server-side protection (v4 correct)
  // if (!session || session.user.role !== "ADMIN") {
  //   redirect("/dashboard/userDashboard");
  // }

//   return (
//     <div className="min-h-screen bg-slate-900 p-10 text-white">
//       <div className="max-w-6xl mx-auto">

//         {/* Header */}
//         <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-4">
//           <h1 className="text-4xl font-bold text-emerald-400">
//             Owner Dashboard
//           </h1>

//           <div className="flex items-center gap-4">
//             <span className="text-slate-400">{session.user.email}</span>
//             <span className="bg-emerald-900 text-emerald-300 py-1 px-3 rounded text-xs border border-emerald-700">
//               MASTER ADMIN
//             </span>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
//             <h3 className="text-slate-400 text-sm uppercase tracking-wider">
//               Total Users
//             </h3>
//             <p className="text-3xl font-bold mt-2">1,240</p>
//           </div>

//           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
//             <h3 className="text-slate-400 text-sm uppercase tracking-wider">
//               Today&apos;s Revenue
//             </h3>
//             <p className="text-3xl font-bold mt-2 text-emerald-400">
//               $850.00
//             </p>
//           </div>

//           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
//             <h3 className="text-slate-400 text-sm uppercase tracking-wider">
//               Pending Bookings
//             </h3>
//             <p className="text-3xl font-bold mt-2 text-yellow-400">4</p>
//           </div>
//         </div>

//         {/* Logout */}
//         <LogoutButton />

//       </div>
//     </div>
//   );
// }
    'use client'
    import { FcGoogle } from "react-icons/fc";
    import { FaRegEyeSlash } from "react-icons/fa";
    import { FaRegEye } from "react-icons/fa6";
    import { useState } from "react"
    import { useRouter } from "next/navigation";
    import { signIn } from "next-auth/react";
    import axios from "axios";

    const page = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")
    const [name, setName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()


    const handleSubmit = async (e:React.FormEvent)=>{
        e.preventDefault();    
        if(isLoading) return
        setErrorMsg("")
        setIsLoading(true)
        if (password !== confirmPassword) {
        setErrorMsg("Password and confirm password does not match");
        return;
    }
        try {
        const result = await axios.post('/api/auth/signUp',{email, password, name})
        return router.push('/login')

        } catch (error:any) {
        if (axios.isAxiosError(error)) {
            const msg = error.response?.data?.error ;
            setErrorMsg(msg);
        } else {
            setErrorMsg(error);
        }    
        }finally{
            setIsLoading(false)
        }
    }
        const isPasswordVisible =()=>{
            setShowPassword((prev) => !prev)
        }
        const isConfirmPasswordVisible =()=>{
            setShowConfirmPassword((prev) => !prev)
        }
        
    


    return (
        <div className='min-h-screen flex items-center justify-center bg-neutral-900'>
        <div className="flex flex-col border-2 border-white/40 gap-5 items-center my-10">
        <div className=" text-3xl items-center flex flex-col font-bold tracking-widest pt-10">
            Sign Up
        </div>  
            {errorMsg && ( <p className="mb-3 text-red-400 font-semibold text-center">
                {errorMsg}
                </p>)} 
        <form className="flex flex-col items-center border-white/40 pb-4 px-5 gap-10 w-xl"
        onSubmit={handleSubmit}>  
            <input type="text" 
        placeholder="Name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        className="mt-2 flex w-full border-b px-2 border-white/55 pb-1 tracking-widest placeholder:text-xl placeholder:text-pink-50 focus:outline-none"
        />
        <input type="text" 
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        className="mt-2 flex border-b w-full px-2 border-white/55 pb-1 tracking-widest placeholder:text-xl placeholder:text-pink-50 focus:outline-none"
        />

        <div className="flex items-center w-full justify-between border-b border-white/55">
            <input type={showPassword? "text":"password"} placeholder="Password"
            value={password}
        
        onChange={(e)=>setPassword(e.target.value)}
        className="flex px-2 w-full pb-1 tracking-widest placeholder:text-xl placeholder:text-pink-50 focus:outline-none"
        />
        <button type="button"
        onClick={isPasswordVisible} className="mr-5 hover:cursor-pointer">{showPassword? <FaRegEyeSlash />:<FaRegEye /> }</button>
        </div>

        <div className="flex w-full items-center justify-between border-b border-white/55">
            <input type={showConfirmPassword? "text":"password"} placeholder="Confirm Your Password"
        value={confirmPassword}
        
        onChange={(e)=>setConfirmPassword(e.target.value)}
        className="flex px-2 w-full pb-1 tracking-widest placeholder:text-xl placeholder:text-pink-50 focus:outline-none"
        />
        <button type="button"
        onClick={isConfirmPasswordVisible} className="mr-5 hover:cursor-pointer">{showConfirmPassword? <FaRegEyeSlash />:<FaRegEye /> }</button>
        </div>

        <button type="submit"
        disabled={isLoading}
        className={`self-center px-10 active:scale-95 mt-4 py-2 bg-goldenbg rounded-4xl text-xl tracking-wider
            ${isLoading? "opacity-70 cursor-not-allowed scale-95":"hover:cursor-pointer"}
        `}>
            Submit</button>
        </form>
        <div className="flex items-center justify-center w-full px-5 gap-5">
            <hr className="flex-1 border-white/40"/>
                OR
            <hr className="flex-1 border-white/40" />
        </div>

        <div className="flex items-center gap-2"> <p>Log In with</p>
        <button 
            className=" hover:cursor-pointer flex items-center gap-2 font-semibold">
            <FcGoogle size={22} />GOOGLE</button>
        </div>
        <div className="w-full px-5 my-2 items-center gap-4 flex flex-col">
            <hr className="flex-1 w-full border-white/40"/>
        <p className="tracking-wider gap pb-2"> Already have an account
            <span onClick={()=>router.push('/login')}
            className="text-blue-300 hover:cursor-pointer mx-2 font-semibold underline"> Sign Up </span> here</p>
        
        
        </div>
        </div>
        </div>
    )
    }

    export default pageimport connectDb from '@/lib/db'
import Barber from '@/model/barber'
import BarberListShow from './BarberListShow';


const ShowBarber = async () => {
  let barberList:any[] = [];
  try {
    await connectDb()
    barberList = await Barber.find().lean()
  } catch (error) {
    console.error("Error fetching Barber list", error) 
  }
  return (<BarberListShow initialBarbers={JSON.parse(JSON.stringify(barberList))}/>
        
  )
}

export default ShowBarberimport { auth } from '@/lib/auth'
import { redirect } from 'next/navigation';


export default async function dashboardPage (){
    const session = await auth();
    if(!session){
        redirect('/login')
    }
    if(session.user.role==="ADMIN"){
        redirect('/dashboard/adminDashboard')
    }else{
        redirect('/dashboard/userDashboard')
    }
}

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


export async function proxy(req:NextRequest){
    const token = await getToken({req, secret:process.env.AUTH_SECRET})
    const url = req.nextUrl;

    if(!token && (url.pathname.startsWith('/adminDashboard') || url.pathname.startsWith('/userDashboard'))){
        return NextResponse.redirect(new URL('/logIn', req.url))
    }
    if(url.pathname.startsWith('/adminDashboard')){
        if(token?.role !== "ADMIN"){
            return NextResponse.redirect(new URL('/userDashboard', req.url))
        }
    }
    return NextResponse.next()
}

export const config = {
    matcher:[
        "/userDashboard/:path*",
        "/adminDashboard/:path*"
    ]
}
import Team from "./components/Teams";
import Hero from "./components/Hero";
import Second from "./components/Second";
import Prices from "./components/Prices";
import PriceList from "./components/PriceList";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import ContactUs from "./components/ContactUs";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
    <main>
      <Hero />
      <section>
        <Second />
      </section>
      <section id="prices">
        <Prices />
      </section>
      
      <PriceList />
      <section id="services">
        <Services />
      </section>
      <section id="team">
        <Team />
      </section>
      <section id="gallery">
        <Gallery />
      </section>
      <section id="contactus">
        <ContactUs />
      </section>
      <Footer />

    </main>
    
      
      

    </>
  );
}
'use client'
import { Servicetype, service } from "@/data/services"
import { useContext, createContext, useState, useEffect } from "react"


type cartContextType = {
    cart: Servicetype[];
    addToCart: (service:Servicetype) => void
    removeFromCart: (id:string) =>void 
    clearCart:()=> void
}


const cartContext = createContext<cartContextType|null>(null)

export  const CartProvider = ({children}:{children:React.ReactNode}) => {

    const [cart, setCart] = useState<Servicetype[]> ([])
    useEffect(()=>{
          try {
             const storedCart =  localStorage.getItem("cart")
           if(storedCart) setCart(JSON.parse(storedCart))            
          } catch (error) {
        console.error(error)
        
          }
    },[])

    useEffect(()=>{
        localStorage.setItem("cart",JSON.stringify(cart))

    },[cart])
   
    
    const addToCart = (service:Servicetype)=>{
        setCart((prev)=>
            prev.find((item)=>item.id === service.id)
        ?prev
        :[...prev, service]
        )
    }
    const removeFromCart =(id:string)=>{
      setCart((prev)=>
        prev.filter((item)=> item.id !== id)
      )
    }
    const clearCart =()=>{
      setCart([])

    }
       
  return (
    <cartContext.Provider value={{cart, addToCart, removeFromCart, clearCart}}>
     {children}
    </cartContext.Provider>
  )
}

export const useCart=()=>{
   const ctx = useContext(cartContext)
   if (!ctx) throw new Error("use Cart must be used inside CartProvider");

   return ctx;

}
//export const useCart=()=>{
//     const ctx = useContext(cartContext);
//     if (!ctx) throw new Error("use Cart must be used inside CartProvider");
//     return ctx;


// 'use client'
// import { useContext, createContext, useState, useEffect } from 'react'
// import { Service } from '@/data/services'


// type cartContextType ={
//     cart: Service[]
//     addToCart:(service:Service) =>void;
// }

// const cartContext = createContext<cartContextType|null>(null)

// export const CartProvider = ({children}:{children:React.ReactNode}) => {

//     const [cart, setCart] = useState<Service[]>([])

//     useEffect(()=>{
//        try {
//          const storedCart = localStorage.getItem("cart")
//         if(storedCart){
//             setCart(JSON.parse(storedCart))
//         }
        
//        } catch (error) {
//         throw new Error("sdkf")
        
//        }
//     },[])
//     useEffect(()=>{
//         localStorage.setItem("cart",JSON.stringify(cart))

//     },[cart])


//     const addToCart=(service:Service)=>{
//         setCart((prev)=>
//             prev?.find((item)=>item.id === service.id)
//             ?prev
//             :[...prev, service]
//         )
//     }
//   return (
//     <cartContext.Provider value={{cart, addToCart}}>
//         {children}
//     </cartContext.Provider>
//   )
// }

// export const useCart=()=>{
//     const ctx = useContext(cartContext);
//     if (!ctx) throw new Error("use Cart must be used inside CartProvider");
//     return ctx;
// }// data/packages.ts
import { Servicetype } from "./services";

export type PackageType = {
  id: string;
  name: string;
  price: number;
  heading: string;
  services: Servicetype[];
};

export const PACKAGES: Record<string, PackageType> = {
  essentials: {
    id: "pkg_essentials",
    name: "Essentials Package",
    heading:"Most Popular for Everyday Look",
    price: 120,
    services: [
      { id: "classic-haircut", name: "Classic Haircut", price: 0 },
      { id: "beard-trim-shape", name: "Beard Trim & Shape", price: 0 },
      { id: "hair-wash-conditioning", name: "Hair Wash & Conditioning", price: 0 },
      { id: "line-up-edging", name: "Line Up / Edging", price: 0 },
      { id: "hot-towel-shave", name: "Hot Towel Shave", price: 0 },
      { id: "scalp-massage", name: "Scalp Massage", price: 0 },
    ],
  },

  groom: {
    id: "pkg_groom",
    name: "Groom Package",
    heading: "Premium men’s Grooming Experience",
    price: 150,
    services: [
      { id: "classic-haircut", name: "Classic Haircut", price: 0 },
      { id: "beard-trim-shape", name: "Beard Trim & Shape", price: 0 },
      { id: "hot-towel-shave", name: "Hot Towel Shave", price: 0 },
      { id: "scalp-massage", name: "Scalp Massage", price: 0 },
      { id: "hair-colour-touchup", name: "Hair Colour Touch-Up", price: 0 },
      { id: "black-mask-facial", name: "Black Mask Facial", price: 0 },
        
    ],
  },

  deluxe: {
    id: "pkg_deluxe",
    name: "Deluxe Package",
    heading:"Pick as you suit",
    price: 200,
    services: [
      { id: "classic-haircut", name: "Classic Haircut", price: 0 },
      { id: "beard-trim-shape", name: "Beard Trim & Shape", price: 0 },
      { id: "hot-towel-shave", name: "Hot Towel Shave", price: 0 },
      { id: "scalp-massage", name: "Scalp Massage", price: 0 },
      { id: "aftercare_products", name: "After Products", price: 0 },
      { id: "eyebrow-grooming", name: "Eyebrow Grooming", price: 0 },
    ],
  },
};
export type Servicetype = {
    id: string;
    name: string;
    price:number;
      type?: "service" | "package";
}

export const service:Servicetype[] = [
  { id: 'classic-haircut', name: 'Classic Haircut', price: 30 },
  { id: 'skin-fade', name: 'Skin Fade', price: 35 },
  { id: 'beard-trim-shape', name: 'Beard Trim & Shape', price: 20 },
  { id: 'hot-towel-shave', name: 'Hot Towel Shave', price: 25 },
  { id: 'full-shave-straight-razor', name: 'Full Shave (Straight Razor)', price: 30 },
  { id: 'hair-wash-conditioning', name: 'Hair Wash & Conditioning', price: 10 },
  { id: 'scalp-massage', name: 'Scalp Massage', price: 15 },
  { id: 'line-up-edging', name: 'Line Up / Edging', price: 10 },
  { id: 'eyebrow-grooming', name: 'Eyebrow Grooming / Shaping', price: 10 },
  { id: 'black-mask-facial', name: 'Black Mask Facial', price: 15 },
  { id: 'beard-colour-tint', name: 'Beard Colour / Tint', price: 15 },
  { id: 'hair-colour-touchup', name: 'Hair Colour Touch-Up', price: 40 },
  { id: 'hairstyling', name: 'Hairstyling (Blow/Style)', price: 35 },
  { id: 'manicure', name: 'Manicure', price: 25 },
  { id: 'basic-facial-cleanse', name: 'Basic Facial Cleanse', price: 20 },
  { id: 'deep-conditioning-treatment', name: 'Deep Conditioning Treatment', price: 30 },
  { id: 'head-spa-treatment', name: 'Head Spa Treatment', price: 45 },
  { id: 'kids-haircut', name: 'Kids Haircut (Under 12)', price: 20 },
]

 export const essentialsPackages =[

 ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HAIR WASH & CONDITIONING", true],
  ["LINE UP / EDGING", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", false]
];
export const deluxePackages = [
  ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", true],
  ["HAIR COLOUR TOUCH-UP", true],
  ["BLACK MASK FACIAL", true]
]; 
 export  const groomPackages=[
  ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", true],
  ["AFTERCARE PRODUCTS", true],
  ["EYEBROW GROOMING", false]    
  ]import {z} from "zod";
const passwordSchema = z
.string()
.min(8, "Password must be 8 characters long")
.regex(/[A-Z]/,"Password must contains atlease one uppercase letter")
.regex(/[a-z]/,"Password must contains atlease one lowerrcase letter")
.regex(/[0-9]/,"Password must contains atlease one number")
.regex(/[^A-Za-z0-9]/, "Password must contain atleast one Special symbol")

export const signUpSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema
})// data will be safe parsed from here when someone tries signUP
export type signUpInput = z.infer<typeof signUpSchema>// z.infer will create a type while in runtime automatically like mame:string, email:string, password:passwordSchema

export const logInSchema = z.object({
    email: z.string().email(),
    password: passwordSchema
})
export type logInInput = z.infer<typeof logInSchema>// again here z.infer will create a type during runtime automatically

export const otpSchema = z.object({
    email : z.string().email(),
    otp : z.string().length(6,"OTP must be 6 digits")
})
export type otpInput = z.infer<typeof otpSchema>// again automatic input type during runtimeimport { BookingInput } from "@/types/booking";


export const validateBookingInput =(data:BookingInput)=>{
    
if(data.items.length === 0){
    throw new Error("At lease one service/Package is needed in Cart")
}
return data;
    
};

import { getServerSession } from "next-auth";
import authOptions from "@/lib/authOptions";

export const auth = () => getServerSession(authOptions);
import  CredentialsProvider  from "next-auth/providers/credentials"
import connectDb from "./db"
import User from "@/model/user.model"
import bcrypt from "bcryptjs"
import Google from "next-auth/providers/google"
import  { NextAuthOptions } from "next-auth"

const authOptions:NextAuthOptions = ({
    providers:[
        Google({
            clientId: process.env.GOOGLE_CLIENTID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials:{
                email: {label:"Email", type:"text"},
                password:{ label:"Password", type:"password"}
            },
            async authorize(credentials,req){
                let email = credentials?.email?.toLowerCase().trim()
                let password = credentials?.password
                if(!email || !password){
                    throw new Error("Email and Password both are required. Try again")
                }
                await connectDb()
                let user = await User.findOne({email})
                if(!user){
                    throw new Error("Email is not registered. Please try correct email or SIGN UP first")
                }
                if(!user.password){
                    throw new Error("This account was created using Google. Try loging in with GOOGLE")
                }

                let isPasswordCorrect =  await bcrypt.compare(password, user.password)
                if (!isPasswordCorrect){
                    throw new Error("Wrong password. Please Try Again")
                }
                let role = user.role || "USER";// we already declared the admin role while sign up here accessing that role from user.role and sending them to the appropriate dashboard
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: role// this will return a object named user that we will access in jwt params as user and share the user values with token
                }
            }
        })
    ],
    callbacks:{
        async signIn({user, account}) {
            if(account?.provider ==="google"){
                await connectDb()
                const email = user.email?.toLowerCase().trim()// lowercasing google email
                let existingUser = await User.findOne({email})
                if(!existingUser){
                    const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase().trim()
                    let role = ownerEmail === email ? "ADMIN":"USER"
                    await User.create({
                        name :user.name || "USER",//if somehow google fails to send it 
                        email: email!,// already lowercased
                        image:user.image || "",
                        role: role,
                        isVerified:true
                    })
                }return true
            }return true
        },
       async jwt({token,user}) {
        if(user){
            token.id = user.id,
            token.name = user.name,
            token.image = user.image,
            token.email = user.email

            if (user.role){
                token.role = user.role
            }
            else{
                await connectDb()
                const email = token.email?.toLowerCase().trim()
                const dbUser = await User.findOne({email})
                if(dbUser){
                    token.id = dbUser._id.toString(),
                    token.role = dbUser.role
                }
            }
        }
        return token  
        },
        session({session,token}) {
            if(session.user){
                session.user.id = token.id,
                session.user.email = token.email,
                session.user.name = token.name,
                session.user.image = token.image as string;
                session.user.role = token.role 
            }return session
        },
    },
    session:{
        strategy:'jwt',
        maxAge: 1000*60*60*24*15
    },
    pages: {
        signIn:'/login',
        error:'/login'
    },
    secret: process.env.AUTH_SECRET
})

export default authOptionsimport {connect} from "mongoose"

let mongodb_url = process.env.MONGODB_URI
if(!mongodb_url){
    throw Error ("MongoDb url is not connected")
}
let cached = global.mongoose;

if(!cached){
    cached = global.mongoose = {conn:null, promise:null}
}

const connectDb= async()=>{
    if(cached.conn){
        console.log(" cached Mongodb url is working")
        return cached.conn
    }
    if(!cached.promise){
       cached.promise = connect(mongodb_url).then((c)=>c.connection)
    }
    try {
        cached.conn = await cached.promise
        console.log("New connection is made")
    } catch (error) {
        throw error
    }
    console.log("Db connected in the end with new promise and connection")
    return cached.conn
} 
export default connectDb    import mongoose, {Schema, Model} from "mongoose";
    import { required } from "zod/mini";

    export interface BarberDocument {
        _id: string,
        name: string,
        email:string,
        isActive: boolean,
        phone: string,
        workingDays: string[],
        workingHours:{
            start:string,
            end:string;
        },
        lunchBreak:{
            start:string,
            end:string  
        },
        timeOff:{
        startDate:string;
        endDate:string;
        fullDay:boolean;
        start?:string;
        end?:string;
        reason?:string;
        }[];
        services: string[],
        createdAt:Date
    }

    const BarberSchema = new Schema<BarberDocument>({
        name:{
            type: String,
            required: true,
            trim: true,
        },
        isActive:{
            type: Boolean,
            required: true
        },
        phone:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            lowercase: true,
            trim:true
        },
        workingDays:{
            type:[{type: String}],
            required:true
        },
        workingHours:{
            start:{type:String, required:true },
            end:{type:String, required:true}
        },
        lunchBreak:{
            start:{type:String, required:true},
            end:{type:String, required:true}
        },
        services:{
            type:[String],
            required:true
        },
        timeOff:[{
            startDate:{type: String,required:true},
            endDate:{type:String,required:true},
            fullDay:{type:Boolean,required:true},
            start:{type:String},
            end:{type:String},
            reason:{type:String}

        }],
        createdAt:{
            type:Date,
            default:Date.now
        }
    })

    const Barber:Model<BarberDocument> = mongoose.models.Barber || mongoose.model<BarberDocument>("Barber",BarberSchema)
    export default Barberimport mongoose, {Schema, Model} from "mongoose";
    import { BookingDocument } from "@/types/booking";  
    
    
    
    const BookingItemSchema = new Schema({
        id:{type:String, required: true},
        name:{type:String, required:true},
        type:{
            type:String,
            enum: ["service", "package"],
            required:true
        },
        price: {type: Number, required:true},
        },
        {_id:false}//this forces mongodb to not create a separete id for this schema as it is going to used in Booking Schema not individually
    )
    //following is used to save data in mongoose as bookingdocument
    const bookingSchema = new Schema<BookingDocument>({
        name:{
            type: String,
            required: true,
            trim:true
        },
        phone:{
            type:String,
            required: true,
            trim:true
        },
        date:{
            type:String,
            required:true,
        },
        time:{
            type:String,
            required:true
        },
        items:{
            type: [BookingItemSchema],
            required:true
        },
        totalAmount:{
            type: Number,   
            required:true
        },
       
        userId:{
            type:String,
            default:null
        },
        barberId:{
            type: Schema.Types.ObjectId,
            ref: "Barber",
            required: true,
            index:true
        },
        status:{
            type: String,
            enum:["open","completed","cancelled"],
            default: "open",
            index: true
        },
        ipAddress:{
            type:String,
            required:true,
            index:true
        },
        cancellationReason: {
        type: String,
        default: null
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
        })
    // prevents double booking every youtuber asks about that using race condition
        bookingSchema.index(
            {date:1,time:1, barberId:1},
            {unique:true}
        )
    //phone booking limit max to 3 per phone number
        bookingSchema.index({phone:1, status:1})
    
    //Ip abuse protection (max to 5)
        bookingSchema.index({ipAddress:1, status:1})
    
    
    const Booking:Model<BookingDocument> = mongoose.models?.Booking || mongoose.model<BookingDocument>("Booking", bookingSchema)
    export default Bookingimport mongoose, { Document, Model, Schema } from "mongoose";
    
    export type OTPPurpose = "VERIFY EMAIL"| "RESET PASSWORD"
    
    export interface IOTP extends Document{
        userId: mongoose.Types.ObjectId;
        code: string;
        used: boolean;
        purpose: OTPPurpose;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }
    
    const OTPSchema = new Schema<IOTP>({
        userId:{
            type: mongoose.Types.ObjectId,
            ref:"User",
            required:true
        },
        code:{
            type:String,
            required:true,
        },
        used:{
            type:Boolean,
            default:false
        },
        purpose:{
            type:String,
            required:true,
            enum:["VERIFY EMAIL","RESET PASSWORD"]
        },
        expiresAt:{
            type:Date,
            required:true
        },},{timestamps:true});
    
        const OTP:Model<IOTP> = mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema)
        export default OTP
    import {connection} from "mongoose"

declare global{
    var mongoose:{
        conn: connection | null;
        promise: promise<connection>|null;
    }

}
export {}import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document{
    name: string;
    email: string;
    password?: string;
    isVerified: boolean;
    image?:string;
    role: "USER"|"ADMIN"
    createdAt:Date;
    updatedAt:Date;
}

const UserSchema = new Schema<IUser>({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        trim:true
    },
    password:{
        type:String,
        required:false
    },
    image:{
        type:String,
        required:false
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    role:{
        type:String,
        enum:["USER","ADMIN"],
        default:"USER"
    },
    },{timestamps:true})
    const User:Model<IUser> = mongoose.models.User|| mongoose.model<IUser>("User", UserSchema)
    export default User

    import { Types } from "mongoose";

export type BookingItemType = "service" | "package"

//info of service-- info of service or package
export interface BookingItem {
    id: string;
    price: number;
    name: string;
    type: BookingItemType;
}
// here using BookingItem without extending
// to get the info from the customer
//also we will send this to validator before saving it in bookingdocument so it wont save any empty array of item (services/package) in the database even though we made it in components
export interface BookingInput{
    name: string;
    phone: string;
    date: string;
    time: string;
    items: BookingItem[];
}

// Booking status

export type BookingStatus = "open"|"completed"|"cancelled"


// till now we have booking type-- info of booked item-- info of Customer
// sending all to save on database

export interface BookingDocument extends BookingInput{
    _id:string; // this id is different, works as order number
    totalAmount: number;
    userId: string | null;

    barberId: Types.ObjectId;
    status: BookingStatus;
    cancellationReason: string | null;
    ipAddress: string;
    createdAt: Date;

}


// these are all types to make the schema
import "next-auth";
import "next-auth/jwt"
import { DefaultSession } from "next-auth";


declare module "next-auth"{
    interface User{
        id:string;
        role:string
    }
    interface Session{
       user:{
         id:string
        role:string
       } & DefaultSession["user"]
    }
}
declare module "next-auth/jwt"{
    interface JWT{
        id: string;
        role:string
    }
}'use client'
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { useState } from "react";
import { FaRegUser } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import { SlLocationPin } from "react-icons/sl";
import { TfiEmail } from "react-icons/tfi";


const ContactUs = () => {
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit=(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
    }
  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="flex items-center justify-center gap-10 py-20 px-50">
        {/* left side form/table */}
        <div className="border w-full h-[90vh]">
                <div className="px-7 pt-5 gap-4 flex flex-col h-[30%]">
                    <h1 className="text-4xl text-golden font-bold">
                    Get In Touch With Us
                    </h1>
                    <p className="leading-7">
                    Give us a call or drop by anytime, we endeavour to answer all
                    enquiries within 24 hours on business days. We will be happy to
                    answer your questions.
                    </p>
                </div>

          <div className="h-[50%] flex flex-col gap-[12.5%] px-5">
                <div className="border flex items-center px-5 py-3 gap-5 ">
                    <div className="bg-gray-200 p-3 rounded-full"><SlLocationPin className="text-black" size={30} /></div>
                    <div>
                        <h1 className="text-xl font-bold">LAND MARK ADDRESS</h1>
                        <p> 1785 Queen St E, Brampton, ON L6T 4S3, <br />Canada </p>
                    </div>
            </div>
            <div className="border">
                 <div className="border flex items-center px-5 py-3 gap-5 ">
                    <div className="bg-gray-200 p-3 rounded-full"><FiPhone  className="text-black" size={30} /></div>
                    <div>
                        <h1 className="text-xl font-bold">PHONE NUMBER</h1>
                        <p> +1 437 438 9692</p>
                    </div>
                </div>
            </div>

            <div className="border">
                <div className="border flex items-center px-5 py-3 gap-5 ">
                    <div className="bg-gray-200 p-3 rounded-full"><TfiEmail className="text-black" size={30} /></div>
                    <div>
                        <h1 className="text-xl font-bold">EMAIL ADDRESS</h1>
                        <p> xyzemail@gmail.com</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
            {/* right side table/appointment  */}
        <div className="border w-full h-[90vh]">
          <div className="h-[20%]  px-7 py-5 gap-3">
            <h1 className="text-golden text-4xl font-bold">Contact Us</h1>
            <p className="leading-7">Please feel free to get in touch with us using the contact form below. We’d love to hear for you.</p>   
          </div>

          <div className="h-[80%] ">
            <form onSubmit={handleSubmit} className="gap-5 flex flex-col px-4">
                <div className="grid grid-cols-2 gap-5">      
                    <div className=" border-2 flex items-center p-4 gap-4 rounded-xl">
                        <FaRegUser size={20} className="shrink-0"/>
                        <input 
                        type="text" 
                        placeholder="FullName"
                        value={name}                 
                        onChange={(e)=>setName(e.target.value)}
                        className="focus:outline-none focus:ring-0"/>
                    </div>
                    <div className="border-2 flex items-center p-4 gap-4 rounded-xl ">
                        <TfiEmail size={23} className="shrink-0"/>
                        <input 
                        type="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}               
                        placeholder="Email"
                        className="focus:outline-none focus:ring-0 " />
                    </div>
                </div>
            <div className="border-2 w-full py-4 rounded-xl flex items-center pl-4">
                <FiPhone size={23} className="shrink-0"/>
                <input type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e)=> setPhoneNumber(e.target.value)}
                className="pl-3 focus:outline-none focus:ring-0 w-full bg-transparent"
             />
            </div>
            <div className="border-2 rounded-xl flex items-center gap-5 pl-4 py-4">
                <HiOutlinePencilSquare size={27} className="shrink-0"/>
                <input type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e)=>setSubject(e.target.value)}
                className=" focus:outline-none w-full focus:ring-0  "
                 />
            </div>
            <textarea
            placeholder="Write Your Message"
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            className="border-2 h-[24vh] resize-none  border-white focus:outline-none focus:ring-0 p-4 flex top-1"
            />
          <div className="flex justify-end w-full ">
            <button type="submit"
             className="px-6 py-3 mt-3 bg-golden/50 font-bold  border rounded-xl hover:cursor-pointer active:scale-90 hover:bg-goldenbg hover:font-bold">Submit</button>
          </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
'use client'

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";
import { FiPhone } from "react-icons/fi";
import { SlLocationPin } from "react-icons/sl";
import { TfiEmail } from "react-icons/tfi";

const footerLinks = [
  "Services",
  "Book Appointment",
  "About Us",
  "Blogs",
];

const businessHours = [
  { day: "Mon - Friday", time: "09:00 - 21:00" },
  { day: "Saturday", time: "09:00 - 18:00" },
];

const contactInfo = [
  { icon: FiPhone, text: "+123 (4567) - 890" },
  { icon: SlLocationPin, text: "1785 Queen St E, Brampton, ON L6T 4S3, Canada" },
  { icon: TfiEmail, text: "yourmail@info.com" },
];
const legalLinks = [
  "Country site map",
  "Exceptional Service",
  "Quality Cuts",
];
const policyLinks = [
  "Privacy Policy",
  "Modern slavery statement",
  "Timeless Style",
  "Modern Styles",
];

const socialIcons = [FaFacebookF, FaXTwitter, FaInstagram];

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white px-10 pt-16">

      {/* TOP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* LINKS */}
        <div>
          <h3 className="text-xl font-bold mb-4">Links</h3>
          <ul className="space-y-2">
            {footerLinks.map((item, i) => (
              <li key={i} className="hover:text-golden cursor-pointer">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* BUSINESS HOURS */}
        <div>
          <h3 className="text-xl font-bold mb-4">Business Hours</h3>
          {businessHours.map((item, i) => (
            <div key={i} className="mb-3">
              <p className="text-golden">{item.day}</p>
              <p>{item.time}</p>
            </div>
          ))}
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contact</h3>
          <ul className="space-y-3">
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={i} className="flex items-center gap-3">
                  <Icon size={26} className="text-golden" />
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* FOLLOW US */}
        <div>
          <h3 className="text-xl font-bold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            {socialIcons.map((Icon, i) => (
              <div
                key={i}
                className="border rounded-full p-3 hover:bg-golden hover:text-black cursor-pointer transition"
              >
                <Icon />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t border-neutral-200 my-12" />

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* LOGO */}
        <div>
          <h2 className="text-2xl font-bold">Clip & Cut</h2>
          <p className="mt-4 text-sm text-neutral-400">
            Lorem ipsum dolor sit amet consectetur. Lectus ac sed purus
            ultrices diam eu scelerisque.
          </p>
        </div>

        {/* LEGAL */}
        <div>
          <h4 className="font-bold mb-4">Legal</h4>
          <ul className="space-y-2">
            {legalLinks.map((item, i) => (
              <li key={i} className="underline cursor-pointer">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* POLICY */}
        <div>
          <h4 className="font-bold mb-4">Privacy Policy</h4>
          <ul className="space-y-2">
            {policyLinks.map((item, i) => (
              <li key={i} className="underline cursor-pointer">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-neutral-700 mt-12 py-6 text-center text-sm text-neutral-400">
        ©2025 All Rights Reserved. Clip & Cut — Designed & Developed by UIPARADOX
      </div>

    </footer>
  );
};

export default Footer;
import { FaRegHandPointer } from "react-icons/fa";
import Link from "next/link";

const Fourth = () => {


  const essentialsPackage =[
 ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HAIR WASH & CONDITIONING", true],
  ["LINE UP / EDGING", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", false]
];
const deluxePackage = [
  ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", true],
  ["HAIR COLOUR TOUCH-UP", true],
  ["BLACK MASK FACIAL", true]
]; 
  const groomPackage=[
  ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", true],
  ["AFTERCARE PRODUCTS", true],
  ["EYEBROW GROOMING", false]    
  ]


  return (
    <div className='min-h-screen min-w-full flex flex-col items-center bg-neutral-900 overflow-hidden'>
      <div className=' w-full flex flex-col items-center pt-10 py-10'>
        <h2 className='text-6xl font-bold text-white '>Our Barbers. Your Style.</h2>
      </div>

        {/* Card One */}
      <div className='flex px-19 w-full justify-between h-[81vh] gap-6 mb-10 '>
        <div className='w-1/3 h-full justify-between border flex flex-col'>
        <div>
        <h1 className='text-4xl font-bold  p-4 text-golden  text-center '>Essentials Package </h1>
           <p className='text-center text-lg px-4 py-2 text-white bg-gradient-to-r from-golden/10 via-golden/20 to-golden/30 uppercase tracking-tighter font-medium'>
            Most Popular for Everyday Look</p> 
           </div>
        <div className="flex flex-col grow "> 
          {essentialsPackage.map(([title, included],i)=>
           <div key={i}>
           <div className='text-white border-b-2 justify-between text-xl font-md flex items-center mx-7 py-4 '>
            <span> {title} </span>
            {included ? 
            (<span className="pr-3 text-golden text-xl font-bold">
              ✔</span>)
            :( <span className="pr-3 text-golden text-xl font-bold">
              ✖</span>)}
           </div>
          </div>
          )}
        </div>
        <div className="flex items-center p-8 justify-between ">
          <div className="flex items-center ">
                <span className="w-8 h-1 bg-white mr-3"></span>
                <p className="text-golden text-4xl font-bold">$120</p>
                </div>
               
               <Link href="/booking?package=essentials">
                <div className="bg-golden text-black text-xl flex items-center p-3 hover:cursor-pointer gap-1">
                   <p>Book Now</p> 
                  <FaRegHandPointer /></div>
                  </Link>
                
              </div>
            </div>




        {/* Card two */}
        <div className='w-1/3 border h-full'>
        <div>
          <h1 className='text-4xl font-bold  p-4 text-golden  text-center '> Groom Package </h1>
        <p className='text-center text-lg px-4 py-2 text-white bg-gradient-to-r from-golden/10 via-golden/20 to-golden/30 uppercase tracking-tighter font-medium'>Premium men’s Grooming Experience</p>
        </div>
        <div className="flex flex-col grow "> 
          {groomPackage.map(([title, included],i)=>
           <div key={i}>
           <div className='text-white border-b-2 justify-between text-xl font-md flex items-center mx-7 py-4 '>
            <span> {title} </span>
            {included ? 
            (<span className="pr-3 text-golden text-xl font-bold">
              ✔</span>)
            :( <span className="pr-3 text-golden text-xl font-bold">
              ✖</span>)}
           </div>
          </div>
          )}
        </div>
        <div className="flex items-center p-8 justify-between ">
          <div className="flex items-center ">
                <span className="w-8 h-1 bg-white mr-3"></span>
                <p className="text-golden text-4xl font-bold">$150</p>
                </div>
                <div className="bg-golden text-black text-xl flex items-center p-3 hover:cursor-pointer gap-1"> <p>Book Now</p> 
                  <FaRegHandPointer /></div>
                
              </div>        
        </div>




          {/* Card 3rd */}
        <div className='w-1/3 h-full border'>
        <div>
          <h1 className='text-4xl font-bold  p-4 text-golden  text-center '> Deluxe Package </h1>
           <p className='text-center text-lg px-4 py-2 text-white bg-gradient-to-r from-golden/10 via-golden/20 to-golden/30 uppercase tracking-tighter font-medium'>Pick as you suit</p></div> 
        <div className="flex flex-col grow "> 
          {deluxePackage.map(([title, included],i)=>
           <div key={i}>
           <div className='text-white border-b-2 justify-between text-xl font-md flex items-center mx-7 py-4 '>
            <span> {title} </span>
            {included ? 
            (<span className="pr-3 text-golden text-xl font-bold">
              ✔</span>)
            :( <span className="pr-3 text-golden text-xl font-bold">
              ✖</span>)}
           </div>
          </div>
          )}
        </div>
        <div className="flex items-center p-8 justify-between ">
          <div className="flex items-center ">
                <span className="w-8 h-1 bg-white mr-3"></span>
                <p className="text-golden text-4xl font-bold">$200</p>
                </div>
                <div className="bg-golden text-black text-xl flex items-center p-3 hover:cursor-pointer gap-1"> <p>Book Now</p> 
                  <FaRegHandPointer /></div>
                
              </div>
        </div>
      </div>
    </div>
  )
}

export default Fourth'use client'
import React, { useState } from "react";
import Image from "next/image";

const Gallery = () => {
    const [visibleCount, setVisibleCount] = useState(4)

    const loadMore =()=>{
        setVisibleCount(prev=>prev+4)
    }

    



    const images = [
        "/gallery/temporaryImages/1.jpg",
        "/gallery/temporaryImages/2.png",
        "/gallery/temporaryImages/3.png",
        "/gallery/temporaryImages/4.png",
        "/gallery/temporaryImages/5.png",
        "/gallery/temporaryImages/6.png",
        "/gallery/temporaryImages/7.jpeg",
        "/gallery/temporaryImages/8.jpeg",
        "/gallery/temporaryImages/9.jpeg",
        "/gallery/temporaryImages/10.jpeg",
    ];
        const visibleImages = images.slice(0, visibleCount)
    return (
        <div className="min-h-screen bg-neutral-900">
            <div className="flex flex-col items-center ">
                <h1 className="text-6xl uppercase text-white bg-goldenbg py-8 tracking-wider w-full text-center font-semibold ">
                    Explore gallery
                </h1>

                <div className="overflow-x-auto w-full p-10">
                    <div className="flex gap-12 w-max h-[60vh] pt-10 border-golden">
                        {visibleImages.map((image, i) => (
                            <div key={i}>
                                <Image
                                    src={image}
                                    loading="lazy"
                                    alt="galleryImages"
                                    style={{
                                        width: "350px",
                                        height: "350px",
                                        objectFit: "cover",
                                    }}
                                    width={200}
                                    height={200}
                                    className=""
                                />
                            </div>
                        ))}
                    </div>
                       
                </div>  
                 <div className="w-full">
                     {visibleCount < images.length ? (
                        <div className="flex justify-end pr-4">
                            <button onClick={loadMore}
                            className="text-xl my-5 p-5 rounded-2xl  uppercase font-semibold tracking-wide hover:cursor-pointer hover:scale-105 bg-goldenbg active:scale-95">view more
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-end pr-6">
                            <button onClick={()=>setVisibleCount(4)}
                            className="text-xl my-5 p-5 rounded-2xl  uppercase font-bold tracking-wide hover:cursor-pointer text-black bg-golden active:scale-95">view less
                            </button>
                            </div>
                    )}  
                    </div>           
            </div>
        </div>
    );
};

export default Gallery;

'use client'
import Image from "next/image";
import Navbar from "./Navbar";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";



const Hero = () => {
  const {cart} = useCart()

  const router = useRouter();


  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src="/heroc.png"
        alt="123"
        fill
        priority
        className="object-cover -z-10 object-[70%_center]"
      />
      <Navbar />
    
      <div className="absolute border-gray-400 border left-45 mt-13 backdrop-blur-xs justify-around flex flex-col max-w-[25vw] text-white h-[63vh] ">
        <div className="leading-18 font-bold text-5xl flex pl-10  items-center">Relax And Recharge At VIP Salon</div>
        <div className="text-lg pl-10 font-semibold ">The Ultimate Satisfaction</div>
        <button onClick={()=> cart.length > 0 
          ? router.push('/booking')
          : document.getElementById('prices')?.scrollIntoView({behavior:"smooth"})
         } 
        className=" text-xl font-bold ml-7 border bg-gray-800 px-4 py-5 w-55 rounded-full hover:cursor-pointer hover:scale-95 ">
          Book Appointment</button>
      </div>


      <div className="absolute bottom-13 right-10 z-10 text-right flex gap-6 flex-col ">
        <h1
          className="px-6 py-3 bg-linear-to-l from-black/70 via-black/40 to-transparent backdrop-blur-[1px] text-sm font-semibold uppercase tracking-widest text-amber-300" >      
          Elevate Your Everyday Look
        </h1>
        <p className="font-bold text-6xl leading-tight text-gray-100 max-w-[45vw]">
          Trusted by Modern Gentlemen
        </p>
      </div>
    </div>
  );
};

export default Hero;
'use client'
import Image from "next/image"
import { FaPhoneVolume } from "react-icons/fa6";

const Navbar = () => {
  const scrollToSection =(id:string)=>{
    const element = document.getElementById(id)
     if(!element) return

     element.scrollIntoView({
      behavior:'smooth',
      block:'start'
     })

  }
  return (
    
      <div className=" pr-5 pt-3 bg-transparent w-screen flex justify-between items-center">
        <div className=" flex  pl-20 items-center">               
          <div className="font-bold text-3xl flex items-center">VIP Salon & Barber</div>
           {/* <Image src='/lll.png' width={80} height={0} alt='logo'/>    */}
        </div>
        <ul className="flex gap-10 px-10 py-4 font-bold">
            {[
                ["Home","about"],
                ['Prices','prices'],
                ['Services', 'services'],
                ['Team', 'team'],
                ['Gallery', 'gallery'],
                ['Contact Us', 'contactus']
            ].map(([label, id],i)=>(
                <li
                key={i}
                onClick={()=>scrollToSection(id)}
                className="hover:cursor-pointer uppercase"
                >
                  {label}
                </li>
                

            ))
            }


           
          </ul>
        <div className="flex gap-5 px-10 py-4 text-amber-500 font-bold items-center gap-10">
          <span className=""><FaPhoneVolume /></span> <p> +123 456 7890 </p>
        </div>
      </div>
      
  )
}

export default Navbar'use client'
import { useCart } from "@/context/cartContext";
import { service } from "@/data/services";
import { useRouter } from "next/navigation";


const PriceList = () => {

  const {cart, addToCart, removeFromCart} = useCart()
  const router = useRouter()

  return (
    <div className='min-h-screen bg-neutral-900'>
        <div className='text-center py-5 text-7xl bg-gradient-to-r from-golden/60 to-goldenbg/90 font-bold uppercase tracking-widest '>
            Pricing Best deal for you
         </div>
        <div className='pt-15 grid md:grid-cols-2 px-18 gap-x-28 gap-y-25 pb-8 border-white'>
            {service.map((s,i)=>   { 
              
              const isAdded = cart.some((c)=>c.id===s.id)
              return(
            <div key={s.id}
            className='text-white flex justify-between items-center gap-5 font-normal border-b border-white/25 pb-3 tracking-wide text-2xl'>
                <div>
                  <span>{i+1}. </span>
                <span>{s.name}</span>
                </div>
                <div className='flex gap-4 items-center'>
                  <span className='text-golden font-semibold'>${s.price}</span>
                <button 
                onClick={()=> isAdded? removeFromCart(s.id):  addToCart(s)}
                 className='hover:cursor-pointer active:scale-95 px-4 text-base rounded-full bg-amber-700 py-1 '>
                   {isAdded ? "Remove" : "Add to Cart +"}
                </button>
                </div>     
        </div>
              )}

        )}
       
        </div>
         {cart.length > 0 && 
        <div className="fixed right-20 bottom-6 z-100">
          <button 
          onClick={()=>router.push('/booking')}
          
          className="text-white text-xl font-xl px-5 py-2 border- rounded-4xl bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:cursor-pointer">
            Check Out
          </button>
          
        </div>}
        
    </div>
  )
}

export default PriceList// app/prices/page.tsx
import Link from "next/link";
import { FaRegHandPointer } from "react-icons/fa";
import { PACKAGES } from "@/data/packages";

const Prices = () => {
  return (
    <div className="min-h-screen bg-neutral-900 px-20 py-10 text-white">
      <h1 className="text-6xl font-bold text-center mb-12">
        Our Barbers. Your Style.
      </h1>

      <div className="flex gap-8">
        {Object.entries(PACKAGES).map(([key, pkg]) => (
          <div
            key={pkg.id}
            className="w-1/3 border border-white/40 flex flex-col justify-between"
          >
            {/* Header */}
            <div>
              <h2 className="text-4xl font-bold text-golden text-center p-4">
                {pkg.name}
              </h2>
              <p className="text-center bg-golden/20 py-2 uppercase">
                {pkg.heading}
              </p>
            </div>

            {/* Services */}
            <div className="flex flex-col px-6 py-4 grow">
              {pkg.services.map((s, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-white/20 py-3 text-xl"
                >
                  <span>{s.name}</span>
                  <span className="text-golden font-bold">✔</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6">
              <div className="flex items-center">
                <span className="w-6 h-1 bg-white mr-3"></span>
              <p className="text-4xl text-golden font-bold"> 
                ${pkg.price}
              </p>
              </div>
              

              <Link href={`/booking?package=${key}`}>
                <div className="bg-golden text-black px-4 py-3 flex items-center gap-2 cursor-pointer">
                  <span>Book Now</span>
                  <FaRegHandPointer />
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Prices;



//   return (
//     <div className='min-h-screen min-w-full flex flex-col items-center bg-neutral-900 overflow-hidden'>
//       <div className=' w-full flex flex-col items-center pt-10 py-10'>
//         <h2 className='text-6xl font-bold text-white '>Our Barbers. Your Style.</h2>
//       </div>

//         {/* Card One */}
//       <div className='flex px-19 w-full justify-between h-[81vh] gap-6 mb-10 '>
//         <div className='w-1/3 h-full justify-between border flex flex-col'>
//         <div>
//         <h1 className='text-4xl font-bold  p-4 text-golden  text-center '>Essentials Package </h1>
//            <p className='text-center text-lg px-4 py-2 text-white bg-gradient-to-r from-golden/10 via-golden/20 to-golden/30 uppercase tracking-tighter font-medium'>
//             Most Popular for Everyday Look</p> 
//            </div>
//         <div className="flex flex-col grow "> 
//           {essentialsPackage.map(([title, included],i)=>
//            <div key={i}>
//            <div className='text-white border-b-2 justify-between text-xl font-md flex items-center mx-7 py-4 '>
//             <span> {title} </span>
//             {included ? 
//             (<span className="pr-3 text-golden text-xl font-bold">
//               ✔</span>)
//             :( <span className="pr-3 text-golden text-xl font-bold">
//               ✖</span>)}
//            </div>
//           </div>
//           )}
//         </div>
//         <div className="flex items-center p-8 justify-between ">
//           <div className="flex items-center ">
//                 <span className="w-8 h-1 bg-white mr-3"></span>
//                 <p className="text-golden text-4xl font-bold">$120</p>
//                 </div>
               
//                <Link href="/booking?package=essentials">
//                 <div className="bg-golden text-black text-xl flex items-center p-3 hover:cursor-pointer gap-1">
//                    <p>Book Now</p> 
//                   <FaRegHandPointer /></div>
//                   </Link>
                
//               </div>
//             </div>




//         {/* Card two */}
//         <div className='w-1/3 border h-full'>
//         <div>
//           <h1 className='text-4xl font-bold  p-4 text-golden  text-center '> Groom Package </h1>
//         <p className='text-center text-lg px-4 py-2 text-white bg-gradient-to-r from-golden/10 via-golden/20 to-golden/30 uppercase tracking-tighter font-medium'>Premium men’s Grooming Experience</p>
//         </div>
//         <div className="flex flex-col grow "> 
//           {groomPackage.map(([title, included],i)=>
//            <div key={i}>
//            <div className='text-white border-b-2 justify-between text-xl font-md flex items-center mx-7 py-4 '>
//             <span> {title} </span>
//             {included ? 
//             (<span className="pr-3 text-golden text-xl font-bold">
//               ✔</span>)
//             :( <span className="pr-3 text-golden text-xl font-bold">
//               ✖</span>)}
//            </div>
//           </div>
//           )}
//         </div>
//         <div className="flex items-center p-8 justify-between ">
//           <div className="flex items-center ">
//                 <span className="w-8 h-1 bg-white mr-3"></span>
//                 <p className="text-golden text-4xl font-bold">$150</p>
//                 </div>
//                 <div className="bg-golden text-black text-xl flex items-center p-3 hover:cursor-pointer gap-1"> <p>Book Now</p> 
//                   <FaRegHandPointer /></div>
                
//               </div>        
//         </div>




//           {/* Card 3rd */}
//         <div className='w-1/3 h-full border'>
//         <div>
//           <h1 className='text-4xl font-bold  p-4 text-golden  text-center '> Deluxe Package </h1>
//            <p className='text-center text-lg px-4 py-2 text-white bg-gradient-to-r from-golden/10 via-golden/20 to-golden/30 uppercase tracking-tighter font-medium'>Pick as you suit</p></div> 
//         <div className="flex flex-col grow "> 
//           {deluxePackage.map(([title, included],i)=>
//            <div key={i}>
//            <div className='text-white border-b-2 justify-between text-xl font-md flex items-center mx-7 py-4 '>
//             <span> {title} </span>
//             {included ? 
//             (<span className="pr-3 text-golden text-xl font-bold">
//               ✔</span>)
//             :( <span className="pr-3 text-golden text-xl font-bold">
//               ✖</span>)}
//            </div>
//           </div>
//           )}
//         </div>
//         <div className="flex items-center p-8 justify-between ">
//           <div className="flex items-center ">
//                 <span className="w-8 h-1 bg-white mr-3"></span>
//                 <p className="text-golden text-4xl font-bold">$200</p>
//                 </div>
//                 <div className="bg-golden text-black text-xl flex items-center p-3 hover:cursor-pointer gap-1"> <p>Book Now</p> 
//                   <FaRegHandPointer /></div>
                
//               </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default prices'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Second = () => {
  const router = useRouter()
  return (
    <>
      <div className="min-h-screen max-w-full flex bg-neutral-900">
        <div className="relative text-white flex w-48">
          <p>svg/img/logo</p>
        </div>
        <div className="relative h-screen flex flex-col text-linen max-w-[47vw] ">
          <div className="flex items-center gap-2 pt-10 text-sm">
            <span className="w-8 bg-golden h-1 flex flex-col items-center"></span>
            SINCE 2019
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold pb-5 text-4xl leading-tight">
              VIP BARBERS & SALON BRAMPTON
            </h1>
            <p className="max-w-[90ch]">
              Step into a trusted neighbourhood barbershop delivering clean
              fades, beard shaping, and classic men’s grooming. With a{" "}
              <span className="text-golden font-semibold text-lg tracking-wide">
                4.6 ★{" "}
              </span>
              rating from{" "}
              <span className="text-golden font-semibold text-lg tracking-wide">
                740+ real customers
              </span>
              , VIP Barbers & Salon has become a go-to grooming spot for
              professionals, students, and the Punjabi community in Brampton.
              <br />
              <br /> Located on
              <span className="text-golden font-semibold text-lg tracking-wide">
                {" "}
                Queen St E,
              </span>{" "}
              our barbers focus on sharp detailing, straight-razor finishing,
              and haircuts built to match your face shape and lifestyle. No
              rushed cuts or guessing—just skilled hands and precise results,
              every visit.
            </p>
          </div>
          <div className="pb-10 leading-tight pt-10 flex flex-col gap-7  ">
            <div className="flex items-center gap-3">
              <span>
                {" "}
                <Image src="/logo2.png" width={40} height={40} alt="logo2" />
              </span>
              <div>
                <h1 className="text-xl leading-tight  ">
                  SKILLED & EXPERIENCED BARBERS
                </h1>
                <p>
                  Years of hands-on chair experience specializing in fades,
                  beard shaping & straight razor work.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span>
                {" "}
                <Image
                  src="/trimmerLogo.png"
                  width={40}
                  height={40}
                  alt="logo2"
                />
              </span>
              <div>
                <h1 className="text-xl leading-tight ">
                  CUSTOMIZED GROOMING FOR EVERY CLIENT
                </h1>
                <p>
                  We cut according to hair texture, face shape & personal
                  style—not one look for everyone.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span>
                {" "}
                <Image src="/icon-3.png" width={40} height={40} alt="logo2" />
              </span>
              <div>
                <h1 className="text-xl leading-tight ">
                  QUALITY PRODUCTS & CLEAN RESULTS
                </h1>
                <p>
                  Professional tools & grooming products used to protect hair
                  and maintain long-lasting shape.
                </p>
              </div>
            </div>
          </div>
          <button onClick={()=> router.push('/booking')}
          className="bg-white w-fit text-black px-6 py-4 hover:cursor-pointer hover:bg-golden transition-colors duration-500">
            Book Now
          </button>
        </div>
        <div className="min-w-[40%]">
          <Image src='/imageSecond.png' alt='imageSecond' width={450} height={300} className="relative top-10 left-25"/>
          <div className="relative bg-transparent backdrop-blur-sm left-5 w-70  h-74 z-10 bottom-27 px-5 py-6 border-2 border-gray-200">
            <h2 className="text-golden font-bold text-2xl">OPENING HOURS</h2>
            <div className="pt-2 text-xl leading-relaxed border-b-2 border-dashed  pb-6">
            <p> MONDAY - FRIDAY</p>
            <p>09:00 AM - 09:00 PM </p>
            </div>
             <div className="text-xl leading-relaxed pt-5 pb-6">
            <p> SATURDAY - SUNDAY </p>
            <p> 11:00 AM - 7:00 PM </p>
            </div>
            
            
            </div>
        </div>
      </div>
    </>
  );
};

export default Second;
'use client'
import { FaArrowRightLong } from "react-icons/fa6";
import Image from 'next/image'
import { useState } from "react";
import ServicesModal from "./ServicesModal";

const Services = () => {
    const [cardSelected, setCardSelected] = useState<number| null>(null)
    const detailedServices = [
  {
    title: "Haircuts",
    desc: "Precision cuts tailored to your style, hair texture, and face shape. Experience clean lines and sharp detailing every time.",
    icon: "/sHairCut.png"
  },
  {
    title: "Shaving",
    desc: "A classic hot-lather shave with razor-sharp definition, soothing oils, and a smooth, irritation-free finish.",
    icon: "/sShaving.png"
  },
  {
    title: "Beard Trims",
    desc: "Shape, sculpt, and define your beard with precision techniques that enhance your jawline and look.",
    icon: "/sBeared.png"
  },
  {
    title: "Hair Coloring",
    desc: "Professional hair color that blends naturally, adds depth, and refreshes your overall appearance.",
    icon: "/sHairColouring.png"
  },
  {
    title: "Face Care",
    desc: "Deep-clean facial treatments designed to remove impurities and rejuvenate your skin for a healthier glow.",
    icon: "/sFaceCare.png"
  },
  {
    title: "Styling",
    desc: "Modern styles, blow-outs, and finishing touch work to make your hair look sharp, polished, and event-ready.",
    icon: "/sStyling.png"
  }
];

  return (
    <div className='min-h-screen bg-neutral-900 flex flex-col items-center  '>
        <div className='flex items-center gap-3 pt-10'>
            <span className='w-8 h-1 bg-golden flex '></span>
            <p> Explore our services</p>
        </div>

        <div className='grid grid-cols-3  my-10 px-48 gap-6'>
            {detailedServices.map((s,i)=>
            <div key={i}
            className='border w-auto flex flex-col gap-5 px-7 pt-7'>
                <span>
                <Image src={s.icon} alt='logo' width={60} height={60} className=''/>
                </span>
                <span className='text-2xl font-semibold uppercase'>{s.title}</span>
                <span>{s.desc}</span>
                <button onClick={()=>setCardSelected(i)}
                className='flex items-center gap-3 text-md py-4 hover:text-golden transition-colors duration-300 tracking-wider font-semibold hover:cursor-pointer'>
                    READ MORE <FaArrowRightLong />
                    </button>
                    
            </div>
            )}
            { cardSelected !==null && (
                        <ServicesModal 
                        index={cardSelected}
                        onClose={()=>setCardSelected(null)}
                        />
                    )

                    }

            


        </div>
          </div>
        
    
  )
}

export default Services'use client'
import Image from "next/image"
import { RxCross2 } from "react-icons/rx"

interface props{
  index : null|number
  onClose: ()=>void
}
interface Service{
  id:number
  title: String
  icon: String
  desc: String
  price: number

}



const ServicesModal = (props:props) => {
  

  const data = [
  {
    title: 'Haircut',
    id: 0,
    icon: '/services/haircuthero.jpg',
    price: 27,
    desc: 'Experience a clean, professional haircut tailored to your face shape, hair type, and personal style. Our haircut includes clipper and scissor blending, taper detailing, neckline cleanup, and a polished finish using premium styling products. Whether you want a modern fade, a classic gentleman’s cut, or a simple refresh, we shape the cut to enhance your look and grow out naturally. Walk out feeling sharp, confident, and completely renewed.'
  },

  {
    title:'Shaving',
    id: 1,
    icon:'/services/shaving.avif',
    price: 20,
    desc:'Enjoy a luxurious hot-lather shave using premium oils and soothing steam towels. Each shave is performed with a precision razor, shaping clean lines while minimizing irritation and razor burn. We finish with calming aftershave balms and moisturizers, leaving your skin smooth, refreshed, and razor sharp.'
  },

  {
    title:'Beard Trim',
    id: 2,
    icon:'/services/beard.jpg',
    price: 22,
    desc:'Enhance your beard with expert shaping and detailed trimming designed to match your face structure and beard density. We blend lines, redefine edges, and maintain symmetry while keeping volume intact. Includes conditioning oils and styling for a clean, powerful look.'
  },

  {
    title:'Hair Coloring',
    id: 3,
    icon:'/services/haircolour.jpg',
    price: 55,
    desc:'Professional hair coloring that enhances depth, blends gray, and elevates your personal style. We use ammonia-free, damage-controlled formulas to maintain hair strength and shine. From subtle tones to bold transformations, we match your vision with expert precision.'
  },

  {
    title:'Face Care',
    id: 4,
    icon:'/services/facecare.jpg',
    price: 35,
    desc:'A deep facial cleansing treatment that removes buildup, unclogs pores, and restores skin vitality. Using professional exfoliants, steam, masks, and hydration serums, we rejuvenate your complexion, reduce dullness, and leave your face noticeably brighter and healthier.'
  },

  {
    title:'Styling',
    id: 5,
    icon:'/services/styling.jpg',
    price: 25,
    desc:'Get a magazine-ready finish with professional styling and blow-dry techniques. Whether you want volume, texture, sleek finish, or a messy casual look, we sculpt hair using premium products for hold, movement, and long-lasting structure suited to your occasion.'
  }
];



   if(props.index===null) return null;

   const service = data.find(item => item.id === props.index)
   if (!service) return null;

  return (
    <div className="min-h-screen fixed overflow-scroll inset-y-1 bg-transparent inset-x-30 backdrop-blur-3xl z-51">    
      <div className="flex items-center text-center w-full justify-between  ">
        <span></span>
        <h1 className=" py-15 text-6xl uppercase text-golden font-semibold tracking-widest">
        {service.title}</h1>
         <RxCross2 size={40} 
         onClick={props.onClose}
         className="font-bold hover:cursor-pointer"/>
       
      </div>


    <div className="flex flex-col items-center gap-20 px-30 text-2xl">
      <p className="">
        {service.desc}
      </p>

      <Image src={service.icon} alt="haircut" width={1000} height={100} 
      className="h-125 object-fill"  />

      <div className="flex items-center justify-between w-full pb-10">
        <div className="border py-5 px-8 flex items-baseline gap-1">
        <span className="text-5xl text-golden font-bold"> ${service.price}</span> <p>/ PERSON</p>
        </div>
        <button className=" px-8 py-6 font-semibold hover:cursor-pointer hover:text-golden text-4xl border border-white ">Book now</button>
      </div>


       
     </div>
    </div>
    
     
  
  )
}

export default ServicesModalimport Image from "next/image"

const Teams = () => {

    const team=[
        {
            image:'/teams/barber_1.jpg',
            name:'Michel Sharelin',
            speciality:'Beard & triming'
        },
        {
            image:'/teams/barber_2.jpg',
            name:'Hasib Hossain',
            speciality:'Haircut specialist'
        },
        {
            image:'/teams/barber_3.jpg',
            name:'Rukshana Islam',
            speciality:'Makeup artist'
        },
    ]
    const logos =[
        {
            logo:'/teams/barber_logo1.png',
            heading:'Years Experience',
            numbers:10
        },
         {
            logo:'/teams/barber_logo2.png',
            heading:'Hair Stylists',
            numbers:4
        },
         {
            logo:'/teams/barber_logo3.png',
            heading:'Happy Customers',
            numbers: '1000+'
        },
        {
            logo: '/teams/barber_logo1.png',
            heading:'Google Maps Ratings',
            numbers:4.2
        }
    ]





  return (
    <div className='min-h-screen bg-neutral-900 flex flex-col justify-between max-w-full items-center'>
        <div className="flex flex-col items-center py-20 gap-5">
            <h4 className="text-xl uppercase font-medium tracking-wide">Our Barbers</h4>
            <h1 className="text-6xl font-semibold tracking-wide text-golden pb-2">Professional Team</h1>
            <Image src='/teams/mustachesLogo.png' alt="" width={250} height={10} />
        </div>

        <div className="flex items-center gap-5  ">
            {team.map(({image,name,speciality},i)=>
               <div className="border border-golden/40 flex flex-col items-center gap-4 h-full p-5 "
             key={i}>
                <Image src={image} alt="barber_1" width={300} height={80}  />
                <span className="text-2xl font-bold text-golden uppercase ">{name}</span>
                <span className="text-xl font-medium">{speciality}</span>
            </div>               
            )}
        </div>

        <div className=" flex items-center min-h-100 justify-center gap-x-15 w-full">
            {logos.map((l,i)=>
            <div key={i}>
                 <div className="flex items-center gap-6">
                <span>
                    <Image src={l.logo} alt="logo1" width={100} height={100}
                    />
                </span>
                <div className="flex flex-col">
                    <span className="text-golden text-3xl font-semibold tracking-tighter">{l.numbers}</span>
                    <span className="font-medium text-xl">{l.heading}</span>
                </div>
            </div>

            </div>
            )}
           

           
        </div>
    </div>
  )
}

export default Teams