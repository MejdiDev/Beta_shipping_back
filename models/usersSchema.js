const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const usersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    last: {
      type: String,
      required: [false, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: [
        "admin",
        "user",
        "client",
        "salesAgent",
        "manager",
        "financialOfficer",
        "operationalOfficer",
      ],
      default: "client",
    },
    phone: {
      type: String,
      trim: true
    },
    user_image: { type: String },
    status: { type: Boolean, default: false },
    // New fields
    lastLogin: {
      type: Date
    },
    
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    leads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    }],
    
    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }]
  },
  {
    timestamps: true,
  }
);

usersSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

usersSchema.methods.getFullName = function () {
  return `${this.name} ${this.last}`;
};

usersSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

usersSchema.methods.isManager = function () {
  return this.role === 'manager';
};

usersSchema.methods.isClient = function () {
  return this.role === 'client';
};

usersSchema.methods.isSalesAgent = function () {
  return this.role === 'salesAgent';
};

usersSchema.methods.isFinancialOfficer = function () {
  return this.role === 'financialOfficer';
};

usersSchema.methods.isOperatingOfficer = function () {
  return this.role === 'operationalOfficer';
};

usersSchema.add({
  repository: {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    }]
  }
});

const users = mongoose.model("users", usersSchema);
module.exports = users;
