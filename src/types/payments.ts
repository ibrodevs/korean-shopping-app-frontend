export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export type Card = {
  id: string;
  brand: CardBrand;
  last4: string;
  exp: string; // "12/28"
  holder: string;
  isDefault?: boolean;
};
