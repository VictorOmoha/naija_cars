const express = require('express');
const router = express.Router();
const valuationService = require('../services/valuationService');
const { optionalAuth, requireAuth } = require('../middleware/auth');

// Get car valuation (public, but saves for authenticated users)
router.post('/calculate', optionalAuth, async (req, res) => {
  try {
    const {
      make,
      model,
      year,
      trim,
      mileage,
      transmission,
      fuelType,
      condition,
      location
    } = req.body;

    // Validate required fields
    if (!make || !model || !year || !mileage || !condition) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: make, model, year, mileage, and condition are required'
        }
      });
    }

    // Calculate valuation
    const valuation = await valuationService.calculateValuation({
      make,
      model,
      year,
      trim,
      mileage,
      transmission,
      fuelType,
      condition,
      location
    });

    // Save valuation for authenticated users
    const userId = req.user?.id || null;
    const savedValuation = await valuationService.saveValuation(valuation, userId);

    res.json({
      success: true,
      data: {
        ...valuation,
        id: savedValuation?.id,
        savedAt: savedValuation?.createdAt
      }
    });
  } catch (error) {
    console.error('Error calculating valuation:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to calculate valuation' }
    });
  }
});

// Get user's valuation history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const valuations = await valuationService.getUserValuations(req.user.id, limit);

    res.json({
      success: true,
      data: valuations
    });
  } catch (error) {
    console.error('Error fetching valuation history:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch valuation history' }
    });
  }
});

// Get available makes and models for valuation form
router.get('/makes', (req, res) => {
  const makes = [
    // Japanese
    { value: 'Toyota', label: 'Toyota', country: 'Japan' },
    { value: 'Honda', label: 'Honda', country: 'Japan' },
    { value: 'Lexus', label: 'Lexus', country: 'Japan' },
    { value: 'Nissan', label: 'Nissan', country: 'Japan' },
    { value: 'Mazda', label: 'Mazda', country: 'Japan' },
    { value: 'Mitsubishi', label: 'Mitsubishi', country: 'Japan' },
    { value: 'Subaru', label: 'Subaru', country: 'Japan' },
    { value: 'Infiniti', label: 'Infiniti', country: 'Japan' },
    { value: 'Acura', label: 'Acura', country: 'Japan' },
    // German
    { value: 'Mercedes-Benz', label: 'Mercedes-Benz', country: 'Germany' },
    { value: 'BMW', label: 'BMW', country: 'Germany' },
    { value: 'Audi', label: 'Audi', country: 'Germany' },
    { value: 'Volkswagen', label: 'Volkswagen', country: 'Germany' },
    { value: 'Porsche', label: 'Porsche', country: 'Germany' },
    // American
    { value: 'Ford', label: 'Ford', country: 'USA' },
    { value: 'Chevrolet', label: 'Chevrolet', country: 'USA' },
    { value: 'Jeep', label: 'Jeep', country: 'USA' },
    { value: 'GMC', label: 'GMC', country: 'USA' },
    { value: 'Cadillac', label: 'Cadillac', country: 'USA' },
    // British
    { value: 'Land Rover', label: 'Land Rover', country: 'UK' },
    // Korean
    { value: 'Hyundai', label: 'Hyundai', country: 'South Korea' },
    { value: 'Kia', label: 'Kia', country: 'South Korea' },
    // French
    { value: 'Peugeot', label: 'Peugeot', country: 'France' },
    // Swedish
    { value: 'Volvo', label: 'Volvo', country: 'Sweden' }
  ];

  res.json({
    success: true,
    data: makes
  });
});

// Get models for a specific make
router.get('/models/:make', (req, res) => {
  const { make } = req.params;

  const modelsByMake = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Land Cruiser', 'Prado', 'Sienna', 'Venza', 'Avalon', '4Runner', 'Tacoma', 'Tundra'],
    'Honda': ['Accord', 'Civic', 'CR-V', 'Pilot', 'HR-V', 'Odyssey', 'Passport'],
    'Lexus': ['RX', 'ES', 'IS', 'GX', 'LX', 'NX', 'UX', 'LS'],
    'Nissan': ['Pathfinder', 'Murano', 'Altima', 'Maxima', 'Rogue', 'Armada', 'Sentra'],
    'Mazda': ['CX-5', 'CX-9', 'CX-30', '6', '3'],
    'Mitsubishi': ['Pajero', 'Outlander', 'Eclipse Cross'],
    'Subaru': ['Outback', 'Forester', 'Crosstrek', 'Ascent'],
    'Infiniti': ['QX60', 'QX80', 'QX50', 'Q50'],
    'Acura': ['MDX', 'RDX', 'TLX', 'ILX'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'A-Class', 'CLA', 'G-Class', 'GLA', 'GLB'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'X1', 'X4', 'X6'],
    'Audi': ['A3', 'A4', 'A6', 'A8', 'Q5', 'Q7', 'Q3', 'Q8'],
    'Volkswagen': ['Passat', 'Jetta', 'Tiguan', 'Touareg', 'Golf', 'Atlas'],
    'Porsche': ['Cayenne', 'Macan', 'Panamera', '911', 'Taycan'],
    'Ford': ['Explorer', 'Edge', 'Escape', 'F-150', 'Expedition', 'Bronco', 'Mustang'],
    'Chevrolet': ['Equinox', 'Traverse', 'Tahoe', 'Suburban', 'Blazer', 'Malibu'],
    'Jeep': ['Grand Cherokee', 'Cherokee', 'Wrangler', 'Compass', 'Gladiator'],
    'GMC': ['Yukon', 'Sierra', 'Acadia', 'Terrain'],
    'Cadillac': ['Escalade', 'XT5', 'XT6', 'CT5', 'CT4'],
    'Land Rover': ['Range Rover', 'Range Rover Sport', 'Discovery', 'Evoque', 'Defender', 'Velar'],
    'Hyundai': ['Tucson', 'Santa Fe', 'Elantra', 'Sonata', 'Palisade', 'Kona', 'Venue'],
    'Kia': ['Sportage', 'Sorento', 'Seltos', 'Carnival', 'Telluride', 'K5', 'Forte'],
    'Peugeot': ['508', '5008', '3008', '2008', '308'],
    'Volvo': ['XC90', 'XC60', 'XC40', 'S60', 'S90', 'V60']
  };

  const models = modelsByMake[make] || [];

  res.json({
    success: true,
    data: models.map(model => ({ value: model, label: model }))
  });
});

// Get Nigerian locations for valuation
router.get('/locations', (req, res) => {
  const locations = [
    { value: 'Lagos', label: 'Lagos', region: 'South West' },
    { value: 'Abuja', label: 'Abuja (FCT)', region: 'North Central' },
    { value: 'Port Harcourt', label: 'Port Harcourt', region: 'South South' },
    { value: 'Ibadan', label: 'Ibadan', region: 'South West' },
    { value: 'Kano', label: 'Kano', region: 'North West' },
    { value: 'Enugu', label: 'Enugu', region: 'South East' },
    { value: 'Benin City', label: 'Benin City', region: 'South South' },
    { value: 'Kaduna', label: 'Kaduna', region: 'North West' },
    { value: 'Calabar', label: 'Calabar', region: 'South South' },
    { value: 'Warri', label: 'Warri', region: 'South South' },
    { value: 'Uyo', label: 'Uyo', region: 'South South' },
    { value: 'Owerri', label: 'Owerri', region: 'South East' },
    { value: 'Jos', label: 'Jos', region: 'North Central' },
    { value: 'Onitsha', label: 'Onitsha', region: 'South East' },
    { value: 'Asaba', label: 'Asaba', region: 'South South' }
  ];

  res.json({
    success: true,
    data: locations
  });
});

module.exports = router;
