'use client'
import { MdCancel } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import React, { useState } from 'react'
import { service } from "@/data/services";
import axios from "axios";

const AddNewBarber =  () => {
    const [barberName, setBarberName] = useState("")
    const [barberPhoneNumber, setBarberPhoneNumber] = useState("")
    const [barberEmail, setBarberEmail] = useState("")
    const [addBarber, setAddBarber] = useState(false)
    const [workingDays, setWorkingDays] = useState<string[]>([])
    const [startingTime, setStartingTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [breakStart, setBreakStart] = useState("")
    const [breakEnd, setBreakEnd] = useState("")

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const [selectedServices,setSelectedServices] = useState<string[]>([])
    const allServicesSelected = selectedServices.length === service.length
    
    const toggleAllServices =()=>{
      setSelectedServices( allServicesSelected ? []: service.map(s =>s.id))
    }
    const toggleService = (id:string)=>{
      setSelectedServices(prev=> prev.includes(id)? prev.filter(s=> s !== id) : [...prev,id])
    }
    const toggleDays =(day:string)=>{
      setWorkingDays((prev)=>!prev.includes(day)
    ? [...prev,day]
    : prev.filter((d)=> d !== day))
    }

    const handleSubmit= async (e:React.FormEvent)=>{
      e.preventDefault()
      if(!barberName || !barberEmail || !barberPhoneNumber || workingDays.length === 0 || !startingTime || !breakStart || !breakEnd || !endTime || selectedServices.length===0  ){
        alert("Please fill all the fields")
        return;
      }
      try {
        let res = await axios.post("/api/barbers",{
        name: barberName,
        email: barberEmail,
        phone: barberPhoneNumber,
        workingDays,
        workingHours: {
          start: startingTime,
          end: endTime,
        },
        lunchBreak:{
          start: breakStart,
          end: breakEnd,
        },
        services:selectedServices
      })
      alert("Congrats, Barber added Successfully")
      setBarberEmail("");
      setBarberName("");
      setBarberPhoneNumber("");
      setWorkingDays([]);
      setStartingTime("");
      setEndTime("");
      setSelectedServices([]);
      setBreakStart("");
      setBreakEnd("");
      setAddBarber(false)                
      } catch (error:any) {
        alert(error.response?.data?.message || "Something Went wrong")                
      }
    }
       
  return (<>
        <div className='relative'>   
          <button onClick={()=>setAddBarber(true)}
          className='text-golden flex items-center gap-2 hover:cursor-pointer active:scale-90'>
            <p>Add New Barber</p><FaPlus />
          </button>
        </div>

        {addBarber && (
            <div className="fixed inset-0 bg-neutral-800 flex flex-col itmes-center m-10 overflow-y-auto no-scrollbar">
                <div className="flex justify-end p-5 w-full ">
                    <MdCancel onClick={()=>setAddBarber(false)}
                    className="bg-white rounded-full hover:cursor-pointer active:scale-90 text-red-700" size={35}/>
                    </div>
                    <div className="flex justify-center text-4xl font-semibold pb-10">Add New Barber</div>
                    <form onSubmit={handleSubmit} className="px-20 pb-15 gap-15">
                      <div className="grid grid-cols-3 py-10 gap-15">
                        <div className="flex flex-col gap-5 bg-transparent">
                           <label > Barber Name: </label>
                            <input 
                            value={barberName}
                            onChange={(e)=>setBarberName(e.target.value)}
                            id="barberName"
                            type="text"
                            placeholder="Barber Name" 
                            className="border-b border-white  focus:outline-none"
                        />
                        </div>
                        <div className="flex flex-col gap-5 bg-transparent">
                           <label> Email: </label>
                            <input 
                            value={barberEmail}
                            onChange={(e)=>setBarberEmail(e.target.value)}
                            id="barberEmail"
                            type="text"
                            placeholder="Barber's Email" 
                            className="border-b border-white flex-1 focus:outline-none"
                        />
                        </div>
                        <div className="flex flex-col gap-5 bg-transparent">
                           <label> Barber Phone Number: </label>
                            <input 
                            value={barberPhoneNumber}
                            onChange={(e)=>setBarberPhoneNumber(e.target.value)}
                            id="barberPhoneName"
                            type="tel"
                            placeholder="Barber Phone Number" 
                            className="border-b border-white flex-1 focus:outline-none"
                        />
                        </div>
                        
                        </div>

                        
                       <div  className="flex flex-col gap-10">
                        {/* Working Days  */}
                        <div className="flex items-center gap-10">
                          <h3 className="text-xl min-w-fit">Working Days:</h3>
                        {days.map((day)=>(
                          <button
                          type="button"
                          onClick={()=>toggleDays(day)}
                          key={day}
                          className={`px-6 py-2 border rounded-full m-2 hover:cursor-pointer active:scale-95
                          ${workingDays.includes(day)? "bg-green-900 text-white font-semibold":"bg-white text-black"}`}>
                            {day}

                          </button>
                        ))}
                        
                       </div>
                       {/* services */}
                       <div className="flex  items-start  ">
                        <h3 className="text-xl min-w-fit tracking-wider">Services :</h3>
                        {/* to select/deselect all services */}
                        <div className="flex-wrap flex items-start ml-10 gap-6">
                        <button
                        type="button"
                        onClick={toggleAllServices}
                        className={`border rounded-4xl px-4 py-2 hover:cursor-pointer active:scale-95
                          ${allServicesSelected? "bg-golden text-white": "bg-goldenbg text-white"}`}
                        >
                          {allServicesSelected ? "Clear all Services":" Select all Services"}
                        </button>
                        {/* single service  */}
                         {service.map(s => (
                          <label key={s.id}
                          className={`border flex  px-4 py-2 gap-8 rounded-4xl 
                          ${selectedServices.includes(s.id) ? "bg-green-800 font-bold text-white": ""}`}>
                            <button
                            key={s.id}
                            type="button" 
                            onClick={()=>toggleService(s.id)}
                            >  {s.name}
                            </button>
                          </label>
                         ))}
                        </div>
                       </div>
                       {/* working hours  and lunch break*/}
                       <div className="flex items-start pt-10 gap-10">
                        {/* working hours */}
                       <div className="flex">
                         <h3 className="text-xl font-bold min-w-fit pt-2">Working Hours:</h3>

                       <div className="ml-10 gap-4 flex flex-col">
                       
                        <div className="flex items-center gap-4 text-xl ">
                          <p>Starting Hours : </p>
                          <input type="time"
                          value={startingTime}
                          onChange={(e)=> setStartingTime(e.target.value)}
                          className="border pl-4 py-2 pr-2 rounded-xl hover:cursor-pointer bg-gray-800 text-white font-semibold" />
                        </div>
                        <div className="flex items-center gap-4 text-xl">
                          <p>Ending Hours :</p>
                          <input type="time" 
                          value={endTime}
                          onChange={(e)=>setEndTime(e.target.value)}
                          className="border ml-1.5 pl-4 py-2 pr-2 rounded-xl hover:cursor-pointer bg-gray-800 text-white font-semibold"
                          />
                        </div>

                       </div>
                       </div>
                       {/* lunch break */}
                       <div className="flex items-start">
                        
                        <h3 className="text-xl font-bold min-w-fit pt-2">Lunch Break :</h3>

                       <div className="ml-10 gap-4 flex flex-col">
                       
                        <div className="flex items-center gap-4 text-xl ">
                          <p>Lunch Starts : </p>
                          <input type="time"
                          value={breakStart}
                          onChange={(e)=> setBreakStart(e.target.value)}
                          className="border pl-4 py-2 pr-2 rounded-xl hover:cursor-pointer bg-gray-800 text-white font-semibold" />
                        </div>
                        <div className="flex items-center gap-4 text-xl">
                          <p>Lunch Ends :</p>
                          <input type="time" 
                          value={breakEnd}
                          onChange={(e)=>setBreakEnd(e.target.value)}
                          className="border ml-1.5 pl-4 py-2 pr-2 rounded-xl hover:cursor-pointer bg-gray-800 text-white font-semibold"
                          />
                        </div>

                       </div>
                       </div>
                       </div>
                       
                       {/* Lunch Hours */}
                        
                       </div>

                        <div className="justify-center flex mt-20">
                          
                    <button type="submit"
                    className="border px-10 py-3 rounded-full text-xl bg-green-900 font-semibold active:scale-95 hover:cursor-pointer">
                      Submit
                    </button>
                        </div>
                    </form>
            </div>
          )}
          </>
    
  )
}

export default AddNewBarber