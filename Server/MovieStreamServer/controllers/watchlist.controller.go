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
)

func GetWatchlist(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(c, 100*time.Second)
		defer cancel()

		userId := c.GetString("userId")
		userCollection := database.OpenCollection("users", client)

		pipeline := mongo.Pipeline{
			{{Key: "$match", Value: bson.M{"user_id": userId}}},
			{{Key: "$unwind", Value: "$watchlist"}},
			{{Key: "$lookup", Value: bson.M{
				"from":         "movies",
				"localField":   "watchlist.imdb_id",
				"foreignField": "imdb_id",
				"as":           "movieData",
			}}},
			{{Key: "$unwind", Value: bson.M{
				"path":                       "$movieData",
				"preserveNullAndEmptyArrays": true,
			}}},
			{{Key: "$project", Value: bson.M{
				"_id":      0,
				"imdb_id":  "$watchlist.imdb_id",
				"title":    "$movieData.title",
				"added_at": "$watchlist.added_at",
			}}},
		}

		cursor, err := userCollection.Aggregate(ctx, pipeline)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer cursor.Close(ctx)

		var results []models.WatchlistEnrichedEntry
		if err := cursor.All(ctx, &results); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if results == nil {
			results = []models.WatchlistEnrichedEntry{}
		}

		c.JSON(http.StatusOK, results)
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
