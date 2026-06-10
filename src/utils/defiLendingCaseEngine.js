export function createDefiLendingState() {
  return {
    market: {
      collateralAsset: "ETH",
      borrowAsset: "USDC",
      collateralPrice: 2200,
      liquidationThreshold: 0.8,
      liquidationBonus: 0.08
    },
    position: {
      wallet: "0xDeFiLearner",
      collateral: 4,
      borrowed: 4200
    },
    completed: false,
    events: [event("MarketReady", "Collateralized lending market initialized.")]
  };
}

export function lendingMetrics(state) {
  const collateralValue = state.position.collateral * state.market.collateralPrice;
  const borrowed = Number(state.position.borrowed);
  const ltv = collateralValue ? borrowed / collateralValue : 0;
  const healthFactor = borrowed ? (collateralValue * state.market.liquidationThreshold) / borrowed : Infinity;
  return {
    collateralValue,
    ltv,
    healthFactor,
    liquidationRisk: borrowed > 0 && healthFactor < 1.15,
    liquidatable: borrowed > 0 && healthFactor < 1
  };
}

export function depositCollateral(state, amount) {
  const value = positive(amount);
  if (!value) return state;
  return patch(
    state,
    { position: { ...state.position, collateral: state.position.collateral + value } },
    "CollateralDeposited",
    `Deposited ${value} ${state.market.collateralAsset} as collateral.`
  );
}

export function borrowAsset(state, amount) {
  const value = positive(amount);
  if (!value) return state;
  const next = { ...state, position: { ...state.position, borrowed: state.position.borrowed + value } };
  const metrics = lendingMetrics(next);
  const message = metrics.healthFactor < 1
    ? `Borrowed ${money(value)}, but the position is immediately liquidatable.`
    : `Borrowed ${money(value)} with health factor ${formatHealth(metrics.healthFactor)}.`;
  return patch(next, {}, "AssetBorrowed", message);
}

export function updatePrice(state, price) {
  const nextPrice = Math.max(100, Number(price) || state.market.collateralPrice);
  const next = { ...state, market: { ...state.market, collateralPrice: nextPrice } };
  const metrics = lendingMetrics(next);
  const message = metrics.liquidatable
    ? `Collateral price moved to ${money(nextPrice)}. Health factor is below 1.`
    : `Collateral price moved to ${money(nextPrice)}.`;
  return patch(next, {}, "PriceUpdated", message);
}

export function simulatePriceDrop(state, percent) {
  const drop = Math.min(95, Math.max(1, Number(percent) || 1)) / 100;
  return updatePrice(state, Math.round(state.market.collateralPrice * (1 - drop)));
}

export function partialLiquidation(state) {
  const metrics = lendingMetrics(state);
  if (!metrics.liquidatable) {
    return patch(state, {}, "LiquidationRejected", "Health factor is still above liquidation level.");
  }
  const repayAmount = Math.min(state.position.borrowed * 0.35, state.position.borrowed);
  const collateralSeized = (repayAmount / state.market.collateralPrice) * (1 + state.market.liquidationBonus);
  const nextCollateral = Math.max(0, state.position.collateral - collateralSeized);
  const nextBorrowed = Math.max(0, state.position.borrowed - repayAmount);
  return patch(
    state,
    {
      position: { ...state.position, collateral: nextCollateral, borrowed: nextBorrowed },
      completed: true
    },
    "PartialLiquidation",
    `Liquidator repaid ${money(repayAmount)} and seized ${collateralSeized.toFixed(4)} ${state.market.collateralAsset}.`
  );
}

export function repayLoan(state, amount) {
  const value = Math.min(positive(amount), state.position.borrowed);
  if (!value) return state;
  return patch(
    state,
    { position: { ...state.position, borrowed: state.position.borrowed - value }, completed: state.completed || value >= state.position.borrowed },
    "LoanRepaid",
    `Repaid ${money(value)} ${state.market.borrowAsset}.`
  );
}

export function withdrawCollateral(state, amount) {
  const value = Math.min(positive(amount), state.position.collateral);
  if (!value) return state;
  const next = { ...state, position: { ...state.position, collateral: state.position.collateral - value } };
  const metrics = lendingMetrics(next);
  if (next.position.borrowed > 0 && metrics.healthFactor < 1.15) {
    return patch(state, {}, "WithdrawRejected", "Withdrawal rejected because the remaining collateral would make the loan risky.");
  }
  return patch(next, {}, "CollateralWithdrawn", `Withdrew ${value} ${state.market.collateralAsset}.`);
}

export function resetDefiLendingCase() {
  return createDefiLendingState();
}

function positive(value) {
  return Math.max(0, Number(value) || 0);
}

function patch(state, changes, name, message) {
  return {
    ...state,
    ...changes,
    events: [event(name, message), ...state.events]
  };
}

function event(name, message) {
  return {
    id: crypto.randomUUID(),
    name,
    message,
    time: new Date().toLocaleTimeString()
  };
}

function money(value) {
  return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatHealth(value) {
  return value === Infinity ? "safe" : value.toFixed(2);
}
