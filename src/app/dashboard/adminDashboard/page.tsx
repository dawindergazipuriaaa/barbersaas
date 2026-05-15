import ShowBarber from '@/app/dashboard/adminDashboard/ShowBarber'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminCalendar from './AdminCalendar'

const page = async () => {
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
    </div>
  )
}

export default page