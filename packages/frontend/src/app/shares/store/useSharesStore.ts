import { create } from 'zustand';
import { Share, TradeMode } from '../../../types/shares';

interface SharesUIState {
  tradeMode: TradeMode | null;
  selectedShare: Share | null;
  openBuy: () => void;
  openSell: (share: Share) => void;
  closeTradeForm: () => void;
}

export const useSharesStore = create<SharesUIState>((set) => ({
  tradeMode: null,
  selectedShare: null,
  openBuy: () => set({ tradeMode: 'buy', selectedShare: null }),
  openSell: (share) => set({ tradeMode: 'sell', selectedShare: share }),
  closeTradeForm: () => set({ tradeMode: null, selectedShare: null }),
})); 