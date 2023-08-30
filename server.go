package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"strconv"
)

type ScoreEntry struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
}

var scores []ScoreEntry

func main() {
	http.HandleFunc("/submit", corsMiddleware(submitHandler))
	http.HandleFunc("/leaderboard", corsMiddleware(leaderboardHandler))

	port := "3500"
	if len(os.Args) > 1 {
		port = os.Args[1]
	}

	fmt.Printf("Server starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://127.0.0.1:5500")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	}
}

func submitHandler(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	scoreStr := r.URL.Query().Get("score")

	score, err := strconv.Atoi(scoreStr)
	if err != nil {
		http.Error(w, "Invalid score", http.StatusBadRequest)
		return
	}

	scores = append(scores, ScoreEntry{Name: name, Score: score})

	// Respond to the client
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Score submitted successfully!"))
}

func leaderboardHandler(w http.ResponseWriter, r *http.Request) {
	// Sort the scores in descending order
	sort.SliceStable(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	// Return the top 10 scores
	topScores := scores
	if len(scores) > 10 {
		topScores = scores[:10]
	}

	// Convert the scores to JSON
	jsonData, err := json.Marshal(topScores)
	if err != nil {
		http.Error(w, "Failed to convert leaderboard to JSON", http.StatusInternalServerError)
		return
	}

	// Return the JSON response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}
