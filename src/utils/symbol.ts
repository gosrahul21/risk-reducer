export const getBinanceSymbolToCoindcx = (symbol: string) => {
  const tradedSymbol = symbol.split("USDT")[0];
  return `B-${tradedSymbol}_USDT`;
};

export const getCoindcxSymbolToBinance = (symbol: string) => {
  return symbol.replace("B-", "").replace("_", "");
};