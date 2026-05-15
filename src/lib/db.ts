import {connect} from "mongoose"

let mongodb_url = process.env.MONGODB_URI
if(!mongodb_url){
    throw Error ("MongoDb url is not connected")
}
let cached = global.mongoose;

if(!cached){
    cached = global.mongoose = {conn:null, promise:null}
}

const connectDb= async()=>{
    if(cached.conn){
        console.log(" cached Mongodb url is working")
        return cached.conn
    }
    if(!cached.promise){
       cached.promise = connect(mongodb_url).then((c)=>c.connection)
    }
    try {
        cached.conn = await cached.promise
        console.log("New connection is made")
    } catch (error) {
        throw error
    }
    console.log("Db connected in the end with new promise and connection")
    return cached.conn
} 
export default connectDb