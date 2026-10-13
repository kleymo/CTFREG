package handlers

import (
	"altayCTF/internal/auth"
	"altayCTF/internal/config"
	"altayCTF/internal/database"
	"altayCTF/internal/models"
	"encoding/json"
	"fmt"
	"net/http"
)

func New(db *database.DB, cfg *config.Config) *Handler {
	return &Handler{
		db:     db,
		config: cfg,
	}
}

type Handler struct {
	db     *database.DB
	config *config.Config
}

type RegReq struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

// Функция регистрации
func (h Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Error in encoding json ", http.StatusBadRequest)
		return
	}

	if len(req.Login) < 5 || len(req.Login) > 20 {
		http.Error(w, " Error: The Login must be at least 5 characters and no more than 20 ", http.StatusBadRequest)
		return
	}
	if len(req.Password) < 8 || len(req.Password) > 20 {
		http.Error(w, " Error: The Password must be at least 8 characters and no more than 20. ", http.StatusBadRequest)
		return
	}
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM Users WHERE Login = $1)`
	err := h.db.QueryRow(query, req.Login).Scan(&exists)

	if err != nil {
		http.Error(w, "Error DB ", http.StatusInternalServerError)
		return
	}

	if exists {
		http.Error(w, "User with this login already exists ", http.StatusConflict)
		return
	}

	insertQuery :=
		`INSERT INTO Users(Login, PasswordHash, Role, Created_at, Updated_at) 
	VALUES($1, $2, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
	RETURNING UserId` // В поле с хэшем пароля хранится сырой пароль, решение до продакшн

	var UserId int
	err = h.db.QueryRow(insertQuery, req.Login, req.Password).Scan(&UserId)

	if err != nil {
		http.Error(w, "Error: DB (save user)", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User registered successfully",
		"userId":  UserId,
		"login":   req.Login,
		"role":    "user",
	})
}

// Функция логина + jwt генерация
func (h Handler) SQLi_Login(w http.ResponseWriter, r *http.Request) {
	var req RegReq
	err := json.NewDecoder(r.Body).Decode(&req)

	if err != nil {
		http.Error(w, "Error in encoding json", http.StatusBadRequest)
		return
	}

	var u models.User
	query := `
	SELECT UserId, Login, PasswordHash, Role, Created_at, Updated_at FROM Users WHERE Login = $1 and PasswordHash = $2`

	err = h.db.QueryRow(query, req.Login, req.Password).Scan(
		&u.UserId,
		&u.Login,
		&u.PasswordHash,
		&u.Role,
		&u.Created_at,
		&u.Updated_at,
	)

	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		fmt.Println("Error: User tried to login into account", req.Login)
		return
	}

	token, err := auth.JwtEncode(u)

	if err != nil {
		http.Error(w, "Error", http.StatusInternalServerError)
		fmt.Println("Error in generate JWT")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Expose-Headers", "Authorization")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Authorization", "Bearer "+token)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"message": "Login completed successfully",
			"user_id": u.UserId,
			"login":   u.Login,
			"role":    u.Role,
		},
	})
}
