package main

//The project is privately owned by the company

import (
	"altayCTF/internal/config"
	"altayCTF/internal/database"
	"altayCTF/internal/handlers"
	"log"
	"net/http"
)

func GetKey() (string, error) {
	config, err := config.Load()
	if err != nil {
		return "hui ", err
	}
	key := config.JwtSecret
	log.Println(key)
	return key, nil
}

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Println("Error ", err)
		return
	}
	db, err := database.Now()
	if err != nil {
		log.Fatalf("Error DB: %v", err)
	}

	h := handlers.New(db, cfg)
	h.AdminDefault()

	//POST запросы
	http.HandleFunc("/api/register", h.Register)
	http.HandleFunc("/api/login", h.SQLi_Login)
	http.HandleFunc("/api/team/create", h.Create_team)
	http.HandleFunc("/api/event/create", h.CreateEvent)//создание ивента, может делать модератор или админ
	http.HandleFunc("/api/team/approved", h.ApprovedTeam) //одобрение заявки команды
	http.HandleFunc("/api/result/create", h.CreateResults)//создание результа, может делать модератор или админ

	//GET запросы
	http.HandleFunc("/api/event", h.GetEvents)
	http.HandleFunc("/api/team/intro", h.AllTeamIntroFromEvent)//посмотреть заявки может только админ
	http.HandleFunc("/api/my/team", h.MyTeamIntro)
	http.HandleFunc("/api/result", h.GetResultFromEvent)

	if err := http.ListenAndServe(":"+cfg.BackendPort, nil); err != nil {
		log.Fatalf("Error in listen port %v", err)
	}
	log.Println("OK")
}
