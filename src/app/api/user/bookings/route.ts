'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";


const fetchBookings = async () => {
    const router = useRouter();

    try {
        const response = await fetch('/api/user/bookings');

        if (response.status === 401) {
            router.push('/login');
            return; 
        }

        const data = await response.json();
       

    } catch (error) {
        console.error("Failed to fetch data", error);
    }
}