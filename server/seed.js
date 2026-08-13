const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
const mongoose = require("mongoose");

const Destination = require("./models/Destination");

dotenv.config();

const destinations = [
  {
    name: "Table Mountain",
    location: "Cape Town",
    country: "South Africa",
    description:
      "Iconic mountain overlooking Cape Town with spectacular city and ocean views.",
    category: "sightseeing",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80",
    tags: ["nature", "mountains", "views", "adventure"],
    priceLevel: 2,
  },
  {
    name: "Bo-Kaap",
    location: "Cape Town",
    country: "South Africa",
    description:
      "A colourful historic neighbourhood known for its architecture, culture and food.",
    category: "sightseeing",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=1200&q=80",
    tags: ["culture", "photography", "history"],
    priceLevel: 1,
  },
  {
    name: "Tsukiji Outer Market",
    location: "Tokyo",
    country: "Japan",
    description:
      "A lively food destination packed with fresh seafood, Japanese street food and local delicacies.",
    category: "food",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    tags: ["food", "seafood", "street-food", "japan"],
    priceLevel: 2,
  },
  {
    name: "Shibuya Crossing",
    location: "Tokyo",
    country: "Japan",
    description:
      "One of Tokyo's most famous landmarks surrounded by shopping, restaurants and nightlife.",
    category: "nightlife",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80",
    tags: ["city", "nightlife", "shopping"],
    priceLevel: 3,
  },
  {
    name: "Eiffel Tower",
    location: "Paris",
    country: "France",
    description:
      "The world's most recognisable landmark offering unforgettable views across Paris.",
    category: "sightseeing",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    tags: ["landmark", "romantic", "architecture"],
    priceLevel: 3,
  },
  {
    name: "Le Marais",
    location: "Paris",
    country: "France",
    description:
      "A vibrant Parisian neighbourhood filled with cafés, boutiques, galleries and historic streets.",
    category: "food",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80",
    tags: ["cafes", "shopping", "culture"],
    priceLevel: 3,
  },
  {
    name: "Skybar Lebua",
    location: "Bangkok",
    country: "Thailand",
    description:
      "Luxury rooftop nightlife with spectacular views across Bangkok's skyline.",
    category: "nightlife",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?auto=format&fit=crop&w=1200&q=80",
    tags: ["rooftop", "cocktails", "city-views"],
    priceLevel: 4,
  },
  {
    name: "Borough Market",
    location: "London",
    country: "United Kingdom",
    description:
      "Historic food market packed with artisan producers, restaurants and international flavours.",
    category: "food",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
    tags: ["food", "market", "local"],
    priceLevel: 2,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    await Destination.deleteMany({});
    await Destination.insertMany(destinations);

    console.log(`Seeded ${destinations.length} destinations`);

    await mongoose.disconnect();

    console.log("Database connection closed");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seedDatabase();