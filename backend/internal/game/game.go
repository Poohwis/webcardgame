package game

import (
	"log"
	"math/rand"
	"sync"
	"time"

	"slices"

	"github.com/gorilla/websocket"
)

type ServerGameState struct {
	PlayersHand [][]int
	OnTableCard []int //0-based index
	mu          sync.Mutex
}

type ClientGameState struct {
	Turn                  int   `json:"turn"` //1-based index, represent the current player's turn
	GameNumber            int   `json:"gameNumber"`
	Round                 int   `json:"round"`         //1-based index
	RoundPlayCard         int   `json:"roundPlayCard"` //0-based index
	PlayersChance         []int `json:"playersChance"`
	PlayersHandCount      []int `json:"playersHandCount"`
	Playerscore           []int `json:"playersScore"`
	IsOver                bool  `json:"isOver"`
	LastPlayedBy          []int `json:"lastPlayedBy"` //1-based index, the last player who played
	LastPlayedCardCount   int   `json:"lastPlayedCardCount"`
	ForcePlayerOrder      int   `json:"forcePlayerOrder"`      //1-based index, Order of player which force to play all their hand / call
	LastGameStarterOrder  int   `json:"lastGameStarterOrder"`  //1-based index
	LastRoundStarterOrder int   `json:"lastRoundStarterOrder"` //1-based index
	EndGameScore          int   `json:"endGameScore"`
	mu                    sync.Mutex
}

// TODO: hard coded the game condition of player for now, may change if want this to be configurable
func NewGameState(slots [4]*websocket.Conn, endGameScore int) (*ClientGameState, *ServerGameState) {
	c := &ClientGameState{
		Turn:                  1,
		GameNumber:            1,
		Round:                 1,
		RoundPlayCard:         -1,
		Playerscore:           make([]int, len(slots)),
		PlayersHandCount:      make([]int, len(slots)),
		PlayersChance:         make([]int, len(slots)),
		LastPlayedBy:          []int{},
		LastPlayedCardCount:   0,
		ForcePlayerOrder:      -1,
		LastGameStarterOrder:  0,
		LastRoundStarterOrder: 0,
		IsOver:                false,
		EndGameScore:          endGameScore,
	}

	for i := range slots {
		if slots[i] != nil {
			c.LastGameStarterOrder = i + 1
			c.LastRoundStarterOrder = i + 1
			c.Turn = i + 1
			break
		}
	}

	for i := range slots {
		if slots[i] != nil {
			c.PlayersHandCount[i] = 5
			c.PlayersChance[i] = 2
		} else {
			c.PlayersHandCount[i] = 0
			c.PlayersChance[i] = 0
		}
	}

	s := &ServerGameState{
		PlayersHand: make([][]int, len(slots)),
		OnTableCard: []int{},
	}

	c.generateDeck(s)
	return c, s
}

func (c *ClientGameState) isEndGameScoreMeet() bool {
	return slices.Contains(c.Playerscore, c.EndGameScore)
}
func (c *ClientGameState) NextGame(s *ServerGameState, slots [4]*websocket.Conn) bool {
	//TODO: check that endGameScore meet,true - output endgame to client
	c.mu.Lock()
	if c.isEndGameScoreMeet() {
		c.mu.Unlock()
		return true
	}

	c.GameNumber++
	for i := 0; i < len(slots); i++ {
		next := (c.LastGameStarterOrder + i) % len(slots)
		if slots[next] != nil {
			c.Turn = next + 1
			c.LastGameStarterOrder = next + 1
			c.LastRoundStarterOrder = next + 1
			break
		}
	}
	c.Round = 1
	c.PlayersHandCount = make([]int, len(slots))
	c.PlayersChance = make([]int, len(slots))
	c.LastPlayedBy = []int{}
	c.IsOver = false
	c.ForcePlayerOrder = -1
	c.mu.Unlock()

	for i := range slots {
		if slots[i] != nil {
			c.PlayersHandCount[i] = 5
			c.PlayersChance[i] = 2
		} else {
			c.PlayersHandCount[i] = 0
			c.PlayersChance[i] = 0
		}
	}

	c.generateDeck(s)
	return false
}

// use this after call check
func (c *ClientGameState) checkIsGameEnd() {
	count := 0
	scorerOrder := -1

	for i, chance := range c.PlayersChance {
		if chance != 0 {
			if scorerOrder == -1 {
				scorerOrder = i + 1
			} else {
				return
			}
		} else {
			count++
		}
	}

	if count == len(c.PlayersHandCount)-1 {
		c.IsOver = true
	}

	if c.IsOver {
		c.addScore(scorerOrder)
		log.Printf("PlayerOrder scored: %v", scorerOrder)
	}
}

func (c *ClientGameState) generateDeck(s *ServerGameState) {
	c.mu.Lock()
	pool := []int{}
	//create
	for i := 0; i <= 4; i++ {
		for j := 0; j <= 5; j++ {
			if i == 4 && j > 1 {
				break
			}
			pool = append(pool, i)
		}
	}
	//Create shuffled deck of cards
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := len(pool) - 1; i > 0; i-- {
		j := rng.Intn(i + 1)
		pool[i], pool[j] = pool[j], pool[i]
	}
	log.Printf("pool: %v", pool)

	//Asign play card for this round
	for num := 20; num <= len(pool)-1; num++ {
		if pool[num] != 4 {
			c.RoundPlayCard = pool[num]
			log.Printf("round of: %v", pool[num])
			break
		}
	}
	c.mu.Unlock()

	//distribute card
	cardsPerPlayer := 5
	cardIndex := 0

	s.mu.Lock()
	s.PlayersHand = make([][]int, len(c.PlayersHandCount))
	s.OnTableCard = []int{}
	for i := range s.PlayersHand {
		for j := 0; j < cardsPerPlayer; j++ {
			s.PlayersHand[i] = append(s.PlayersHand[i], pool[cardIndex])
			cardIndex++
		}
	}
	s.mu.Unlock()
	log.Printf("Distributed Hands: %v", s.PlayersHand)
}

// TODO :this function may return err for better practice
// TODO: May add card validate (check with s.PlayersHand)
func (c *ClientGameState) PlayCard(s *ServerGameState, playerOrder int, playedCard []int) {
	if len(playedCard) > 3 || len(playedCard) < 1 {
		return
	}
	if playerOrder != c.Turn {
		return
	}

	c.mu.Lock()
	c.LastPlayedBy = append(c.LastPlayedBy, playerOrder)
	c.LastPlayedCardCount = len(playedCard)
	c.PlayersHandCount[playerOrder-1] = c.PlayersHandCount[playerOrder-1] - len(playedCard)
	s.OnTableCard = playedCard
	c.mu.Unlock()

	c.nextTurn()

	if isOnlyOne, playerIndex := c.isOnlyOnePlayerWithHand(); isOnlyOne {
		log.Printf("Only one player has cards left: %v", playerIndex)
		c.ForcePlayerOrder = playerIndex + 1
	}
}

func (c *ClientGameState) CallCheck(s *ServerGameState, callerOrder int, calledOrder int) (bool, bool) {
	callLoserOrder := callerOrder
	for _, card := range s.OnTableCard {
		if card != c.RoundPlayCard && card != 4 {
			callLoserOrder = calledOrder
			break
		}
	}

	c.decreaseChance(callLoserOrder)
	var isCallSuccess bool
	if callLoserOrder == callerOrder {
		log.Println("call failed")
		isCallSuccess = false
	} else {
		log.Println("call success")
		isCallSuccess = true
	}

	c.checkIsGameEnd()
	return c.IsOver, isCallSuccess
}

func (c *ClientGameState) isOnlyOnePlayerWithHand() (bool, int) {
	count := 0
	playerIndex := -1
	for i, num := range c.PlayersHandCount {
		if num != 0 {
			count++
			playerIndex = i
		}
	}
	return count == 1, playerIndex
}

func (c *ClientGameState) nextTurn() {
	count := 0

	c.mu.Lock()
	for {
		c.Turn = (c.Turn % len(c.PlayersHandCount)) + 1
		if c.PlayersHandCount[c.Turn-1] != 0 && c.PlayersChance[c.Turn-1] != 0 {
			break
		}

		count++
		//need fix
		if count > len(c.PlayersHandCount)-2 {
			lastPlayedByLength := len(c.LastPlayedBy)
			//This is force call case when 2 people play all their hand
			c.Turn = c.LastPlayedBy[lastPlayedByLength-2]
			log.Printf("Last player at:Order%v, %v must call",
				c.LastPlayedBy[lastPlayedByLength-1], c.LastPlayedBy[lastPlayedByLength-2])
			break
		}
	}
	c.mu.Unlock()
}

func (c *ClientGameState) NextRound(s *ServerGameState, slots [4]*websocket.Conn) {
	c.mu.Lock()
	for i := 0; i < len(slots); i++ {
		next := (c.LastRoundStarterOrder + i) % len(slots)
		if slots[next] != nil && c.PlayersChance[next] != 0 {
			c.Turn = next + 1
			c.LastRoundStarterOrder = next + 1
			break
		}
	}
	// for {
	// 	startOrder = (startOrder % len(c.PlayersHandCount)) + 1
	// 	if c.PlayersChance[startOrder-1] != 0 {
	// 		break
	// 	}
	// }

	c.Round++
	// c.Turn = startOrder
	for i, playerChance := range c.PlayersChance {
		if playerChance != 0 {
			c.PlayersHandCount[i] = 5
		} else {
			c.PlayersHandCount[i] = 0
		}
	}
	c.LastPlayedBy = []int{}
	c.ForcePlayerOrder = -1
	c.mu.Unlock()
	c.generateDeck(s)
}

func (c *ClientGameState) decreaseChance(playerOrder int) {
	c.mu.Lock()
	defer c.mu.Unlock()

	playerIndex := playerOrder - 1
	c.PlayersChance[playerIndex] -= 1
	log.Printf("%v remaining chance: %v", playerOrder, c.PlayersChance[playerIndex])
}

func (c *ClientGameState) addScore(playerOrder int) {
	c.mu.Lock()
	defer c.mu.Unlock()

	playerIndex := playerOrder - 1
	c.Playerscore[playerIndex] += 1
	log.Printf("%v score added: %v", playerOrder, c.Playerscore[playerIndex])
}

func (c *ClientGameState) SetLeavePlayer(playerOrder int, slots [4]*websocket.Conn) (bool, bool, int) {
	c.mu.Lock()

	playerIndex := playerOrder - 1
	if playerIndex < 0 || playerIndex >= len(c.PlayersChance) {
		log.Printf("Invalid playerOrder: %v", playerOrder)
		return false, false, -1
	}

	c.PlayersHandCount[playerIndex] = 0
	c.PlayersChance[playerIndex] = 0

	isOnlyOnePlayerLeft := false
	isGoToNextGame := false
	skipToTurn := -1

	remainingPlayer := 0
	activePlayer := []int{}

	for i := range slots {
		if slots[i] != nil {
			remainingPlayer++
		}
		if c.PlayersChance[i] != 0 {
			activePlayer = append(activePlayer, i)
		}
	}
	c.mu.Unlock()
	if len(activePlayer) == 1 {
		isGoToNextGame = true
		activePlayerOrder := activePlayer[0] + 1
		log.Printf("PlayerOrder: %v gain the point; Go next game", activePlayerOrder)
		c.addScore(activePlayerOrder)
	}

	if remainingPlayer == 1 {
		log.Printf("Only 1 player remains in the room - Game ended")
		isOnlyOnePlayerLeft = true
		return isOnlyOnePlayerLeft, isGoToNextGame, skipToTurn
	}

	log.Printf("Removed player order: %v", playerOrder)

	if c.Turn == playerOrder {
		for i := 1; i <= len(c.PlayersChance); i++ {
			nextTurn := (playerOrder + i - 1) % len(c.PlayersChance)
			if c.PlayersChance[nextTurn] > 0 {
				c.Turn = nextTurn + 1
				skipToTurn = c.Turn
				log.Printf("PlayerOrder: %v left on their turn, skipped to turn: %v", playerOrder, c.Turn)
				return isOnlyOnePlayerLeft, isGoToNextGame, skipToTurn
			}
		}
	}

	return isOnlyOnePlayerLeft, isGoToNextGame, skipToTurn
}
