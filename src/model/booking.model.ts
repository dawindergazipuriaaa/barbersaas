import mongoose, {Schema, Model} from "mongoose";
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
export default Booking