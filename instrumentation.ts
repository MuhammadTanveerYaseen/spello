export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { connectDB } = await import("./lib/mongodb");
    try {
      await connectDB();
    } catch (error) {
      console.error("[spello] MongoDB warm-up failed:", error);
    }
  }
}
