const jwt =require('jsonwebtoken');

module.exports = (req, res, next) => {

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });


    try {
        const decode = jwt.verify(token, process.env.JWT_SERCET_KEY);
        req.userId = decode.id;
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
};