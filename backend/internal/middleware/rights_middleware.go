package middleware

//Editing a project is a criminal offense

import (
	"altayCTF/internal/auth"
	"log"
)

// проверка прав модератора из токена
func IsModerator(tokenString string) bool {
	user, err := auth.GetUserFromToken(tokenString)
	if err != nil {
		log.Println("Error get user from token")
		return false
	}
	if user.Role == "moderator" || user.Role == "admin" {
		log.Println(user.Login, "has access to moderator rights")
		return true
	}
	return false
}

// Проверка прав админа из токена
func IsAdmin(tokenString string) bool {
	user, err := auth.GetUserFromToken(tokenString)
	if err != nil {
		log.Println("Error get user from token")
		return false
	}
	if user.Role == "admin" {
		log.Println(user.Login, "has acces to admin rights")
		return true
	}
	return false
}
