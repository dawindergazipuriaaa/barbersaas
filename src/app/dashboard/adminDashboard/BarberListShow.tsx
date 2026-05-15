'use client'
import { useState } from "react"
import { MdDeleteForever, MdEventBusy, MdFormatListBulleted, MdEmail, MdPhone } from "react-icons/md"; // Added Email and Phone icons
import AddNewBarber from "./AddNewBarber";

const BarberListShow = ({initialBarbers}:any) => {
  const [barbers, setBarbers] = useState(initialBarbers)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<any>(null)
  const [undoItem, setUndoItem] = useState<any>(null)
  const [leaveModel, setLeaveModel] = useState<any>(null)
  const [viewLeavesModel, setViewLeavesModel] = useState<any>(null) 
  const [leaveData, setLeaveData] = useState({startDate:"", endDate:"", fullDay:true, start:"",end:"",reason:""})
  
  const handleDeleteClick = (barber:any)=>{
    setPendingDelete(barber)
    setShowConfirm(true)
  }

  const confirmDelete = ()=>{
    setShowConfirm(false)
    setBarbers((prev:any)=>prev.map((b:any)=>b._id === pendingDelete._id ? {...b, isDeleted:true} : b))
    
    const timer = setTimeout(()=>{
      deleteFromDatabase(pendingDelete._id)
      setUndoItem(null)
    },10000)
    setUndoItem({...pendingDelete, timer})
  }

  const undoDelete =()=>{
    clearTimeout(undoItem.timer)
    setBarbers((prev:any) =>prev.map((b:any)=>b._id === undoItem._id ? {...b, isDeleted:false} : b))
    setUndoItem(null)
  }
  
const deleteFromDatabase = async(id:string) =>{
  await fetch("/api/delete-barber",{
    method:"DELETE",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({id})
  })
}

const toggleActiveStatus = async(id:string, currentStatus:boolean) =>{
  const newStatus = currentStatus === false ? true:false
  setBarbers((prev:any)=>prev.map((b:any)=>b._id === id? {...b, isActive:newStatus} :b))
  try {
    const res = await fetch(`/api/barbers/${id}/status`,{
      method: "PATCH",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({isActive:newStatus})
    })
    const data = await res.json()
    if(!data.success){
      setBarbers((prev:any)=>prev.map((b:any)=>b._id === id? {...b, isActive:currentStatus}:b));
      alert("Failed to update Status. Please try again")
    }
  } catch (error:any) {
    setBarbers((prev:any)=>prev.map((b:any)=>b._id === id? {...b, isActive:currentStatus}:b ))
    console.error("Failed to change Barber Status",error)
  }
}

const handleScheduleLeave = async()=>{
  if(!leaveData.startDate) return alert("Start Date is required")
  const payload = {
    ...leaveData,
    endDate:leaveData.endDate|| leaveData.startDate
  }
  try {
    const res = await fetch(`/api/barbers/${leaveModel._id}/leave`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const data = await res.json()
    if(data.success){
      alert(`Leave scheduled! Auto-cancelled ${data.cancelledCount} existing appointments.`);
      
      const newLeaveObj = { ...payload, _id: Math.random().toString() };
      setBarbers((prev:any) => prev.map((b:any) => b._id === leaveModel._id ? {...b, timeOff: [...(b.timeOff || []), newLeaveObj]} : b));
      
      setLeaveModel(null);
      setLeaveData({startDate:"", endDate:"", fullDay:true, start:"",end:"",reason:""}); 
    } else {
      alert("Error: " + data.message);
    }
    
  } catch (error) {
    alert("Failed to schedule leave");    
  }
}

const handleRemoveLeave = async (barberId: string, leaveId: string) => {
    setBarbers((prev:any) => prev.map((b:any) => b._id === barberId ? {...b, timeOff: b.timeOff.filter((l:any) => l._id !== leaveId)} : b));
    setViewLeavesModel((prev:any) => ({...prev, timeOff: prev.timeOff.filter((l:any) => l._id !== leaveId)}));

    try {
        const res = await fetch(`/api/barbers/${barberId}/leave`, {
            method: "DELETE",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ leaveId })
        });
        const data = await res.json();
        if(!data.success) {
            alert("Failed to remove leave from database.");
        }
    } catch (error) {
        console.error("Failed to remove leave", error);
    }
}

  return (
   <>
    <div className="border border-neutral-700/50 rounded-2xl overflow-hidden shadow-2xl ml-4 bg-[#0F172A]">
      <div className="flex justify-center py-8 tracking-wider font-bold text-4xl text-amber-500 bg-neutral-900/50 border-b border-neutral-800">
          Our Barbers
      </div>
      
      {barbers.length === 0 ? (
       <div className="py-12 px-6 flex flex-col items-center justify-center gap-6">
         <p className="text-gray-400 text-xl">No barbers added yet.</p> 
         <AddNewBarber/>
       </div>
      ) : (
        <div className="min-h-126 py-8 px-6">
            <div className="flex justify-end pb-8 pr-2">
                <AddNewBarber/>
            </div>            
            
            <div className="flex flex-col gap-6">
            {barbers.map((barber:any, index:number)=>(
                <div key={barber._id} className="bg-neutral-800/40 hover:bg-neutral-800/80 transition-all duration-300 border border-neutral-700 rounded-2xl p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-lg group">
                    
                    {/* LEFT SIDE: Info */}
                    <div className="flex gap-6 items-center">
                        {/* Avatar / Initial */}
                        <div className="flex items-center justify-center min-w-[60px] h-[60px] bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-full text-2xl font-bold shadow-md">
                            {barber.name ? barber.name.charAt(0).toUpperCase() : "?"}
                        </div>

                        {barber.isDeleted ? (
                            <div className="flex items-center gap-6">
                                <p className="text-red-400 font-semibold text-lg">Barber Deleted</p>
                                <button className="text-blue-400 text-sm underline hover:text-blue-300 transition-colors" onClick={undoDelete}>Undo Delete</button>
                            </div>
                        ):(
                            <div className="flex flex-col gap-1">
                                <p className="text-2xl font-bold text-gray-100 tracking-wide">{barber.name}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1 text-sm text-gray-400 font-medium">
                                    <span className="flex items-center gap-2"><MdEmail className="text-gray-500" size={16}/> {barber.email}</span>
                                    <span className="flex items-center gap-2"><MdPhone className="text-gray-500" size={16}/> {barber.phone}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDE: Buttons */}
                    {!barber.isDeleted && (
                    <div className="flex flex-wrap gap-3 items-center pt-4 xl:pt-0 border-t border-neutral-700 xl:border-none">
                        
                        <button onClick={()=>setViewLeavesModel(barber)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-purple-300 bg-purple-900/30 hover:bg-purple-600 hover:text-white transition-all border border-purple-800/50">
                            <MdFormatListBulleted size={18} /> Leaves
                        </button>

                        <button onClick={()=>setLeaveModel(barber)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-300 bg-blue-900/30 hover:bg-blue-600 hover:text-white transition-all border border-blue-800/50">
                            <MdEventBusy size={18} /> Time Off
                        </button>

                        <button
                            onClick={()=>toggleActiveStatus(barber._id, barber.isActive)}
                            className={`flex items-center justify-center min-w-[100px] px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                                barber.isActive === false 
                                ? "bg-red-900/30 text-red-300 border-red-800/50 hover:bg-red-600 hover:text-white"
                                : "bg-emerald-900/30 text-emerald-300 border-emerald-800/50 hover:bg-emerald-600 hover:text-white"
                            }`}>
                            {barber.isActive === false ? "On Leave" : "Active"}
                        </button>

                        <button 
                            onClick={()=>handleDeleteClick(barber)}
                            className="p-2 ml-1 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all border border-transparent hover:border-red-600 group-hover:opacity-100">
                            <MdDeleteForever size={24} />
                        </button>
                    </div>
                    )}
                </div>
            ))}
            </div>
        </div>
    )}

    {/* VIEW LEAVES MODAL */}
    {viewLeavesModel && (
        <div className="flex fixed inset-0 bg-black/80 backdrop-blur-sm z-50 items-center justify-center p-4">
            <div className="bg-gray-900 p-8 rounded-3xl flex flex-col gap-6 border border-gray-700 w-full max-w-lg shadow-2xl max-h-[80vh]">
                <h3 className="text-2xl font-semibold text-amber-500 tracking-wider border-b border-gray-700 pb-4">
                    Scheduled Leaves: {viewLeavesModel.name}
                </h3>
                
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                    {(!viewLeavesModel.timeOff || viewLeavesModel.timeOff.length === 0) ? (
                        <p className="text-gray-400 text-center py-6">No leaves scheduled.</p>
                    ) : (
                        viewLeavesModel.timeOff.map((leave: any, i: number) => (
                            <div key={leave._id || i} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <p className="text-white font-medium">
                                        {leave.startDate} {leave.startDate !== leave.endDate && `to ${leave.endDate}`}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {leave.fullDay ? "Full Day" : `${leave.start} - ${leave.end}`}
                                    </p>
                                    {leave.reason && <p className="text-xs text-amber-500 mt-1">Reason: {leave.reason}</p>}
                                </div>
                                <button 
                                    onClick={() => handleRemoveLeave(viewLeavesModel._id, leave._id)}
                                    className="bg-red-900/50 text-red-400 p-2 rounded-lg hover:bg-red-900 hover:text-white transition-colors cursor-pointer active:scale-95"
                                    title="Remove Leave"
                                >
                                    <MdDeleteForever size={24} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-end">
                    <button className="bg-neutral-700 text-white rounded-xl py-2 px-6 font-semibold hover:bg-neutral-600 cursor-pointer active:scale-95 transition-all" 
                            onClick={() => setViewLeavesModel(null)}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* SCHEDULE LEAVE MODAL */}
    {leaveModel && (
        <div className="flex fixed inset-0 bg-black/80 backdrop-blur-sm z-50 items-center justify-center p-4">
            <div className="bg-gray-900 p-10 rounded-3xl flex flex-col gap-6 border border-gray-700 w-full max-w-lg shadow-2xl">
                <h3 className="text-3xl font-semibold text-amber-500 tracking-wider">Schedule Leave: {leaveModel.name}</h3>
                
                <div className="flex gap-4">
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-gray-400 text-sm tracking-wide">Start Date</label>
                        <input type="date" className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500/50"
                               value={leaveData.startDate} onChange={(e) => setLeaveData({...leaveData, startDate: e.target.value})} />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-gray-400 text-sm tracking-wide">End Date (Optional)</label>
                        <input type="date" className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500/50"
                               value={leaveData.endDate} onChange={(e) => setLeaveData({...leaveData, endDate: e.target.value})} />
                    </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                    <input type="checkbox" id="fullday" className="w-5 h-5 accent-amber-500" 
                           checked={leaveData.fullDay} onChange={(e) => setLeaveData({...leaveData, fullDay: e.target.checked})} />
                    <label htmlFor="fullday" className="text-gray-300 font-medium tracking-wide">Full Day Off</label>
                </div>

                {!leaveData.fullDay && (
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-gray-400 text-sm tracking-wide">Start Time</label>
                            <input type="time" className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500/50"
                                   value={leaveData.start} onChange={(e) => setLeaveData({...leaveData, start: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="text-gray-400 text-sm tracking-wide">End Time</label>
                            <input type="time" className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500/50"
                                   value={leaveData.end} onChange={(e) => setLeaveData({...leaveData, end: e.target.value})} />
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <label className="text-gray-400 text-sm tracking-wide">Reason (Optional)</label>
                    <input type="text" placeholder="e.g. Sick Leave, Doctor Appt" className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-amber-500/50"
                           value={leaveData.reason} onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})} />
                </div>

                <div className="flex gap-6 mt-6">
                    <button className="flex-1 bg-emerald-900 border border-emerald-700 text-white rounded-2xl py-3 font-semibold text-lg hover:bg-emerald-800 active:scale-95 transition-all cursor-pointer" onClick={handleScheduleLeave}>
                        Confirm Leave
                    </button>
                    <button className="flex-1 bg-red-900 border border-red-700 text-white rounded-2xl py-3 font-semibold text-lg hover:bg-red-800 active:scale-95 transition-all cursor-pointer" onClick={() => setLeaveModel(null)}>
                        Cancel
                    </button>
                </div>
                <p className="text-sm text-red-400 text-center tracking-wide">Warning: This will automatically cancel existing appointments during this time.</p>
            </div>
        </div>
    )}
    
    {showConfirm && (
      <div className="flex fixed inset-0 bg-black/80 backdrop-blur-sm items-center justify-center z-50 p-4">
        <div className="bg-gray-900 p-10 rounded-3xl flex flex-col gap-6 border border-gray-700 w-full max-w-md shadow-2xl text-center">
            <p className="text-2xl font-semibold text-white">Do you want to remove <br/><b className="text-amber-500 capitalize">{pendingDelete?.name}</b>?</p>
            <div className="text-lg font-bold flex gap-4 mt-4">
            <button className="flex-1 rounded-xl bg-neutral-800 text-white border border-neutral-700 py-3 hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer" onClick={()=>setShowConfirm(false)}>Cancel</button>
            <button className="flex-1 rounded-xl bg-red-600 text-white py-3 hover:bg-red-500 active:scale-95 transition-all cursor-pointer shadow-lg shadow-red-900/50" onClick={confirmDelete}>Delete</button>
            </div> 
        </div>
      </div>
    )}
    </div>
   </>
  )
}
export default BarberListShow