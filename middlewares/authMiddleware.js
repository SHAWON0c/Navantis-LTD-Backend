const jwt = require('jsonwebtoken');

const Authmiddleware = (requiredRoles = []) => {
  return (req, res, next) => { // <-- include next!
    const authHeader = req.headers.authorization;

    if (!authHeader) 
      return res.status(401).json({ message: "No token provided" });

    if (!authHeader.startsWith("Bearer ")) 
      return res.status(401).json({ message: "Invalid token format" });

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // attach user info

      // Role check
      if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden: insufficient permissions" });
      }

      next(); // <-- MUST call next() to continue to the route
    } catch (err) {
      console.error("JWT ERROR:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = Authmiddleware;
