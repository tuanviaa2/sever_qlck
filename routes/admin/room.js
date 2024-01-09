import express from 'express';
import FloorModel from "../../model/Floor.js";
import { authenticateToken } from "../../helper/midleWare.js";
import floor from "../../model/Floor.js";

const roomRouter = express.Router();


roomRouter.post('/addFloor', async (req, res) => {
    try {
        // Lấy số lượng tầng hiện tại
        const currentFloorsCount = await FloorModel.countDocuments();

        // Tạo tên tầng mới
        const newFloorName = `${currentFloorsCount + 1}`;

        // Tạo tầng mới
        const newFloor = new FloorModel({ name: newFloorName });
        await newFloor.save();

        res.status(201).json({ message: 'Thêm tầng thành công', floor: newFloor });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi thêm tầng', details: error.message });
    }
});

roomRouter.post('/addRoom', async (req, res) => {
    try {
        const { floorId } = req.body;

        // Kiểm tra xem floorId có hợp lệ hay không
        const existingFloor = await FloorModel.findById(floorId);
        if (!existingFloor) {
            return res.status(404).json({ error: 'Không tìm thấy tầng' });
        }

        // Lấy số lượng phòng hiện tại
        const currentRoomsCount = existingFloor.rooms.length;

        // Tạo tên phòng mới
        const newRoomName = `T${existingFloor.name}P${currentRoomsCount + 1}`;

        // Tạo phòng mới
        const newRoom = { name: newRoomName, residentId: null };
        existingFloor.rooms.push(newRoom);
        await existingFloor.save();

        res.status(201).json({ message: 'Thêm phòng thành công', room: newRoom });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi thêm phòng', details: error.message });
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

roomRouter.delete('/deleteFloor/:floorName', async (req, res) => {
    try {
        const { floorName } = req.params;

        // Tìm tầng theo tên
        const floorToDelete = await FloorModel.findOneAndDelete({ name: floorName });
        if (!floorToDelete) {
            return res.status(404).json({ error: 'Không tìm thấy tầng' });
        }

        res.status(200).json({ message: 'Xoá tầng thành công' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Lỗi khi xoá tầng', details: error.message });
    }
});

roomRouter.get('/getRoomsByFloorId/:floorId', async (req, res) => {
    try {
        const { floorId } = req.params;

        // Kiểm tra xem floorId có hợp lệ hay không
        const existingFloor = await FloorModel.findById(floorId);
        if (!existingFloor) {
            return res.status(404).json({ error: 'Không tìm thấy tầng' });
        }

        // Lấy danh sách phòng của tầng
        const rooms = existingFloor.rooms;

        res.status(200).json({ rooms });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách phòng', details: error.message });
    }
});