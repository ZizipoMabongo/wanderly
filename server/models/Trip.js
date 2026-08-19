const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /*
      Legacy support: trips created against your old
      manually-added Destination documents keep working.
      Optional now because new trips are built from
      SerpAPI results, which don't have a Mongo _id.
    */
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      default: null,
    },

    /*
      SerpAPI place info, captured at the time the trip
      is created so the trip still displays correctly
      even if the place later drops out of search results.
    */
    placeId: {
      type: String,
      default: "",
    },

    placeName: {
      type: String,
      trim: true,
      default: "",
    },

    placeImage: {
      type: String,
      default: "",
    },

    placeLocation: {
      type: String,
      trim: true,
      default: "",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    /*
      =========================================
      POST-TRIP REVIEW
      Filled in after the trip via
      PATCH /api/trips/:id/review
      =========================================
    */
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
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

      reviewedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);
