package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/database"
	"github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func GetWatchlist(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		userId := c.GetString("userId")

		projection := bson.M{
			"watchlist.imdb_id": 1,
			"_id":               0,
		}

		filter := bson.M{"user_id": userId}

		opts := options.FindOne().SetProjection(projection)

		var result bson.M

		var userCollection *mongo.Collection = database.OpenCollection("users", client)

		err := userCollection.FindOne(ctx, filter, opts).Decode(&result)

		if err != nil {
			if err == mongo.ErrNoDocuments {
				c.JSON(http.StatusOK, []string{})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return

		}

		watchlist, ok := result["watchlist"].(bson.A)

		if !ok {
			c.JSON(http.StatusOK, []string{})
			return
		}
		c.JSON(http.StatusOK, watchlist)
	}
}

func AddMovieToWatchlist(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		var userCollection *mongo.Collection = database.OpenCollection("users", client)

		userId := c.GetString("userId")

		var req models.AddToWatchlistEntry
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		alreadyExistsFilter := bson.M{
			"user_id":           userId,
			"watchlist.imdb_id": req.ImdbID,
		}

		count, err := userCollection.CountDocuments(ctx, alreadyExistsFilter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "Movie already exists in watchlist"})
			return
		}

		entry := models.WatchlistEntry{
			ImdbID:  req.ImdbID,
			AddedAt: time.Now(),
		}

		filter := bson.M{"user_id": userId}
		update := bson.M{
			"$push": bson.M{"watchlist": entry},
		}

		result, err := userCollection.UpdateOne(ctx, filter, update)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Movie added to watchlist"})

	}
}
