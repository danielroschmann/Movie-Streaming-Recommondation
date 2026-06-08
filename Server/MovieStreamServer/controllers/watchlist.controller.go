package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/database"
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
