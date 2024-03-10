import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new Schema({
    fullName: {
        type : 'String',
        require : [true, 'Name is Required'],
        maxLength : [20, 'Name must be less than 20 characters'],
        minLength : [5, 'Name  must be more than 5 characters'],
        lower : true,
        trim : true,
    },
    email : {
        type : 'String',
        required :[true, 'Email is Required'],
        lowercase : true,
        trim : true,
        unique : true,
        match : [
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            'please fill in a valid email address '
        ]
    },
    password : {
        type : 'String',
        required : [true, 'password is required'],
        minLength : [8, 'Password must be at least 8 characters'],
        select : false
    },
    avatar :{
        public_id : {
            type : 'String'
        },
        secure_url : {
            type : 'String'
        }
    },
    role : {
        type : 'String',
        enum : ['USER', 'ADMIN'],
        default : 'USER'
    },
    forgotPasswordToken : String,
    forgotPasswordExpiry : Date
},
{
    timestamps : true
});

userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        return next();
    } 
    this.password = await bcrypt.hash(this.password, 10);

});



userSchema.methods = {
    generateJWTToken: async function() {
        const token = await jwt.sign({
            id: this._id, 
            email: this.email,
            subscription: this.subscription,    
            role: this.role
        }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        return token;
    },
    comparePassword : async function (plainTextPassword){
        return await bcrypt.compare(plainTextPassword, this.password);

    },
    generatePasswordResetToken : async function(){
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

        this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

        return resetToken;
    } 
 
}




const user = model('User', userSchema)
export default user;