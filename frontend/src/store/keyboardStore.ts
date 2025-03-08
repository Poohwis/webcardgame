import {create} from "zustand"

interface KeyBoardState {
    mode : string
    setNameEditMode : ()=>void
    setChatMode : ()=>void
}

export const useKeyboardStore = create<KeyBoardState>()((set)=> ({
    mode: "chat",
    setNameEditMode : ()=> set(()=> ({mode : "nameEdit"})),
    setChatMode : ()=> set(()=> ({mode: "chat"}))
}))