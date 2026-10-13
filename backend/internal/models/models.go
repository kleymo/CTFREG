package models

import "time"

// writing exploits and editing code is a criminal offense
type Team struct {
	Name       string    `json:"name" db:"Name"`
	TeamId     int       `json:"teamId" db:"TeamId"`
	University string    `json:"university" db:"University"`
	Email      string    `json:"email" db:"Email"`
	City       string    `json:"city" db:"City"`
	Phone      string    `json:"phone" db:"Phone"`
	PhotoURL   string    `json:"photoURL" db:"PhotoURL"`
	EventId    int       `json:"eventId" db:"EventId"`
	ID         int       `json:"id" db:"id"`
	UserId     int       `json:"userId" db:"UserId"`
	Created_at time.Time `json:"created_at" db:"Created_at"`
	Updated_at time.Time `json:"updated_at" db:"Updated_at"`
}

// соревнование
type Event struct {
	Name        string    `json:"name" db:"Name"`
	Description string    `json:"description" db:"Description"`
	DateStart   time.Time `json:"dateStart" db:"DateStart"`
	EndDate     time.Time `json:"endDate" db:"EndDate"`
	PhotoURL    string    `json:"photoURL" db:"PhotoURL"`
	EventId     int       `json:"eventId" db:"EventId"`
	UserId      int       `json:"userId" db:"UserId"`
	IsOpen      bool      `json:"is_open" db:"-"`
	Created_at  time.Time `json:"created_at" db:"Created_at"`
	Updated_at  time.Time `json:"updated_at" db:"Updated_at"`
}

// пользователи
type User struct {
	UserId       int       `json:"userId" db:"UserId"`
	Email        string    `json:"email" db:"Email"`
	Login        string    `json:"login" db:"Login"`
	PasswordHash string    `json:"-" db:"PasswordHash"`
	Role         string    `json:"role" db:"Role"`
	Created_at   time.Time `json:"created_at" db:"Created_at"`
	Updated_at   time.Time `json:"updated_at" db:"Updated_at"`
}

// заявка на инвайт команды
type TeamIntro struct {
	ID         int       `json:"id" db:"id"`
	Name       string    `json:"name" db:"Name"`
	University string    `json:"university" db:"University"`
	Email      string    `json:"email" db:"Email"`
	City       string    `json:"city" db:"City"`
	Phone      string    `json:"phone" db:"Phone"`
	PhotoURL   string    `json:"photoURL" db:"PhotoURL"`
	EventId    int       `json:"eventId" db:"EventId"`
	UserId     int       `json:"userId" db:"UserId"`
	Status     string    `json:"status" db:"Status"`
	Comment    string    `json:"comment" db:"Comment"`
	Created_at time.Time `json:"created_at" db:"Created_at"`
	Updated_at time.Time `json:"updated_at" db:"Updated_at"`
}

// Результаты соревнований
type Result struct {
	EventId    int       `json:"eventId" db:"EventId"`
	TeamId     int       `json:"teamId" db:"TeamId"`
	Score      int       `json:"score" db:"Score"`
	Result_id  int       `json:"result_id" db:"Result_id"`
	Created_at time.Time `json:"created_at" db:"Created_at"`
	Updated_at time.Time `json:"updated_at" db:"Updated_at"`
}

// разработчики соревнований с указанием их роли
type Developer struct {
	Dev_id      int       `json:"dev_id" db:"Dev_id"`
	Name        string    `json:"name" db:"Name"`
	PhotoURL    string    `json:"photoURL" db:"PhotoURL"`
	Information string    `json:"information" db:"Information"`
	EventId     int       `json:"eventId" db:"EventId"`
	Created_at  time.Time `json:"created_at" db:"Created_at"`
	Updated_at  time.Time `json:"updated_at" db:"Updated_at"`
}

// Организаторы соревнований
type Organizer struct {
	Org_id     int       `json:"org_id" db:"Org_id"`
	Role       string    `json:"role" db:"Role"`
	Name       string    `json:"name" db:"Name"`
	PhotoURL   string    `json:"photoURL" db:"PhotoURL"`
	Link       string    `json:"link" db:"Link"`
	EventId    int       `json:"eventId" db:"EventId"`
	Created_at time.Time `json:"created_at" db:"Created_at"`
	Updated_at time.Time `json:"updated_at" db:"Updated_at"`
}
