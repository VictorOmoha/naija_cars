export const featuredCars = [
  {
    id: 1,
    make: "Toyota",
    model: "Land Cruiser",
    year: 2023,
    trim: "VX Premium",
    price: 85000000,
    mileage: 12000,
    transmission: "Automatic",
    fuelType: "Diesel",
    condition: "Foreign Used",
    category: ['suv'],
    location: { state: "Lagos", city: "Victoria Island" },
    type: "sale",
    images: [
      "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800"
    ],
    verified: true,
    featured: true,
    dealer: {
      name: "AutoPrime Motors",
      verified: true,
      rating: 4.8
    }
  },
  {
    id: 2,
    make: "Mercedes-Benz",
    model: "GLE 450",
    year: 2022,
    trim: "4MATIC",
    price: 75000000,
    mileage: 18000,
    transmission: "Automatic",
    fuelType: "Petrol",
    condition: "Foreign Used",
    category: ['suv', 'luxury'],
    location: { state: "Abuja", city: "Maitama" },
    type: "sale",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800"
    ],
    verified: true,
    featured: true,
    dealer: {
      name: "Elite Auto Gallery",
      verified: true,
      rating: 4.9
    }
  },
  {
    id: 3,
    make: "BMW",
    model: "X5",
    year: 2023,
    trim: "xDrive40i",
    price: 68000000,
    mileage: 8500,
    transmission: "Automatic",
    fuelType: "Petrol",
    condition: "Brand New",
    category: ['suv', 'luxury', 'new'],
    location: { state: "Lagos", city: "Lekki" },
    type: "sale",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800"
    ],
    verified: true,
    featured: true,
    dealer: {
      name: "Prestige Auto Hub",
      verified: true,
      rating: 4.7
    }
  },
  {
    id: 4,
    make: "Lexus",
    model: "RX 350",
    year: 2021,
    trim: "F Sport",
    price: 42000000,
    mileage: 35000,
    transmission: "Automatic",
    fuelType: "Petrol",
    condition: "Nigerian Used",
    category: ['suv', 'luxury'],
    location: { state: "Port Harcourt", city: "GRA" },
    type: "sale",
    images: [
      "https://images.unsplash.com/photo-1540066019607-e5f69323a8dc?w=800"
    ],
    verified: true,
    featured: false,
    dealer: {
      name: "PhCity Motors",
      verified: true,
      rating: 4.6
    }
  },
  {
    id: 5,
    make: "Range Rover",
    model: "Sport",
    year: 2022,
    trim: "HSE Dynamic",
    price: 95000000,
    mileage: 15000,
    transmission: "Automatic",
    fuelType: "Diesel",
    condition: "Foreign Used",
    category: ['suv', 'luxury'],
    location: { state: "Lagos", city: "Ikoyi" },
    type: "sale",
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800"
    ],
    verified: true,
    featured: true,
    dealer: {
      name: "Luxury Auto Imports",
      verified: true,
      rating: 4.9
    }
  },
  {
    id: 6,
    make: "Honda",
    model: "Accord",
    year: 2020,
    trim: "Sport 2.0T",
    price: 18500000,
    mileage: 42000,
    transmission: "Automatic",
    fuelType: "Petrol",
    condition: "Nigerian Used",
    category: ['sedan'],
    location: { state: "Kano", city: "Nassarawa" },
    type: "sale",
    images: [
      "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800"
    ],
    verified: true,
    featured: false,
    dealer: {
      name: "Northern Auto Sales",
      verified: false,
      rating: 4.3
    }
  }
];

export const rentalCars = [
  {
    id: 101,
    make: "Toyota",
    model: "Camry",
    year: 2023,
    trim: "XLE",
    pricePerDay: 45000,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    location: { state: "Lagos", city: "Ikeja" },
    type: "rent",
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800"
    ],
    available: true,
    features: ["AC", "Bluetooth", "Backup Camera"],
    company: {
      name: "DriveNaija Rentals",
      verified: true,
      rating: 4.8
    }
  },
  {
    id: 102,
    make: "Mercedes-Benz",
    model: "S-Class",
    year: 2023,
    trim: "S580",
    pricePerDay: 250000,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    location: { state: "Lagos", city: "Victoria Island" },
    type: "rent",
    images: [
      "https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=800"
    ],
    available: true,
    features: ["Chauffeur Available", "WiFi", "Luxury Interior"],
    company: {
      name: "VIP Executive Rentals",
      verified: true,
      rating: 5.0
    }
  },
  {
    id: 103,
    make: "Toyota",
    model: "Hiace",
    year: 2022,
    trim: "GL",
    pricePerDay: 75000,
    transmission: "Manual",
    fuelType: "Diesel",
    seats: 15,
    location: { state: "Abuja", city: "Wuse" },
    type: "rent",
    images: [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"
    ],
    available: true,
    features: ["AC", "Large Capacity", "Perfect for Events"],
    company: {
      name: "Abuja Transit Co.",
      verified: true,
      rating: 4.6
    }
  },
  {
    id: 104,
    make: "Honda",
    model: "CR-V",
    year: 2023,
    trim: "Touring",
    pricePerDay: 55000,
    transmission: "Automatic",
    fuelType: "Petrol",
    seats: 5,
    location: { state: "Lagos", city: "Lekki" },
    type: "rent",
    images: [
      "https://images.unsplash.com/photo-1568844293986-8c8f0d7df5f0?w=800"
    ],
    available: true,
    features: ["AWD", "Apple CarPlay", "Sunroof"],
    company: {
      name: "EasyRide Nigeria",
      verified: true,
      rating: 4.7
    }
  }
];

export const nigerianStates = [
  "Lagos", "Abuja", "Kano", "Rivers", "Oyo", "Kaduna", "Ogun", "Edo",
  "Delta", "Enugu", "Anambra", "Imo", "Akwa Ibom", "Cross River", "Kwara",
  "Osun", "Ekiti", "Ondo", "Plateau", "Benue", "Bauchi", "Gombe", "Adamawa",
  "Taraba", "Borno", "Yobe", "Niger", "Kogi", "Nasarawa", "Sokoto", "Zamfara",
  "Kebbi", "Jigawa", "Katsina", "Bayelsa", "Ebonyi", "Abia"
];

export const carMakes = [
  "Toyota", "Mercedes-Benz", "BMW", "Lexus", "Honda", "Range Rover",
  "Audi", "Porsche", "Ford", "Hyundai", "Kia", "Nissan", "Volkswagen",
  "Peugeot", "Mazda", "Mitsubishi", "Jeep", "Chevrolet", "Land Rover"
];

export const stats = {
  totalListings: 15420,
  verifiedDealers: 850,
  happyCustomers: 28500,
  statesCovered: 36
};
