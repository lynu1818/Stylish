import express from "express";
import productRoute from "./routes/productRouter.js";
import userRoute from "./routes/userRouter.js";
import orderRoute from "./routes/orderRouter.js";
import cors from "cors";

// import swaggerDoc from "./swagger.yaml" assert { type: "json" };
// import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(productRoute);
app.use(userRoute);
app.use(orderRoute);
// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));



app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});