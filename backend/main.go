package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"
	"unicode/utf8"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/poohwis/go-sse/internal/game"
)

type Message struct {
	Type       string                 `json:"type"`
	Payload    map[string]interface{} `json:"payload"`
	SenderSlot int                    `json:"senderSlot"`
}

// TODO: may add error message for handle case which abnormal
type OutgoingMessage struct {
	Type       string                 `json:"type"`
	Payload    map[string]interface{} `json:"payload"`
	TargetSlot int                    `json:"targetSlot,omitempty"`
}
type User struct {
	DisplayName string `json:"displayName"`
	Order       int    `json:"order"`
}

type Room struct {
	ID              string
	Clients         map[*websocket.Conn]bool
	Users           map[*websocket.Conn]User
	IncomingMessage chan Message
	OutgoingMessage chan OutgoingMessage
	Slots           [4]*websocket.Conn
	ClientGameState *game.ClientGameState
	ServerGameState *game.ServerGameState
	IsJoinable      bool
	Mutex           sync.Mutex
}

type Server struct {
	Rooms map[string]*Room
	Mutex sync.Mutex
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// make it handle when player leave the game in mid play (remove player and continue)
func main() {
	server := &Server{
		Rooms: make(map[string]*Room),
	}

	http.HandleFunc("/create", server.handleCreateRoom)
	http.HandleFunc("/ws/", server.handleWebSocket)
	http.HandleFunc("/validate/", server.handleValidateRoom)

	fmt.Println("Server started on :8080")
	// err := http.ListenAndServe(":8080", nil)
	err := http.ListenAndServe("127.0.0.1:8080", nil)
	if err != nil {
		log.Fatalf("Error starting server: %s", err)
	}
}
func (s *Server) handleValidateRoom(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*") // Change "*" to a specific domain for more security
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	roomId := r.URL.Path[len("/validate/"):]

	if _, exists := s.Rooms[roomId]; exists {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Room exists"))
	} else {
		http.Error(w, "Room not found", http.StatusNotFound)
	}
}

func (s *Server) handleCreateRoom(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*") // Change "*" to a specific domain for more security
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight request (for non-GET/POST methods)
	if r.Method == http.MethodOptions {
		return
	}

	//this method can cause id collision (in very small chance), anyway not practical ; change need to be made
	roomID := uuid.NewString()[:8]
	room := &Room{
		ID:              roomID,
		Clients:         make(map[*websocket.Conn]bool),
		Users:           make(map[*websocket.Conn]User),
		IncomingMessage: make(chan Message, 10),
		OutgoingMessage: make(chan OutgoingMessage, 10),
		IsJoinable:      true,
		// GameState:       game.NewGameState(),
	}
	s.Mutex.Lock()
	s.Rooms[roomID] = room
	s.Mutex.Unlock()

	go s.manageRoom(room)

	roomURL := fmt.Sprintf("http://%s/ws/%s", r.Host, roomID)
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(roomURL))
}

func (s *Server) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	roomID := r.URL.Path[len("/ws/"):]
	room, exists := s.Rooms[roomID]
	if !exists {
		http.Error(w, "Room not found", http.StatusNotFound)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		http.Error(w, "WebSocket upgrade failed", http.StatusInternalServerError)
		return
	}

	//TODO : complete query send on client side (name memory)
	query := r.URL.Query()
	displayname := query.Get("displayname")

	room.Mutex.Lock()

	slotNum := -1
	for i := 0; i < 4; i++ {
		if room.Slots[i] == nil {
			slotNum = i
			break
		}
	}

	if !room.IsJoinable {
		_ = conn.WriteJSON(OutgoingMessage{
			Type: "error",
			Payload: map[string]interface{}{
				"type": "errClosedRoom",
			},
		})
		conn.Close()
		log.Println("Room is not available right now")
		room.Mutex.Unlock()
		//TODO: write to client: reject connection and test more about error that can occur in the room
		return
	}

	if slotNum == -1 {
		_ = conn.WriteJSON(OutgoingMessage{
			Type: "error",
			Payload: map[string]interface{}{
				"type": "errRoomFull",
			},
		})
		conn.Close()
		log.Println("Room is full, rejecting connection.")
		room.Mutex.Unlock()
		//TODO: write to client: reject connection and test more about error that can occur in the room
		return
	}

	if displayname == "" {
		// displayname = fmt.Sprintf("Player%d", slotNum+1)
		existingNames := make(map[string]bool)
		for _, user := range room.Users {
			existingNames[user.DisplayName] = true
		}

		displayname = generatePlayerName(existingNames)
	}

	room.Slots[slotNum] = conn
	room.Clients[conn] = true
	room.Users[conn] = User{
		DisplayName: displayname,
		Order:       slotNum + 1,
	}
	room.Mutex.Unlock()

	log.Printf("%s joined room %s as Player%d", displayname, roomID, slotNum+1)
	_ = conn.WriteJSON(OutgoingMessage{
		Type: "initializeSlot",
		Payload: map[string]interface{}{
			"order":       slotNum + 1,
			"displayName": displayname,
		},
	})
	//w.write json to other player
	sendToAll(room, "in", map[string]interface{}{"order": slotNum + 1, "displayName": displayname})

	s.updateUserList(room)

	go s.readMessage(conn, room)
}

func generatePlayerName(existingNames map[string]bool) string {
	var prefixs = []string{
		"Captain", "Commander", "Major", "Colonel", "Admiral", "General", "Private",
		"Agent", "Detective", "Officer", "Sheriff",
		"Dr", "Professor", "Sir", "Master", "Boss", "Chief",
		"Big", "Lil", "Old", "Crazy", "Happy", "Grumpy", "Sneaky",
	}

	var animals = []string{
		"Lion", "Tiger", "Bear", "Wolf", "Fox", "Eagle", "Shark", "Panther",
		"Falcon", "Otter", "Penguin", "Koala", "Leopard", "Cobra", "Rabbit",
		"Turtle", "Hawk", "Lynx", "Jaguar", "Rhino",
	}

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	for i := 0; i < len(animals)*2; i++ {
		animal := animals[rng.Intn(len(animals))]
		prefix := prefixs[rng.Intn(len(prefixs))]
		name := prefix + animal
		if !existingNames[name] {
			return name
		}
	}
	// As fallback, append a number
	for i := 1; ; i++ {
		name := fmt.Sprintf("Player%d", i)
		if !existingNames[name] {
			return name
		}
	}

}

func (s *Server) manageRoom(room *Room) {
	for {
		select {
		case message := <-room.IncomingMessage:
			s.handleIncomingMessage(room, message)
		case message := <-room.OutgoingMessage:
			room.Mutex.Lock()
			for client := range room.Clients {
				client.WriteJSON(message)
			}
			room.Mutex.Unlock()
		}
		//Clean up room if no clients remain
		room.Mutex.Lock()
		if len(room.Clients) == 0 {
			delete(s.Rooms, room.ID)
			room.Mutex.Unlock()
			log.Printf("Room %s deleted as it has no clients", room.ID)
			return
		}
		room.Mutex.Unlock()
	}

}

func (s *Server) readMessage(conn *websocket.Conn, room *Room) {
	defer func() {
		s.removePlayer(conn, room)
		conn.Close()
	}()

	for {
		_, message, err := conn.ReadMessage()
		log.Printf("%s", message)
		if err != nil {
			log.Printf("Read error for room %s: %v:", room.ID, err)
			break
		}

		var parsedMessage Message
		err = json.Unmarshal(message, &parsedMessage)
		if err != nil {
			log.Println("JSON parse error:", err)
			continue
		}

		slotNum := -1
		room.Mutex.Lock()
		for i := 0; i < 4; i++ {
			if room.Slots[i] == conn {
				slotNum = i
				break
			}
		}
		room.Mutex.Unlock()

		if slotNum == -1 {
			log.Println("Unknow sender, ignoring message")
			continue
		}

		parsedMessage.SenderSlot = slotNum + 1

		room.IncomingMessage <- parsedMessage
	}
}

func handleGameIncomingMessage(room *Room, message Message) {
	action, ok := message.Payload["action"].(string)
	if !ok {
		log.Printf("Unknown action: %v", action)
		return
	}
	switch action {
	case "start":
		log.Print("Game start")

		//TODO : finish the To win score logic

		room.Mutex.Lock()
		room.IsJoinable = false
		room.Mutex.Unlock()

		endGameScore := int(message.Payload["endGameScore"].(float64))
		log.Println("Endgame score at:", endGameScore)

		room.ClientGameState, room.ServerGameState = game.NewGameState(room.Slots, endGameScore)

		for client := range room.Clients {
			playerIndex := room.Users[client].Order - 1
			sendToClient(client, "game", map[string]interface{}{
				"action": "start",
				"cards":  room.ServerGameState.PlayersHand[playerIndex],
				"state":  room.ClientGameState,
			})
		}

	case "reset":
		room.Mutex.Lock()
		room.IsJoinable = true
		room.Mutex.Unlock()

		sendToAll(room, "game", map[string]interface{}{
			"action": "initial",
		})

	case "nextRound":
		room.ClientGameState.NextRound(room.ServerGameState, room.Slots)
		for client := range room.Clients {
			playerIndex := room.Users[client].Order - 1
			if room.ClientGameState.PlayersChance[playerIndex] == 0 {
				sendToClient(client, "game", map[string]interface{}{
					"action": "nextRound",
					"cards":  []int{},
					"state":  room.ClientGameState,
				})
			} else {
				sendToClient(client, "game", map[string]interface{}{
					"action": "nextRound",
					"cards":  room.ServerGameState.PlayersHand[playerIndex],
					"state":  room.ClientGameState,
				})
			}
		}

	case "nextGame":
		isEndgameScoreMeet := room.ClientGameState.NextGame(room.ServerGameState, room.Slots)
		if isEndgameScoreMeet {
			sendToAll(room, "game", map[string]interface{}{
				"action":     "gameResult",
				"state":      room.ClientGameState,
				"gameResult": room.ClientGameState.Playerscore,
			})
			return
		}

		for client := range room.Clients {
			playerIndex := room.Users[client].Order - 1
			sendToClient(client, "game", map[string]interface{}{
				"action": "nextGame",
				"cards":  room.ServerGameState.PlayersHand[playerIndex],
				"state":  room.ClientGameState,
			})
		}

	case "playCard":
		if message.SenderSlot != room.ClientGameState.Turn {
			log.Print("Invalid player turn")
			return
		}

		playedCards, ok := message.Payload["playedCards"].([]interface{})
		if !ok {
			log.Println("Invalid playedCards type")
			return
		}

		// Convert playedCards to []int
		var cards []int
		for _, card := range playedCards {
			if cardFloat, ok := card.(float64); ok {
				cards = append(cards, int(cardFloat))
			} else {
				log.Println("Invalid card value")
				return
			}
		}

		log.Printf("Order:%v playedCards: %v", message.SenderSlot, cards)

		// Process the played cards
		room.ClientGameState.PlayCard(room.ServerGameState, message.SenderSlot, cards)

		// Send updated game state to clients
		sendToAll(room, "game", map[string]interface{}{
			"action": "playCard", "state": room.ClientGameState,
		})

	case "call":
		lastPlayOrder := room.ClientGameState.LastPlayedBy

		log.Printf("PlayerOrder:%v called : %v", message.SenderSlot, lastPlayOrder[len(lastPlayOrder)-1])
		isToNextGame, isCallSuccess := room.ClientGameState.CallCheck(room.ServerGameState, message.SenderSlot, lastPlayOrder[len(lastPlayOrder)-1])
		action := "toNextRound"
		if isToNextGame {
			action = "toNextGame"
		}
		log.Printf("%v", action)
		sendToAll(room, "game", map[string]interface{}{
			"action":        action,
			"state":         room.ClientGameState,
			"calledCards":   room.ServerGameState.OnTableCard,
			"isCallSuccess": isCallSuccess,
		})

	case "s":
		room.OutgoingMessage <- OutgoingMessage{
			Type: "roomInfo",
			Payload: map[string]interface{}{
				"room": room.ClientGameState,
			},
		}
	}
}

func (s *Server) handleIncomingMessage(room *Room, message Message) {
	switch message.Type {
	case "chat":
		//handle chat logic
		log.Printf("chat channel: %v %d", message.Payload, message.SenderSlot)
		room.OutgoingMessage <- OutgoingMessage{
			Type:    message.Type,
			Payload: message.Payload,
		}
	case "game":
		//handle game logic
		log.Printf("game logic: %v", message.Payload)
		handleGameIncomingMessage(room, message)

	case "nameChange":
		log.Printf("changename: %v from %v", message.Payload, message.SenderSlot)
		room.Mutex.Lock()
		defer s.updateUserList(room)
		defer room.Mutex.Unlock()

		newName, ok := message.Payload["newName"].(string)
		if !ok {
			log.Println("Invalid name change payload")
			return
		}

		if utf8.RuneCountInString(newName) < 1 || utf8.RuneCountInString(newName) > 16 {
			log.Println("Name must contain between 1 and 16 characters", utf8.RuneCountInString(newName))
			return
		}

		for _, user := range room.Users {
			if user.DisplayName == newName {
				senderIndex := message.SenderSlot - 1
				if senderIndex >= 0 && senderIndex < len(room.Slots) {
					senderConn := room.Slots[senderIndex]
					sendToClient(senderConn, "nameChangeStatus", map[string]interface{}{
						"isReject": true,
						"name":     room.Users[room.Slots[message.SenderSlot-1]].DisplayName})
					log.Println("Name already in use")
				}
				return
			}
		}

		for conn, user := range room.Users {
			if user.Order == message.SenderSlot {
				prevName := user.DisplayName
				user.DisplayName = newName
				room.Users[conn] = user // Update user map
				log.Printf("Player %d changed name to %s", message.SenderSlot, newName)
				sendToClient(conn, "nameChangeStatus", map[string]interface{}{"isReject": false, "name": newName})
				log.Println(user.DisplayName)

				// Notify all clients about the name change
				room.OutgoingMessage <- OutgoingMessage{
					Type: "nameChange",
					Payload: map[string]interface{}{
						"order":       message.SenderSlot,
						"prevName":    prevName,
						"displayName": newName,
					},
				}

				break
			}
		}

	default:
		log.Printf("Unknow message type received in room %s: %s", room.ID, message.Type)
	}

}

func (s *Server) updateUserList(room *Room) {
	room.Mutex.Lock()
	userList := make([]map[string]interface{}, 0, len(room.Users))
	for _, user := range room.Users {
		userList = append(userList, map[string]interface{}{
			"displayName": user.DisplayName,
			"order":       user.Order,
		})
	}
	room.Mutex.Unlock()

	payload := map[string]interface{}{
		"users": userList,
	}

	sendToAll(room, "updateUserList", payload)
}

func (s *Server) removePlayer(conn *websocket.Conn, room *Room) {
	room.Mutex.Lock()
	if _, exists := room.Clients[conn]; !exists {
		return //player already removed
	}

	for i := 0; i < 4; i++ {
		if room.Slots[i] == conn {
			room.Slots[i] = nil
			break
		}
	}

	displayName := room.Users[conn].DisplayName
	order := room.Users[conn].Order

	isOnlyOnePlayerLeft := false
	isGoToNextGame := false
	skipToTurn := -1
	if room.ClientGameState != nil {
		isOnlyOnePlayerLeft, isGoToNextGame, skipToTurn = room.ClientGameState.SetLeavePlayer(order, room.Slots)
	}
	log.Println(isGoToNextGame)

	delete(room.Clients, conn)
	delete(room.Users, conn)

	room.Mutex.Unlock()

	sendToAll(room, "out", map[string]interface{}{"order": order, "displayName": displayName})

	if isOnlyOnePlayerLeft {
		//show all disconnect message
		log.Println("isOnlyOnePlayerLeft:", isOnlyOnePlayerLeft)
		sendToAll(room, "game", map[string]interface{}{"action": "gameResult", "state": room.ClientGameState, "gameResult": []int{-1}})
	}

	if skipToTurn != -1 {
		log.Println("Turn skipped to:", skipToTurn)
		sendToAll(room, "game", map[string]interface{}{"action": "playCard", "state": room.ClientGameState})
	}
	log.Printf("%s left the room", displayName)
	log.Printf("Slots: %v", room.Slots)

	s.updateUserList(room)
}

func sendToAll(room *Room, messageType string, payload map[string]interface{}) {
	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	for client := range room.Clients {
		err := client.WriteJSON(OutgoingMessage{
			Type:    messageType,
			Payload: payload,
		})
		if err != nil {
			log.Printf("Error sending message to client: %v", err)
			client.Close()
			delete(room.Clients, client)
			delete(room.Users, client)
		}
	}
}

func sendToClient(client *websocket.Conn, messageType string, payload map[string]interface{}) {
	err := client.WriteJSON(OutgoingMessage{
		Type:    messageType,
		Payload: payload,
	})
	if err != nil {
		log.Printf("Error sending message to client: %v", err)
		client.Close()
	}
}

func sendToAllExcept(room *Room, exceptClient *websocket.Conn, messageType string, payload map[string]interface{}) {
	room.Mutex.Lock()
	defer room.Mutex.Unlock()

	for client := range room.Clients {
		if client != exceptClient {
			err := client.WriteJSON(OutgoingMessage{
				Type:    messageType,
				Payload: payload,
			})
			if err != nil {
				log.Printf("Error sending message to client: %v", err)
				client.Close()
			}
		}
	}
}
