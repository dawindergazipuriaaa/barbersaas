'use client'
import Image from "next/image";
import Navbar from "./Navbar";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";



const Hero = () => {
  const {cart} = useCart()

  const router = useRouter();


  return (
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src="/heroc.png"
        alt="123"
        fill
        priority
        className="object-cover -z-10 object-[70%_center]"
      />
      <Navbar />
    
      <div className="absolute border-gray-400 border left-45 mt-13 backdrop-blur-xs justify-around flex flex-col max-w-[25vw] text-white h-[63vh] ">
        <div className="leading-18 font-bold text-5xl flex pl-10  items-center">Relax And Recharge At VIP Salon</div>
        <div className="text-lg pl-10 font-semibold ">The Ultimate Satisfaction</div>
        <button onClick={()=> cart.length > 0 
          ? router.push('/booking')
          : document.getElementById('prices')?.scrollIntoView({behavior:"smooth"})
         } 
        className=" text-xl font-bold ml-7 border bg-gray-800 px-4 py-5 w-55 rounded-full hover:cursor-pointer hover:scale-95 ">
          Book Appointment</button>
      </div>


      <div className="absolute bottom-13 right-10 z-10 text-right flex gap-6 flex-col ">
        <h1
          className="px-6 py-3 bg-linear-to-l from-black/70 via-black/40 to-transparent backdrop-blur-[1px] text-sm font-semibold uppercase tracking-widest text-amber-300" >      
          Elevate Your Everyday Look
        </h1>
        <p className="font-bold text-6xl leading-tight text-gray-100 max-w-[45vw]">
          Trusted by Modern Gentlemen
        </p>
      </div>
    </div>
  );
};

export default Hero;
