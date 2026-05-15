'use client'
import { Servicetype, service } from "@/data/services"
import { useContext, createContext, useState, useEffect } from "react"


type cartContextType = {
    cart: Servicetype[];
    addToCart: (service:Servicetype) => void
    removeFromCart: (id:string) =>void 
    clearCart:()=> void
}


const cartContext = createContext<cartContextType|null>(null)

export  const CartProvider = ({children}:{children:React.ReactNode}) => {

    const [cart, setCart] = useState<Servicetype[]> ([])
    useEffect(()=>{
          try {
             const storedCart =  localStorage.getItem("cart")
           if(storedCart) setCart(JSON.parse(storedCart))            
          } catch (error) {
        console.error(error)
        
          }
    },[])

    useEffect(()=>{
        localStorage.setItem("cart",JSON.stringify(cart))

    },[cart])
   
    
    const addToCart = (service:Servicetype)=>{
        setCart((prev)=>
            prev.find((item)=>item.id === service.id)
        ?prev
        :[...prev, service]
        )
    }
    const removeFromCart =(id:string)=>{
      setCart((prev)=>
        prev.filter((item)=> item.id !== id)
      )
    }
    const clearCart =()=>{
      setCart([])

    }
       
  return (
    <cartContext.Provider value={{cart, addToCart, removeFromCart, clearCart}}>
     {children}
    </cartContext.Provider>
  )
}

export const useCart=()=>{
   const ctx = useContext(cartContext)
   if (!ctx) throw new Error("use Cart must be used inside CartProvider");

   return ctx;

}
//export const useCart=()=>{
//     const ctx = useContext(cartContext);
//     if (!ctx) throw new Error("use Cart must be used inside CartProvider");
//     return ctx;


// 'use client'
// import { useContext, createContext, useState, useEffect } from 'react'
// import { Service } from '@/data/services'


// type cartContextType ={
//     cart: Service[]
//     addToCart:(service:Service) =>void;
// }

// const cartContext = createContext<cartContextType|null>(null)

// export const CartProvider = ({children}:{children:React.ReactNode}) => {

//     const [cart, setCart] = useState<Service[]>([])

//     useEffect(()=>{
//        try {
//          const storedCart = localStorage.getItem("cart")
//         if(storedCart){
//             setCart(JSON.parse(storedCart))
//         }
        
//        } catch (error) {
//         throw new Error("sdkf")
        
//        }
//     },[])
//     useEffect(()=>{
//         localStorage.setItem("cart",JSON.stringify(cart))

//     },[cart])


//     const addToCart=(service:Service)=>{
//         setCart((prev)=>
//             prev?.find((item)=>item.id === service.id)
//             ?prev
//             :[...prev, service]
//         )
//     }
//   return (
//     <cartContext.Provider value={{cart, addToCart}}>
//         {children}
//     </cartContext.Provider>
//   )
// }

// export const useCart=()=>{
//     const ctx = useContext(cartContext);
//     if (!ctx) throw new Error("use Cart must be used inside CartProvider");
//     return ctx;
// }