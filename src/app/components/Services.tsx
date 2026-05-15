'use client'
import { FaArrowRightLong } from "react-icons/fa6";
import Image from 'next/image'
import { useState } from "react";
import ServicesModal from "./ServicesModal";

const Services = () => {
    const [cardSelected, setCardSelected] = useState<number| null>(null)
    const detailedServices = [
  {
    title: "Haircuts",
    desc: "Precision cuts tailored to your style, hair texture, and face shape. Experience clean lines and sharp detailing every time.",
    icon: "/sHairCut.png"
  },
  {
    title: "Shaving",
    desc: "A classic hot-lather shave with razor-sharp definition, soothing oils, and a smooth, irritation-free finish.",
    icon: "/sShaving.png"
  },
  {
    title: "Beard Trims",
    desc: "Shape, sculpt, and define your beard with precision techniques that enhance your jawline and look.",
    icon: "/sBeared.png"
  },
  {
    title: "Hair Coloring",
    desc: "Professional hair color that blends naturally, adds depth, and refreshes your overall appearance.",
    icon: "/sHairColouring.png"
  },
  {
    title: "Face Care",
    desc: "Deep-clean facial treatments designed to remove impurities and rejuvenate your skin for a healthier glow.",
    icon: "/sFaceCare.png"
  },
  {
    title: "Styling",
    desc: "Modern styles, blow-outs, and finishing touch work to make your hair look sharp, polished, and event-ready.",
    icon: "/sStyling.png"
  }
];

  return (
    <div className='min-h-screen bg-neutral-900 flex flex-col items-center  '>
        <div className='flex items-center gap-3 pt-10'>
            <span className='w-8 h-1 bg-golden flex '></span>
            <p> Explore our services</p>
        </div>

        <div className='grid grid-cols-3  my-10 px-48 gap-6'>
            {detailedServices.map((s,i)=>
            <div key={i}
            className='border w-auto flex flex-col gap-5 px-7 pt-7'>
                <span>
                <Image src={s.icon} alt='logo' width={60} height={60} className=''/>
                </span>
                <span className='text-2xl font-semibold uppercase'>{s.title}</span>
                <span>{s.desc}</span>
                <button onClick={()=>setCardSelected(i)}
                className='flex items-center gap-3 text-md py-4 hover:text-golden transition-colors duration-300 tracking-wider font-semibold hover:cursor-pointer'>
                    READ MORE <FaArrowRightLong />
                    </button>
                    
            </div>
            )}
            { cardSelected !==null && (
                        <ServicesModal 
                        index={cardSelected}
                        onClose={()=>setCardSelected(null)}
                        />
                    )

                    }

            


        </div>
          </div>
        
    
  )
}

export default Services