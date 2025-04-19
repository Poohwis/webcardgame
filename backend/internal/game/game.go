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
	Turn                int   `json:"turn"`          //1-based index, represent the current player's turn
	Round               int   `json:"round"`         //1-based index
	RoundPlayCard       int   `json:"roundPlayCard"` //0-based index
	PlayersChance       []int `json:"playersChance"`
	PlayersHandCount    []int `json:"playersHandCount"`
	Playerscore         []int `json:"playersScore"`
	IsOver              bool  `json:"isOver"`
	LastPlayedBy        []int `json:"lastPlayedBy"` //1-based index, the last player who played
	LastPlayedCardCount int   `json:"lastPlayedCardCount"`
	ForcePlayerOrder    int   `json:"forcePlayerOrder"` //1-based index, Order of player which force to play all their hand / call
	mu                  sync.Mutex
}

// TODO: hard coded the game condition of player for now, may change if want this to be configurable
func NewGameState(numPlayers int) (*ClientGameState, *ServerGameState) {
	c := &ClientGameState{
		Turn:                1,
		Round:               1,
		RoundPlayCard:       -1,
		Playerscore:         make([]int, numPlayers),
		PlayersHandCount:    make([]int, numPlayers),
		PlayersChance:       make([]int, numPlayers),
		LastPlayedBy:        []int{},
		LastPlayedCardCount: 0,
		ForcePlayerOrder:    -1,
		IsOver:              false,
	}

	for i := range c.PlayersHandCount {
		c.PlayersHandCount[i] = 5
		c.PlayersChance[i] = 2
	}

	s := &ServerGameState{
		PlayersHand: make([][]int, numPlayers),
		OnTableCard: []int{},
	}

	c.generateDeck(s)
	return c, s
}

// TODO: Make it start at next player
func (c *ClientGameState) NextGame(s *ServerGameState) {
	c.mu.Lock()
	c.Turn = 1
	c.Round = 1
	c.PlayersHandCount = make([]int, len(c.PlayersHandCount))
	c.PlayersChance = make([]int, len(c.PlayersHandCount))
	c.LastPlayedBy = []int{}
	c.IsOver = false
	c.ForcePlayerOrder = -1
	c.mu.Unlock()

	for i := range c.PlayersHandCount {
		c.PlayersHandCount[i] = 5
		c.PlayersChance[i] = 2
	}

	c.generateDeck(s)
}

// use this after call check
func (c *ClientGameState) checkIsGameEnd() {
	count := 0
	winnerOrder := -1

	for i, chance := range c.PlayersChance {
		if chance != 0 {
			if winnerOrder == -1 {
				winnerOrder = i + 1
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
	// return c.IsOver
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

func (c *ClientGameState) NextRound(s *ServerGameState) {
	c.mu.Lock()
	startOrder := c.Round
	for {
		startOrder = (startOrder % len(c.PlayersHandCount)) + 1
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
