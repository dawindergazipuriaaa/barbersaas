import Image from "next/image"

const Teams = () => {

    const team=[
        {
            image:'/teams/barber_1.jpg',
            name:'Michel Sharelin',
            speciality:'Beard & triming'
        },
        {
            image:'/teams/barber_2.jpg',
            name:'Hasib Hossain',
            speciality:'Haircut specialist'
        },
        {
            image:'/teams/barber_3.jpg',
            name:'Rukshana Islam',
            speciality:'Makeup artist'
        },
    ]
    const logos =[
        {
            logo:'/teams/barber_logo1.png',
            heading:'Years Experience',
            numbers:10
        },
         {
            logo:'/teams/barber_logo2.png',
            heading:'Hair Stylists',
            numbers:4
        },
         {
            logo:'/teams/barber_logo3.png',
            heading:'Happy Customers',
            numbers: '1000+'
        },
        {
            logo: '/teams/barber_logo1.png',
            heading:'Google Maps Ratings',
            numbers:4.2
        }
    ]





  return (
    <div className='min-h-screen bg-neutral-900 flex flex-col justify-between max-w-full items-center'>
        <div className="flex flex-col items-center py-20 gap-5">
            <h4 className="text-xl uppercase font-medium tracking-wide">Our Barbers</h4>
            <h1 className="text-6xl font-semibold tracking-wide text-golden pb-2">Professional Team</h1>
            <Image src='/teams/mustachesLogo.png' alt="" width={250} height={10} />
        </div>

        <div className="flex items-center gap-5  ">
            {team.map(({image,name,speciality},i)=>
               <div className="border border-golden/40 flex flex-col items-center gap-4 h-full p-5 "
             key={i}>
                <Image src={image} alt="barber_1" width={300} height={80}  />
                <span className="text-2xl font-bold text-golden uppercase ">{name}</span>
                <span className="text-xl font-medium">{speciality}</span>
            </div>               
            )}
        </div>

        <div className=" flex items-center min-h-100 justify-center gap-x-15 w-full">
            {logos.map((l,i)=>
            <div key={i}>
                 <div className="flex items-center gap-6">
                <span>
                    <Image src={l.logo} alt="logo1" width={100} height={100}
                    />
                </span>
                <div className="flex flex-col">
                    <span className="text-golden text-3xl font-semibold tracking-tighter">{l.numbers}</span>
                    <span className="font-medium text-xl">{l.heading}</span>
                </div>
            </div>

            </div>
            )}
           

           
        </div>
    </div>
  )
}

export default Teams