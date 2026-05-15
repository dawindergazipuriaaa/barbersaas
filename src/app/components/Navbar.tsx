'use client'
import Image from "next/image"
import { FaPhoneVolume } from "react-icons/fa6";

const Navbar = () => {
  const scrollToSection =(id:string)=>{
    const element = document.getElementById(id)
     if(!element) return

     element.scrollIntoView({
      behavior:'smooth',
      block:'start'
     })

  }
  return (
    
      <div className=" pr-5 pt-3 bg-transparent w-screen flex justify-between items-center">
        <div className=" flex  pl-20 items-center">               
          <div className="font-bold text-3xl flex items-center">VIP Salon & Barber</div>
           {/* <Image src='/lll.png' width={80} height={0} alt='logo'/>    */}
        </div>
        <ul className="flex gap-10 px-10 py-4 font-bold">
            {[
                ["Home","about"],
                ['Prices','prices'],
                ['Services', 'services'],
                ['Team', 'team'],
                ['Gallery', 'gallery'],
                ['Contact Us', 'contactus']
            ].map(([label, id],i)=>(
                <li
                key={i}
                onClick={()=>scrollToSection(id)}
                className="hover:cursor-pointer uppercase"
                >
                  {label}
                </li>
                

            ))
            }


           
          </ul>
        <div className="flex gap-5 px-10 py-4 text-amber-500 font-bold items-center gap-10">
          <span className=""><FaPhoneVolume /></span> <p> +123 456 7890 </p>
        </div>
      </div>
      
  )
}

export default Navbar