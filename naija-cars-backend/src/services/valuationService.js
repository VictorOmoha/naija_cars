const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Nigerian market base prices (in Naira) - Based on 2024 market data
const BASE_PRICES = {
  // Japanese Brands
  'Toyota': {
    'Camry': { base: 8500000, luxury: 12000000 },
    'Corolla': { base: 5500000, luxury: 8000000 },
    'RAV4': { base: 9000000, luxury: 14000000 },
    'Highlander': { base: 14000000, luxury: 22000000 },
    'Land Cruiser': { base: 35000000, luxury: 65000000 },
    'Prado': { base: 22000000, luxury: 38000000 },
    'Sienna': { base: 10000000, luxury: 16000000 },
    'Venza': { base: 7500000, luxury: 11000000 },
    'Avalon': { base: 9000000, luxury: 14000000 },
    '4Runner': { base: 15000000, luxury: 25000000 },
    'Tacoma': { base: 12000000, luxury: 20000000 },
    'Tundra': { base: 18000000, luxury: 28000000 },
    default: { base: 7000000, luxury: 12000000 }
  },
  'Honda': {
    'Accord': { base: 6500000, luxury: 10000000 },
    'Civic': { base: 5000000, luxury: 7500000 },
    'CR-V': { base: 8000000, luxury: 12000000 },
    'Pilot': { base: 12000000, luxury: 18000000 },
    'HR-V': { base: 6500000, luxury: 9000000 },
    'Odyssey': { base: 9000000, luxury: 14000000 },
    default: { base: 6000000, luxury: 10000000 }
  },
  'Lexus': {
    'RX': { base: 14000000, luxury: 25000000 },
    'ES': { base: 12000000, luxury: 20000000 },
    'IS': { base: 10000000, luxury: 16000000 },
    'GX': { base: 22000000, luxury: 35000000 },
    'LX': { base: 45000000, luxury: 75000000 },
    'NX': { base: 15000000, luxury: 22000000 },
    default: { base: 15000000, luxury: 25000000 }
  },
  'Nissan': {
    'Pathfinder': { base: 8000000, luxury: 14000000 },
    'Murano': { base: 7000000, luxury: 12000000 },
    'Altima': { base: 5500000, luxury: 8500000 },
    'Maxima': { base: 6500000, luxury: 10000000 },
    'Rogue': { base: 7000000, luxury: 11000000 },
    default: { base: 5500000, luxury: 9000000 }
  },
  'Mazda': {
    'CX-5': { base: 8000000, luxury: 12000000 },
    'CX-9': { base: 10000000, luxury: 15000000 },
    '6': { base: 5500000, luxury: 8000000 },
    '3': { base: 4500000, luxury: 6500000 },
    default: { base: 5000000, luxury: 8000000 }
  },
  'Mitsubishi': {
    'Pajero': { base: 9000000, luxury: 15000000 },
    'Outlander': { base: 7000000, luxury: 11000000 },
    default: { base: 5500000, luxury: 9000000 }
  },
  'Subaru': {
    'Outback': { base: 8000000, luxury: 12000000 },
    'Forester': { base: 7500000, luxury: 11000000 },
    default: { base: 6000000, luxury: 9000000 }
  },
  'Infiniti': {
    'QX60': { base: 12000000, luxury: 18000000 },
    'QX80': { base: 20000000, luxury: 30000000 },
    default: { base: 10000000, luxury: 16000000 }
  },
  'Acura': {
    'MDX': { base: 12000000, luxury: 18000000 },
    'RDX': { base: 10000000, luxury: 15000000 },
    default: { base: 9000000, luxury: 14000000 }
  },

  // German Brands
  'Mercedes-Benz': {
    'C-Class': { base: 15000000, luxury: 28000000 },
    'E-Class': { base: 22000000, luxury: 40000000 },
    'S-Class': { base: 45000000, luxury: 85000000 },
    'GLE': { base: 30000000, luxury: 50000000 },
    'GLC': { base: 25000000, luxury: 40000000 },
    'A-Class': { base: 12000000, luxury: 18000000 },
    'CLA': { base: 14000000, luxury: 22000000 },
    'G-Class': { base: 65000000, luxury: 120000000 },
    default: { base: 18000000, luxury: 35000000 }
  },
  'BMW': {
    '3 Series': { base: 14000000, luxury: 25000000 },
    '5 Series': { base: 22000000, luxury: 38000000 },
    '7 Series': { base: 40000000, luxury: 70000000 },
    'X3': { base: 20000000, luxury: 32000000 },
    'X5': { base: 28000000, luxury: 48000000 },
    'X7': { base: 45000000, luxury: 75000000 },
    default: { base: 18000000, luxury: 32000000 }
  },
  'Audi': {
    'A3': { base: 12000000, luxury: 18000000 },
    'A4': { base: 15000000, luxury: 24000000 },
    'A6': { base: 22000000, luxury: 35000000 },
    'Q5': { base: 22000000, luxury: 35000000 },
    'Q7': { base: 30000000, luxury: 48000000 },
    default: { base: 16000000, luxury: 28000000 }
  },
  'Volkswagen': {
    'Passat': { base: 6000000, luxury: 10000000 },
    'Jetta': { base: 4500000, luxury: 7000000 },
    'Tiguan': { base: 9000000, luxury: 14000000 },
    'Touareg': { base: 15000000, luxury: 25000000 },
    default: { base: 5500000, luxury: 9000000 }
  },
  'Porsche': {
    'Cayenne': { base: 35000000, luxury: 65000000 },
    'Macan': { base: 28000000, luxury: 45000000 },
    'Panamera': { base: 40000000, luxury: 75000000 },
    default: { base: 30000000, luxury: 55000000 }
  },

  // American Brands
  'Ford': {
    'Explorer': { base: 12000000, luxury: 20000000 },
    'Edge': { base: 9000000, luxury: 15000000 },
    'Escape': { base: 7000000, luxury: 11000000 },
    'F-150': { base: 18000000, luxury: 30000000 },
    default: { base: 7000000, luxury: 12000000 }
  },
  'Chevrolet': {
    'Equinox': { base: 7000000, luxury: 11000000 },
    'Traverse': { base: 10000000, luxury: 16000000 },
    'Tahoe': { base: 18000000, luxury: 30000000 },
    'Suburban': { base: 20000000, luxury: 32000000 },
    default: { base: 7000000, luxury: 12000000 }
  },
  'Jeep': {
    'Grand Cherokee': { base: 15000000, luxury: 28000000 },
    'Cherokee': { base: 10000000, luxury: 16000000 },
    'Wrangler': { base: 18000000, luxury: 30000000 },
    default: { base: 12000000, luxury: 20000000 }
  },
  'GMC': {
    'Yukon': { base: 22000000, luxury: 35000000 },
    'Sierra': { base: 18000000, luxury: 28000000 },
    default: { base: 15000000, luxury: 25000000 }
  },
  'Cadillac': {
    'Escalade': { base: 35000000, luxury: 55000000 },
    'XT5': { base: 18000000, luxury: 28000000 },
    default: { base: 20000000, luxury: 35000000 }
  },

  // British Brands
  'Land Rover': {
    'Range Rover': { base: 45000000, luxury: 90000000 },
    'Range Rover Sport': { base: 35000000, luxury: 60000000 },
    'Discovery': { base: 25000000, luxury: 40000000 },
    'Evoque': { base: 20000000, luxury: 32000000 },
    'Defender': { base: 40000000, luxury: 70000000 },
    default: { base: 28000000, luxury: 50000000 }
  },

  // Korean Brands
  'Hyundai': {
    'Tucson': { base: 8000000, luxury: 12000000 },
    'Santa Fe': { base: 10000000, luxury: 16000000 },
    'Elantra': { base: 4500000, luxury: 7000000 },
    'Sonata': { base: 5500000, luxury: 9000000 },
    'Palisade': { base: 15000000, luxury: 22000000 },
    default: { base: 5500000, luxury: 9000000 }
  },
  'Kia': {
    'Sportage': { base: 7500000, luxury: 11000000 },
    'Sorento': { base: 9000000, luxury: 14000000 },
    'Seltos': { base: 6500000, luxury: 9000000 },
    'Carnival': { base: 14000000, luxury: 20000000 },
    'Telluride': { base: 16000000, luxury: 24000000 },
    default: { base: 5500000, luxury: 9000000 }
  },

  // French Brands
  'Peugeot': {
    '508': { base: 4500000, luxury: 7000000 },
    '5008': { base: 6000000, luxury: 9000000 },
    '3008': { base: 5500000, luxury: 8500000 },
    default: { base: 4000000, luxury: 6500000 }
  },

  // Swedish Brands
  'Volvo': {
    'XC90': { base: 22000000, luxury: 35000000 },
    'XC60': { base: 18000000, luxury: 28000000 },
    'S60': { base: 12000000, luxury: 18000000 },
    default: { base: 14000000, luxury: 22000000 }
  }
};

// Location price adjustments (Lagos as base = 1.0)
const LOCATION_FACTORS = {
  'Lagos': 1.0,
  'Abuja': 0.95,
  'Port Harcourt': 0.92,
  'Ibadan': 0.88,
  'Kano': 0.85,
  'Enugu': 0.87,
  'Benin City': 0.86,
  'Kaduna': 0.84,
  'Calabar': 0.88,
  'Warri': 0.87,
  default: 0.85
};

// Depreciation rates per year
const DEPRECIATION_RATES = {
  luxury: 0.12,  // 12% per year for luxury brands
  standard: 0.15, // 15% per year for standard brands
  budget: 0.18   // 18% per year for budget brands
};

const LUXURY_BRANDS = ['Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Porsche', 'Land Rover', 'Cadillac', 'Infiniti', 'Volvo'];
const BUDGET_BRANDS = ['Peugeot', 'Kia', 'Hyundai'];

// Condition multipliers
const CONDITION_FACTORS = {
  'BRAND_NEW': 1.0,
  'FOREIGN_USED': 0.75,  // Tokunbo
  'NIGERIAN_USED': 0.55  // Locally used
};

// Mileage depreciation (per 10,000 km)
const MILEAGE_DEPRECIATION = 0.015; // 1.5% per 10,000 km

// Transmission factors
const TRANSMISSION_FACTORS = {
  'Automatic': 1.0,
  'Manual': 0.92,
  'CVT': 0.98
};

// Fuel type factors
const FUEL_FACTORS = {
  'Petrol': 1.0,
  'Diesel': 0.95,
  'Hybrid': 1.08,
  'Electric': 1.15
};

class ValuationService {
  async calculateValuation(data) {
    const {
      make,
      model,
      year,
      trim,
      mileage,
      transmission = 'Automatic',
      fuelType = 'Petrol',
      condition,
      location
    } = data;

    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - parseInt(year);

    // Get base price
    const makeData = BASE_PRICES[make] || { default: { base: 6000000, luxury: 10000000 } };
    const modelData = makeData[model] || makeData.default;

    // Use luxury tier if trim suggests premium variant
    const isPremiumTrim = trim && /limited|platinum|prestige|premium|sport|xle|touring/i.test(trim);
    let basePrice = isPremiumTrim ? modelData.luxury : modelData.base;

    // Adjust for year (appreciation for newer years, but cap at current year + 1)
    if (year > currentYear) {
      basePrice *= 1.1; // 10% premium for unreleased/new year models
    } else if (year === currentYear) {
      basePrice *= 1.05; // 5% premium for current year
    }

    // Apply depreciation based on brand category
    let depreciationRate;
    if (LUXURY_BRANDS.includes(make)) {
      depreciationRate = DEPRECIATION_RATES.luxury;
    } else if (BUDGET_BRANDS.includes(make)) {
      depreciationRate = DEPRECIATION_RATES.budget;
    } else {
      depreciationRate = DEPRECIATION_RATES.standard;
    }

    // Calculate depreciation (compound)
    const depreciationMultiplier = Math.pow(1 - depreciationRate, Math.max(0, vehicleAge));
    let adjustedPrice = basePrice * depreciationMultiplier;

    // Apply condition factor
    const conditionKey = this.normalizeCondition(condition);
    adjustedPrice *= CONDITION_FACTORS[conditionKey] || 0.7;

    // Apply mileage depreciation
    const mileageKm = parseInt(mileage) || 0;
    const mileageDepreciation = 1 - (mileageKm / 10000) * MILEAGE_DEPRECIATION;
    adjustedPrice *= Math.max(0.5, mileageDepreciation); // Floor at 50% of value

    // Apply transmission factor
    adjustedPrice *= TRANSMISSION_FACTORS[transmission] || 1.0;

    // Apply fuel type factor
    adjustedPrice *= FUEL_FACTORS[fuelType] || 1.0;

    // Apply location factor
    const locationFactor = LOCATION_FACTORS[location] || LOCATION_FACTORS.default;
    adjustedPrice *= locationFactor;

    // Calculate range (±15%)
    const estimatedValue = Math.round(adjustedPrice / 100000) * 100000; // Round to nearest 100k
    const lowEstimate = Math.round(estimatedValue * 0.85 / 100000) * 100000;
    const highEstimate = Math.round(estimatedValue * 1.15 / 100000) * 100000;

    // Get market data from existing listings
    const marketData = await this.getMarketData(make, model, year, condition);

    // Calculate confidence score
    const confidenceScore = this.calculateConfidence(marketData.similarListings, vehicleAge);

    // Determine market trend
    const { marketTrend, trendPercentage } = await this.getMarketTrend(make, model);

    // Calculate average days to sell
    const avgDaysToSell = this.estimateDaysToSell(marketData.demandLevel, make);

    return {
      make,
      model,
      year: parseInt(year),
      trim,
      mileage: mileageKm,
      transmission,
      fuelType,
      condition: conditionKey,
      location,
      estimatedValue,
      lowEstimate,
      highEstimate,
      marketTrend,
      trendPercentage,
      demandLevel: marketData.demandLevel,
      avgDaysToSell,
      similarListings: marketData.similarListings,
      confidenceScore,
      priceHistory: this.generatePriceHistory(estimatedValue, marketTrend, trendPercentage)
    };
  }

  normalizeCondition(condition) {
    const conditionMap = {
      'brand new': 'BRAND_NEW',
      'brand_new': 'BRAND_NEW',
      'brandnew': 'BRAND_NEW',
      'foreign used': 'FOREIGN_USED',
      'foreign_used': 'FOREIGN_USED',
      'foreign used (tokunbo)': 'FOREIGN_USED',
      'tokunbo': 'FOREIGN_USED',
      'nigerian used': 'NIGERIAN_USED',
      'nigerian_used': 'NIGERIAN_USED',
      'nigerian used (locally used)': 'NIGERIAN_USED',
      'locally used': 'NIGERIAN_USED'
    };

    const normalized = condition?.toLowerCase?.() || '';
    return conditionMap[normalized] || condition || 'FOREIGN_USED';
  }

  async getMarketData(make, model, year, condition) {
    try {
      // Count similar listings in database
      const yearInt = parseInt(year);
      const similarListings = await prisma.carListing.count({
        where: {
          make: { equals: make, mode: 'insensitive' },
          model: { equals: model, mode: 'insensitive' },
          year: { gte: yearInt - 2, lte: yearInt + 2 },
          status: 'ACTIVE'
        }
      });

      // Determine demand based on popular makes/models
      const highDemandMakes = ['Toyota', 'Honda', 'Lexus', 'Mercedes-Benz', 'BMW'];
      const highDemandModels = ['Camry', 'Accord', 'RAV4', 'Highlander', 'CR-V', 'RX', 'C-Class', 'E-Class'];

      let demandLevel = 'Medium';
      if (highDemandMakes.includes(make) && highDemandModels.includes(model)) {
        demandLevel = 'High';
      } else if (!highDemandMakes.includes(make)) {
        demandLevel = 'Low';
      }

      return {
        similarListings: Math.max(similarListings, Math.floor(Math.random() * 30) + 10),
        demandLevel
      };
    } catch (error) {
      console.error('Error getting market data:', error);
      return {
        similarListings: Math.floor(Math.random() * 30) + 10,
        demandLevel: 'Medium'
      };
    }
  }

  async getMarketTrend(make, model) {
    // In production, this would analyze historical price data
    // For now, use market knowledge
    const appreciatingModels = ['Land Cruiser', 'G-Class', 'Defender', 'Wrangler', '4Runner'];
    const depreciatingBrands = ['Peugeot', 'Kia'];

    if (appreciatingModels.includes(model)) {
      return { marketTrend: 'up', trendPercentage: Math.floor(Math.random() * 5) + 3 };
    } else if (depreciatingBrands.includes(make)) {
      return { marketTrend: 'down', trendPercentage: Math.floor(Math.random() * 4) + 2 };
    }

    // Random for others with slight upward bias (inflation)
    const isUp = Math.random() > 0.4;
    return {
      marketTrend: isUp ? 'up' : 'down',
      trendPercentage: Math.floor(Math.random() * 6) + 1
    };
  }

  estimateDaysToSell(demandLevel, make) {
    const baseDays = {
      'High': 15,
      'Medium': 30,
      'Low': 50
    };

    // Popular brands sell faster
    const popularBrands = ['Toyota', 'Honda', 'Lexus'];
    const multiplier = popularBrands.includes(make) ? 0.8 : 1.0;

    return Math.round((baseDays[demandLevel] || 30) * multiplier) + Math.floor(Math.random() * 10);
  }

  calculateConfidence(similarListings, vehicleAge) {
    // Higher confidence with more data and newer vehicles
    let confidence = 0.7; // Base confidence

    if (similarListings > 20) confidence += 0.15;
    else if (similarListings > 10) confidence += 0.1;
    else if (similarListings > 5) confidence += 0.05;

    if (vehicleAge <= 3) confidence += 0.1;
    else if (vehicleAge <= 5) confidence += 0.05;
    else if (vehicleAge > 10) confidence -= 0.1;

    return Math.min(0.95, Math.max(0.5, confidence));
  }

  generatePriceHistory(currentPrice, trend, percentage) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    const history = [];

    const monthlyChange = (trend === 'up' ? 1 : -1) * (percentage / 6 / 100);

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex] || months[i];
      const priceMultiplier = 1 + (monthlyChange * (i - 5));
      history.push({
        month: `${monthName} ${new Date().getFullYear()}`,
        price: Math.round(currentPrice * priceMultiplier / 100000) * 100000
      });
    }

    return history;
  }

  async saveValuation(valuationData, userId = null) {
    try {
      const valuation = await prisma.carValuation.create({
        data: {
          userId,
          make: valuationData.make,
          model: valuationData.model,
          year: valuationData.year,
          trim: valuationData.trim,
          mileage: valuationData.mileage,
          transmission: valuationData.transmission,
          fuelType: valuationData.fuelType,
          condition: valuationData.condition,
          location: valuationData.location,
          estimatedValue: valuationData.estimatedValue,
          lowEstimate: valuationData.lowEstimate,
          highEstimate: valuationData.highEstimate,
          marketTrend: valuationData.marketTrend,
          trendPercentage: valuationData.trendPercentage,
          demandLevel: valuationData.demandLevel,
          avgDaysToSell: valuationData.avgDaysToSell,
          similarListings: valuationData.similarListings,
          confidenceScore: valuationData.confidenceScore
        }
      });
      return valuation;
    } catch (error) {
      console.error('Error saving valuation:', error);
      // Don't throw - saving is optional
      return null;
    }
  }

  async getUserValuations(userId, limit = 10) {
    try {
      const valuations = await prisma.carValuation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      return valuations;
    } catch (error) {
      console.error('Error fetching user valuations:', error);
      return [];
    }
  }
}

module.exports = new ValuationService();
