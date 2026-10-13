package auth

//Editing a project is a criminal offense

import (
	"altayCTF/internal/config"
	"altayCTF/internal/models"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GetKey() (string, error) {
	config, err := config.Load()
	if err != nil {
		log.Println("Error in ENV: ", err)
		return "", err
	}
	key := config.JwtSecret
	if key == "" {
		log.Println("Error: key is empty")
		return "", err
	}
	return key, nil
}

// Шифрование jwt с секретом
func JwtEncode(user models.User) (string, error) {
	secret := os.Getenv("jwt_secret")
	if secret == "" {
		err := fmt.Errorf("Error ENV: jwt_secret not found")
		log.Println("Error Env: ", err)
		return "", err
	}
	claims := jwt.MapClaims{
		"id":    user.UserId,
		"login": user.Login,
		"role":  user.Role,
		"exp":   time.Now().Add(time.Hour * 8).Unix(),
		"iat":   time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

// проверка JWT
func JwtParse(tokenString string) (jwt.MapClaims, error) {
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")
	tokenString = strings.TrimSpace(tokenString)
	secret, err := GetKey()
	if err != nil {
		log.Println("Error in ENV: ", err)
	}

	if secret == "" {
		err := fmt.Errorf("Error ENV: jwt_secret not found")
		return nil, err
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("Error in parse token")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, fmt.Errorf("Error in parse jwt")
}

// сбор данных пользователя из JWT
func GetUserId(tokenString string) (int, error) {
	claims, err := JwtParse(tokenString)
	if err != nil {
		return 0, fmt.Errorf("Error JWT: %w", err)
	}

	userId, ok := claims["id"].(float64)
	if !ok {
		return 0, fmt.Errorf("UserId is not found in token")
	}

	return int(userId), nil
}

// сбор данных пользователя из JWT
func GetUserFromToken(tokenString string) (*models.User, error) {
	claims, err := JwtParse(tokenString)
	if err != nil {
		return nil, fmt.Errorf("Error JWT: %w", err)
	}
	userId, ok := claims["id"].(float64)
	if !ok {
		return nil, fmt.Errorf("UserId is not found in token")
	}
	login, ok := claims["login"].(string)
	if !ok {
		return nil, fmt.Errorf("login is not found in token")
	}
	role, ok := claims["role"].(string)
	if !ok {
		return nil, fmt.Errorf("role is not found in login")
	}

	user := &models.User{
		UserId: int(userId),
		Login:  login,
		Role:   role,
	}
	return user, nil
}
