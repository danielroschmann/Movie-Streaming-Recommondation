package main

import (
	"fmt"

	"github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	routes.SetupUnprotectedRoutes(router)
	routes.SetupProtectedRoutes(router)

	if err := router.Run(":8080"); err != nil {
		fmt.Println("Failed to start server", err)
	}
}
