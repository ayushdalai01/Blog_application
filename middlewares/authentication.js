const { validateToken } = require("../services/auth");

function checkForAuth(cookieName) {
    return (req, res, next) => {
        const cookieValue = req.cookies?.[cookieName];

        if (!cookieValue) return next();

        try {
            const userPayload = validateToken(cookieValue);
            req.user = userPayload;
        } catch (error) {
            // Ignore invalid or expired token
        }

        return next();
    };
}

module.exports = {
    checkForAuth
};