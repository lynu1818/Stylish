import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import dotenv from "dotenv";
import {connection} from "../../db.js";
dotenv.config();
import userModel from "../../models/userModel.js";

export const fetchAndStoreData = async(req, res) => {
    try {
        const response = await fetch('http://35.75.145.100:1234/api/1.0/order/data');
        console.log("response: ", response);
        const orders = await response.json();
        console.log("orders: ", orders);
        for(const order of orders) {
            const {total, list} = order;
            const {id, color, size, qty, price} = list[0];
            await connection.execute("INSERT INTO orders(total, product_id, color, size, qty, price) VALUES(?,?,?,?,?,?)", [total, id, color, size, qty, price]);
        }
        return await response.json();
    } catch (err) {
        console.error("Error fetching data: ",err);
    }
}

export const getTotalRevenue = async(req, res) => {
    try {
        const totalRevenue =  await connection.execute("SELECT SUM(total) AS total_revenue FROM orders");
        return res.status(200).json(totalRevenue[0][0]);
    } catch (err) {
        console.error("Error fetching data: ",err);
    }
}

export const getSalesByColors = async(req, res) => {
    try {
        const salesByColors =  await connection.execute("SELECT color, SUM(qty) AS total_sales FROM orders GROUP BY color");
        return res.status(200).json(salesByColors[0]);
    } catch (err) {
        console.error("Error fetching data: ",err);
    }
}

export const getSalesByPriceRange = async(req, res) => {
    try {
        const salesByPriceRange =  await connection.execute("SELECT price, SUM(qty) AS total_sales FROM orders GROUP BY price");
        return res.status(200).json(salesByPriceRange[0]);
    } catch (err) {
        console.error("Error fetching data: ",err);
    }
}

export const getTopProductsBySize = async(req, res) => {
    try {
        const _topProductsBySize =  await connection.execute("SELECT product_id FROM orders GROUP BY product_id ORDER BY SUM(qty) DESC LIMIT 5");
        const ids = _topProductsBySize[0].map((product) => product.product_id);
        const topProductsBySize = await connection.execute("SELECT product_id, size, SUM(qty) AS qty FROM orders WHERE product_id IN (?,?,?,?,?) GROUP BY product_id, size ORDER BY qty, size DESC", ids);

        console.log("topProductsBySize: ", topProductsBySize);
        return res.status(200).json(topProductsBySize[0]);
    } catch (err) {
        console.error("Error fetching data: ",err);
    }
}

export const orderCheckOut = async (req, res) => {
    const {prime} = req.body;
    console.log("req.body: ", req.body);
    console.log("prime: ", prime);
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
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
            const data = JSON.stringify(
                {
                    "partner_key": "partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG",
                    "prime": "ef8d8e03f8a67ab1015e3f4d6d1be7b4393a455037f789cb13ef06583ac633e0",
                    "amount": "1",
                    "merchant_id": "AppWorksSchool_CTBC",
                    "details": "Some item",
                    "cardholder": {
                        "phone_number": "+886923456789",
                        "name": "王小明",
                        "email": "LittleMing@Wang.com",
                        "zip_code": "100",
                        "address": "台北市天龍區芝麻街1號1樓",
                        "national_id": "A123456789"
                    },
                    "remember": true
                })
            console.log("data: ", data);
            fetch('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG'
                },
                body: data
            }).then((response) => response.json()).then((data) => {
                console.log(data)

                return res.status(200).json({
                    data: {
                        number: data.order_number,
                    }
                });
            }).catch((err) => {
                console.log("Fetch error: ", err)
            });
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: "Internal server error"});
    }

}