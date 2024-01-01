import {connection} from "../db.js";

const executeQuery = async (query, params) => {
    try {
        console.log("Executing query: ", query, params);
        const [results] = await connection.query(query, params);
        console.log("Query results: ", results);
        return results;
    } catch (err) {
        console.error("Query error: ", err);
        throw err;
    }
};

class productModel {
    async checkColorExists(colorcode) {
        console.log("Check color exist: ", colorcode);
        try {
            const query = "SELECT * FROM `colors` WHERE `color_code` = ?";
            const results = await executeQuery(query, [colorcode]);
            return results.length > 0;
        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    }

    async createProduct({category, title, description, price, texture, wash, place, note, story, size, colorcode, stock, main_image}) {
        console.log("Create product: ", category, title, description, price, texture, wash, place, note, story, size, colorcode, stock, main_image);

        try {
            const insertProductQuery = "INSERT INTO `products` (`category`, `title`, `description`, `price`, `texture`, `wash`, `place`, `note`, `story`, `main_image`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
            const product = await executeQuery(insertProductQuery, [category, title, description, price, texture, wash, place, note, story, main_image]);
            const productId = product.insertId;

            const insertProductSizeQuery = "INSERT INTO `productSizes` (`product_id`, `size`) VALUES (?, ?)";
            await executeQuery(insertProductSizeQuery, [productId, size]);


            if( !(await this.checkColorExists(colorcode))){ //if color not exists, insert color
                const insertColorQuery = "INSERT INTO `colors` (`color_code`, `name`) VALUES (?, ?)";
                await executeQuery(insertColorQuery, [colorcode, 'test']);
            }
            const insertProductColorQuery = "INSERT INTO `productColors` (`product_id`, `color_code`) VALUES (?, ?)";
            await executeQuery(insertProductColorQuery, [productId, colorcode]);

            const insertVariantQuery = "INSERT INTO `variants` (`product_id`, `color_code`, `size`, `stock`) VALUES (?, ?, ?, ?)";
            await executeQuery(insertVariantQuery, [productId, colorcode, size, stock]);



            return product;

        } catch (err) {
            console.log(err);
            throw new Error(err);
        }
    }

    // async getUserByEmail(email) {
    //     console.log("Get user by email: ", email);
    //     try {
    //         const query = "SELECT * FROM `users` WHERE `email` = ?";
    //         const results = await executeQuery(query, [email]);
    //         return results.length > 0 ? results[0] : null;
    //     } catch (err) {
    //         console.log(err);
    //         throw new Error(err);
    //     }
    // }

}

export default new productModel();