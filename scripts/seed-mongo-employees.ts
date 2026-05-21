import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Employee from "../models/Employee";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI as string;

const EMPLOYEE_SEEDS = [
  { name: "ALDRIN", email: "aldrin@leif.org", password: "LfA!4821" },
  { name: "AMARI", email: "amari@leif.org", password: "LfM!7392" },
  { name: "ANDREA", email: "andrea@leif.org", password: "LfN!1648" },
  { name: "CARYLL", email: "caryll@leif.org", password: "LfC!9537" },
  { name: "CEDES", email: "cedes@leif.org", password: "LfD!2751" },
  { name: "CHARM", email: "charm@leif.org", password: "LfH!6084" },
  { name: "DAISY", email: "daisy@leif.org", password: "LfY!3416" },
  { name: "DANNA", email: "danna@leif.org", password: "LfD!5179" },
  { name: "DEVEY", email: "devey@leif.org", password: "LfV!8042" },
  { name: "DIA", email: "dia@leif.org", password: "LfI!6935" },
  { name: "EBBIE", email: "ebbie@leif.org", password: "LfE!7420" },
  { name: "EUNICE", email: "eunice@leif.org", password: "LfU!1857" },
  { name: "GIESEL", email: "giesel@leif.org", password: "LfG!9264" },
  { name: "JEF", email: "jef@leif.org", password: "LfJ!3508" },
  { name: "JEM", email: "jem@leif.org", password: "LfM!4173" },
  { name: "JERICA", email: "jerica@leif.org", password: "LfR!8625" },
  { name: "JESPER", email: "jesper@leif.org", password: "LfS!2049" },
  { name: "JOAN", email: "joan@leif.org", password: "LfO!5714" },
  { name: "JOE", email: "joe@leif.org", password: "LfE!6382" },
  { name: "JOEBELL", email: "joebell@leif.org", password: "LfB!1496" },
  { name: "KADAN SO", email: "kadanso@leif.org", password: "LfK!7831" },
  { name: "KATIA", email: "katia@leif.org", password: "LfT!2968" },
  { name: "KYLA", email: "kyla@leif.org", password: "LfY!5240" },
  { name: "LANI", email: "lani@leif.org", password: "LfL!9073" },
  { name: "LEA", email: "lea@leif.org", password: "LfA!2685" },
  { name: "LEAH", email: "leah@leif.org", password: "LfH!7349" },
  { name: "LEIZA", email: "leiza@leif.org", password: "LfZ!1824" },
  { name: "LIA", email: "lia@leif.org", password: "LfI!6591" },
  { name: "MAISIE", email: "maisie@leif.org", password: "LfM!8147" },
  { name: "MARA", email: "mara@leif.org", password: "LfR!3056" },
  { name: "MISTY SABRINA", email: "mistysabrina@leif.org", password: "LfS!9721" },
  { name: "MITCH", email: "mitch@leif.org", password: "LfT!4863" },
  { name: "RAANAH", email: "raanah@leif.org", password: "LfR!1507" },
  { name: "RASH", email: "rash@leif.org", password: "LfH!6248" },
  { name: "SHANIE", email: "shanie@leif.org", password: "LfS!2934" },
  { name: "SHANN", email: "shann@leif.org", password: "LfN!7052" },
  { name: "SHARLYN", email: "sharlyn@leif.org", password: "LfY!4186" },
  { name: "SHIE", email: "shie@leif.org", password: "LfE!8375" },
  { name: "SHISHI", email: "shishi@leif.org", password: "LfI!2469" },
  { name: "TRISHA", email: "trisha@leif.org", password: "LfT!9613" },
  { name: "VERA", email: "vera@leif.org", password: "LfV!5728" },
  { name: "WILMA", email: "wilma@leif.org", password: "LfW!1347" }
];

async function main() {
  await mongoose.connect(MONGODB_URI);

  for (const employee of EMPLOYEE_SEEDS) {
    const passwordHash = await bcrypt.hash(employee.password, 10);
    await Employee.updateOne(
      { email: employee.email },
      {
        $set: {
          name: employee.name,
          email: employee.email,
          passwordHash,
          department: "Staff",
          role: "EMPLOYEE",
          isActive: true,
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
        $currentDate: {
          updatedAt: true,
        },
      },
      { upsert: true }
    );
  }

  // Create admin
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  await Employee.updateOne(
    { email: "admin@leif.local" },
    {
      $set: {
        name: "LEIF Admin",
        email: "admin@leif.local",
        passwordHash: adminPasswordHash,
        department: "Operations",
        role: "ADMIN",
        isActive: true,
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
      $currentDate: {
        updatedAt: true,
      },
    },
    { upsert: true }
  );

  console.log("✅ Employees and admin seeded to MongoDB.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
