import mongoose, { Document, Model, Schema } from "mongoose";

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

    