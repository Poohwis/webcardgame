import { create } from "zustand";

export interface GameState {
  currentState: string;
  gameNumber: number;
  turn: number;
  round: number;
  roundPlayCard: number;
  cards: number[];
  calledCards: number[];
  isCallSuccess: boolean;
  playersChance: number[];
  /**  1-base index */
  lastPlayedBy: number[];
  lastPlayedCardCount: number;
  playersHandCount: number[];
  playersScore: number[];
  isOver: boolean;
  forcePlayerOrder: number;
  lastGameStarterOrder: number; //might not necessary
  lastRoundStarterOrder: number; //might not necessary
  gameResult : number[]
  endGameScore : number
  setCurrentState: (action: string) => void;
  setCards: (cards: number[]) => void;
  playCards: (indices: number[]) => void;
  updateGameState: (payload: any) => void;
  resetGameState: () => void;
}

const initialState = {
  currentState: "initial",
  gameNumber: -1,
  turn: -1,
  round: -1,
  endGameScore : -1,
  roundPlayCard: -1,
  cards: [],
  calledCards: [],
  isCallSuccess: false,
  playersChance: [],
  lastPlayedBy: [],
  lastPlayedCardCount: 0,
  playersHandCount: [],
  playersScore: [],
  isOver: false,
  lastGameStarterOrder: 0,
  lastRoundStarterOrder: 0,
  forcePlayerOrder: -1,
  gameResult : []
};
export const useGameStateStore = create<GameState>()((set) => ({
  ...initialState,
  setCurrentState: (action) => set(() => ({ currentState: action })),
  setCards: (cards) => set(() => ({ cards: cards })),
  playCards: (indices) =>
    set((state) => {
      indices.sort((a, b) => b - a);
      const newCards = [...state.cards];
      indices.forEach((index) => {
        if (index >= 0 && index < newCards.length) {
          newCards[index] = -1;
        }
      });
      return { cards: newCards };
    }),
  //currently using bulk update for simplicity and easy work for now TODO : May consider unnecessary of re-render or better practice
  updateGameState: (payload) => {
    set((state) => ({
      currentState: payload.action,
      cards: payload.cards ?? state.cards,
      calledCards: payload.calledCards ?? state.calledCards,
      isCallSuccess: payload.isCallSuccess ?? state.isCallSuccess,
      gameResult : payload.gameResult ?? state.gameResult,
      endGameScore : payload.state.endGameScore ?? state.endGameScore,
      forcePlayerOrder:
        payload.state.forcePlayerOrder ?? state.forcePlayerOrder,
      turn: payload.state?.turn ?? state.turn,
      gameNumber: payload.state?.gameNumber ?? state.gameNumber,
      round: payload.state?.round ?? state.round,
      roundPlayCard: payload.state?.roundPlayCard ?? state.roundPlayCard,
      playersChance: payload.state?.playersChance ?? state.playersChance,
      lastPlayedBy: payload.state?.lastPlayedBy ?? state.lastPlayedBy,
      lastPlayedCardCount:
        payload.state?.lastPlayedCardCount ?? state.lastPlayedCardCount,
      playersHandCount:
        payload.state?.playersHandCount ?? state.playersHandCount,
      playersScore: payload.state?.playersScore ?? state.playersScore,
      lastGameStarterOrder:
        payload.state?.lastGameStarterOrder ?? state.lastGameStarterOrder,
      lastRoundStarterOrder:
        payload.state?.lastRoundStarterOrder ?? state.lastRoundStarterOrder,
      isOver: payload.state?.isOver ?? state.isOver,
    }));
  },
  resetGameState: () => set(() => ({ ...initialState })),
}));
