package controllers

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/database"
	"github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/models"
	"github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/utils"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/joho/godotenv"
	"github.com/tmc/langchaingo/llms/openai"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var movieCollection *mongo.Collection = database.OpenCollection("movies")
var rankingCollection *mongo.Collection = database.OpenCollection("rankings")
var validate = validator.New()

func GetMovies() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var movies []models.Movie

		cursor, err := movieCollection.Find(ctx, bson.M{})

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Fetch failed"})
		}

		defer cursor.Close(ctx)

		if err = cursor.All(ctx, &movies); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode movies"})
		}

		c.JSON(http.StatusOK, movies)
	}
}

func GetMovie() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		movieID := c.Param("imdb_id")

		if movieID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Movie ID not found"})
			return
		}

		var movie models.Movie

		err := movieCollection.FindOne(ctx, bson.M{"imdb_id": movieID}).Decode(&movie)

		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Movie not found"})
			return
		}

		c.JSON(http.StatusOK, movie)
	}
}

func AddMovie() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var movie models.Movie

		if err := c.ShouldBindJSON(&movie); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
			return
		}

		if err := validate.Struct(movie); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
			return
		}

		result, err := movieCollection.InsertOne(ctx, movie)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add movie"})
			return
		}

		c.JSON(http.StatusCreated, result)
	}
}

func AdminReviewUpdate() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, err := utils.GetRoleFromContext(c)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Role not found"})
			return
		}

		if role != "ADMIN" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User does not have the admin role"})
			return
		}

		movieId := c.Param("imdb_id")

		if movieId == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Movie id is missing"})
			return
		}

		var req struct {
			AdminReview string `json:"admin_review"`
		}

		var res struct {
			RankingName string `json:"ranking_name"`
			AdminReview string `json:"admin_review"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		sentiment, rankValue, err := GetReviewRanking(req.AdminReview)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error getting review ranking"})
			return
		}

		filter := bson.M{"imdb_id": movieId}
		update := bson.M{
			"$set": bson.M{
				"admin_review": req.AdminReview,
				"ranking": bson.M{
					"ranking_value": rankValue,
					"ranking_name":  sentiment,
				},
			},
		}

		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		result, err := movieCollection.UpdateOne(ctx, filter, update)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error updating movie"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "No movie found"})
			return
		}

		res.RankingName = sentiment
		res.AdminReview = req.AdminReview

		c.JSON(http.StatusOK, res)
	}
}

func GetReviewRanking(admin_review string) (string, int, error) {
	rankings, err := GetRankings()

	if err != nil {
		return "", 0, err
	}

	sentimentDelimited := ""

	for _, ranking := range rankings {
		if ranking.RankingValue != 999 {
			sentimentDelimited = sentimentDelimited + ranking.RankingName + ","
		}
	}

	sentimentDelimited = strings.Trim(sentimentDelimited, ",")

	err = godotenv.Load(".env")

	if err != nil {
		log.Println("env file not found")
	}

	OpenAiKey := os.Getenv("OPENAI_API_KEY")

	if OpenAiKey == "" {
		return "", 0, errors.New("Could not read API key")
	}

	llm, err := openai.New(openai.WithToken(OpenAiKey))

	if err != nil {
		return "", 0, err
	}

	BasePromptTemplate := os.Getenv("BASE_PROMPT_TEMPLATE")
	BasePrompt := strings.Replace(BasePromptTemplate, "{rankings}", sentimentDelimited, 1)
	response, err := llm.Call(context.Background(), BasePrompt+admin_review)

	if err != nil {
		return "", 0, err
	}

	rankValue := 0

	for _, ranking := range rankings {
		if ranking.RankingName == response {
			rankValue = ranking.RankingValue
			break
		}
	}
	return response, rankValue, nil
}

func GetRankings() ([]models.Ranking, error) {
	var rankings []models.Ranking

	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	cursor, err := rankingCollection.Find(ctx, bson.M{})

	if err != nil {
		return nil, err
	}

	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &rankings); err != nil {
		return nil, err
	}

	return rankings, nil
}

func GetRecommendedMovies() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId, err := utils.GetUserIdFromContext(c)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User ID not found"})
			return
		}

		favourite_genres, err := GetFavouriteGenres(userId)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		err = godotenv.Load(".env")

		if err != nil {
			log.Println("env file not found")
		}

		var recommendedMoviesLimit int64 = 5

		recommendedMoviesLimitStr := os.Getenv("RECOMMENDED_MOVIE_LIMIT")

		if recommendedMoviesLimitStr != "" {
			recommendedMoviesLimit, _ = strconv.ParseInt(recommendedMoviesLimitStr, 10, 64)
		}

		findOptions := options.Find()
		findOptions.SetSort(bson.D{{Key: "ranking.ranking_value", Value: 1}})
		findOptions.SetLimit(recommendedMoviesLimit)

		filter := bson.M{"genre.genre_name": bson.M{"$in": favourite_genres}}

		ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		cursor, err := movieCollection.Find(ctx, filter, findOptions)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch recommended movies"})
			return
		}
		defer cursor.Close(ctx)

		var recommendedMovies []models.Movie

		if err := cursor.All(ctx, &recommendedMovies); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch recommended movies"})
			return
		}

		c.JSON(http.StatusOK, recommendedMovies)
	}
}

func GetFavouriteGenres(userId string) ([]string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	filter := bson.M{"user_id": userId}

	projection := bson.M{
		"favourite_genres.genre_name": 1,
		"_id":                         0,
	}

	opts := options.FindOne().SetProjection(projection)

	var result bson.M
	err := userCollection.FindOne(ctx, filter, opts).Decode(&result)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return []string{}, nil
		}
	}

	favGenres, ok := result["favourite_genres"].(bson.A)

	if !ok {
		return []string{}, errors.New("Unable to retrieve favourite genres")
	}

	var genreNames []string

	for _, item := range favGenres {
		if genreMap, ok := item.(bson.D); ok {
			for _, elem := range genreMap {
				if elem.Key == "genre_name" {
					if name, ok := elem.Value.(string); ok {
						genreNames = append(genreNames, name)
					}
				}
			}
		}
	}

	return genreNames, nil
}
