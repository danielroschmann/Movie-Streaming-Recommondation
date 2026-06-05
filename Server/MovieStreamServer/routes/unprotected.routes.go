package routes

import (
	controller "github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/controllers"
	"github.com/gin-gonic/gin"
)

func SetupUnprotectedRoutes(router *gin.Engine) {
	router.GET("/movies", controller.GetMovies())
	router.POST("/register", controller.RegisterUser())
	router.POST("/login", controller.LoginUser())
	router.PATCH("/updatereview/:imdb_id", controller.AdminReviewUpdate())
}
