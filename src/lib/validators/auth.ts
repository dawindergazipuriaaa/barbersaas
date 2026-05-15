import {z} from "zod";
const passwordSchema = z
.string()
.min(8, "Password must be 8 characters long")
.regex(/[A-Z]/,"Password must contains atlease one uppercase letter")
.regex(/[a-z]/,"Password must contains atlease one lowerrcase letter")
.regex(/[0-9]/,"Password must contains atlease one number")
.regex(/[^A-Za-z0-9]/, "Password must contain atleast one Special symbol")

export const signUpSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema
})// data will be safe parsed from here when someone tries signUP
export type signUpInput = z.infer<typeof signUpSchema>// z.infer will create a type while in runtime automatically like mame:string, email:string, password:passwordSchema

export const logInSchema = z.object({
    email: z.string().email(),
    password: passwordSchema
})
export type logInInput = z.infer<typeof logInSchema>// again here z.infer will create a type during runtime automatically

export const otpSchema = z.object({
    email : z.string().email(),
    otp : z.string().length(6,"OTP must be 6 digits")
})
export type otpInput = z.infer<typeof otpSchema>// again automatic input type during runtime