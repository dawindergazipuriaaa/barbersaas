import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


export async function proxy(req:NextRequest){
    const token = await getToken({req, secret:process.env.AUTH_SECRET})
    const url = req.nextUrl;

    if(!token && (url.pathname.startsWith('/adminDashboard') || url.pathname.startsWith('/userDashboard'))){
        return NextResponse.redirect(new URL('/logIn', req.url))
    }
    if(url.pathname.startsWith('/adminDashboard')){
        if(token?.role !== "ADMIN"){
            return NextResponse.redirect(new URL('/userDashboard', req.url))
        }
    }
    return NextResponse.next()
}

export const config = {
    matcher:[
        "/userDashboard/:path*",
        "/adminDashboard/:path*"
    ]
}