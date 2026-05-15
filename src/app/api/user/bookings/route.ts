import authOptions from "@/lib/authOptions";
import { getServerSession } from "next-auth";

export async function GET(){
    try {
        const session = await getServerSession(authOptions)
        if(!session)
    } catch (error) {
        
    }
}