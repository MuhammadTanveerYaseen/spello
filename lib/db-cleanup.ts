import Expense from "@/models/Expense";
import Investment from "@/models/Investment";
import { isCloudinaryConfigured, uploadInvoiceFile } from "@/lib/cloudinary";
import { parseInvoiceData } from "@/lib/invoice";

let cleanupStarted = false;

async function migrateDoc(
  model: typeof Expense | typeof Investment,
  doc: {
    _id: unknown;
    invoiceName?: string;
    invoiceData?: string;
    invoiceMime?: string;
  }
) {
  const { buffer, mime } = parseInvoiceData(doc.invoiceData!, doc.invoiceMime);
  const uploaded = await uploadInvoiceFile(
    buffer,
    doc.invoiceName || "invoice",
    mime
  );
  await model.updateOne(
    { _id: doc._id },
    {
      $set: {
        invoiceUrl: uploaded.url,
        invoicePublicId: uploaded.publicId,
        invoiceMime: uploaded.mime,
        invoiceResourceType: uploaded.resourceType,
      },
      $unset: { invoiceData: "" },
    }
  );
}

/** Remove multi-MB base64 blobs from MongoDB — major speed fix. Runs once per server process. */
export async function cleanupHeavyInvoiceData() {
  if (cleanupStarted) return;
  cleanupStarted = true;

  try {
    await Promise.all([
      Expense.updateMany(
        { invoiceUrl: { $nin: ["", null] }, invoiceData: { $nin: ["", null] } },
        { $unset: { invoiceData: "" } }
      ),
      Investment.updateMany(
        { invoiceUrl: { $nin: ["", null] }, invoiceData: { $nin: ["", null] } },
        { $unset: { invoiceData: "" } }
      ),
    ]);

    if (!isCloudinaryConfigured()) return;

    const [legacyExpenses, legacyInvestments] = await Promise.all([
      Expense.find({ invoiceData: { $nin: ["", null] }, invoiceUrl: { $in: ["", null] } })
        .select("_id invoiceName invoiceData invoiceMime")
        .limit(10)
        .lean(),
      Investment.find({ invoiceData: { $nin: ["", null] }, invoiceUrl: { $in: ["", null] } })
        .select("_id invoiceName invoiceData invoiceMime")
        .limit(10)
        .lean(),
    ]);

    for (const doc of legacyExpenses) {
      try {
        await migrateDoc(Expense, doc);
      } catch (e) {
        console.error("[spello] migrate expense", doc._id, e);
      }
    }

    for (const doc of legacyInvestments) {
      try {
        await migrateDoc(Investment, doc);
      } catch (e) {
        console.error("[spello] migrate investment", doc._id, e);
      }
    }
  } catch (e) {
    console.error("[spello] invoice cleanup failed", e);
  }
}

export function resetCleanupFlag() {
  cleanupStarted = false;
}
