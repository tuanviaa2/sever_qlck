import express from 'express';
import ResidentInfoModel from "../model/User.js";
import { generateToken } from "../helper/genToken.js";
import { authenticateToken, checkAdmin } from "../helper/midleWare.js";

const authRouter = express.Router();

authRouter.post('/login', async (req, res, next) => {
    try {
        const { personal_identification_number, password } = req.body;
        console.log(await ResidentInfoModel.find())
        console.log(password)
        const user = await ResidentInfoModel.findOne({ password, personal_identification_number });
        if (!user) {
            return res.status(401).json({ error: 'Tai khoan mat khau khong chinh xac' });
        }
        delete user._doc.password
        return res.status(200).send({
            mess: "Login success",
            data: {
                user: {
                    ...user._doc,
                },
                token: generateToken({ id: user._doc.personal_identification_number, role: user._doc.role })
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
authRouter.post('/register', authenticateToken, async (req, res) => {
    try {
        //     if (!checkAdmin(req.role, res)) return
        const {
            fullName,
            date_of_birth,
            phone_number,
            personal_identification_number,
            permanent_address,
            gender,
            portrait_url,
            email,
            check_in_date,
            payments,
            role
        } = req.body;
        const existingUser = await ResidentInfoModel.findOne({ personal_identification_number });
        console.log(portrait_url)
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return
        }
        // Tạo một bản ghi người dùng mới
        const newUser = new ResidentInfoModel({
            fullName,
            date_of_birth,
            phone_number,
            personal_identification_number,
            permanent_address,
            gender,
            portrait_url,
            email,
            check_in_date,
            payments,
            role
        });
        await newUser.save();
        console.log("add thanh cogn")
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
export default authRouter;
