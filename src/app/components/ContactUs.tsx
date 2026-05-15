'use client'
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { useState } from "react";
import { FaRegUser } from "react-icons/fa";
import { FiPhone } from "react-icons/fi";
import { SlLocationPin } from "react-icons/sl";
import { TfiEmail } from "react-icons/tfi";


const ContactUs = () => {
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit=(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
    }
  return (
    <div className="min-h-screen bg-neutral-900">
      <div className="flex items-center justify-center gap-10 py-20 px-50">
        {/* left side form/table */}
        <div className="border w-full h-[90vh]">
                <div className="px-7 pt-5 gap-4 flex flex-col h-[30%]">
                    <h1 className="text-4xl text-golden font-bold">
                    Get In Touch With Us
                    </h1>
                    <p className="leading-7">
                    Give us a call or drop by anytime, we endeavour to answer all
                    enquiries within 24 hours on business days. We will be happy to
                    answer your questions.
                    </p>
                </div>

          <div className="h-[50%] flex flex-col gap-[12.5%] px-5">
                <div className="border flex items-center px-5 py-3 gap-5 ">
                    <div className="bg-gray-200 p-3 rounded-full"><SlLocationPin className="text-black" size={30} /></div>
                    <div>
                        <h1 className="text-xl font-bold">LAND MARK ADDRESS</h1>
                        <p> 1785 Queen St E, Brampton, ON L6T 4S3, <br />Canada </p>
                    </div>
            </div>
            <div className="border">
                 <div className="border flex items-center px-5 py-3 gap-5 ">
                    <div className="bg-gray-200 p-3 rounded-full"><FiPhone  className="text-black" size={30} /></div>
                    <div>
                        <h1 className="text-xl font-bold">PHONE NUMBER</h1>
                        <p> +1 437 438 9692</p>
                    </div>
                </div>
            </div>

            <div className="border">
                <div className="border flex items-center px-5 py-3 gap-5 ">
                    <div className="bg-gray-200 p-3 rounded-full"><TfiEmail className="text-black" size={30} /></div>
                    <div>
                        <h1 className="text-xl font-bold">EMAIL ADDRESS</h1>
                        <p> xyzemail@gmail.com</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
            {/* right side table/appointment  */}
        <div className="border w-full h-[90vh]">
          <div className="h-[20%]  px-7 py-5 gap-3">
            <h1 className="text-golden text-4xl font-bold">Contact Us</h1>
            <p className="leading-7">Please feel free to get in touch with us using the contact form below. We’d love to hear for you.</p>   
          </div>

          <div className="h-[80%] ">
            <form onSubmit={handleSubmit} className="gap-5 flex flex-col px-4">
                <div className="grid grid-cols-2 gap-5">      
                    <div className=" border-2 flex items-center p-4 gap-4 rounded-xl">
                        <FaRegUser size={20} className="shrink-0"/>
                        <input 
                        type="text" 
                        placeholder="FullName"
                        value={name}                 
                        onChange={(e)=>setName(e.target.value)}
                        className="focus:outline-none focus:ring-0"/>
                    </div>
                    <div className="border-2 flex items-center p-4 gap-4 rounded-xl ">
                        <TfiEmail size={23} className="shrink-0"/>
                        <input 
                        type="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}               
                        placeholder="Email"
                        className="focus:outline-none focus:ring-0 " />
                    </div>
                </div>
            <div className="border-2 w-full py-4 rounded-xl flex items-center pl-4">
                <FiPhone size={23} className="shrink-0"/>
                <input type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e)=> setPhoneNumber(e.target.value)}
                className="pl-3 focus:outline-none focus:ring-0 w-full bg-transparent"
             />
            </div>
            <div className="border-2 rounded-xl flex items-center gap-5 pl-4 py-4">
                <HiOutlinePencilSquare size={27} className="shrink-0"/>
                <input type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e)=>setSubject(e.target.value)}
                className=" focus:outline-none w-full focus:ring-0  "
                 />
            </div>
            <textarea
            placeholder="Write Your Message"
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            className="border-2 h-[24vh] resize-none  border-white focus:outline-none focus:ring-0 p-4 flex top-1"
            />
          <div className="flex justify-end w-full ">
            <button type="submit"
             className="px-6 py-3 mt-3 bg-golden/50 font-bold  border rounded-xl hover:cursor-pointer active:scale-90 hover:bg-goldenbg hover:font-bold">Submit</button>
          </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
