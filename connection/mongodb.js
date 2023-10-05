import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/Calendar_Note")
.then(()=>console.log("Mongodb Connection SuccessFully"))
.catch(()=>console.log("Mongodb Connection Fail"))

export default mongoose