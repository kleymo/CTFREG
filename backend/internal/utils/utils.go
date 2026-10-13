package utils

import (
	"altayCTF/internal/config"
	"altayCTF/internal/database"
	"fmt"
	"time"

	emailverifier "github.com/AfterShip/email-verifier"
)

type Handler struct {
	db     *database.DB
	config *config.Config
}

func ParseDate(date string) (time.Time, error) {
	parse, err := time.Parse("02.01.2006", date)
	if err != nil {
		fmt.Println("Error in parsing time: ", err)
		return time.Time{}, fmt.Errorf("invalid date format: %v", err)
	}
	return parse, nil
}

var verifier = emailverifier.NewVerifier()

func EmailVerifier(email string) bool {
	ret, err := emailverifier.NewVerifier().Verify(email)
	return err == nil && ret.Syntax.Valid
}
