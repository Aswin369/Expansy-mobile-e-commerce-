const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ["Category", "Product", "Referral"], 
        required: true 
    },
    categoryOrProduct: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "type",
      required: function () {
        return this.type !== "Referral"; // Required only for Category/Product
      },
    },
    discountType: {
      type: String,
      enum: ["Percentage", "Fixed Amount"],
      required: function () {
        return this.type !== "Referral"; // Not needed for Referral
      },
    },
    discountValue: { 
        type: Number, 
        required: function () {
          return this.type !== "Referral"; // Not needed for Referral
        },
    },
    minPurchase: { 
        type: Number, 
        default: null 
    },
    referralBonus: { // Amount given for referring a new user
      type: Number,
      required: function () {
        return this.type === "Referral"; // Required only for Referral Offers
      },
    },
    maxReferrals: { // Maximum number of referrals allowed per user
      type: Number,
      default: null
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value);
        },
        message: "Invalid Start Date",
      },
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return this.startDate && value > this.startDate;
        },
        message: "End Date must be after Start Date",
      },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Scheduled"],
      default: "Scheduled",
    },
    description: { type: String },
  },
  { timestamps: true }
);

// Middleware to check if End Date is after Start Date
offerSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End Date must be after Start Date"));
  } else {
    next();
  }
});

module.exports = mongoose.model("Offer", offerSchema);
