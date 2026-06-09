export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { connectDB } = await import("./lib/mongodb");
    const { cleanupHeavyInvoiceData } = await import("./lib/db-cleanup");

    try {
      await connectDB();
      void cleanupHeavyInvoiceData();
    } catch (error) {
      console.error("[spello] startup failed:", error);
    }
  }
}
