import userModel from "../models/userModel.js";

export const adminOnly = async (req, res, next) => {
    const {
        category,
        title,
        description,
        price,
        texture,
        wash,
        place,
        note,
        story,
        size,
        colorcode,
        stock,
        email
    } = req.body;
    const user = await userModel.getUserByEmail(email);
    if (!user) {
        return res.status(401).json("Unauthorized");
    }
    if (user.role !== 'admin') {
        return res.status(403).json("Forbidden");
    }
    next();
};
