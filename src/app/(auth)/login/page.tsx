'use client'
import { FcGoogle } from "react-icons/fc";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import { useState } from "react"
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const page = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()


  const handleSubmit = async (e:React.FormEvent)=>{
    e.preventDefault();  
    setIsLoading(true)  
    setErrorMsg("")
    
    try {
      const result = await signIn('credentials',{email, password, redirect:false})
      if(result?.error){
        setErrorMsg(result.error)
      }else{
        router.push('/dashboard')
      }
    } catch (error:any) {
      setErrorMsg("Login failed. Please try again")      
    }
    finally{
      setIsLoading(false)
    }
  }
  const isPasswordVisible=()=>{
    setShowPassword((prev)=>!prev)
  }


  return (
    <div className='min-h-screen flex items-center justify-center bg-neutral-900'>
      <div className="flex flex-col border-2 border-white/40 gap-5 items-center">
      <div className=" text-3xl items-center flex flex-col font-bold tracking-widest pt-15">
        Log In
      </div>  
        {errorMsg && ( <p className="mb-3 text-red-400 font-semibold text-center">
              {errorMsg}
            </p>)} 
      <form className="flex flex-col items-center border-white/40 pb-10 px-10 gap-10"
       onSubmit={handleSubmit}>  
           
      <input type="text" 
       placeholder="Email"
       value={email}
       onChange={(e)=>setEmail(e.target.value)}
       className="mt-2 flex border-b w-xl h-12 text-lg px-2 border-white/55 pb-1 tracking-widest placeholder:text-xl placeholder:text-pink-50 focus:outline-none"
       />


       <div className="flex items-center border-b border-white/55 pb-1 w-xl">
      <input type={showPassword? "text":"password"} placeholder="Password"
      value={password}
      onChange={(e)=>setPassword(e.target.value)}
       className="flex w-full h-12 text-lg px-2  tracking-widest placeholder:text-xl placeholder:text-pink-50 focus:outline-none"/>
       <button type="button" 
       className="pr-5 hover:cursor-pointer"
       onClick={isPasswordVisible}>
        
        {showPassword? <FaRegEye /> : <FaRegEyeSlash />}
       </button>

       </div>
      
      <button type="submit"
      disabled={isLoading}
      className={`self-center px-15 active:scale-95 mt-7 py-3 bg-goldenbg rounded-4xl text-xl font-semibold tracking-wider
        ${isLoading? "opacity-70 cursor-not-allowed scale-95":"hover:cursor-pointer"}
      `}>
        Submit</button>
      </form>



      <div className="flex items-center gap-5 justify-center w-full px-5">
          <hr className="flex-1 border-white/40"/>
             OR
          <hr className="flex-1 border-white/40" />
      </div>

      <div className="flex items-center gap-2"> <p>Log In with</p>
      <button 
      className=" hover:cursor-pointer flex items-center gap-2 font-semibold">
        <FcGoogle size={30} />GOOGLE</button>
      </div>
      <div className="w-full px-5 my-5 items-center gap-5 flex flex-col">
        <hr className="flex-1 w-full border-white/40"/>
      <p className="tracking-wider gap">Don't have an account
        <span onClick={()=>router.push('/signUp')}
         className="text-blue-300 hover:cursor-pointer mx-2 font-semibold underline"> Sign Up </span> here</p>
       
      
      </div>
      </div>
    </div>
  )
}

export default page