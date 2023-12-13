import mongoose from 'mongoose';

const { Schema } = mongoose;
const roomSchema = new Schema({
    name: { type: String, required: true },
    residentId: { type: String, default: null },
});
const floorSchema = new Schema({
    name: { type: String, required: true },
    rooms: { type: [roomSchema], default: [] },
});

const FloorModel = mongoose.model('Floor', floorSchema);
export default FloorModel;
