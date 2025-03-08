package game

import (
	"log"
	"math/rand"
	"sync"
	"time"
)

type ServerGameState struct {
	PlayersHand [][]int
	OnTableCard []int //0-based index
	mu          sync.Mutex
}

type ClientGameState struct {
	Turn             int   `json:"turn"`          //1-based index, represent the current player's turn
	Round            int   `json:"round"`         //1-based index
	RoundPlayCard    int   `json:"roundPlayCard"` //0-based index
	PlayersChance    []int `json:"playersChance"`
	PlayersHandCount []int `json:"playersHandCount"`
	Playerscore      []int `json:"playersScore"`
	IsOver           bool  `json:"isOver"`
	LastPlayedBy     []int `json:"lastPlayedBy"` //1-based index, the last player who played
	mu               sync.Mutex
}

// TODO: hard coded the game condition of player for now, may change if want this to be configurable
func NewGameState() (*ClientGameState, *ServerGameState) {
	c := &ClientGameState{
		Turn:             1,
		Round:            1,
		RoundPlayCard:    -1,
		Playerscore:      []int{0, 0, 0, 0},
		PlayersHandCount: []int{5, 5, 5, 5},
		PlayersChance:    []int{2, 2, 2, 2},
		LastPlayedBy:     []int{},
		IsOver:           false,
	}

	s := &ServerGameState{
		PlayersHand: make([][]int, 4),
		OnTableCard: []int{},
	}
	c.generateDeck(s)
	return c, s
}

func (c *ClientGameState) NextGame(s *ServerGameState) {
	c.mu.Lock()
	c.Turn = 1
	c.Round = 1
	c.PlayersHandCount = []int{5, 5, 5, 5}
	c.PlayersChance = []int{2, 2, 2, 2}
	c.LastPlayedBy = []int{}
	c.IsOver = false
	c.mu.Unlock()

	c.generateDeck(s)
}

// use this after call check
func (c *ClientGameState) checkIsGameEnd() {
	count := 0
	winnerOrder := -1
	for i, chance := range c.PlayersChance {
		if chance != 0 {
			winnerOrder = i + 1
		} else {
			count++
			if count > 2 {
				c.IsOver = true
			}
		}
	}
	if c.IsOver {
		c.addScore(winnerOrder)
		log.Printf("Gameover winnerOrder: %v", winnerOrder)
	}
}

func (c *ClientGameState) generateDeck(s *ServerGameState) {
	c.mu.Lock()
	pool := []int{}
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
	numPlayer := 4
	cardsPerPlayer := 5
	cardIndex := 0

	s.mu.Lock()
	s.PlayersHand = make([][]int, 4)
	s.OnTableCard = []int{}
	for i := 0; i < numPlayer; i++ {
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
		log.Print("Invalid played card number")
		return
	}
	if playerOrder != c.Turn {
		log.Print("Invalid player turn")
		return
	}

	c.mu.Lock()
	c.LastPlayedBy = append(c.LastPlayedBy, playerOrder)
	c.PlayersHandCount[playerOrder-1] = c.PlayersHandCount[playerOrder-1] - len(playedCard)
	s.OnTableCard = playedCard
	c.mu.Unlock()

	c.nextTurn()
}

func (c *ClientGameState) CallCheck(s *ServerGameState, callerOrder int, calledOrder int) bool {
	callLoserOrder := callerOrder
	for _, card := range s.OnTableCard {
		if card != c.RoundPlayCard && card != 4 {
			callLoserOrder = calledOrder
			break
		}
	}

	c.decreaseChance(callLoserOrder)
	if callLoserOrder == callerOrder {
		log.Println("call failed")
	} else {
		log.Println("call success")
	}

	c.checkIsGameEnd()
	return c.IsOver
	// return c.IsOver
}

func (c *ClientGameState) nextTurn() {
	count := 0
	playerNum := 4
	c.mu.Lock()
	for {
		c.Turn = (c.Turn % 4) + 1
		if c.PlayersHandCount[c.Turn-1] != 0 && c.PlayersChance[c.Turn-1] != 0 {
			break
		}
		count++

		//need fix
		if count > playerNum-2 {
			lastPlayedByCount := len(c.LastPlayedBy)
			//This is force call case when 2 people play all their hand
			c.Turn = c.LastPlayedBy[lastPlayedByCount-2]
			log.Printf("Last player at:Order%v, %v must call",
				c.LastPlayedBy[lastPlayedByCount-1], c.LastPlayedBy[lastPlayedByCount-2])
			break
		}
	}
	c.mu.Unlock()
}

func (c *ClientGameState) NextRound(s *ServerGameState) {
	c.mu.Lock()
	startOrder := c.Round
	for {
		startOrder = (startOrder % 4) + 1
		if c.PlayersChance[startOrder-1] != 0 {
			break
		}
	}

	c.Round++
	c.Turn = startOrder
	for i, playerChance := range c.PlayersChance {
		if playerChance != 0 {
			c.PlayersHandCount[i] = 5
		} else {
			c.PlayersHandCount[i] = 0
		}
	}
	c.LastPlayedBy = []int{}
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
