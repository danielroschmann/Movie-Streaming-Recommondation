package routes

import (
	controller "github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/controllers"
	"github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/middleware"
	"github.com/gin-gonic/gin"
)

func SetupProtectedRoutes(router *gin.Engine) {
	router.Use(middleware.AuthMiddleware())

	router.GET("/movie/:imdb_id", controller.GetMovie())
	router.POST("/addmovie", controller.AddMovie())

}
