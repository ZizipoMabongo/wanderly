const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");
const mongoose = require("mongoose");

const Destination = require("./models/Destination");

dotenv.config();

const destinations = [
  // 🇿🇦 SOUTH AFRICA
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
      "A colourful historic neighbourhood known for its architecture, culture and Cape Malay heritage.",
    category: "culture",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1576485375217-d6a95e34d043?auto=format&fit=crop&w=1200&q=80",
    tags: ["culture", "photography", "history", "food"],
    priceLevel: 1,
  },
  {
    name: "Kruger National Park",
    location: "Mpumalanga",
    country: "South Africa",
    description:
      "One of Africa's most famous safari destinations, home to the Big Five and incredible wildlife.",
    category: "adventure",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    tags: ["wildlife", "safari", "nature", "adventure"],
    priceLevel: 3,
  },
  {
    name: "V&A Waterfront",
    location: "Cape Town",
    country: "South Africa",
    description:
      "A lively waterfront destination filled with restaurants, shops, entertainment and harbour views.",
    category: "food",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80",
    tags: ["shopping", "food", "entertainment", "waterfront"],
    priceLevel: 3,
  },
  {
    name: "uShaka Marine World",
    location: "Durban",
    country: "South Africa",
    description:
      "A popular beachfront attraction combining marine life, entertainment and family-friendly activities.",
    category: "adventure",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1200&q=80",
    tags: ["beach", "family", "ocean", "adventure"],
    priceLevel: 2,
  },

  // 🌍 AFRICA
  {
    name: "Victoria Falls",
    location: "Livingstone",
    country: "Zambia",
    description:
      "One of the world's greatest natural wonders, where the Zambezi River plunges into a dramatic gorge.",
    category: "nature",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1582972236019-ea9d5a2e6c29?auto=format&fit=crop&w=1200&q=80",
    tags: ["waterfalls", "nature", "adventure", "photography"],
    priceLevel: 3,
  },
  {
    name: "Stone Town",
    location: "Zanzibar",
    country: "Tanzania",
    description:
      "A historic coastal district filled with winding streets, markets and Swahili architecture.",
    category: "culture",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80",
    tags: ["culture", "history", "beach", "architecture"],
    priceLevel: 2,
  },
  {
    name: "Maasai Mara",
    location: "Narok",
    country: "Kenya",
    description:
      "A spectacular wildlife reserve famous for big cats, vast savannahs and the Great Migration.",
    category: "adventure",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    tags: ["wildlife", "safari", "nature", "photography"],
    priceLevel: 4,
  },
  {
    name: "Marrakech Medina",
    location: "Marrakech",
    country: "Morocco",
    description:
      "A vibrant old city filled with colourful markets, traditional architecture and Moroccan cuisine.",
    category: "culture",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1597212720408-3c9a5c9c8a9c?auto=format&fit=crop&w=1200&q=80",
    tags: ["culture", "markets", "food", "history"],
    priceLevel: 2,
  },
  {
    name: "Pyramids of Giza",
    location: "Giza",
    country: "Egypt",
    description:
      "Ancient Egyptian monuments and one of the most recognisable archaeological sites in the world.",
    category: "sightseeing",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
    tags: ["history", "ancient", "architecture", "photography"],
    priceLevel: 2,
  },

  // 🇯🇵 JAPAN
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
    tags: ["city", "nightlife", "shopping", "photography"],
    priceLevel: 3,
  },
  {
    name: "Fushimi Inari Shrine",
    location: "Kyoto",
    country: "Japan",
    description:
      "A famous Shinto shrine known for its thousands of bright torii gates winding through the forest.",
    category: "culture",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=1200&q=80",
    tags: ["culture", "temples", "history", "nature"],
    priceLevel: 1,
  },
  {
    name: "Arashiyama Bamboo Grove",
    location: "Kyoto",
    country: "Japan",
    description:
      "A peaceful bamboo forest offering one of Kyoto's most memorable natural experiences.",
    category: "nature",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80",
    tags: ["nature", "bamboo", "photography", "peaceful"],
    priceLevel: 1,
  },

  // 🇫🇷 FRANCE
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
    tags: ["landmark", "romantic", "architecture", "photography"],
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
    tags: ["cafes", "shopping", "culture", "food"],
    priceLevel: 3,
  },
  {
    name: "French Riviera",
    location: "Nice",
    country: "France",
    description:
      "A glamorous Mediterranean coastline known for beaches, sunshine, charming towns and seaside dining.",
    category: "beaches",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
    tags: ["beach", "coast", "luxury", "relaxation"],
    priceLevel: 4,
  },

  // 🇬🇧 UNITED KINGDOM
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
    tags: ["food", "market", "local", "restaurants"],
    priceLevel: 2,
  },
  {
    name: "Tower Bridge",
    location: "London",
    country: "United Kingdom",
    description:
      "One of London's most recognisable landmarks spanning the River Thames.",
    category: "sightseeing",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    tags: ["landmark", "history", "architecture", "city"],
    priceLevel: 2,
  },

  // 🇮🇹 ITALY
  {
    name: "Colosseum",
    location: "Rome",
    country: "Italy",
    description:
      "An ancient Roman amphitheatre and one of Italy's most iconic historical landmarks.",
    category: "history",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    tags: ["history", "ancient", "architecture", "rome"],
    priceLevel: 3,
  },
  {
    name: "Amalfi Coast",
    location: "Amalfi",
    country: "Italy",
    description:
      "A breathtaking Mediterranean coastline lined with colourful villages, cliffs and sparkling blue water.",
    category: "beaches",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1200&q=80",
    tags: ["beach", "coast", "romantic", "scenery"],
    priceLevel: 4,
  },

  // 🇪🇸 SPAIN
  {
    name: "Sagrada Família",
    location: "Barcelona",
    country: "Spain",
    description:
      "Gaudí's extraordinary basilica and one of Barcelona's most famous architectural landmarks.",
    category: "architecture",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1583779457094-ab6f9d7c5b4d?auto=format&fit=crop&w=1200&q=80",
    tags: ["architecture", "culture", "history", "photography"],
    priceLevel: 3,
  },
  {
    name: "Ibiza",
    location: "Balearic Islands",
    country: "Spain",
    description:
      "A Mediterranean island famous for beautiful beaches, vibrant nightlife and spectacular sunsets.",
    category: "nightlife",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    tags: ["beach", "nightlife", "music", "summer"],
    priceLevel: 4,
  },

  // 🇹🇭 THAILAND
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
    tags: ["rooftop", "cocktails", "city-views", "nightlife"],
    priceLevel: 4,
  },
  {
    name: "Railay Beach",
    location: "Krabi",
    country: "Thailand",
    description:
      "A stunning tropical beach surrounded by dramatic limestone cliffs and turquoise water.",
    category: "beaches",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    tags: ["beach", "island", "nature", "adventure"],
    priceLevel: 2,
  },

  // 🇮🇩 INDONESIA
  {
    name: "Ubud",
    location: "Bali",
    country: "Indonesia",
    description:
      "A peaceful cultural destination surrounded by rice terraces, temples, forests and wellness retreats.",
    category: "culture",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    tags: ["culture", "nature", "wellness", "rice-terraces"],
    priceLevel: 2,
  },
  {
    name: "Seminyak Beach",
    location: "Bali",
    country: "Indonesia",
    description:
      "A stylish beach destination known for sunsets, restaurants, resorts and relaxed coastal living.",
    category: "beaches",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=1200&q=80",
    tags: ["beach", "sunset", "food", "relaxation"],
    priceLevel: 3,
  },

  // 🇦🇪 UNITED ARAB EMIRATES
  {
    name: "Burj Khalifa",
    location: "Dubai",
    country: "United Arab Emirates",
    description:
      "The world's tallest building offering extraordinary views across Dubai and the Arabian Gulf.",
    category: "sightseeing",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    tags: ["architecture", "city", "luxury", "views"],
    priceLevel: 4,
  },
  {
    name: "Dubai Marina",
    location: "Dubai",
    country: "United Arab Emirates",
    description:
      "A modern waterfront district filled with skyscrapers, restaurants, shopping and nightlife.",
    category: "nightlife",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80",
    tags: ["city", "waterfront", "shopping", "nightlife"],
    priceLevel: 4,
  },

  // 🇺🇸 UNITED STATES
  {
    name: "Times Square",
    location: "New York City",
    country: "United States",
    description:
      "The bright heart of Manhattan, famous for giant billboards, theatres, shopping and entertainment.",
    category: "sightseeing",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1538970272646-f61fabb3a8a2?auto=format&fit=crop&w=1200&q=80",
    tags: ["city", "nightlife", "shopping", "entertainment"],
    priceLevel: 4,
  },
  {
    name: "Central Park",
    location: "New York City",
    country: "United States",
    description:
      "A vast urban park offering peaceful green spaces, walking paths, lakes and city views.",
    category: "nature",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1200&q=80",
    tags: ["nature", "parks", "walking", "city"],
    priceLevel: 1,
  },

  // 🇧🇷 BRAZIL
  {
    name: "Copacabana Beach",
    location: "Rio de Janeiro",
    country: "Brazil",
    description:
      "A legendary beach framed by mountains, lively streets and the vibrant energy of Rio.",
    category: "beaches",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    tags: ["beach", "city", "sun", "culture"],
    priceLevel: 2,
  },

  // 🇦🇺 AUSTRALIA
  {
    name: "Sydney Opera House",
    location: "Sydney",
    country: "Australia",
    description:
      "One of Australia's most recognisable landmarks overlooking the beautiful Sydney Harbour.",
    category: "sightseeing",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1506973035872-a4f8f3e1b7b1?auto=format&fit=crop&w=1200&q=80",
    tags: ["architecture", "harbour", "culture", "photography"],
    priceLevel: 3,
  },

  // 🇬🇷 GREECE
  {
    name: "Santorini",
    location: "Cyclades",
    country: "Greece",
    description:
      "A breathtaking Greek island known for whitewashed villages, blue domes and unforgettable sunsets.",
    category: "beaches",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
    tags: ["island", "beach", "romantic", "sunset"],
    priceLevel: 4,
  },
];
async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

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