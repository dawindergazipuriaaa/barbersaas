'use client'
import Image from "next/image"
import { RxCross2 } from "react-icons/rx"

interface props{
  index : null|number
  onClose: ()=>void
}
interface Service{
  id:number
  title: String
  icon: String
  desc: String
  price: number

}



const ServicesModal = (props:props) => {
  

  const data = [
  {
    title: 'Haircut',
    id: 0,
    icon: '/services/haircuthero.jpg',
    price: 27,
    desc: 'Experience a clean, professional haircut tailored to your face shape, hair type, and personal style. Our haircut includes clipper and scissor blending, taper detailing, neckline cleanup, and a polished finish using premium styling products. Whether you want a modern fade, a classic gentleman’s cut, or a simple refresh, we shape the cut to enhance your look and grow out naturally. Walk out feeling sharp, confident, and completely renewed.'
  },

  {
    title:'Shaving',
    id: 1,
    icon:'/services/shaving.avif',
    price: 20,
    desc:'Enjoy a luxurious hot-lather shave using premium oils and soothing steam towels. Each shave is performed with a precision razor, shaping clean lines while minimizing irritation and razor burn. We finish with calming aftershave balms and moisturizers, leaving your skin smooth, refreshed, and razor sharp.'
  },

  {
    title:'Beard Trim',
    id: 2,
    icon:'/services/beard.jpg',
    price: 22,
    desc:'Enhance your beard with expert shaping and detailed trimming designed to match your face structure and beard density. We blend lines, redefine edges, and maintain symmetry while keeping volume intact. Includes conditioning oils and styling for a clean, powerful look.'
  },

  {
    title:'Hair Coloring',
    id: 3,
    icon:'/services/haircolour.jpg',
    price: 55,
    desc:'Professional hair coloring that enhances depth, blends gray, and elevates your personal style. We use ammonia-free, damage-controlled formulas to maintain hair strength and shine. From subtle tones to bold transformations, we match your vision with expert precision.'
  },

  {
    title:'Face Care',
    id: 4,
    icon:'/services/facecare.jpg',
    price: 35,
    desc:'A deep facial cleansing treatment that removes buildup, unclogs pores, and restores skin vitality. Using professional exfoliants, steam, masks, and hydration serums, we rejuvenate your complexion, reduce dullness, and leave your face noticeably brighter and healthier.'
  },

  {
    title:'Styling',
    id: 5,
    icon:'/services/styling.jpg',
    price: 25,
    desc:'Get a magazine-ready finish with professional styling and blow-dry techniques. Whether you want volume, texture, sleek finish, or a messy casual look, we sculpt hair using premium products for hold, movement, and long-lasting structure suited to your occasion.'
  }
];



   if(props.index===null) return null;

   const service = data.find(item => item.id === props.index)
   if (!service) return null;

  return (
    <div className="min-h-screen fixed overflow-scroll inset-y-1 bg-transparent inset-x-30 backdrop-blur-3xl z-51">    
      <div className="flex items-center text-center w-full justify-between  ">
        <span></span>
        <h1 className=" py-15 text-6xl uppercase text-golden font-semibold tracking-widest">
        {service.title}</h1>
         <RxCross2 size={40} 
         onClick={props.onClose}
         className="font-bold hover:cursor-pointer"/>
       
      </div>


    <div className="flex flex-col items-center gap-20 px-30 text-2xl">
      <p className="">
        {service.desc}
      </p>

      <Image src={service.icon} alt="haircut" width={1000} height={100} 
      className="h-125 object-fill"  />

      <div className="flex items-center justify-between w-full pb-10">
        <div className="border py-5 px-8 flex items-baseline gap-1">
        <span className="text-5xl text-golden font-bold"> ${service.price}</span> <p>/ PERSON</p>
        </div>
        <button className=" px-8 py-6 font-semibold hover:cursor-pointer hover:text-golden text-4xl border border-white ">Book now</button>
      </div>


       
     </div>
    </div>
    
     
  
  )
}

export default ServicesModal