const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    /*
      SerpAPI place identifier (place_id / data_id).
      This is what ties a review to a destination now
      that destinations aren't stored in Mongo.
    */
    placeId: {
      type: String,
      required: true,
      index: true,
    },

    placeName: {
      type: String,
      required: true,
      trim: true,
    },

    /*
      Present only for logged-in reviewers.
      Guest reviews leave this null.
    */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /*
      Display name for guest reviewers.
      Ignored/overridden by the account name
      when `user` is set.
    */
    guestName: {
      type: String,
      trim: true,
      default: "",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],

    /*
      Private reviews are only ever returned to the
      user who wrote them. Guests can't create private
      reviews since there'd be no account to view them
      from later — enforced in the route, not here.
    */
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
