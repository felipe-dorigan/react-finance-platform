import Decimal from 'decimal.js';

export type MonetaryValue = Decimal.Value;

export function toDecimal(value: MonetaryValue): Decimal {
  return new Decimal(value);
}

export function normalizeMoney(value: MonetaryValue, decimals = 2): string {
  return toDecimal(value).toFixed(decimals);
}

export function addMoney(left: MonetaryValue, right: MonetaryValue, decimals = 2): string {
  return toDecimal(left).plus(right).toFixed(decimals);
}

export function subtractMoney(left: MonetaryValue, right: MonetaryValue, decimals = 2): string {
  return toDecimal(left).minus(right).toFixed(decimals);
}

export function multiplyMoney(left: MonetaryValue, right: MonetaryValue, decimals = 2): string {
  return toDecimal(left).times(right).toFixed(decimals);
}

export function divideMoney(left: MonetaryValue, right: MonetaryValue, decimals = 2): string {
  return toDecimal(left).dividedBy(right).toFixed(decimals);
}

export function sumMoney(values: MonetaryValue[], decimals = 2): string {
  let total = new Decimal(0);

  for (const value of values) {
    total = total.plus(value);
  }

  return total.toFixed(decimals);
}

export function compareMoney(left: MonetaryValue, right: MonetaryValue): number {
  return toDecimal(left).comparedTo(right);
}

export function isMoneyPositive(value: MonetaryValue): boolean {
  return toDecimal(value).greaterThan(0);
}