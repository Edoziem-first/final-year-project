const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {

    const authHeader =
    req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({
            error: "Access denied"
        });

    }

    const token =
    authHeader.split(" ")[1];

    try {

        const verified =
        jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = verified;

        next();

    }

    catch(error){

        res.status(401).json({

            error:
            "Invalid token"

        });

    }

}

module.exports =
verifyToken;