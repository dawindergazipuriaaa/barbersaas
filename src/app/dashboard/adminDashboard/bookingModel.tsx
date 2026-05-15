'use client'

import { PACKAGES } from "@/data/packages"
import { service } from "@/data/services"

export default function BookingModal({
  selectedSlot,
  newBooking,
  setNewBooking,
  onAction,
  onClose
}: {
  selectedSlot: any;
  newBooking: any;
  setNewBooking: (data: any) => void;
  onAction: (action: 'cancel' | 'add') => void;
  onClose: () => void;
}) {
  if (!selectedSlot) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 border border-neutral-700 p-6 rounded-2xl max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-1">{selectedSlot.time} Slot</h2>
        <p className="text-neutral-400 mb-6">Barber: {selectedSlot.barber.name}</p>

        {selectedSlot.booking ? (
          <div className="space-y-4">
            <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-700">
              <p className="text-sm text-neutral-400">Customer</p>
              <p className="text-white font-semibold text-lg">{selectedSlot.booking.name || "Unknown"}</p>
              <p className="text-amber-500 text-sm">{selectedSlot.booking.phone || 'No contact info'}</p>
              
              <div className="mt-3 pt-3 border-t border-neutral-800">
                <p className="text-sm text-neutral-400">Service(s)</p>
                <p className="text-white">
                  {selectedSlot.booking.items && selectedSlot.booking.items.length > 0 
                    ? selectedSlot.booking.items.map((item: any) => item.name).join(", ") 
                    : "Standard Service"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => onAction('cancel')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold transition-colors">
                Cancel Booking
              </button>
              <button 
                onClick={onClose}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded-lg font-bold transition-colors">
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-emerald-500 text-sm font-medium">Add Manual Booking:</p>
            
            <input 
              type="text" placeholder="Customer Name" 
              value={newBooking.customerName}
              className="w-full bg-neutral-900 border border-neutral-700 p-2 rounded text-white"
              onChange={(e) => setNewBooking({...newBooking, customerName: e.target.value})}
            />
            
            <select 
              className="w-full bg-neutral-900 border border-neutral-700 p-2 rounded text-white"
              value={newBooking.service}
              onChange={(e) => setNewBooking({...newBooking, service: e.target.value})}
            >
              <option value="">Select a Service</option>
              <optgroup label="Packages">
                 {Object.values(PACKAGES || {}).map(pkg => (
                   <option key={pkg.id} value={pkg.name}>{pkg.name} - ${pkg.price}</option>
                 ))}
              </optgroup>
              <optgroup label="Individual Services">
                 {(service || []).map(s => (
                   <option key={s.id} value={s.name}>{s.name} - ${s.price}</option>
                 ))}
              </optgroup>
            </select>

            <input 
              type="text" placeholder="Phone Number" 
              value={newBooking.contact}
              className="w-full bg-neutral-900 border border-neutral-700 p-2 rounded text-white"
              onChange={(e) => setNewBooking({...newBooking, contact: e.target.value})}
            />
            
            <div className="flex gap-2 pt-4">
              <button 
                onClick={() => onAction('add')}
                disabled={!newBooking.customerName || !newBooking.service || !newBooking.contact}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-600 disabled:text-neutral-400 text-white py-2 rounded-lg font-bold">
                Confirm Booking
              </button>
              <button onClick={onClose} className="flex-1 text-neutral-400">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}