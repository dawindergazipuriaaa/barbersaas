import { BookingInput } from "@/types/booking";


export const validateBookingInput =(data:BookingInput)=>{
    
if(data.items.length === 0){
    throw new Error("At lease one service/Package is needed in Cart")
}
return data;
    
};

