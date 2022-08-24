import mongoose from "mongoose";




const {Schema , model} = mongoose


const postsSchema = new Schema(
    {
        text: {type: String, required: true},
        username: {type: String, required: true},
        image:{type:String},
        users:[{type: Schema.Types.ObjectId, required:true, ref:"User"}]
        // username: {type: String , required:true, unique:true},
    },
    {
        timestamps: true,
    }
)


export default model("Post", postsSchema)