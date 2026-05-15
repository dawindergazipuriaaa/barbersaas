import  CredentialsProvider  from "next-auth/providers/credentials"
import connectDb from "./db"
import User from "@/model/user.model"
import bcrypt from "bcryptjs"
import Google from "next-auth/providers/google"
import  { NextAuthOptions } from "next-auth"

const authOptions:NextAuthOptions = ({
    providers:[
        Google({
            clientId: process.env.GOOGLE_CLIENTID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials:{
                email: {label:"Email", type:"text"},
                password:{ label:"Password", type:"password"}
            },
            async authorize(credentials,req){
                let email = credentials?.email?.toLowerCase().trim()
                let password = credentials?.password
                if(!email || !password){
                    throw new Error("Email and Password both are required. Try again")
                }
                await connectDb()
                let user = await User.findOne({email})
                if(!user){
                    throw new Error("Email is not registered. Please try correct email or SIGN UP first")
                }
                if(!user.password){
                    throw new Error("This account was created using Google. Try loging in with GOOGLE")
                }

                let isPasswordCorrect =  await bcrypt.compare(password, user.password)
                if (!isPasswordCorrect){
                    throw new Error("Wrong password. Please Try Again")
                }
                let role = user.role || "USER";// we already declared the admin role while sign up here accessing that role from user.role and sending them to the appropriate dashboard
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: role// this will return a object named user that we will access in jwt params as user and share the user values with token
                }
            }
        })
    ],
    callbacks:{
        async signIn({user, account}) {
            if(account?.provider ==="google"){
                await connectDb()
                const email = user.email?.toLowerCase().trim()// lowercasing google email
                let existingUser = await User.findOne({email})
                if(!existingUser){
                    const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase().trim()
                    let role = ownerEmail === email ? "ADMIN":"USER"
                    await User.create({
                        name :user.name || "USER",//if somehow google fails to send it 
                        email: email!,// already lowercased
                        image:user.image || "",
                        role: role,
                        isVerified:true
                    })
                }return true
            }return true
        },
       async jwt({token,user}) {
        if(user){
            token.id = user.id,
            token.name = user.name,
            token.image = user.image,
            token.email = user.email

            if (user.role){
                token.role = user.role
            }
            else{
                await connectDb()
                const email = token.email?.toLowerCase().trim()
                const dbUser = await User.findOne({email})
                if(dbUser){
                    token.id = dbUser._id.toString(),
                    token.role = dbUser.role
                }
            }
        }
        return token  
        },
        session({session,token}) {
            if(session.user){
                session.user.id = token.id,
                session.user.email = token.email,
                session.user.name = token.name,
                session.user.image = token.image as string;
                session.user.role = token.role 
            }return session
        },
    },
    session:{
        strategy:'jwt',
        maxAge: 1000*60*60*24*15
    },
    pages: {
        signIn:'/login',
        error:'/login'
    },
    secret: process.env.AUTH_SECRET
})

export default authOptions