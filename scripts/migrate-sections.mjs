/**
 * One-time migration: moves the old fixed "categories" / "spaces" collections into
 * the dynamic Sections + Groups structure and re-tags products.
 *
 *   node --env-file=.env scripts/migrate-sections.mjs
 *
 * Safe to re-run: it skips anything already migrated.
 */
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");
await mongoose.connect(uri);
const db = mongoose.connection.db;

const sections = db.collection("sections");
const groups = db.collection("groups");
const products = db.collection("products");
const now = new Date();

async function ensureSection(spec) {
  const existing = await sections.findOne({ slug: spec.slug });
  if (existing) return existing._id;
  const count = await sections.countDocuments();
  const { insertedId } = await sections.insertOne({ ...spec, order: count, createdAt: now, updatedAt: now });
  console.log(`+ section "${spec.label}" (/${spec.slug})`);
  return insertedId;
}

async function migrateCollection(oldName, sectionId, productField) {
  const old = await db.collection(oldName).find().toArray();
  for (const doc of old) {
    // Reuse the same _id so any product references stay valid.
    const exists = await groups.findOne({ _id: doc._id });
    if (!exists) {
      await groups.insertOne({
        _id: doc._id,
        section: sectionId,
        name: doc.name,
        slug: doc.slug,
        description: doc.description ?? "",
        image: doc.image ?? "",
        order: doc.order ?? 0,
        createdAt: doc.createdAt ?? now,
        updatedAt: now,
      });
      console.log(`  + card "${doc.name}"`);
    }
  }
  // Tag products that referenced the old field.
  const res = await products.updateMany(
    { [productField]: { $type: "objectId" } },
    [{ $set: { groups: { $setUnion: [{ $ifNull: ["$groups", []] }, [`$${productField}`]] } } }, { $unset: productField }]
  );
  if (res.modifiedCount) console.log(`  ~ re-tagged ${res.modifiedCount} product(s) from "${productField}"`);
}

const categoryId = await ensureSection({ slug: "category", label: "Category", pluralLabel: "Categories", title: "Browse by category", eyebrow: "Our work", cardCta: "View collection" });
const spaceId = await ensureSection({ slug: "space", label: "Space", pluralLabel: "Spaces", title: "Browse by space", eyebrow: "For every space", cardCta: "See what fits" });

await migrateCollection("categories", categoryId, "category");
await migrateCollection("spaces", spaceId, "space");
await migrateCollection("rooms", spaceId, "room"); // in case any data was created under the older name

// Products that never got a group array
await products.updateMany({ groups: { $exists: false } }, { $set: { groups: [] } });

console.log("\nDone. Sections:", await sections.countDocuments(), "| cards:", await groups.countDocuments(), "| products:", await products.countDocuments());
const orphans = await products.countDocuments({ groups: { $size: 0 } });
if (orphans) console.log(`! ${orphans} product(s) have no section — open them in admin and pick one.`);
await mongoose.disconnect();
