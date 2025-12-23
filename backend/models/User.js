import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: function() { return !this.googleId; },
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function() { return !this.googleId; },
        minlength: 6
    },
    confirmPassword: {
        type: String,
        minlength: 6
    },
    phone: {
        type: String,
        trim: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    googleDisplayName: {
        type: String,
        trim: true
    },
    googlePhotoURL: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

export default User;
