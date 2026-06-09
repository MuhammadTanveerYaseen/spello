import fs from "fs";
import mongoose from "mongoose";

const env = fs.readFileSync(".env.local", "utf8");
const get = (key) => env.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();

const uri = get("MONGODB_URI");
if (!uri) {
  console.error("MONGODB_URI not found");
  process.exit(1);
}

const cloudName = get("CLOUDINARY_CLOUD_NAME");
const apiKey = get("CLOUDINARY_API_KEY");
const apiSecret = get("CLOUDINARY_API_SECRET");
const cloudinaryReady = cloudName && apiKey && apiSecret;

await mongoose.connect(uri);

const Expense = mongoose.model("Expense", new mongoose.Schema({}, { strict: false }), "expenses");
const Investment = mongoose.model("Investment", new mongoose.Schema({}, { strict: false }), "investments");

const r1 = await Expense.updateMany(
  { invoiceUrl: { $nin: ["", null] }, invoiceData: { $nin: ["", null] } },
  { $unset: { invoiceData: "" } }
);
const r2 = await Investment.updateMany(
  { invoiceUrl: { $nin: ["", null] }, invoiceData: { $nin: ["", null] } },
  { $unset: { invoiceData: "" } }
);
console.log("Unset invoiceData where Cloudinary URL exists:", r1.modifiedCount, "expenses,", r2.modifiedCount, "investments");

if (cloudinaryReady) {
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

  async function uploadBuffer(buffer, filename, mime) {
    const isPdf = mime === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
    const resourceType = isPdf ? "raw" : "image";
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "spello-invoices", resource_type: resourceType },
        (err, result) => (err || !result ? reject(err) : resolve(result))
      );
      stream.end(buffer);
    });
  }

  function parseData(data, mime) {
    let base64 = data;
    let outMime = mime;
    if (data.startsWith("data:")) {
      const comma = data.indexOf(",");
      outMime = outMime || data.slice(5, data.indexOf(";"));
      base64 = data.slice(comma + 1);
    }
    return { buffer: Buffer.from(base64, "base64"), mime: outMime };
  }

  for (const [name, Model] of [["expenses", Expense], ["investments", Investment]]) {
    const docs = await Model.find({
      invoiceData: { $nin: ["", null] },
      invoiceUrl: { $in: ["", null] },
    })
      .select("_id invoiceName invoiceData invoiceMime")
      .lean();

    console.log(`Migrating ${docs.length} legacy ${name} to Cloudinary...`);

    for (const doc of docs) {
      try {
        const { buffer, mime } = parseData(doc.invoiceData, doc.invoiceMime);
        const result = await uploadBuffer(buffer, doc.invoiceName || "invoice", mime);
        await Model.updateOne(
          { _id: doc._id },
          {
            $set: {
              invoiceUrl: result.secure_url,
              invoicePublicId: result.public_id,
              invoiceMime: mime,
              invoiceResourceType: result.resource_type,
            },
            $unset: { invoiceData: "" },
          }
        );
        console.log("  OK", doc._id, doc.invoiceName);
      } catch (e) {
        console.error("  FAIL", doc._id, e.message);
      }
    }
  }
} else {
  console.log("Cloudinary not configured — skipped legacy upload migration.");
}

const left1 = await Expense.countDocuments({ invoiceData: { $nin: ["", null] } });
const left2 = await Investment.countDocuments({ invoiceData: { $nin: ["", null] } });
console.log("Remaining docs with base64 invoiceData:", left1, "expenses,", left2, "investments");

await mongoose.disconnect();
console.log("Done.");
