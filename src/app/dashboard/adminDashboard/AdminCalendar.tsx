'use client'

import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import BookingModal from "./bookingModel" // Adjust import path if needed
import BarberGrid from "./BarberGrid"     // Adjust import path if needed

type ValuePiece = Date | null
type date = ValuePiece | [ValuePiece, ValuePiece]

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState<date>(new Date())
  const [bookings, setBookings] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{ barber: any, time: string, booking?: any } | null>(null)
  const [newBooking, setNewBooking] = useState({ customerName: '', service: '', contact: '' })

  useEffect(() => {
    if (selectedDate instanceof Date) {
      const offset = selectedDate.getTimezoneOffset()
      const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000))
      fetchbookings(localDate.toISOString().split("T")[0])
    }
  }, [selectedDate])

  const fetchbookings = async (dateStr: string) => {
    try {
      const res = await fetch(`/api/admin/bookings?date=${dateStr}`)
      const data = await res.json()
      if (data.success) {
        setBookings(data.bookings)
        setBarbers(data.barbers)
      }
    } catch (error) {
      console.error("Failed to fetch bookings", error)
    }
  }

  const handleAction = async (action: 'cancel' | 'add') => {
    if (!selectedSlot) return;
    
    let dateStr = "";
    if (selectedDate instanceof Date) {
      const offset = selectedDate.getTimezoneOffset()
      const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000))
      dateStr = localDate.toISOString().split("T")[0]
    }
    
    let res;
    if (action === 'cancel') {
      const reason = prompt("Enter reason for cancellation (optional):") || "Cancelled by Admin";
      res = await fetch(`/api/admin/bookings/${selectedSlot.booking._id}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
    } else if (action === 'add') {
      res = await fetch(`/api/admin/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBooking,
          barberId: selectedSlot.barber._id,
          time: selectedSlot.time,
          date: dateStr
        })
      });
    }

    const data = await res?.json();
    if (data?.success) {
      fetchbookings(dateStr);
      setSelectedSlot(null);
      setNewBooking({ customerName: '', service: '', contact: '' });
    } else {
      alert("Action failed: " + data?.message);
    }
  }

  const bookingMap = bookings.reduce((acc: any, booking: any) => {
    const barberId = booking.barberId?._id || booking.barberId
    const key = `${barberId}-${booking.time}`
    acc[key] = booking
    return acc
  }, {})

  return (
    <div className="flex flex-col items-center w-full px-4 md:px-8  bg-neutral-900 min-h-screen">
      <div className="w-full max-w-4xl rounded-2xl bg-neutral-800 p-6  shadow-xl">
        
        <div className="custom-dark-calendar">
          <Calendar
            onChange={(val) => setSelectedDate(val as date)}
            value={selectedDate}
            showNeighboringMonth={false}
            next2Label={null}
            prev2Label={null}
          />
        </div>

        <div className="mt-6 flex justify-between items-center bg-neutral-700/50 p-4 rounded-lg">
          <span className="text-neutral-300 font-medium">
            📅 {selectedDate instanceof Date ? selectedDate.toDateString() : "None"}
          </span>
          <span className="bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold">
            {bookings.length} Bookings
          </span>
        </div>

        {/* REPLACED LARGE CHUNK WITH ONE LINE */}
        <BarberGrid 
          barbers={barbers} 
          bookingMap={bookingMap} 
          selectedDate={selectedDate}
          onSlotClick={(barber, time, booking) => setSelectedSlot({ barber, time, booking })} 
        />
      </div>

      {/* REPLACED LARGE CHUNK WITH ONE LINE */}
      <BookingModal 
        selectedSlot={selectedSlot}
        newBooking={newBooking}
        setNewBooking={setNewBooking}
        onAction={handleAction}
        onClose={() => setSelectedSlot(null)}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-dark-calendar .react-calendar { width: 100%; background: transparent; border: none; font-family: inherit; }
        .custom-dark-calendar .react-calendar__navigation { display: flex; margin-bottom: 1rem; }
        .custom-dark-calendar .react-calendar__navigation button { color: white; min-width: 44px; background: transparent; font-size: 1.125rem; font-weight: 600; }
        .custom-dark-calendar .react-calendar__navigation button:enabled:hover { background-color: #404040; border-radius: 8px; }
        .custom-dark-calendar .react-calendar__month-view__weekdays { color: #a3a3a3; text-transform: uppercase; font-size: 0.75rem; text-align: center; }
        .custom-dark-calendar .react-calendar__month-view__weekdays__weekday abbr { text-decoration: none; }
        .custom-dark-calendar .react-calendar__tile { color: #e5e5e5; padding: 1rem; border-radius: 8px; margin-top: 4px; }
        .custom-dark-calendar .react-calendar__tile:enabled:hover { background-color: #404040; }
        .custom-dark-calendar .react-calendar__tile--now { background-color: #2563eb; color: white; }
        .custom-dark-calendar .react-calendar__tile--active { background-color: #f59e0b !important; color: black !important; font-weight: bold; }
      `}} />
    </div>
  )
}


// 'use client'

// import Booking from "@/model/booking.model"
// import { useState } from "react"
// import Calendar from "react-calendar"
// import "react-calendar/dist/Calendar.css"

// type ValuePiece = Date | null
// type date = ValuePiece | [ValuePiece, ValuePiece]//either one date or [startdate, end date] but the range is not true so only one date will be used but the range here so typescript won't throw error

// export default function AdminCalendar() {
//   const [selectedDate, setSelectedDate] = useState<date>(new Date())
//   const [bookings, setBookings] = useState<any[]>([])
//   const [barbers, setBarbers] = useState<any[]>([])

//   const timeSlots = [
//   "10:00","10:30","11:00","11:30",
//   "12:00","12:30","13:00","13:30",
//   "14:00","14:30","15:00","15:30",
//   "16:00","16:30","17:00","17:30",
//   "18:00","18:30","19:00","19:30",
//   "20:00","20:30","21:00","21:30"
// ]

//   const handleDateClick = (value: date) => {
//     setSelectedDate(value)

//     if (value instanceof Date) {
//       const formatted = value.toISOString().split("T")[0]
//       fetchbookings(formatted)
//     }
//   }
//   const fetchbookings = async(date:string)=>{
//     try {
//       const res = await fetch(`/api/admin/bookings?date=${date}`)
//       const data = await res.json()
//       if(data.success){
//         setBookings(data.bookings)
//         setBarbers(data.barbers)
//       }
//     } catch (error) {
//       console.error("Failed to fetch bookings", error)
//     }
//   }
//   const bookingMap = bookings.reduce((acc:any,booking:any)=>{
//     const key =`${booking.barberId._}-${booking.time}`
//     acc[key] = booking
//     return acc
//   },{})

//   return (
//     <div className="flex w-full justify-center px-8">
//       <div className="rounded-2xl bg-neutral-800 p-6 shadow-xl">
        
//         {/* The wrapper class limits our custom styles to just this calendar */}
//         <div className="custom-dark-calendar">
//           <Calendar
//             onChange={handleDateClick}
//             value={selectedDate}
//             showNeighboringMonth={false} // Hides next/prev month days
//             next2Label={null} // Removes '>>'
//             prev2Label={null} // Removes '<<'
//           />
//         </div>

//         <div className="mt-6 rounded-lg bg-neutral-700/50 p-3 text-center text-sm font-medium text-neutral-300">
//           Selected: {selectedDate instanceof Date ? selectedDate.toDateString() : "None"}
//         </div>
//         <div className="mt-4 text-center text-white">
//           Total Bookings: {bookings.length}
//         </div>
//         <div className="mt-10">
//   {barbers.map((barber:any) => (
//     <div key={barber._id} className="mb-6">

//       <h3 className="text-lg text-white mb-2 font-semibold">
//         {barber.name}
//       </h3>

//       <div className="grid grid-cols-6 gap-2">

//         {timeSlots.map(slot => {

//           const booking = bookingMap[`${barber._id}-${slot}`]

//           return (
//             <div
//               key={slot}
//               className={`p-2 text-center rounded text-sm
//                 ${booking
//                   ? "bg-red-600 text-white"
//                   : "bg-green-600 text-white"}
//               `}
//             >
//               {slot}
//             </div>
//           )
//         })}

//       </div>

//     </div>
//   ))}
// </div>
//       </div>

//       {/* Injecting standard CSS directly into the component.
//         This uses exact Tailwind hex colors for seamless integration.
//       */}
//       <style dangerouslySetInnerHTML={{ __html: `
//         .custom-dark-calendar .react-calendar {
//           width: 100%;
//           background: transparent;
//           border: none;
//           font-family: inherit;
//         }
        
//         /* Header Navigation */
//         .custom-dark-calendar .react-calendar__navigation {
//           display: flex;
//           margin-bottom: 1rem;
//           gap: 0.25rem;
//         }
//         .custom-dark-calendar .react-calendar__navigation button {
//           color: white;
//           min-width: 44px;
//           background: transparent;
//           border-radius: 0.5rem;
//           padding: 0.5rem;
//           font-size: 1.125rem;
//           font-weight: 600;
//           transition: background-color 0.2s;
//         }
//         .custom-dark-calendar .react-calendar__navigation button:enabled:hover,
//         .custom-dark-calendar .react-calendar__navigation button:enabled:focus {
//           background-color: #404040; /* neutral-700 */
//         }
        
//         /* Weekdays (Sun, Mon, Tue) */
//         .custom-dark-calendar .react-calendar__month-view__weekdays {
//           color: #a3a3a3; /* neutral-400 */
//           font-weight: 500;
//           text-transform: uppercase;
//           font-size: 0.75rem;
//           margin-bottom: 0.75rem;
//           text-align: center;
//         }
//         .custom-dark-calendar .react-calendar__month-view__weekdays__weekday abbr {
//           text-decoration: none;
//         }
        
//         /* Day Tiles */
//         .custom-dark-calendar .react-calendar__tile {
//           color: #e5e5e5; /* neutral-200 */
//           background: transparent;
//           border-radius: 0.5rem;
//           padding: 0.75rem;
//           transition: all 0.2s;
//           outline: none;
//           margin-top: 0.25rem;
//         }
//         .custom-dark-calendar .react-calendar__tile:enabled:hover,
//         .custom-dark-calendar .react-calendar__tile:enabled:focus {
//           background-color: #404040; /* neutral-700 */
//         }
        
//         /* Today's Date (Blue) */
//         .custom-dark-calendar .react-calendar__tile--now {
//           background-color: #2563eb; /* blue-600 */
//           color: white;
//           font-weight: bold;
//         }
//         .custom-dark-calendar .react-calendar__tile--now:enabled:hover,
//         .custom-dark-calendar .react-calendar__tile--now:enabled:focus {
//           background-color: #3b82f6; /* blue-500 */
//         }
        
//         /* Selected Date (Amber) */
//         .custom-dark-calendar .react-calendar__tile--active,
//         .custom-dark-calendar .react-calendar__tile--hasActive {
//           background-color: #f59e0b !important; /* amber-500 */
//           color: black !important;
//           font-weight: bold;
//           box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
//         }
//         .custom-dark-calendar .react-calendar__tile--active:enabled:hover,
//         .custom-dark-calendar .react-calendar__tile--active:enabled:focus {
//           background-color: #fbbf24 !important; /* amber-400 */
//         }
//       `}} />
//     </div>
//   )
// }