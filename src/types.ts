export interface MomentumData {
  ticker: string;
  name: string;
  returnPct: number;
  currentPrice: number;
  history: { date: string; dateShort?: string; price: number; return?: number }[];
}

export interface MomentumResponse {
  recommendation: string;
  data: MomentumData[];
  failedTickers: string[];
  dates: {
    start: string;
    end: string;
    today: string;
  };
}
