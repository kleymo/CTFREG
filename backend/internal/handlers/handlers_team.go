package handlers

import (
	"altayCTF/internal/auth"
	"altayCTF/internal/middleware"
	"altayCTF/internal/models"
	"altayCTF/internal/utils"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// функция для создания заявки на соревнования
func (h Handler) Create_team(w http.ResponseWriter, r *http.Request) {
	var req models.TeamIntro
	token := r.Header.Get("Authorization")
	UserId, err := auth.GetUserId(token)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Error in encoding json ", http.StatusBadRequest)
		fmt.Println("Error: ", err)
		return
	}
	query := `SELECT EXISTS(SELECT 1 FROM Event WHERE EventId = $1)`

	var exists bool
	err = h.db.QueryRow(query, req.EventId).Scan(&exists)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println("Error in DB ", err)
		return
	}
	if !exists {
		http.Error(w, "There is no such event", http.StatusBadRequest)
		return
	}
	query = `SELECT DateStart FROM Event WHERE EventId = $1`

	var DateStart time.Time
	err = h.db.QueryRow(query, req.EventId).Scan(&DateStart)
	if time.Now().After(DateStart) {
		http.Error(w, "Event has already ended", http.StatusConflict)
		return
	}

	if len(req.Name) < 3 || len(req.Name) > 50 {
		http.Error(w, "The length of the team name must be a minimum of 3 and a maximum of 50 characters", http.StatusBadRequest)
		return
	}

	if len(req.Phone) != 12 || !strings.HasPrefix(req.Phone, "+7") {
		http.Error(w, "The number should be: +79876543219", http.StatusBadRequest)
		return
	}

	if len(req.City) < 3 || len(req.City) > 30 {
		http.Error(w, "The name of the city is a minimum of 3 and a maximum of 30 characters", http.StatusBadRequest)
		return
	}

	if len(req.University) < 3 || len(req.University) > 60 {
		http.Error(w, "The name of the University is a minimum of 3", http.StatusBadRequest)
		return
	}

	if !utils.EmailVerifier(req.Email) {
		http.Error(w, "Email invalid", http.StatusBadRequest)
		return
	}

	insertQuery := `INSERT INTO TeamIntro
	(Name, University, Email, City, Phone, PhotoURL, UserId, EventId, Comment, Created_at, Updated_at)
	VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	RETURNING id`

	var TeamId int
	err = h.db.QueryRow(insertQuery,
		req.Name,
		req.University,
		req.Email,
		req.City,
		req.Phone,
		req.PhotoURL,
		UserId,
		req.EventId,
		req.Comment,
	).Scan(&TeamId)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Team Created",
		"data": map[string]interface{}{
			"id": TeamId,
		},
	})
}

type MyTeamIntro struct {
	Name       string `json:"name"`
	University string `json:"university"`
	Email      string `json:"email"`
	City       string `json:"city"`
	Phone      string `json:"phone"`
	PhotoURL   string `json:"PhotoURL"`
	EventId    int    `json:"event_id"`
	EventName  string `json:"event_name"`
	Status     string `json:"status"`
	Comment    string `json:"comment"`
	Updated_at string `json:"updated_at"`
}

// функция для просмотра своих заявок
func (h Handler) MyTeamIntro(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	token := r.Header.Get("Authorization")
	userId, err := auth.GetUserId(token)
	if err != nil {
		http.Error(w, "Error in token", http.StatusBadRequest)
		return
	}

	query := `SELECT TeamIntro.Name, TeamIntro.University, TeamIntro.Email, TeamIntro.City, TeamIntro.Phone, TeamIntro.PhotoURL, TeamIntro.Status, TeamIntro.Comment, TeamIntro.EventId, TeamIntro.Updated_at, Event.Name
	 FROM TeamIntro 
	 JOIN Event ON TeamIntro.EventId = Event.EventId
	 WHERE TeamIntro.UserId = $1`
	rows, err := h.db.Query(query, userId)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println("ErrorDB: ", err)
		return
	}
	defer rows.Close()

	var TeamIntro []MyTeamIntro

	for rows.Next() {
		var Intro MyTeamIntro
		err := rows.Scan(
			&Intro.Name,
			&Intro.University,
			&Intro.Email,
			&Intro.City,
			&Intro.Phone,
			&Intro.PhotoURL,
			&Intro.Status,
			&Intro.Comment,
			&Intro.EventId,
			&Intro.Updated_at,
			&Intro.EventName,
		)
		if err != nil {
			fmt.Println(err)
			continue
		}
		TeamIntro = append(TeamIntro, Intro)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": TeamIntro,
	})
}

// функция для получения заявок мероприятия, может получить модератор/админ
func (h Handler) AllTeamIntroFromEvent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	reqStr := r.URL.Query().Get("event_id")
	token := r.Header.Get("Authorization")

	if !middleware.IsModerator(token) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	if reqStr == "" {
		http.Error(w, "event_id is required", http.StatusBadRequest)
		return
	}
	req, err := strconv.Atoi(reqStr)
	if err != nil {
		http.Error(w, "Invalid event_id", http.StatusBadRequest)
		return
	}

	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM TeamIntro WHERE EventId = $1)`
	err = h.db.QueryRow(query, req).Scan(&exists)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println("Error DB: ", err)
		return
	}
	if !exists {
		http.Error(w, "No applications found for this event", http.StatusBadRequest)
		return
	}
	query = `SELECT * FROM TeamIntro WHERE EventId = $1`
	rows, err := h.db.Query(query, req)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println("Error DB: ", err)
		return
	}
	defer rows.Close()

	var TeamIntro []models.TeamIntro
	for rows.Next() {
		var Team models.TeamIntro
		err := rows.Scan(
			&Team.Name,
			&Team.ID,
			&Team.University,
			&Team.Email,
			&Team.City,
			&Team.Phone,
			&Team.PhotoURL,
			&Team.UserId,
			&Team.EventId,
			&Team.Status,
			&Team.Comment,
			&Team.Created_at,
			&Team.Updated_at,
		)
		if err != nil {
			fmt.Println(err)
			continue
		}
		TeamIntro = append(TeamIntro, Team)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": TeamIntro,
	})
}

type ApprovedRequest struct {
	IntroId string `json:"intro_id"`
}

// функция для одобрения заявки, может использовать модератор/админ
func (h Handler) ApprovedTeam(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	token := r.Header.Get("Authorization")
	checkModerator := middleware.IsModerator(token)
	if !checkModerator {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req ApprovedRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Error in json", http.StatusBadRequest)
		return
	}

	var intro models.TeamIntro

	query := `SELECT Name, University, Email, City, Phone, PhotoURL, UserId, EventId 
	FROM TeamIntro 
	WHERE id = $1 AND Status = 'pending'`

	err = h.db.QueryRow(query, req.IntroId).Scan(
		&intro.Name,
		&intro.University,
		&intro.Email,
		&intro.City,
		&intro.Phone,
		&intro.PhotoURL,
		&intro.UserId,
		&intro.EventId,
	)

	if err == sql.ErrNoRows {
		http.Error(w, "The application was not found", http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		fmt.Println("Error DB: ", err)
		return
	}

	tx, err := h.db.Begin()

	if err != nil {
		http.Error(w, "Server Internal Error", http.StatusInternalServerError)
		fmt.Println("Error DB: ", err)
		return
	}
	defer tx.Rollback()

	var TeamId int
	InsertTeam := `INSERT INTO Team(
	Name, University, Email, City, Phone, 
	PhotoURL, EventId, UserId, Created_at, Updated_at
	) 
	VALUES($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	RETURNING TeamId`
	err = tx.QueryRow(InsertTeam,
		intro.Name,
		intro.University,
		intro.Email,
		intro.City,
		intro.Phone,
		intro.PhotoURL,
		intro.EventId,
		intro.UserId,
	).Scan(&TeamId)
	if err != nil {
		http.Error(w, "Error creating team", http.StatusInternalServerError)
		fmt.Println("Error creating team:", err)
		return
	}

	_, err = tx.Exec(`
	UPDATE TeamIntro SET Status = 'approved', Updated_at = NOW() WHERE id = $1`, req.IntroId)
	if err != nil {
		http.Error(w, "Error updating application status", http.StatusInternalServerError)
		fmt.Println("Error updating status:", err)
		return
	}

	if err = tx.Commit(); err != nil {
		http.Error(w, "Error saving data", http.StatusInternalServerError)
		fmt.Println("Error committing transaction:", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Team approved and created successfully",
		"data": map[string]interface{}{
			"team_id":   TeamId,
			"team_name": intro.Name,
			"event_id":  intro.EventId,
		},
	})
}
