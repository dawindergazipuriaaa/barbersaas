import connectDb from '@/lib/db'
import Barber from '@/model/barber'
import BarberListShow from './BarberListShow';


const ShowBarber = async () => {
  let barberList:any[] = [];
  try {
    await connectDb()
    barberList = await Barber.find().lean()
  } catch (error) {
    console.error("Error fetching Barber list", error) 
  }
  return (<BarberListShow initialBarbers={JSON.parse(JSON.stringify(barberList))}/>
        
  )
}

export default ShowBarber