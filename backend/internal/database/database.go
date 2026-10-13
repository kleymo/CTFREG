package database

import (
	"altayCTF/internal/config"
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type DB struct {
	*sql.DB
}

func Now() (*DB, error) {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("db connect Error: ", err)
	}
	connStr := fmt.Sprintf(
		"user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.PostgresUser, cfg.PostgresPassword, cfg.Postgres_db, cfg.PostgresPort,
	)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(30)
	db.SetConnMaxIdleTime(15)
	db.SetConnMaxLifetime(time.Minute * 10)
	db.SetConnMaxIdleTime(time.Minute * 5)
	if err := db.Ping(); err != nil {
		return nil, err
	}
	log.Println("DB Connect")
	return &DB{db}, nil
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func ChekPassword(password, hash string) bool {
	error := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return error == nil
}
