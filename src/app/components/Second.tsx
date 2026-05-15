'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Second = () => {
  const router = useRouter()
  return (
    <>
      <div className="min-h-screen max-w-full flex bg-neutral-900">
        <div className="relative text-white flex w-48">
          <p>svg/img/logo</p>
        </div>
        <div className="relative h-screen flex flex-col text-linen max-w-[47vw] ">
          <div className="flex items-center gap-2 pt-10 text-sm">
            <span className="w-8 bg-golden h-1 flex flex-col items-center"></span>
            SINCE 2019
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold pb-5 text-4xl leading-tight">
              VIP BARBERS & SALON BRAMPTON
            </h1>
            <p className="max-w-[90ch]">
              Step into a trusted neighbourhood barbershop delivering clean
              fades, beard shaping, and classic men’s grooming. With a{" "}
              <span className="text-golden font-semibold text-lg tracking-wide">
                4.6 ★{" "}
              </span>
              rating from{" "}
              <span className="text-golden font-semibold text-lg tracking-wide">
                740+ real customers
              </span>
              , VIP Barbers & Salon has become a go-to grooming spot for
              professionals, students, and the Punjabi community in Brampton.
              <br />
              <br /> Located on
              <span className="text-golden font-semibold text-lg tracking-wide">
                {" "}
                Queen St E,
              </span>{" "}
              our barbers focus on sharp detailing, straight-razor finishing,
              and haircuts built to match your face shape and lifestyle. No
              rushed cuts or guessing—just skilled hands and precise results,
              every visit.
            </p>
          </div>
          <div className="pb-10 leading-tight pt-10 flex flex-col gap-7  ">
            <div className="flex items-center gap-3">
              <span>
                {" "}
                <Image src="/logo2.png" width={40} height={40} alt="logo2" />
              </span>
              <div>
                <h1 className="text-xl leading-tight  ">
                  SKILLED & EXPERIENCED BARBERS
                </h1>
                <p>
                  Years of hands-on chair experience specializing in fades,
                  beard shaping & straight razor work.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span>
                {" "}
                <Image
                  src="/trimmerLogo.png"
                  width={40}
                  height={40}
                  alt="logo2"
                />
              </span>
              <div>
                <h1 className="text-xl leading-tight ">
                  CUSTOMIZED GROOMING FOR EVERY CLIENT
                </h1>
                <p>
                  We cut according to hair texture, face shape & personal
                  style—not one look for everyone.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span>
                {" "}
                <Image src="/icon-3.png" width={40} height={40} alt="logo2" />
              </span>
              <div>
                <h1 className="text-xl leading-tight ">
                  QUALITY PRODUCTS & CLEAN RESULTS
                </h1>
                <p>
                  Professional tools & grooming products used to protect hair
                  and maintain long-lasting shape.
                </p>
              </div>
            </div>
          </div>
          <button onClick={()=> router.push('/booking')}
          className="bg-white w-fit text-black px-6 py-4 hover:cursor-pointer hover:bg-golden transition-colors duration-500">
            Book Now
          </button>
        </div>
        <div className="min-w-[40%]">
          <Image src='/imageSecond.png' alt='imageSecond' width={450} height={300} className="relative top-10 left-25"/>
          <div className="relative bg-transparent backdrop-blur-sm left-5 w-70  h-74 z-10 bottom-27 px-5 py-6 border-2 border-gray-200">
            <h2 className="text-golden font-bold text-2xl">OPENING HOURS</h2>
            <div className="pt-2 text-xl leading-relaxed border-b-2 border-dashed  pb-6">
            <p> MONDAY - FRIDAY</p>
            <p>09:00 AM - 09:00 PM </p>
            </div>
             <div className="text-xl leading-relaxed pt-5 pb-6">
            <p> SATURDAY - SUNDAY </p>
            <p> 11:00 AM - 7:00 PM </p>
            </div>
            
            
            </div>
        </div>
      </div>
    </>
  );
};

export default Second;
