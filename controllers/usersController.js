const User = require("../models/usersSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Helper function to generate JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "48h",
  });
};

module.exports.addUser = async (req, res) => {
    try {
        const { name, last, email, phone, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Name, email and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // --- MODIFICATION START ---
        // Determine the role based on the email domain
        let determinedRole = "client"; // Default to client

        if (email.endsWith("@salesbeta.com")) {
            determinedRole = "salesAgent";
        } else if (email.endsWith("@operationbeta.com")) {
            determinedRole = "operationalOfficer";
        } else if (email.endsWith("@financialbeta.com")) {
            determinedRole = "financialOfficer";
        } else if (email.endsWith("@adminbeta.com")) {
            determinedRole = "admin";
        }
        // --- MODIFICATION END ---


        const newUser = new User({
            name,
            last,
            email,
            password: hashedPassword,
            phone,
            role: determinedRole, // Use the determined role
        });

        const user = await newUser.save();

        // Generate token for immediate login after registration
        const token = createToken(user._id);

        // Return user info without sensitive data
        const userInfo = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        res.status(201).json({
            message: "Registration successful",
            token,
            user: userInfo,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Login
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = createToken(user._id); // your JWT generation logic

    // ✅ Set secure HTTP-only cookie here
    res.cookie("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production", // only HTTPS in production
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    // Return only the necessary user info (without token)
    const userInfo = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // ✅ Send response
    res.status(200).json({ message: "connected", user: userInfo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Logout
module.exports.logout = async (req, res) => {
  res.clearCookie("jwt_token");
  res.status(200).json({ message: "Logout successful" });
};
module.exports.getProfile = async (req, res) => {
  try {
    const userProfile = await User.findById(req.user._id).select("-password");
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    const { name, last, email, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (name) user.name = name;
    if (last) user.last = last;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports.getAllActors = async (req, res) => {
  try {
    const users = await User.find({
      roles: { $ne: "client" }
    });
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Password reset request
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send email with reset token
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/users/resetPassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

    // Implement email sending logic here (e.g., using Nodemailer)
    console.log(message);

    res.status(200).json({ message: "Reset token sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reset password
module.exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
