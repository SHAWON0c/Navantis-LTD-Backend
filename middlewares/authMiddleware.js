// const jwt = require("jsonwebtoken");

// const AuthMiddleware = (requiredRoles = []) => {
//   return (req, res, next) => {
//     console.log("========================================");
//     console.log("🔹 Incoming Request:", req.method, req.originalUrl);

//     /* ===============================
//        1️⃣ AUTH HEADER VALIDATION
//     ================================ */
//     const authHeader = req.headers.authorization;
//     console.log("🔹 Authorization Header:", authHeader);

//     if (!authHeader) {
//       console.log("❌ ERROR: Authorization header missing");
//       return res.status(401).json({
//         error: "NO_AUTH_HEADER",
//         message: "Authorization header missing",
//       });
//     }

//     if (!authHeader.startsWith("Bearer ")) {
//       console.log("❌ ERROR: Invalid Authorization format");
//       return res.status(401).json({
//         error: "INVALID_AUTH_FORMAT",
//         message: "Authorization must be: Bearer <token>",
//       });
//     }

//     const token = authHeader.replace("Bearer ", "").trim();
//     console.log("🔹 Extracted Token Length:", token.length);

//     if (!token) {
//       console.log("❌ ERROR: Empty token");
//       return res.status(401).json({
//         error: "EMPTY_TOKEN",
//         message: "Token is empty",
//       });
//     }

//     /* ===============================
//        2️⃣ JWT SECRET DEBUG (SAFE)
//     ================================ */
//     const secret = process.env.JWT_SECRET;

//     console.log("🔐 JWT_SECRET exists:", Boolean(secret));
//     console.log("🔐 JWT_SECRET length:", secret?.length);

//     if (!secret) {
//       console.log("❌ SERVER ERROR: JWT_SECRET not set");
//       return res.status(500).json({
//         error: "JWT_SECRET_MISSING",
//         message: "Server misconfiguration",
//       });
//     }

//     /* ===============================
//        3️⃣ TOKEN HEADER INSPECTION
//     ================================ */
//     try {
//       const decodedHeader = jwt.decode(token, { complete: true });
//       console.log("📦 JWT Header:", decodedHeader?.header);
//       console.log("📦 JWT Payload (UNVERIFIED):", decodedHeader?.payload);
//     } catch (e) {
//       console.log("❌ ERROR: Token cannot be decoded");
//     }

//     /* ===============================
//        4️⃣ VERIFY TOKEN
//     ================================ */
//     try {
//       const decoded = jwt.verify(token, secret, {
//         algorithms: ["HS256"], // prevent alg mismatch attacks
//       });

//       console.log("✅ VERIFIED TOKEN PAYLOAD:", decoded);

//       req.user = decoded;

//       /* ===============================
//          5️⃣ ROLE CHECK
//       ================================ */
//       if (requiredRoles.length) {
//         const userRole = String(decoded.role || "").toLowerCase();
//         const allowedRoles = requiredRoles.map(r => r.toLowerCase());

//         console.log("🔹 Required Roles:", allowedRoles);
//         console.log("🔹 User Role:", userRole);

//         if (!allowedRoles.includes(userRole)) {
//           console.log("❌ FORBIDDEN: Role not allowed");
//           return res.status(403).json({
//             error: "FORBIDDEN",
//             message: "Insufficient permissions",
//             allowedRoles,
//             userRole,
//           });
//         }
//       }

//       console.log("➡️ JWT AUTH SUCCESS");
//       next();

//     } catch (err) {
//       /* ===============================
//          6️⃣ DETAILED JWT ERRORS
//       ================================ */
//       console.error("❌ JWT VERIFICATION FAILED");
//       console.error("🔻 Error Name:", err.name);
//       console.error("🔻 Error Message:", err.message);

//       let errorCode = "JWT_ERROR";

//       if (err.name === "TokenExpiredError") {
//         errorCode = "TOKEN_EXPIRED";
//       } else if (err.name === "JsonWebTokenError") {
//         errorCode = "INVALID_SIGNATURE";
//       } else if (err.name === "NotBeforeError") {
//         errorCode = "TOKEN_NOT_ACTIVE";
//       }

//       return res.status(401).json({
//         error: errorCode,
//         message: err.message,
//       });

//     } finally {
//       console.log("========================================\n");
//     }
//   };
// };

// module.exports = AuthMiddleware;


// middlewares/Authmiddleware.js
// const jwt = require("jsonwebtoken");
// const User = require("../models/User.model");

// const JWT_SECRET = process.env.JWT_SECRET;

// const authMiddleware = async (req, res, next) => {
//   try {
//     // 1️⃣ Get token from header (raw token expected)
//     const token = req.headers?.authorization?.trim();

//     if (!token) {
//       return res.status(401).json({ success: false, message: "No token provided" });
//     }

//     // 2️⃣ Verify JWT
//     const decoded = jwt.verify(token, JWT_SECRET);

//     if (!decoded?.userId) {
//       return res.status(401).json({ success: false, message: "Invalid token payload" });
//     }

//     // 3️⃣ Fetch user from DB
//     const user = await User.findById(decoded.userId).select("_id employeeId role email");

//     if (!user) {
//       return res.status(401).json({ success: false, message: "User not found" });
//     }

//     // 4️⃣ Attach user to request
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("Auth Middleware Error:", error.message);
//     return res.status(401).json({ success: false, message: "Unauthorized: invalid token" });
//   }
// };

// module.exports = authMiddleware;




// const jwt = require("jsonwebtoken");
// const User = require("../models/User.model");

// const AuthMiddleware = (requiredRoles = []) => {
//   return async (req, res, next) => {
//     try {
//       console.log("========================================");
//       console.log("🔹 Incoming Request:", req.method, req.originalUrl);

//       // 1️⃣ Get raw token from Authorization header
//       const token = req.headers?.authorization?.trim();
//       if (!token) {
//         return res.status(401).json({
//           success: false,
//           error: "NO_AUTH_HEADER",
//           message: "Authorization header missing or empty",
//         });
//       }

//       // 2️⃣ Verify JWT
//       const secret = process.env.JWT_SECRET;
//       if (!secret) {
//         return res.status(500).json({
//           success: false,
//           error: "JWT_SECRET_MISSING",
//           message: "Server misconfiguration",
//         });
//       }

//       let decoded;
//       try {
//         decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
//         console.log("✅ Verified token payload:", decoded);
//       } catch (err) {
//         console.error("❌ JWT Verification Failed:", err.message);
//         let code = "JWT_ERROR";
//         if (err.name === "TokenExpiredError") code = "TOKEN_EXPIRED";
//         else if (err.name === "JsonWebTokenError") code = "INVALID_SIGNATURE";
//         else if (err.name === "NotBeforeError") code = "TOKEN_NOT_ACTIVE";

//         return res.status(401).json({ success: false, error: code, message: err.message });
//       }

//       // 3️⃣ Fetch user from DB
//       const user = await User.findById(decoded.userId).select("_id employeeId role email");
//       if (!user) {
//         return res.status(401).json({ success: false, message: "User not found" });
//       }

//       req.user = user;

//       // 4️⃣ Role check
//       if (requiredRoles.length) {
//         const allowedRoles = requiredRoles.map(r => r.toLowerCase());
//         const userRole = String(user.role || "").toLowerCase();

//         if (!allowedRoles.includes(userRole)) {
//           return res.status(403).json({
//             success: false,
//             error: "FORBIDDEN",
//             message: "Insufficient permissions",
//             allowedRoles,
//             userRole,
//           });
//         }
//       }

//       console.log("➡️ JWT Auth Success");
//       next();
//     } catch (err) {
//       console.error("❌ Auth Middleware Uncaught Error:", err);
//       res.status(500).json({ success: false, message: "Internal server error" });
//     } finally {
//       console.log("========================================\n");
//     }
//   };
// };

// module.exports = AuthMiddleware;


const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const AuthMiddleware = (requiredRoles = null) => {
  return async (req, res, next) => {
    try {
      console.log("========================================");
      console.log("🔹 Incoming Request:", req.method, req.originalUrl);

      // 1️⃣ Get raw token from Authorization header
      const token = req.headers?.authorization?.trim();
      if (!token) {
        return res.status(401).json({
          success: false,
          error: "NO_AUTH_HEADER",
          message: "Authorization header missing or empty",
        });
      }

      // 2️⃣ Verify JWT
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({
          success: false,
          error: "JWT_SECRET_MISSING",
          message: "Server misconfiguration",
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
        console.log("✅ Verified token payload:", decoded);
      } catch (err) {
        console.error("❌ JWT Verification Failed:", err.message);
        let code = "JWT_ERROR";
        if (err.name === "TokenExpiredError") code = "TOKEN_EXPIRED";
        else if (err.name === "JsonWebTokenError") code = "INVALID_SIGNATURE";
        else if (err.name === "NotBeforeError") code = "TOKEN_NOT_ACTIVE";

        return res.status(401).json({ success: false, error: code, message: err.message });
      }

      // 3️⃣ Fetch user from DB
      const user = await User.findById(decoded.userId).select("_id employeeId role email");
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      // 4️⃣ Default role to "user" if missing
      if (!user.role) user.role = "user";

      req.user = user;

      // 5️⃣ Role check if roles are provided
      if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
        const allowedRoles = requiredRoles.map(r => r.toLowerCase());
        const userRole = String(user.role || "").toLowerCase();

        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({
            success: false,
            error: "FORBIDDEN",
            message: "Insufficient permissions",
            allowedRoles,
            userRole,
          });
        }
      }

      console.log("➡️ JWT Auth Success");
      next();
    } catch (err) {
      console.error("❌ Auth Middleware Uncaught Error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    } finally {
      console.log("========================================\n");
    }
  };
};

module.exports = AuthMiddleware;
