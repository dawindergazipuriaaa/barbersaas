    import mongoose, {Schema, Model} from "mongoose";
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
    export default Barber