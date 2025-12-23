import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
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
destinationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Destination = mongoose.model('Destination', destinationSchema);

export default Destination;
