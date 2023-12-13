import express from 'express';
import authRouter from "./routes/auth.js";
import { connectDb } from "./helper/conectDb.js";
import userRouter from "./routes/admin/user.js";
import cors from 'cors';
import roomRouter from "./routes/admin/room.js";
const app = express();
const port = 3000;
const corsOptions = {
  origin: '*', // Thay thế bằng origin thực tế của bạn hoặc '*' để cho phép tất cả các origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Cho phép chia sẻ cookie khi có yêu cầu CORS
  optionsSuccessStatus: 204, // Trả về 204 No Content cho các yêu cầu OPTIONS
};

app.use(cors(corsOptions));
app.use(express.json())
//router
app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/room', roomRouter)
app.get('', (req, res) => {
  res.send('Hello, World!');
});
app.listen(port, () => {
  connectDb();
  console.log(`App listening at http://localhost:${port}`);
});


