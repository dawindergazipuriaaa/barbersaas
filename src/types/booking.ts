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
