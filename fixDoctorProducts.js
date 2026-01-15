const mongoose = require('mongoose');
require('dotenv').config();
const Doctor = require('./models/Doctor.model'); // path to your Doctor model

async function fixDoctorProductIds() {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // 2️⃣ Fetch all doctors
    const doctors = await Doctor.find({});
    console.log(`Found ${doctors.length} doctor(s)`);

    for (const doctor of doctors) {
      let changed = false;

      // 3️⃣ Iterate products array
      doctor.products = doctor.products.map(p => {
        // Convert to ObjectId if stored as string
        if (typeof p.productId === 'string') {
          p.productId = mongoose.Types.ObjectId(p.productId);
          changed = true;
        }
        return p;
      });

      // 4️⃣ Save only if any changes were made
      if (changed) {
        await doctor.save();
        console.log(`✅ Fixed doctor ${doctor._id} productIds`);
      }
    }

    console.log('🎯 All done! Product IDs fixed.');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ ERROR:', err);
    mongoose.disconnect();
  }
}

// Run the script
fixDoctorProductIds();
