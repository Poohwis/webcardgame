import {create} from "zustand"

export interface GameState {
    currentState : string,
    turn : number,
    round : number,
    roundPlayCard : number,
    cards : number[]
    playersChance : number[]
    lastPlayedBy : number[]
    lastPlayedCardCount : number
    playersHandCount : number[]
    playersScore : number[]
    isOver : boolean
    setCurrentState : (action : string)=>void 
    setCards : (cards : number[]) =>void
    playCards: (indices : number[])=>void
    updateGameState : (payload : any)=>void
    resetGameState : ()=>void
}

const initialState = {
    currentState : "initial",
    turn : -1,
    round : -1,
    roundPlayCard : -1,
    cards : [],
    playersChance : [],
    lastPlayedBy : [],
    lastPlayedCardCount : 0,
    playersHandCount: [],
    playersScore : [],
    isOver : false,
}
export const useGameStateStore = create<GameState>()((set)=> ({
    ...initialState,
    setCurrentState : (action)=> set(()=> ({currentState : action})),
    setCards: (cards)=> set(()=>({cards : cards})),
    playCards: (indices)=> set((state)=>{
        indices.sort((a, b)=> b-a);
        const newCards = [...state.cards];
         indices.forEach(index => {
            if (index >= 0 && index < newCards.length) {
                newCards[index] = - 1
            }
        });
        return { cards: newCards };
    }),
    //currently using bulk update for simplicity and easy work for now TODO : May consider unnecessary of re-render or better practice
    updateGameState : (payload) => {
        set((state) => ({
            currentState: payload.action,
            cards: payload.cards ?? state.cards,
            turn: payload.state?.turn ?? state.turn,
            round: payload.state?.round ?? state.round,
            roundPlayCard: payload.state?.roundPlayCard ?? state.roundPlayCard,
            playersChance: payload.state?.playersChance ?? state.playersChance,
            lastPlayedBy : payload.state?.lastPlayedBy ?? state.lastPlayedBy,
            lastPlayedCardCount : payload.state?.lastPlayedCardCount ?? state.lastPlayedCardCount,
            playersHandCount : payload.state?.playersHandCount ?? state.playersHandCount,
            playersScore: payload.state?.playersScore ?? state.playersScore,
            isOver: payload.state?.isOver ?? state.isOver,
        }))
    },
    resetGameState : ()=> set(()=>({...initialState})),
    
}))