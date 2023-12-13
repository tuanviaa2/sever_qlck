import express from 'express';
import ResidentInfoModel from "../../model/User.js";
import FloorModel from '../../model/Floor.js';
import e from 'express';

const userRouter = express.Router();

userRouter.put('/update/:personal_identification_number', async (req, res) => {
    try {
        const { personal_identification_number } = req.params;
        const existingUser = await ResidentInfoModel.findOne({ personal_identification_number });

        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updatedUser = await ResidentInfoModel.findOneAndUpdate(
            { personal_identification_number },
            {
                $set: req.body,
            },
            { new: true }
        );
        return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
userRouter.put('/addPaymentToAllResidents', async (req, res) => {
    try {
        const { paymentName, amount } = req.body;

        // Lấy danh sách tất cả cư dân
        const allResidents = await ResidentInfoModel.find();

        if (!allResidents || allResidents.length === 0) {
            return res.status(404).json({ error: 'No residents found' });
        }

        // Thêm khoản thu vào danh sách của từng cư dân
        for (const user of allResidents) {
            user.payments.push({
                name: paymentName,
                amount,
                isPayment: false
            });

            await user.save();
        }

        res.status(200).json({ message: 'Payments added to all residents successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

userRouter.get('/:personal_identification_number', async (req, res) => {
    try {
        const { personal_identification_number } = req.params;
        const existingUser = await ResidentInfoModel.findOne({ personal_identification_number });
        if (existingUser) {
            return res.status(200).json({ message: 'User updated successfully', data: { user: existingUser } });

        }
        res.status(500).json({ error: 'Internal Server Error' });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

userRouter.delete('/delete/:personal_identification_number', async (req, res) => {
    try {
        const { personal_identification_number } = req.params;
        const existingUser = await ResidentInfoModel.findOne({ personal_identification_number });
        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const floor = await FloorModel.findOne({
            rooms: {
                $elemMatch: { residentId: personal_identification_number }
            }
        })
        if (floor) {
            const newRooms = floor.rooms.map(item => {
                if (item.residentId == personal_identification_number) {
                    return { ...item, residentId: null }
                }
                return item
            })
            floor.rooms = newRooms
            await floor.save()
        }
        await ResidentInfoModel.findOneAndDelete({ personal_identification_number });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


userRouter.put('/addPayment/:personal_identification_number', async (req, res) => {
    try {
        const { personal_identification_number } = req.params;
        const { paymentName, amount } = req.body
        const user = await ResidentInfoModel.findOne({ personal_identification_number });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.payments.push({
            name: paymentName,
            amount,
            isPayment: false
        });

        await user.save();
        res.status(200).json({
            message: 'User deleted successfully', data: {
                payment: user.payments[user.payments.length - 1]
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



userRouter.put('/maskIsPayment/:personal_identification_number', async (req, res) => {
    try {
        const { personal_identification_number } = req.params;
        const { paymentId } = req.body
        const user = await ResidentInfoModel.findOne({ personal_identification_number });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.payments = user.payments.map((item) => {
            console.log(item._id.toString())
            if (item._id.toString() === paymentId) {
                item.isPayment = true
                console.log("123")
            }
            return item
        })
        await user.save();
        res.status(200).json({
            message: 'Update successfully', data: {
                payment: user.payments
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



userRouter.get('', async (req, res) => {
    try {
        const existingUser = await ResidentInfoModel.find();
        if (existingUser) {
            return res.status(200).json({ message: 'User updated successfully', data: { users: existingUser } });

        }
        res.status(500).json({ error: 'Internal Server Error' });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



userRouter.post('/addNotification', async (req, res) => {
    const { residentId, content, time } = req.body
    console.log({ residentId, content, time })
    try {
        const existingUser = await ResidentInfoModel.findOne({ personal_identification_number: residentId });
        if (existingUser) {
            console.log( existingUser)
            existingUser.notifications = [...existingUser.notifications,{ content: content, time: time }]
            await existingUser.save()
            return res.status(200).json({ message: 'User updated successfully', data: { users: existingUser } });

        }
        res.status(500).json({ error: 'Internal Server Error' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


userRouter.get('/notification/:id', async (req, res) => {
    const { id } = req.params
    try {
        const existingUser = await ResidentInfoModel.findOne({ personal_identification_number: id });
        if (existingUser) {
            return res.status(200).json({ message: 'User updated successfully', data: { notifications: existingUser.notifications } });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

userRouter.put('/readNoti/:id', async (req, res) => {
    const { id } = req.params
    const { notiId } = req.body
    try {
        const existingUser = await ResidentInfoModel.findOne({ personal_identification_number: id });
        if (existingUser) {
            existingUser.notifications = existingUser.notifications.map(item => {
                if (item._id.toString() === notiId) {
                    return { ...item, isReading: true }
                }
                return item
            })
            await existingUser.save()
            return res.status(200).json({ message: 'User updated successfully', data: { notifications: existingUser.notifications } });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


userRouter.post('/addFeedBack', async (req, res) => {
    const { sender, image, content, time } = req.body
    console.log(image)
    try {
        const existingUser = await ResidentInfoModel.findOne({ personal_identification_number: 'admin' });
        if (existingUser) {
            console.log({ sender, content: content, time: time, image })
            existingUser.notifications.push({ sender, content: content, time: time, image })
            await existingUser.save()
            return res.status(200).json({ message: 'User updated successfully', data: { users: existingUser } });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


userRouter.patch('/changePassword/:id', async (req, res) => {
    const { oldPass, newPass } = req.body
    const { id } = req.params
    try {
        const existingUser = await ResidentInfoModel.findOne({ personal_identification_number: id, password: oldPass });
        if (existingUser) {
            existingUser.password = newPass
            await existingUser.save()
            return res.status(200).json({ message: 'update successfully' });
        }
        res.status(500).json({ error: 'mat khau cu khong chinh xac' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
export default userRouter;
