'use client'
import { useCart } from "@/context/cartContext";
import { service } from "@/data/services";
import { useRouter } from "next/navigation";


const PriceList = () => {

  const {cart, addToCart, removeFromCart} = useCart()
  const router = useRouter()

  return (
    <div className='min-h-screen bg-neutral-900'>
        <div className='text-center py-5 text-7xl bg-gradient-to-r from-golden/60 to-goldenbg/90 font-bold uppercase tracking-widest '>
            Pricing Best deal for you
         </div>
        <div className='pt-15 grid md:grid-cols-2 px-18 gap-x-28 gap-y-25 pb-8 border-white'>
            {service.map((s,i)=>   { 
              
              const isAdded = cart.some((c)=>c.id===s.id)
              return(
            <div key={s.id}
            className='text-white flex justify-between items-center gap-5 font-normal border-b border-white/25 pb-3 tracking-wide text-2xl'>
                <div>
                  <span>{i+1}. </span>
                <span>{s.name}</span>
                </div>
                <div className='flex gap-4 items-center'>
                  <span className='text-golden font-semibold'>${s.price}</span>
                <button 
                onClick={()=> isAdded? removeFromCart(s.id):  addToCart(s)}
                 className='hover:cursor-pointer active:scale-95 px-4 text-base rounded-full bg-amber-700 py-1 '>
                   {isAdded ? "Remove" : "Add to Cart +"}
                </button>
                </div>     
        </div>
              )}

        )}
       
        </div>
         {cart.length > 0 && 
        <div className="fixed right-20 bottom-6 z-100">
          <button 
          onClick={()=>router.push('/booking')}
          
          className="text-white text-xl font-xl px-5 py-2 border- rounded-4xl bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 hover:cursor-pointer">
            Check Out
          </button>
          
        </div>}
        
    </div>
  )
}

export default PriceList