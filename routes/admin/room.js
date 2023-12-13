import express from 'express';
import FloorModel from "../../model/Floor.js";
import { authenticateToken } from "../../helper/midleWare.js";
import floor from "../../model/Floor.js";

const roomRouter = express.Router();



roomRouter.post('/addFloor', async (req, res) => {
    try {
        const existingFloor = await FloorModel.findOne({ name: '1' });
        existingFloor.rooms = [
            { name: 'T1P1' },
            { name: 'T1P2' },
            { name: 'T1P3' },
            { name: 'T1P4' },
        ]
        await existingFloor.save()


        res.status(201).json({ message: 'Floor and rooms added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



roomRouter.get('/getFloor', authenticateToken, async (req, res) => {
    const floor = await FloorModel.find();
    console.log('getROom')
    res.status(201).json({ message: 'get successfully', floor: floor });
})

roomRouter.post('/addUser', authenticateToken, async (req, res) => {
    const { roomName, residentId } = req.body

    console.log(roomName)

    const floor = await FloorModel.findOne({
        rooms: {
            $elemMatch: { name: roomName }
        }
    });
    const roomIndex = floor.rooms.findIndex(room => room.name === roomName);

    if (roomIndex === -1) {
        return res.status(404).json({ error: 'Room not found' });
    }
    console.log(floor)
    floor.rooms[roomIndex].residentId = residentId;

    // Cập nhật tầng trong cơ sở dữ liệu
    await FloorModel.updateOne(
        { _id: floor._id, 'rooms.name': roomName },
        { $set: { 'rooms.$.residentId': residentId } }
    );

    res.status(201).json({ message: 'ResidentId added successfully', floor: floor });
})
export default roomRouter;
