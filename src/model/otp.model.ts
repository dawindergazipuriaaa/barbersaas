import mongoose, { Document, Model, Schema } from "mongoose";

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
