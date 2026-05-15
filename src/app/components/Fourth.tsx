import { FaRegHandPointer } from "react-icons/fa";
import Link from "next/link";

const Fourth = () => {


  const essentialsPackage =[
 ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HAIR WASH & CONDITIONING", true],
  ["LINE UP / EDGING", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", false]
];
const deluxePackage = [
  ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", true],
  ["HAIR COLOUR TOUCH-UP", true],
  ["BLACK MASK FACIAL", true]
]; 
  const groomPackage=[
  ["CLASSIC HAIRCUT", true],
  ["BEARD TRIM & SHAPE", true],
  ["HOT TOWEL SHAVE", true],
  ["SCALP MASSAGE", true],
  ["AFTERCARE PRODUCTS", true],
  ["EYEBROW GROOMING", false]    
  ]


  return (
    <div className='min-h-screen min-w-full flex flex-col items-center bg-neutral-900 overflow-hidden'>
      <div className=' w-full flex flex-col items-center pt-10 py-10'>
        <h2 className='text-6xl font-bold text-white '>Our Barbers. Your Style.</h2>
      </div>

        {/* Card One */}
      <div className='flex px-19 w-full justify-between h-[81vh] gap-6 mb-10 '>
        <div className='w-1/3 h-full justify-between border flex flex-col'>
        <div>
        <h1 className='text-4xl font-bold  p-4 text-golden  text-center '>Essentials Package </h1>
           <p className='text-center text-lg px-4 py-2 text-white bg-gradient-to-r from-golden/10 via-golden/20 to-golden/30 uppercase tracking-tighter font-medium'>
            Most Popular for Everyday Look</p> 
           </div>
        <div className="flex flex-col grow "> 
          {essentialsPackage.map(([title, included],i)=>
           <div key={i}>
           <div className='text-white border-b-2 justify-between text-xl font-md flex items-center mx-7 py-4 '>
            <span> {title} </span>
            {included ? 
            (<span className="pr-3 text-golden text-xl font-bold">
              ✔</span>)
            :( <span className="pr-3 text-golden text-xl font-bold">
              ✖</span>)}
           </div>
          </div>
          )}
        </div>
        <div className="flex items-center p-8 justify-between ">
          <div className="flex items-center ">
                <span className="w-8 h-1 bg-white mr-3"></span>
                <p className="text-golden text-4xl font-bold">$120</p>
                </div>
               
               <Link href="/booking?package=essentials">
                <div className="bg-golden text-black text-xl flex items-center p-3 hover:cursor-pointer gap-1">
                   <p>Book Now</p> 
                  <FaRegHandPointer /></div>
                  </Link>
                
              </div>
            </div>




        {/* Card two */}
        <div className='w-1/3 border h-full'>
        <div>
          <h1 className='text-4xl font-bold  p-4 text-golden  text-center '> Groom Package </h1>
        <p className='text-center text-lg px-4 py-2 text-white bg-gradient-to-r from-golden/10 via-golden/20 to-golden/30 uppercase tracking-tighter font-medium'>Premium men’s Grooming Experience</p>
        </div>
        <div className="flex flex-col grow "> 
          {groomPackage.map(([title, included],i)=>
           <div key={i}>
           <div className='text-white border-b-2 justify-between text-xl font-md flex items-center mx-7 py-4 '>
            <span> {title} </span>
            {included ? 
            (<span className="pr-3 text-golden text-xl font-bold">
              ✔</span>)
            :( <span className="pr-3 text-golden text-xl font-bold">
              ✖</span>)}
           </div>
          </div>
          )}
        </div>
        <div className="flex items-center p-8 justify-between ">
          <div className="flex items-center ">
                <span className="w-8 h-1 bg-white mr-3"></span>
                <p className="text-golden text-4xl font-bold">$150</p>
                </div>
                <div className="bg-golden text-black text-xl flex items-center p-3 hover:cursor-pointer gap-1"> <p>Book Now</p> 
                  <FaRegHandPointer /></div>
                
              </div>        
        </div>




          {/* Card 3rd */}
        <div className='w-1/3 h-full border'>
        <div>
          <h1 className='text-4xl font-bold  p-4 text-golden  text-center '> Deluxe Package </h1>
           <p className='text-center text-lg px-4 py-2 text-white bg-gradient-to-r from-golden/10 via-golden/20 to-golden/30 uppercase tracking-tighter font-medium'>Pick as you suit</p></div> 
        <div className="flex flex-col grow "> 
          {deluxePackage.map(([title, included],i)=>
           <div key={i}>
           <div className='text-white border-b-2 justify-between text-xl font-md flex items-center mx-7 py-4 '>
            <span> {title} </span>
            {included ? 
            (<span className="pr-3 text-golden text-xl font-bold">
              ✔</span>)
            :( <span className="pr-3 text-golden text-xl font-bold">
              ✖</span>)}
           </div>
          </div>
          )}
        </div>
        <div className="flex items-center p-8 justify-between ">
          <div className="flex items-center ">
                <span className="w-8 h-1 bg-white mr-3"></span>
                <p className="text-golden text-4xl font-bold">$200</p>
                </div>
                <div className="bg-golden text-black text-xl flex items-center p-3 hover:cursor-pointer gap-1"> <p>Book Now</p> 
                  <FaRegHandPointer /></div>
                
              </div>
        </div>
      </div>
    </div>
  )
}

export default Fourth