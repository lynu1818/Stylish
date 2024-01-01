import {connection} from "../../db.js";
import Redis from "redis";

const redisClient = Redis.createClient({
        url: 'redis://redis:6379'
});

const PAGE_SIZE = 6;

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

export function paginationMiddleware(req, res, next) {
    const page = parseInt(req.query.paging) || 1;

    if (isNaN(page) || page <= 0) {
        return res.status(400).json({error: 'Invalid page number.'});
    }

    req.pagination = {
        page: page,
        offset: (page - 1) * PAGE_SIZE
    };
    next();
}

export const productDetails = async (req, res, next) => {
    const productId = req.query.id;
    if (isNaN(productId)) {
        return res.status(400).json({error: 'Invalid or missing product ID.'});
    }

    try {
        const [product, images, colors, sizes, variants] = await getOrSetCache(
            `productDetails?id=${productId}`,
            async()=> {
                return await Promise.all([
                    connection.query('SELECT * FROM products WHERE id = ?', [productId]),
                    connection.query('SELECT image FROM productImages WHERE product_id = ?', [productId]),
                    connection.query('SELECT c.color_code, c.name FROM productColors pc JOIN colors c ON pc.color_code = c.color_code WHERE pc.product_id = ?', [productId]),
                    connection.query('SELECT size FROM productSizes WHERE product_id = ?', [productId]),
                    connection.query('SELECT color_code, size, stock FROM variants WHERE product_id = ?', [productId])
                ])
            }
        )
        console.log("product: ", product);

        if (!product[0].length) {
            return res.status(400).json({error: 'Product not found.'});
        }


        const response = {
            data: {
                ...product[0][0], // first result from the first query
                images: images[0].map(img => img.image),
                colors: colors[0],
                sizes: sizes[0].map(size => size.size),
                variants: variants[0]
            }
        };
        res.status(200).json(response);
    } catch (err) {
        next(err);
    }

};


export const productList = async (req, res, next) => {
    console.log(req.url);
    const category = req.params.category;
    const validCategories = ['all', 'women', 'men', 'accessories'];
    if (!validCategories.includes(category)) {
        // console.log(category);
        return res.status(400).json({error: 'Invalid category.'});
    }


    const page = req.pagination.page;
    const offset = req.pagination.offset;

    const queryBase = "SELECT * FROM products ";
    let whereClause = "";
    const queryParams = [];

    if (category !== 'all') {
        whereClause = "WHERE category = ? ";
        queryParams.push(category);
    }

    const finalQuery = `${queryBase} ${whereClause}LIMIT ${PAGE_SIZE} OFFSET ?`;
    queryParams.push(offset);

    try {
        const [products] = await connection.query(finalQuery, queryParams);

        const productDetails = await Promise.all(products.map(async product => {
            const [images, colors, sizes, variants] = await Promise.all([
                connection.query('SELECT image FROM productImages WHERE id = ?', [product.id]),
                connection.query('SELECT c.color_code, c.name FROM productColors pc JOIN colors c ON pc.color_code = c.color_code WHERE pc.id = ?', [product.id]),
                connection.query('SELECT size FROM productSizes WHERE id = ?', [product.id]),
                connection.query('SELECT color_code, size, stock FROM variants WHERE id = ?', [product.id])
            ]);
            return {
                ...product,
                images: images[0].map(img => img.image),
                colors: colors[0],
                sizes: sizes[0].map(size => size.size),
                variants: variants[0]
            }
        }));

        const nextPaging = (products.length === PAGE_SIZE) ? page + 1 : null;

        let response;
        if(nextPaging != null) {
            response = {
                data: productDetails,
                next_paging: nextPaging
            };
        } else {
            response = {
                data: productDetails
            };
        }
        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
}

export const productSearch = async (req, res, next) => {
    const page = req.pagination.page;
    const offset = req.pagination.offset;
    const keyword = req.query.keyword;  // 已經由中間件保證keyword存在

    const keywordLike = '%' + keyword + '%';


    try {
        const [products] = await connection.query('SELECT * FROM products WHERE `title` LIKE ? OR `description` LIKE ? LIMIT 6 OFFSET ?', [keywordLike, keywordLike, offset]);


        const productDetails = await Promise.all(products.map(async product => {
            const [images, colors, sizes, variants] = await Promise.all([
                connection.query('SELECT image FROM productImages WHERE id = ?', [product.id]),
                connection.query('SELECT c.color_code, c.name FROM productColors pc JOIN colors c ON pc.color_code = c.color_code WHERE pc.id = ?', [product.id]),
                connection.query('SELECT size FROM productSizes WHERE id = ?', [product.id]),
                connection.query('SELECT color_code, size, stock FROM variants WHERE id = ?', [product.id])
            ]);
            return {
                ...product,
                images: images[0].map(img => img.image),
                colors: colors[0],
                sizes: sizes[0].map(size => size.size),
                variants: variants[0]
            }
        }));

        const nextPaging = (products.length === PAGE_SIZE) ? page + 1 : null;

        let response;
        if(nextPaging != null) {
            response = {
                data: productDetails,
                next_paging: nextPaging
            };
        } else {
            response = {
                data: productDetails
            };
        }
        res.status(200).json(response);
    } catch (err) {
        next(err);
    }
};