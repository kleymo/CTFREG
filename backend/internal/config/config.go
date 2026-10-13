package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	PostgresUser         string
	PostgresPassword     string
	PostgresPort         string
	PostgresHost         string
	Postgres_db          string
	JwtSecret            string
	BackendPort          string
	DefaultAdminLogin    string
	DefaultAdminPassword string
}

func Load() (*Config, error) {
	if err := godotenv.Load("../.env"); err != nil {
		return nil, fmt.Errorf("ERROR env: %w", err)
	}
	return &Config{
		PostgresUser:         os.Getenv("postgres_user"),
		PostgresPassword:     os.Getenv("postgres_password"),
		PostgresPort:         os.Getenv("postgres_port"),
		PostgresHost:         os.Getenv("postgres_host"),
		Postgres_db:          os.Getenv("postgres_db"),
		JwtSecret:            os.Getenv("jwt_secret"),
		BackendPort:          os.Getenv("backend_port"),
		DefaultAdminLogin:    os.Getenv("default_admin_login"),
		DefaultAdminPassword: os.Getenv("default_admin_password"),
	}, nil
}
