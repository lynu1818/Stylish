import userModel from "../../models/userModel.js";
import dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken";


export const userProfile = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) {
        return res.status(401).json({error: "Token is required"});
    }
    console.log("token: ", token);

    try {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                console.log(err);
                console.log("decodedToken: ", decodedToken);
                return res.status(403).json({error: 'Token is invalid or expired'});
            }

            console.log("decodedToken: ", decodedToken);
            const user = userModel.getUserByEmail(decodedToken.email);

            return res.status(200).json({
                data: {
                    provider: user.provider,
                    name: user.name,
                    email: user.email,
                    picture: user.picture
                }
            });
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({error: "Internal server error"});
    }
}
