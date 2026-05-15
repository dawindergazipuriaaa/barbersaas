'use client'
import React, { useState } from "react";
import Image from "next/image";

const Gallery = () => {
    const [visibleCount, setVisibleCount] = useState(4)

    const loadMore =()=>{
        setVisibleCount(prev=>prev+4)
    }

    



    const images = [
        "/gallery/temporaryImages/1.jpg",
        "/gallery/temporaryImages/2.png",
        "/gallery/temporaryImages/3.png",
        "/gallery/temporaryImages/4.png",
        "/gallery/temporaryImages/5.png",
        "/gallery/temporaryImages/6.png",
        "/gallery/temporaryImages/7.jpeg",
        "/gallery/temporaryImages/8.jpeg",
        "/gallery/temporaryImages/9.jpeg",
        "/gallery/temporaryImages/10.jpeg",
    ];
        const visibleImages = images.slice(0, visibleCount)
    return (
        <div className="min-h-screen bg-neutral-900">
            <div className="flex flex-col items-center ">
                <h1 className="text-6xl uppercase text-white bg-goldenbg py-8 tracking-wider w-full text-center font-semibold ">
                    Explore gallery
                </h1>

                <div className="overflow-x-auto w-full p-10">
                    <div className="flex gap-12 w-max h-[60vh] pt-10 border-golden">
                        {visibleImages.map((image, i) => (
                            <div key={i}>
                                <Image
                                    src={image}
                                    loading="lazy"
                                    alt="galleryImages"
                                    style={{
                                        width: "350px",
                                        height: "350px",
                                        objectFit: "cover",
                                    }}
                                    width={200}
                                    height={200}
                                    className=""
                                />
                            </div>
                        ))}
                    </div>
                       
                </div>  
                 <div className="w-full">
                     {visibleCount < images.length ? (
                        <div className="flex justify-end pr-4">
                            <button onClick={loadMore}
                            className="text-xl my-5 p-5 rounded-2xl  uppercase font-semibold tracking-wide hover:cursor-pointer hover:scale-105 bg-goldenbg active:scale-95">view more
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-end pr-6">
                            <button onClick={()=>setVisibleCount(4)}
                            className="text-xl my-5 p-5 rounded-2xl  uppercase font-bold tracking-wide hover:cursor-pointer text-black bg-golden active:scale-95">view less
                            </button>
                            </div>
                    )}  
                    </div>           
            </div>
        </div>
    );
};

export default Gallery;

