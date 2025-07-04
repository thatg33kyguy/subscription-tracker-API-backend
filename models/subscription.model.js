import mongoose from "mongoose";


const SubscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Subscription name is required"],
        trim: true,
        minLength:2,
        maxLength:100
    },
    price: {
        type: Number,
        required: [true,"Subscription price is required"],
        min: [0, "Price cannot be negative"]
    },
    currency: {
        type: String,
        trim: true,
        enum: ["USD", "EUR", "GBP", "INR", "JPY"], // Add more currencies as needed
        default: "USD"
    },
    frequency: {
        type: String,
        trim: true,
        enum: ["monthly", "yearly", "weekly", "daily"],
        default: "monthly"
    },
    category: {
        type: String,
        trim: true,
        enum: ["entertainment", "utilities", "food", "health", "education", "other"],
        default: "other"
    },
    paymentMethod:{
        type: String,
        required: [true, "Payment method is required"],
        trim: true,
        enum: ["credit_card", "debit_card", "paypal", "bank_transfer", "other"],
        default: "credit_card"
    },
    status: {
        type: String,
        trim: true,
        enum: ["active", "inactive", "cancelled"],
        default: "active"
    },
    startDate: {
        type: Date,
        required: [true, "Start date is required"],
        validate: {
            validator: (value) => value <= new Date(),
            message: "Start date cannot be in the future"
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function(value) {
                return value >= this.startDate;
            },
            message: "Renewal date cannot be in the past"
        }
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        index: true
    }
},{timestamps: true});

SubscriptionSchema.pre('save',function(next) {
    if(!this.renewalDate){
        const renewalPeriod={
            monthly: 30,
            yearly: 365,
            weekly: 7,
            daily: 1
        };
        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriod[this.frequency]);
    }

    if(this.renewalDate<new Date()){
        this.status = "inactive";
    }

    next();
})

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;