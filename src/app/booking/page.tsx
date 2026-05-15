"use client";
  import { useEffect, useState } from "react";
  import { useCart } from "@/context/cartContext";
  import { PACKAGES } from "@/data/packages";
  import { useSearchParams } from "next/navigation";

  const page = () => {
    const searchParams = useSearchParams();
    const packageFromUrl = searchParams.get("package")
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const {cart, addToCart, removeFromCart, clearCart} = useCart();
    const [number, setNumber] = useState('')
    const [name, setName] = useState('')
    
    const [bookingDate, setBookingDate] = useState(new Date().toLocaleDateString("en-CA"))
    
    // NEW: State to hold available slots and a loading indicator
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [isLoadingSlots, setIsLoadingSlots] = useState(false)

    useEffect(()=>{
      if(!packageFromUrl) return;

    const selectedPackage = 
      PACKAGES[packageFromUrl as keyof typeof PACKAGES]
      if (!selectedPackage) return;

      addToCart({
        id: selectedPackage.id,
        name: selectedPackage.name,
        price:selectedPackage.price
      })
    },[packageFromUrl])

    // NEW: Fetch availability whenever the bookingDate changes
    useEffect(() => {
        const fetchAvailability = async () => {
          setIsLoadingSlots(true);
          try {
            const res = await fetch(`/api/availability?date=${bookingDate}`);
            const data = await res.json();
            if (data.success) {
              setAvailableSlots(data.availableSlots);
              // If the user previously selected a slot that is no longer available on this new date, deselect it
              if (selectedSlot && !data.availableSlots.includes(selectedSlot)) {
                setSelectedSlot(null);
              }
            } else {
              setAvailableSlots([]);
            }
          } catch (error) {
            console.error("Failed to fetch slots", error);
          }
          setIsLoadingSlots(false);
        };
  
        if (bookingDate) {
          fetchAvailability();
        }
      }, [bookingDate]);

    const timeSlots = [
      { label: "10:00 AM", value: "10:00" }, { label: "10:30 AM", value: "10:30" },
      { label: "11:00 AM", value: "11:00" }, { label: "11:30 AM", value: "11:30" },
      { label: "12:00 PM", value: "12:00" }, { label: "12:30 PM", value: "12:30" },
      { label: "01:00 PM", value: "13:00" }, { label: "01:30 PM", value: "13:30" },
      { label: "02:00 PM", value: "14:00" }, { label: "02:30 PM", value: "14:30" },
      { label: "03:00 PM", value: "15:00" }, { label: "03:30 PM", value: "15:30" },
      { label: "04:00 PM", value: "16:00" }, { label: "04:30 PM", value: "16:30" },
      { label: "05:00 PM", value: "17:00" }, { label: "05:30 PM", value: "17:30" },
      { label: "06:00 PM", value: "18:00" }, { label: "06:30 PM", value: "18:30" },
      { label: "07:00 PM", value: "19:00" }, { label: "07:30 PM", value: "19:30" },
      { label: "08:00 PM", value: "20:00" }, { label: "08:30 PM", value: "20:30" },
      { label: "09:00 PM", value: "21:00" }, { label: "09:30 PM", value: "21:30" },
    ];

    const totalPrice = cart.reduce((total, item)=>{
      return total + item.price
    },0)
    
    const handleConfirmBooking= async ()=>{
      if(!selectedSlot) return;
      const payload = {
        name,
        phone:number,
        date: bookingDate, 
        time: selectedSlot,
        items:cart.map((i)=>({
          id: i.id,
          name: i.name,
          price: i.price,
          type: i.type || "service",
        }))
      }
      try {
        const res = await fetch("/api/booking",{
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body: JSON.stringify(payload)
        })
        const result = await res.json();
            if (!res.ok) {
        throw new Error(result.message);
      }

      clearCart();
      setSelectedSlot(null); 
      setName("");
      setNumber("");
      
      // NEW: Refresh slots after a successful booking so the just-booked slot greys out
      const newAvailRes = await fetch(`/api/availability?date=${bookingDate}`);
      const newAvailData = await newAvailRes.json();
      if(newAvailData.success) setAvailableSlots(newAvailData.availableSlots);

      alert("Booking confirmed!");
      } catch (err) {
        alert(
          err instanceof Error ? err.message : "Something went wrong"
        );
      }
    };

    return (
      <div className="min-h-screen bg-neutral-900 px-[17%] py-[1.3%]">
        <div className="bg-graybg text-white min-h-[94vh] max-h-[94vh] overflow-y-auto rounded-2xl">
          {/* Header */}
          <div className="pt-14 pb-8 text-center">
            <h2 className="text-golden text-5xl font-bold tracking-widest">
              BOOK APPOINTMENT
            </h2>
            <p className="pt-3 tracking-wider">
              Professional grooming tailored to your schedule
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-2 px-10 gap-16 items-start">
            {/* LEFT COLUMN */}
            <div className="flex flex-col ">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  className="border w-full bg-black/40 border-white/30 py-3 pl-5 placeholder-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="tel"
                  placeholder="Number"
                  value={number}
                  onChange={(e)=>setNumber(e.target.value)}
                  className="border w-full bg-black/40 border-white/30 py-3 pl-5 placeholder-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="top-300 pt-7">
                <h4 className="pb-3 text-gray-400 uppercase">Select Date</h4>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toLocaleDateString("en-CA")} 
                  className="border border-white/40 p-3.5 bg-black/40 w-full focus:outline-none focus:border-amber-500 [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
               <div className="pt-7">
          <h4 className="pb-3 text-gray-400 uppercase ">Selected Service</h4>
          <div className="flex flex-col gap-3 h-[33vh] overflow-scroll ">
            {cart.map((ca,i)=>(
            <div key={i}
            className="text-white/80 flex justify-between text-xl ">
                <span> {i+1}. {ca.name}</span>
                <div>
                  <span className="text-golden">$ {ca.price}</span>
                  <button className="hover:cursor-pointer px-5 text-red-400 hover:text-red-500 transition-colors"
                  onClick={()=>removeFromCart(ca.id)}> - </button>
                </div>
              </div>
          )) }
          </div>
          <div className="flex justify-between px-3 py-2 text-xl font-semibold">
            <p className="text-golden ">Final Price</p>
            <p className="text-amber-500"> {totalPrice}</p>
          </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-10 text-gray-400">
              <div className="flex justify-between items-center">
                  <h4>3. Preferred Time</h4>
                  {isLoadingSlots && <span className="text-xs text-amber-500 animate-pulse">Checking Availability...</span>}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => {
                  const isAvailable = availableSlots.includes(slot.value);
                  const isSelected = selectedSlot === slot.value;
                  
                  return (
                    <button
                      key={slot.value}
                      onClick={() => isAvailable && setSelectedSlot(slot.value)}
                      disabled={!isAvailable || isLoadingSlots}
                      className={`px-3 py-3 font-semibold border transition-all
                        ${isSelected
                          ? "bg-amber-500 text-black border-amber-500 scale-95"
                          : !isAvailable || isLoadingSlots
                          ? "border-white/10 text-white/20 bg-black/20 cursor-not-allowed" // Greyed out styling!
                          : "border-white/30 hover:border-amber-400 text-white"
                        }
                      `}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>

              <button
               onClick={handleConfirmBooking}
                disabled={!selectedSlot || !name.trim() || !number.trim() || cart.length === 0}
                className="bg-amber-600 py-4 font-semibold tracking-wider text-white/80 text-xl
                  disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 hover:cursor-pointer transition-all"
              >
                CONFIRM BOOKING
              </button>
            </div>

            {/* FULL WIDTH BOOKING POLICY */}
            <div className="col-span-2 border-dashed border border-gray-400 py-6 px-8 rounded-md mt-6 mb-10">
              <h4 className="text-golden font-bold text-lg pb-3 text-center tracking-wider">
                Booking Policy
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed text-center max-w-3xl mx-auto">
                Please arrive at least 5 minutes before your scheduled time.
                Cancellations must be made a minimum of 24 hours in advance. Late
                arrivals may result in reduced service time.
              </p>
            </div>
            
          </div>
        </div>
      </div>
    );
  };

  export default page;