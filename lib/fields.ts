/** Fields returned in list views — never include invoiceData (base64 is huge). */
export const EXPENSE_LIST_FIELDS =
  "title amount category date vendor invoiceName invoiceUrl invoiceMime description createdAt";

export const INVESTMENT_LIST_FIELDS =
  "investorId investorName type amount date paymentMethod reference note invoiceName invoiceUrl invoiceMime createdAt";

export const ACTIVITY_LIST_FIELDS = "action details type createdAt";

export const DEFAULT_PAGE_SIZE = 40;
