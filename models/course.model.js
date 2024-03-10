import {Schema, model } from 'mongoose';

const courseSchema = new Schema({
    title : {
        type: String,
        required : [true, "Name is required"],
        maxLength : [20, "Title can't be more than 20 characters"],
        minLength : [8, "Minimum length is 8 characters"],
        trim :true
    },
    description : {
        type: String,
        require : [true, "Description is needed"],
        maxLength : [200, "Description must be less than 200 characters "],
        minLength : [10, "Description should be more than 10 characters"],

    },
    category : {
        type : String,
        required : [true, "category is required"]
    },
    thumbnail : {
        public_id :{
            type : String,
            required : true
        },
        secure_url : {
            type : String, 
            required : true 
        }
    },
    lectures : [
        {
            title : String,
            description : String,
            lecture : {
                public_id : {
                    type : String,
                    required : true
                }, 
                secure_url : {
                    type : String,
                    required : true
                }

            }
        }
    ],
    numbersOfLectures : {
        type : Number,
        default : 0,
    },
    createdBy:{
        type : String,
        required : true,
    }
}, {
    timestamps : true
}) 

const Course = model("Course", courseSchema);
export default  Course;