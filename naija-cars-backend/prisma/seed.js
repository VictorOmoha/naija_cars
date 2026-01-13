const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create demo dealers/users
  const dealers = [
    { email: 'autoking@example.com', phone: '+2348011111111', businessName: 'AutoKing Motors', city: 'Lagos', state: 'Lagos' },
    { email: 'primeauto@example.com', phone: '+2348022222222', businessName: 'Prime Auto Hub', city: 'Abuja', state: 'FCT' },
    { email: 'luxurywheels@example.com', phone: '+2348033333333', businessName: 'Luxury Wheels NG', city: 'Lagos', state: 'Lagos' },
    { email: 'riversauto@example.com', phone: '+2348044444444', businessName: 'Rivers Auto', city: 'Port Harcourt', state: 'Rivers' },
    { email: 'automartlagos@example.com', phone: '+2348055555555', businessName: 'AutoMart Lagos', city: 'Lagos', state: 'Lagos' },
    { email: 'capitalmotors@example.com', phone: '+2348066666666', businessName: 'Capital Motors', city: 'Abuja', state: 'FCT' },
    { email: 'toyotang@example.com', phone: '+2348077777777', businessName: 'Toyota Nigeria', city: 'Lagos', state: 'Lagos' },
    { email: 'hondaplaceng@example.com', phone: '+2348088888888', businessName: 'Honda Place Nigeria', city: 'Lagos', state: 'Lagos' },
    { email: 'kanoautomarket@example.com', phone: '+2348099999999', businessName: 'Kano Auto Market', city: 'Kano', state: 'Kano' },
    { email: 'hyundailagos@example.com', phone: '+2348010101010', businessName: 'Hyundai Lagos', city: 'Lagos', state: 'Lagos' },
    { email: 'ibadanmotors@example.com', phone: '+2348012121212', businessName: 'Ibadan Motors', city: 'Ibadan', state: 'Oyo' },
    { email: 'mazdang@example.com', phone: '+2348013131313', businessName: 'Mazda Nigeria', city: 'Lagos', state: 'Lagos' },
    { email: 'premiumautorentals@example.com', phone: '+2348014141414', businessName: 'Premium Auto Rentals', city: 'Lagos', state: 'Lagos' },
    { email: 'elitemotorsabuja@example.com', phone: '+2348015151515', businessName: 'Elite Motors Abuja', city: 'Abuja', state: 'FCT' },
    { email: 'riversautohub@example.com', phone: '+2348016161616', businessName: 'Rivers Auto Hub', city: 'Port Harcourt', state: 'Rivers' },
    { email: 'bmwlagosrentals@example.com', phone: '+2348017171717', businessName: 'BMW Lagos Rentals', city: 'Lagos', state: 'Lagos' },
  ];

  const passwordHash = await bcrypt.hash('demo123456', 12);
  const createdUsers = [];

  for (const dealer of dealers) {
    const user = await prisma.user.upsert({
      where: { email: dealer.email },
      update: {},
      create: {
        email: dealer.email,
        phoneNumber: dealer.phone,
        passwordHash,
        userType: 'DEALER',
        isVerified: true,
        isActive: true,
        profile: {
          create: {
            businessName: dealer.businessName,
            city: dealer.city,
            state: dealer.state,
            verificationBadge: true,
          },
        },
      },
      include: { profile: true },
    });
    createdUsers.push({ ...user, businessName: dealer.businessName });
    console.log(`Created dealer: ${dealer.businessName}`);
  }

  // Helper to find user by business name
  const findDealerByName = (name) => createdUsers.find(u => u.businessName === name);

  // Cars for Sale
  const carsForSale = [
    {
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      trim: 'XLE',
      price: 18500000,
      condition: 'FOREIGN_USED',
      mileage: 25000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'Well-maintained Toyota Camry XLE with full service history. Leather interior, sunroof, and premium sound system.',
      isFeatured: true,
      dealer: 'AutoKing Motors',
      images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'],
    },
    {
      make: 'Honda',
      model: 'Accord',
      year: 2021,
      trim: 'Sport',
      price: 16000000,
      condition: 'FOREIGN_USED',
      mileage: 32000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'FCT',
      locationCity: 'Abuja',
      description: 'Clean Honda Accord Sport with low mileage. Sport mode, Android Auto/Apple CarPlay, and advanced safety features.',
      isFeatured: false,
      dealer: 'Prime Auto Hub',
      images: ['https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800'],
    },
    {
      make: 'Mercedes-Benz',
      model: 'E350',
      year: 2020,
      price: 32000000,
      condition: 'FOREIGN_USED',
      mileage: 28000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'Elegant Mercedes-Benz E350 in pristine condition. AMG Line package, Burmester sound system, panoramic roof.',
      isFeatured: true,
      dealer: 'Luxury Wheels NG',
      images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
    },
    {
      make: 'Toyota',
      model: 'Highlander',
      year: 2019,
      price: 22000000,
      condition: 'FOREIGN_USED',
      mileage: 45000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Rivers',
      locationCity: 'Port Harcourt',
      description: 'Spacious Toyota Highlander with 3rd row seating. Perfect family SUV with excellent fuel efficiency.',
      isFeatured: false,
      dealer: 'Rivers Auto',
      images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'],
    },
    {
      make: 'Lexus',
      model: 'RX 350',
      year: 2018,
      price: 19500000,
      condition: 'NIGERIAN_USED',
      mileage: 65000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'Reliable Lexus RX 350 with comprehensive maintenance records. Premium package with Mark Levinson audio.',
      isFeatured: false,
      dealer: 'AutoMart Lagos',
      images: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800'],
    },
    {
      make: 'BMW',
      model: 'X5',
      year: 2017,
      trim: 'xDrive35i',
      price: 17000000,
      condition: 'NIGERIAN_USED',
      mileage: 78000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'FCT',
      locationCity: 'Abuja',
      description: 'Powerful BMW X5 with xDrive all-wheel drive. Luxury interior, heads-up display, and premium features.',
      isFeatured: false,
      dealer: 'Capital Motors',
      images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
    },
    {
      make: 'Toyota',
      model: 'Corolla Cross',
      year: 2024,
      price: 35000000,
      condition: 'BRAND_NEW',
      mileage: 0,
      transmission: 'Automatic',
      fuelType: 'Hybrid',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'Brand new Toyota Corolla Cross Hybrid. Best-in-class fuel economy with Toyota Safety Sense 2.0.',
      isFeatured: true,
      dealer: 'Toyota Nigeria',
      images: ['https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800'],
    },
    {
      make: 'Honda',
      model: 'HR-V',
      year: 2024,
      price: 28000000,
      condition: 'BRAND_NEW',
      mileage: 0,
      transmission: 'CVT',
      fuelType: 'Petrol',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'All-new Honda HR-V with class-leading interior space. Honda Sensing safety suite included.',
      isFeatured: true,
      dealer: 'Honda Place Nigeria',
      images: ['https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800'],
    },
    {
      make: 'Ford',
      model: 'Explorer',
      year: 2016,
      price: 12500000,
      condition: 'NIGERIAN_USED',
      mileage: 95000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Kano',
      locationCity: 'Kano',
      description: 'Reliable Ford Explorer with 7 seats. Perfect for large families with generous cargo space.',
      isFeatured: false,
      dealer: 'Kano Auto Market',
      images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'],
    },
    {
      make: 'Hyundai',
      model: 'Tucson',
      year: 2020,
      price: 14000000,
      condition: 'FOREIGN_USED',
      mileage: 38000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'Modern Hyundai Tucson with advanced features. Panoramic sunroof, wireless charging, and smart safety tech.',
      isFeatured: false,
      dealer: 'Hyundai Lagos',
      images: ['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800'],
    },
    {
      make: 'Kia',
      model: 'Sportage',
      year: 2019,
      price: 11500000,
      condition: 'FOREIGN_USED',
      mileage: 42000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Oyo',
      locationCity: 'Ibadan',
      description: 'Stylish Kia Sportage with excellent value. Turbocharged engine, premium interior, and comprehensive warranty.',
      isFeatured: false,
      dealer: 'Ibadan Motors',
      images: ['https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800'],
    },
    {
      make: 'Mazda',
      model: 'CX-5',
      year: 2021,
      price: 15500000,
      condition: 'FOREIGN_USED',
      mileage: 29000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'Sporty Mazda CX-5 with Kodo design language. SkyActiv technology for optimal performance and efficiency.',
      isFeatured: false,
      dealer: 'Mazda Nigeria',
      images: ['https://images.unsplash.com/photo-1612544448445-b8232cff3b4c?w=800'],
    },
  ];

  // Cars for Rent
  const carsForRent = [
    {
      make: 'Toyota',
      model: 'Corolla',
      year: 2023,
      price: 25000, // Daily rate
      condition: 'FOREIGN_USED',
      mileage: 15000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'Economy car for daily rentals. AC, Bluetooth, USB Charging, Backup Camera. Weekly rate: ₦150,000. Monthly rate: ₦500,000.',
      isFeatured: true,
      dealer: 'Premium Auto Rentals',
      images: ['https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800'],
    },
    {
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      price: 28000,
      condition: 'FOREIGN_USED',
      mileage: 20000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'FCT',
      locationCity: 'Abuja',
      description: 'Comfortable Honda Civic rental. Apple CarPlay, Lane Assist, Cruise Control. Weekly rate: ₦170,000.',
      isFeatured: false,
      dealer: 'Capital Motors',
      images: ['https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800'],
    },
    {
      make: 'Honda',
      model: 'CR-V',
      year: 2022,
      price: 45000,
      condition: 'FOREIGN_USED',
      mileage: 25000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'SUV rental with Sunroof, Leather Seats, Navigation. Weekly rate: ₦280,000. Chauffeur available.',
      isFeatured: true,
      dealer: 'AutoKing Motors',
      images: ['https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800'],
    },
    {
      make: 'Toyota',
      model: 'Highlander',
      year: 2023,
      price: 55000,
      condition: 'FOREIGN_USED',
      mileage: 18000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'FCT',
      locationCity: 'Abuja',
      description: '7-seater SUV with 3rd Row Seating, Premium Audio, Safety Suite. Weekly rate: ₦340,000.',
      isFeatured: true,
      dealer: 'Elite Motors Abuja',
      images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'],
    },
    {
      make: 'Kia',
      model: 'Sportage',
      year: 2023,
      price: 40000,
      condition: 'FOREIGN_USED',
      mileage: 12000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Rivers',
      locationCity: 'Port Harcourt',
      description: 'Modern SUV with Apple CarPlay, Cruise Control, Rear Camera. Weekly rate: ₦240,000.',
      isFeatured: false,
      dealer: 'Rivers Auto Hub',
      images: ['https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800'],
    },
    {
      make: 'Mercedes-Benz',
      model: 'E-Class',
      year: 2023,
      price: 120000,
      condition: 'FOREIGN_USED',
      mileage: 10000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'Luxury car rental with Sunroof, Leather Seats, Chauffeur Included. Weekly rate: ₦700,000.',
      isFeatured: true,
      dealer: 'Luxury Wheels NG',
      images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
    },
    {
      make: 'Lexus',
      model: 'RX 350',
      year: 2022,
      price: 85000,
      condition: 'FOREIGN_USED',
      mileage: 22000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'FCT',
      locationCity: 'Abuja',
      description: 'Premium SUV rental with Panoramic Roof, Premium Sound, Driver Available. Weekly rate: ₦500,000.',
      isFeatured: true,
      dealer: 'Elite Motors Abuja',
      images: ['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800'],
    },
    {
      make: 'BMW',
      model: '5 Series',
      year: 2023,
      price: 110000,
      condition: 'FOREIGN_USED',
      mileage: 8000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'Executive BMW with M Sport Package, Heads-up Display, Massage Seats. Weekly rate: ₦650,000.',
      isFeatured: false,
      dealer: 'BMW Lagos Rentals',
      images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
    },
    {
      make: 'Mercedes-Benz',
      model: 'S-Class',
      year: 2023,
      price: 200000,
      condition: 'FOREIGN_USED',
      mileage: 5000,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      locationState: 'Lagos',
      locationCity: 'Lagos',
      description: 'Flagship executive sedan. Executive Rear Seating, Full Privacy, Security Ready. Weekly rate: ₦1,200,000.',
      isFeatured: true,
      dealer: 'Luxury Wheels NG',
      images: ['https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800'],
    },
  ];

  // Create listings for sale
  console.log('\nCreating cars for sale...');
  for (const car of carsForSale) {
    const dealer = findDealerByName(car.dealer);
    if (!dealer) {
      console.log(`Dealer not found: ${car.dealer}`);
      continue;
    }

    const listing = await prisma.carListing.create({
      data: {
        sellerId: dealer.id,
        listingType: 'SALE',
        make: car.make,
        model: car.model,
        year: car.year,
        trim: car.trim || null,
        mileage: car.mileage,
        transmission: car.transmission,
        fuelType: car.fuelType,
        condition: car.condition,
        price: car.price,
        locationState: car.locationState,
        locationCity: car.locationCity,
        description: car.description,
        status: 'ACTIVE',
        isFeatured: car.isFeatured,
        viewsCount: Math.floor(Math.random() * 500) + 50,
        favoritesCount: Math.floor(Math.random() * 50) + 5,
        media: {
          create: car.images.map((url, index) => ({
            mediaType: 'PHOTO',
            url,
            displayOrder: index,
          })),
        },
      },
    });
    console.log(`Created: ${car.year} ${car.make} ${car.model} (For Sale)`);
  }

  // Create listings for rent
  console.log('\nCreating cars for rent...');
  for (const car of carsForRent) {
    const dealer = findDealerByName(car.dealer);
    if (!dealer) {
      console.log(`Dealer not found: ${car.dealer}`);
      continue;
    }

    const listing = await prisma.carListing.create({
      data: {
        sellerId: dealer.id,
        listingType: 'RENT',
        make: car.make,
        model: car.model,
        year: car.year,
        mileage: car.mileage,
        transmission: car.transmission,
        fuelType: car.fuelType,
        condition: car.condition,
        price: car.price,
        locationState: car.locationState,
        locationCity: car.locationCity,
        description: car.description,
        status: 'ACTIVE',
        isFeatured: car.isFeatured,
        viewsCount: Math.floor(Math.random() * 300) + 30,
        favoritesCount: Math.floor(Math.random() * 30) + 3,
        media: {
          create: car.images.map((url, index) => ({
            mediaType: 'PHOTO',
            url,
            displayOrder: index,
          })),
        },
      },
    });
    console.log(`Created: ${car.year} ${car.make} ${car.model} (For Rent)`);
  }

  // Create an admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@naijacars.com' },
    update: {},
    create: {
      email: 'admin@naijacars.com',
      phoneNumber: '+2348000000000',
      passwordHash: await bcrypt.hash('admin123456', 12),
      userType: 'ADMIN',
      isVerified: true,
      isActive: true,
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          city: 'Lagos',
          state: 'Lagos',
          verificationBadge: true,
        },
      },
    },
  });
  console.log('\nCreated admin user: admin@naijacars.com');

  // Create a demo buyer user
  const buyerUser = await prisma.user.upsert({
    where: { email: 'demo@naijacars.com' },
    update: {},
    create: {
      email: 'demo@naijacars.com',
      phoneNumber: '+2348001234567',
      passwordHash: await bcrypt.hash('demo123456', 12),
      userType: 'BUYER',
      isVerified: true,
      isActive: true,
      profile: {
        create: {
          firstName: 'Demo',
          lastName: 'User',
          city: 'Lagos',
          state: 'Lagos',
        },
      },
    },
  });
  console.log('Created demo buyer: demo@naijacars.com');

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\nDemo Accounts:');
  console.log('  Admin: admin@naijacars.com / admin123456');
  console.log('  Buyer: demo@naijacars.com / demo123456');
  console.log('  Dealer: autoking@example.com / demo123456');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
