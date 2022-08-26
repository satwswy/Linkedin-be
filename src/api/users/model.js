import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator"



const {Schema , model} = mongoose


const usersSchema = new Schema(
    {
        name: {type: String, required: true},
        surname: {type: String, required: true},
        email: {type:String, required: true},
        bio: {type:String, required:true},
        title:{type:String, required:true},
        area:{type:String, required:true},
        image: {type:String, required:false},
        username: {type: String , required:true, unique:true},
        experiences:[{type: Schema.Types.ObjectId, required:false, ref:"Experience"}]
    },
    {
        timestamps: true,
    }
)
usersSchema.plugin(uniqueValidator);

export default model("User", usersSchema)