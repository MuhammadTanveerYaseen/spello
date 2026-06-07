export function buildDateFilter(from?: string | null, to?: string | null) {
  if (!from && !to) return {};

  const filter: { $gte?: Date; $lte?: Date } = {};
  if (from) filter.$gte = new Date(from);
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    filter.$lte = end;
  }
  return filter;
}

export function buildSearchFilter(fields: string[], search?: string | null) {
  if (!search?.trim()) return null;
  const regex = new RegExp(search.trim(), "i");
  return { $or: fields.map((field) => ({ [field]: regex })) };
}
