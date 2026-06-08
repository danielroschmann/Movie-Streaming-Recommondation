package routes

import (
	controller "github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/controllers"
	"github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func SetupProtectedRoutes(router *gin.Engine, client *mongo.Client) {
	router.Use(middleware.AuthMiddleware())

	router.GET("/movie/:imdb_id", controller.GetMovie(client))
	router.POST("/addmovie", controller.AddMovie(client))
	router.GET("/recommendedmovies", controller.GetRecommendedMovies(client))
	router.PATCH("/updatereview/:imdb_id", controller.AdminReviewUpdate(client))
	router.GET("/watchlist", controller.GetWatchlist(client))
	router.POST("/watchlist/add", controller.AddMovieToWatchlist(client))
}
