import express from "express";
const router = express.Router();

import {uploadUserPicture, userSignUp, userSignIn} from "../controllers/user/auth.js";
import {userProfile} from "../controllers/user/userProfileController.js";

router.post('/signup', uploadUserPicture, userSignUp);
router.post('/signin', userSignIn);
router.get('/profile', userProfile);
// router.get('/admin/checkout.html', adminOnly, (req, res) => {
//    res.sendFile('../public/admin/checkout.html');
// });
// router.get('/admin/product.html', adminOnly, (req, res) => {
//    res.sendFile('../public/admin/product.html');
// });


router.use('/api/1.0/user', router);

export default router;