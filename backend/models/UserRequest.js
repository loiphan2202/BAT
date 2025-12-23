import mongoose from 'mongoose';

const userRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    landscape: {
        type: String,
        required: true,
        enum: ["Beach", "Mountain", "Heritage", "City"]
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true // URL or path to the uploaded image
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: String,
        required: true,
        trim: true
    },
    popular: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
userRequestSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const UserRequest = mongoose.model('UserRequest', userRequestSchema);

export default UserRequest;
