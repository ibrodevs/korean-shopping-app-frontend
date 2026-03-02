import React, { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import type { Card, CardBrand } from '../types/payments';

type NewCardInput = {
  cardNumber: string; // may contain spaces
  exp: string;
  holder: string;
};

type PaymentCardsContextValue = {
  cards: Card[];
  addCard: (input: NewCardInput) => Card;
  removeCard: (id: string) => void;
  setDefaultCard: (id: string) => void;
};

const PaymentCardsContext = createContext<PaymentCardsContextValue | null>(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function detectBrand(digits: string): CardBrand {
  if (digits.startsWith('4')) return 'visa';
  if (digits.startsWith('5')) return 'mastercard';
  return 'unknown';
}

function last4FromDigits(digits: string) {
  return digits.slice(-4);
}

export function PaymentCardsProvider({ children }: PropsWithChildren) {
  const [cards, setCards] = useState<Card[]>([]);

  const value = useMemo<PaymentCardsContextValue>(() => {
    const addCard: PaymentCardsContextValue['addCard'] = ({ cardNumber, exp, holder }) => {
      const digits = cardNumber.replace(/\D/g, '');
      let created: Card | undefined;

      setCards((prev) => {
        const card: Card = {
          id: makeId(),
          brand: detectBrand(digits),
          last4: last4FromDigits(digits),
          exp: exp.trim(),
          holder: holder.trim(),
          isDefault: prev.length === 0,
        };

        created = card;
        return [...prev, card];
      });

      return created as Card;
    };

    const removeCard: PaymentCardsContextValue['removeCard'] = (id) => {
      setCards((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) return next;

        const hasDefault = next.some((c) => c.isDefault);
        if (hasDefault) return next;

        return next.map((card, index) => ({ ...card, isDefault: index === 0 }));
      });
    };

    const setDefaultCard: PaymentCardsContextValue['setDefaultCard'] = (id) => {
      setCards((prev) =>
        prev.map((card) => ({
          ...card,
          isDefault: card.id === id,
        })),
      );
    };

    return { cards, addCard, removeCard, setDefaultCard };
  }, [cards]);

  return <PaymentCardsContext.Provider value={value}>{children}</PaymentCardsContext.Provider>;
}

export function usePaymentCards() {
  const ctx = useContext(PaymentCardsContext);
  if (!ctx) throw new Error('usePaymentCards must be used within PaymentCardsProvider');
  return ctx;
}
