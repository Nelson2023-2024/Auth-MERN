import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: mongoose.Schema.Types.String,
      required: true,
      unique: true,
    },
    password: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    name: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    lastLogin: {
      type: mongoose.Schema.Types.Date,
      default: Date.now,
    },
    isVerified: {
      type: mongoose.Schema.Types.Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpireAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
  },
  {timestamps: true}
);

export const User = mongoose.model('User', userSchema);
