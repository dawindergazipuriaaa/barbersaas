import ShowBarber from '@/app/dashboard/adminDashboard/ShowBarber'
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

    export default page