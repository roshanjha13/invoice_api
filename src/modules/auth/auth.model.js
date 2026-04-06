const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4} = require('uuid');

const userSchema = new mongoose.Schema({
    _id : { 
        type : String, 
        default : () => `usr_${uuidv4().replace(/-/g, '')}` 
    },
    name : {
        type : String,
        required : true 
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
    },
    password : {
        type : String,
        required : true,
        select : false
    },
    plan : {
        type : String,
        enum : [
            'free',
            'starter',
            'pro',
            'enterprise'
        ],
        default: 'free'
    },
    apiKey : { 
        type : String, 
        default : () => `inv_${uuidv4().replace(/-/g, '')}`, 
        unique : true 
    },
    invoiceCount : {
        type : Number,
        default : 0
    },
    isActive : {
        type : Boolean,
        default : true 
    },
    webhookUrl : {
        type : String,
        default : null
    },
    googleId: { 
        type: String, 
        default: null 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    role: {
        type: String,
        enum: ['user', 'manager', 'admin'],
        default: 'user'
    },
    trialUsed: { 
        type: Boolean, 
        default: false 
    },
    trialEndAt: { 
        type: Date, 
        default: null 
    },
},{
    timestamps : true,
    versionKey : false
})

userSchema.index({ plan: 1});
userSchema.index({ isActive: 1});

userSchema.index({ email: 1, isActive: 1 });


userSchema.pre('save',async function(next){
    if (!this.isModified('password')) return next();
    this.password  = await bcrypt.hash(this.password,12);
    next();
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword,this.password);
}

module.exports = mongoose.model('User',userSchema);