import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
import userModel from "../../models/userModel.js";
import {upload} from "../../middleware/multerConfig.js";
import Redis from "redis";

const redisClient = Redis.createClient({
    url: 'redis://redis:6379'
});


const getOrSetCache = async (key, cb) => {
    console.log("getOrSetCache: ");
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log("redisClient connected");
        }
        const data = await redisClient.get(key);
        if(data != null) {
            console.log("getCache: ", JSON.stringify(data));
            return JSON.parse(data);
        } else {
            const freshData = await cb();
            const DEFAULT_EXPIRATION = 3600;
            console.log(freshData);
            await redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
            console.log("setCache: ", JSON.stringify(freshData));
            return freshData;
        }
    } catch (err) {
        console.error("getOrSetCache error: ", err);
        throw err;
    }
}


export const userSignIn = async (req, res) => {
    const {provider, email, password, access_token} = req.body;
    console.log(req.body);

    try {
        if (provider === 'native') {
            if (!email || !password) {
                return res.status(400).json({error: 'Email and password are required for native provider'});
            }

            const user = await getOrSetCache(`userSignIn?email=${email}`, async ()=>{
                return await userModel.getUserByEmail(email);
            })
            console.log(user);
            if(!user) {
                return res.status(400).json({error: 'User does not exist'});
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) {
                return res.status(400).json({error: 'Password is incorrect'});
            }

            const token = jwt.sign({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }, process.env.JWT_SECRET, { expiresIn: '1h' });
            console.log(token);


            return res.status(200).json({
                data: {
                    access_token: token,
                    access_expired: 3600,
                    user: {
                        id: user.id,
                        provider: user.provider,
                        name: user.name,
                        email: user.email,
                        picture: user.picture,
                        role: user.role
                    },
                }
            });


        } else if (provider === 'facebook') {
            if (!access_token) {
                return res.status(400).json({error: 'Access token is required for facebook provider'});
            }

            // const token = req.headers.authorization.split('.')[1];
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdDIiLCJlbWFpbCI6InRlc3QyQHRlc3QuY29tIiwiaWF0IjoxNjk4OTk2NTQ3LCJleHAiOjE2OTkwMDAxNDd9.hbaRYW_Q8_uPXbhfBSeC7yZNIcLbkshT3cd7A9wsWzg";

            console.log("access_token: ", access_token);
            console.log("token: ", token);
            jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
                if (err) {
                    return res.status(403).json({error: 'Token is invalid or expired'});
                }

                console.log("decodedToken: ", decodedToken);

                return res.status(200).json({
                    data: {
                        access_token: token,
                        access_expired: 3600,
                        // user: {
                        //     id: user.id,
                        //     provider: user.provider,
                        //     name: user.name,
                        //     email: user.email,
                        //     picture: user.picture,
                        // },
                    }
                });
            });
            // 在这里添加逻辑来验证 Facebook access token
            // 并从 Facebook 获取用户信息
            // user = await getUserInfoFromFacebook(access_token);

        } else {
            return res.status(400).json({error: 'Invalid provider'});
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({error: 'Internal server error'});
    }

}



export const uploadUserPicture = upload.fields([{name: 'picture', maxCount: 1}]);


export const userSignUp = async (req, res) => {
    const {name, email, password} = req.body;

    try {
        const userExists = await userModel.checkUserExists(email);
        if (userExists) {
            return res.status(409).json({ error: "Email already exists" });
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const userId = await userModel.createUser(
            {
                provider: "native",
                name: name,
                email: email,
                picture: "uploads/default.jpg",
                hashedPassword: hashedPassword,
                role: 'user'
            }
        );
        console.log(userId);
        const token = jwt.sign({
            id: userId,
            name: name,
            email: email,
            role: 'user'
        }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(token);
        return res.status(200).json({
            data: {
                access_token: token,
                access_expired: 3600,
                user: {
                    id: userId,
                    provider: "native",
                    name: name,
                    email: email,
                    picture: "uploads/default.jpg",
                    role: 'user'
                },
            }
        });
    } catch (error) {
        console.error("Signup Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
