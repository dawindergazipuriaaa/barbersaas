import { auth } from '@/lib/auth'
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

