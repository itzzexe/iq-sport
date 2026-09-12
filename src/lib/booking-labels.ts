/** UI-string keys the booking form needs; resolved on the server and passed down as plain strings. */
export const BOOKING_LABEL_KEYS = [
  'formName',
  'formPhone',
  'formBranch',
  'formActivity',
  'formDate',
  'formNotes',
  'formChoose',
  'formSubmit',
  'formSubmitting',
  'formWhatsApp',
  'formRequired',
  'formPhoneInvalid',
  'formFix',
  'formError',
] as const

export type BookingLabelKey = (typeof BOOKING_LABEL_KEYS)[number]
