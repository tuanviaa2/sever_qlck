import mongoose from 'mongoose';

const { Schema } = mongoose;

const billSchema = new Schema({
    name: { type: String, required: true, default: "Other" },
    amount: { type: String, required: true },
    isPayment: { type: Boolean, required: true, default: false },

});
const notificationSchema = new Schema({
    sender: { type: String},
    content: { type: String, required: true },
    isReading: { type: Boolean, default: false },
    time: { type: Date },
    image: { type: String, default: "" }
});
export const residentInfoSchema = new Schema({
    personal_identification_number: { type: String, required: true },
    fullName: { type: String, required: true },
    date_of_birth: { type: Date },
    phone_number: { type: String, required: true },
    permanent_address: { type: String },
    gender: { type: String, default: "male" },
    portrait_url: { type: String },
    email: { type: String },
    check_in_date: { type: Date },
    password: { type: String, default: "1" },
    payments: { type: [billSchema], default: [] },
    role: { type: String, default: "resident" },
    notifications: { type: [notificationSchema], default: [] }
});

const ResidentInfoModel = mongoose.model('ResidentInfo', residentInfoSchema);
export default ResidentInfoModel;
