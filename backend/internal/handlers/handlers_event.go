package handlers

import (
	"altayCTF/internal/auth"
	"altayCTF/internal/config"
	"altayCTF/internal/middleware"
	"altayCTF/internal/models"
	"altayCTF/internal/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

type ReqEvent struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	DateStart   string `json:"dateStart"`
	EndDate     string `json:"endDate"`
	PhotoURL    string `json:"photoURL"`
}

func (h Handler) AdminDefault() {
	cfg, err := config.Load()
	if err != nil {
		fmt.Println("Error in ENV: ", err)
		return
	}
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM Users WHERE Login = $1)`
	err = h.db.QueryRow(query, cfg.DefaultAdminLogin).Scan(&exists)

	if err != nil {
		fmt.Println("Erron in DB: ", err)
		return
	}

	if exists {
		fmt.Println("Admin already exists")
		return
	}

	insertQuery := `INSERT INTO Users(Login, PasswordHash, Role, Created_at, Updated_at) 
	VALUES($1, $2, 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	RETURNING UserId`

	var AdminId int
	err = h.db.QueryRow(insertQuery, cfg.DefaultAdminLogin, cfg.DefaultAdminPassword).Scan(&AdminId)
	if err != nil {
		fmt.Println("Error in save DB(admin) ", err)
		return
	}
	fmt.Println("Admin created. ID: ", AdminId)
}

// -----------------
// Реализовать позже /upload/
// -----------------
func (h Handler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req ReqEvent
	token := r.Header.Get("Authorization")
	checkModerator := middleware.IsModerator(token)
	if checkModerator != true {
		http.Error(w, "You don't have the rights to perform this action", http.StatusForbidden)
		return
	}
	UserId, err := auth.GetUserId(token)
	if err != nil {
		http.Error(w, "Error", http.StatusBadRequest)
		fmt.Println("Error in encoding jwt: ", err)
		return
	}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		fmt.Println("Error in encoding JWT: ", err)
		http.Error(w, "Error in encoding JWT", http.StatusBadRequest)
		return
	}

	if len(req.Name) < 5 || len(req.Name) > 30 {
		http.Error(w, "The length of the event name is a minimum of 5 characters and a maximum of 30", http.StatusBadRequest)
		return
	}

	if len(req.Description) < 5 {
		http.Error(w, "The description is a minimum of 5 characters", http.StatusBadRequest)
		return
	}

	DateStart, err := utils.ParseDate(req.DateStart)
	if err != nil {
		fmt.Println("Error in parse date: ", err)
		http.Error(w, "Error in the date format, use DD.MM.YYYY", http.StatusBadRequest)
		return
	}

	EndDate, err := utils.ParseDate(req.EndDate)
	if err != nil {
		fmt.Println("Error in parse date: ", err)
		http.Error(w, "Error in the date format, use DD.MM.YYYY", http.StatusBadRequest)
		return
	}

	if DateStart.After(EndDate) {
		http.Error(w, "The start date cannot be later than the end date", http.StatusBadRequest)
		return
	}

	insertQuery := `INSERT INTO Event (Name, Description, DateStart, EndDate, PhotoURL, UserId, Created_at, Updated_at)
	VALUES($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	RETURNING EventId`

	var event models.Event
	err = h.db.QueryRow(insertQuery, req.Name, req.Description, DateStart, EndDate, req.PhotoURL, UserId).Scan(
		&event.EventId,
	)
	if err != nil {
		http.Error(w, "Error sever", http.StatusBadRequest)
		fmt.Println("Error in save event: ", err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": "true",
		"data": map[string]interface{}{
			"name":        req.Name,
			"description": req.Description,
			"dataStart":   event.DateStart,
			"endDate":     event.EndDate,
			"PhotoURL":    req.PhotoURL,
			"EventId":     event.EventId,
		},
	})

}

// Гет всех ивентов
func (h Handler) GetEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	rows, err := h.db.Query("SELECT Name, Description, DateStart, EndDate, PhotoURL, EventId, UserId, Created_at FROM Event")

	if err != nil {
		http.Error(w, "Server Error", http.StatusInternalServerError)
		fmt.Println("Error DB: ", err)
		return
	}
	defer rows.Close()

	var events []models.Event

	for rows.Next() {
		var event models.Event
		err := rows.Scan(
			&event.Name,
			&event.Description,
			&event.DateStart,
			&event.EndDate,
			&event.PhotoURL,
			&event.EventId,
			&event.UserId,
			&event.Created_at,
		)
		if err != nil {
			fmt.Println(err)
			continue
		}
		event.IsOpen = time.Now().Before(event.DateStart)
		events = append(events, event)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    events,
	})
}

type ScoreEntry struct {
	TeamId string `json:"team_id"`
	Score  string `json:"score"`
}

type ResultReq struct {
	EventId string       `json:"event_id"`
	Scores  []ScoreEntry `json:"scores"`
}

// создание результатов соревнований
func (h Handler) CreateResults(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := r.Header.Get("Authorization")
	if !middleware.IsModerator(token) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req ResultReq
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Error in encoding json", http.StatusBadRequest)
		return
	}

	if _, err = strconv.Atoi(req.EventId); err != nil {
		http.Error(w, "event_id must be a number", http.StatusBadRequest)
		return
	}

	var exists bool
	err = h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM Event WHERE EventId = $1)", req.EventId).Scan(&exists)

	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println("Error in DB: ", err)
		return
	}

	if !exists {
		http.Error(w, "Event not found", http.StatusBadRequest)
		return
	}

	tx, err := h.db.Begin()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println("Error DB: ", err)
		return
	}
	defer tx.Rollback()

	var TeamsResult []map[string]interface{}
	for _, score := range req.Scores {

		var teamExists bool

		err := tx.QueryRow(`SELECT EXISTS(SELECT 1 FROM Team WHERE TeamId = $1 AND EventId = $2)`,
			score.TeamId, req.EventId).Scan(&teamExists)

		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			fmt.Println("Error DB: ", err)
			return
		}

		if !teamExists {
			http.Error(w, "Team not found in this event", http.StatusBadRequest)
			return
		}

		var resultExists bool
		err = tx.QueryRow(`SELECT EXISTS(SELECT 1 FROM Results 
		WHERE TeamId = $1 AND EventId =$2)`,
			score.TeamId, req.EventId).Scan(&resultExists)

		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			fmt.Println("Error DB: ", err)
			return
		}

		if resultExists {
			_, err = tx.Exec(`
			UPDATE Results
			SET Score = $1, Updated_at = CURRENT_TIMESTAMP
			WHERE EventId = $2 AND TeamID =$3`, score.Score, req.EventId, score.TeamId)
			if err != nil {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				fmt.Println("Error DB: ", err)
				return
			}
			TeamsResult = append(TeamsResult, map[string]interface{}{
				"team_id": score.TeamId,
				"score":   score.Score,
				"status":  "update",
			})
		} else {
			_, err = tx.Exec(`
			INSERT INTO Results(EventId, TeamId, Score)
			VALUES($1, $2, $3)`, req.EventId, score.TeamId, score.Score)

			if err != nil {
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				fmt.Println("Error DB: ", err)
				return
			}

			TeamsResult = append(TeamsResult, map[string]interface{}{
				"team_id": score.TeamId,
				"score":   score.Score,
				"status":  "created",
			})
		}
	}
	err = tx.Commit()
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println("Error DB: ", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "results were created successfully",
		"data":    TeamsResult,
	})
}

// гет результатов
func (h Handler) GetResultFromEvent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	eventIdStr := r.URL.Query().Get("event_id")
	if eventIdStr == "" {
		http.Error(w, "evenet_id is required", http.StatusBadRequest)
		return
	}

	eventId, err := strconv.Atoi(eventIdStr)
	if err != nil {
		http.Error(w, "Invalid event_id", http.StatusBadRequest)
		return
	}

	var exists bool
	err = h.db.QueryRow(`SELECT EXISTS(SELECT 1 FROM Results WHERE EventId = $1)`, eventId).Scan(&exists)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	if !exists {
		http.Error(w, "Event not found", http.StatusBadRequest)
		return
	}

	err = h.db.QueryRow(`SELECT EXISTS(SELECT 1 FROM Results WHERE EventId = $1)`, eventId).Scan(&exists)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	if !exists {
		http.Error(w, "Results not found", http.StatusBadRequest)
		return
	}

	rows, err := h.db.Query(`SELECT 
	r.Result_id,
	t.EventId,
	r.TeamId,
	t.Name as TeamName,
	r.Score,
	RANK() OVER (ORDER BY r.Score DESC) as Place
	FROM Results r
	JOIN Team t ON r.TeamId = t.TeamId
	WHERE r.EventId = $1
	ORDER BY r.Score DESC
	`, eventId)

	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println("DB Error: ", err)
		return
	}
	defer rows.Close()

	var Results []map[string]interface{}
	for rows.Next() {
		var result struct {
			TeamName string `json:"team_name"`
			Score    string `json:"score"`
			Place    string `json:"place"`
			TeamId   string `json:"team_id"`
			EventId  string `json:"event_id"`
			ResultId string `json:"result_id"`
		}

		err := rows.Scan(
			&result.ResultId,
			&result.EventId,
			&result.TeamId,
			&result.TeamName,
			&result.Score,
			&result.Place,
		)

		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		Results = append(Results, map[string]interface{}{
			"team_name": result.TeamName,
			"score":     result.Score,
			"place":     result.Place,
			"team_id":   result.TeamId,
			"event_id":  result.EventId,
			"result_id": result.ResultId,
		})
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": "true",
		"data":    Results,
	})
}

// //гет команд с ивента
// func (h Handler) GetTeamFromEvent(w )
