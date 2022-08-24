import mongoose from "mongoose";




const {Schema , model} = mongoose


const experiencesSchema = new Schema(
    {
        role: {type: String, required: true},
        company: {type: String, required: true},
        startDate:{type: Date, required:true},
        endDate:{type:Date},
        description: {type:String, required: true},
        area: {type:String, required:true},
        image:{type:String}
    },
    {
        timestamps: true,
    }
)


export default model("Experience", experiencesSchema)