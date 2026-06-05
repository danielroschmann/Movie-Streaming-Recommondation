package utils

import (
	"context"
	"os"
	"time"

	"github.com/danielroschmann/Movie-Streaming-Recommendation/Server/MovieStreamServer/database"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type SignedDetails struct {
	Email     string
	FirstName string
	LastName  string
	Role      string
	UserID    string
	jwt.RegisteredClaims
}

var ACCESS_KEY string = os.Getenv("ACCESS_KEY")
var REFRESH_KEY string = os.Getenv("REFRESH_KEY")
var userCollection *mongo.Collection = database.OpenCollection("users")

func GenerateAccessAndRefreshToken(email, firstName, lastName, role, userId string) (string, string, error) {
	accessClaims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      role,
		UserID:    userId,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "MovieStream",
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	signedAccessToken, err := accessToken.SignedString([]byte(ACCESS_KEY))

	if err != nil {
		return "", "", err
	}

	refreshClaims := &SignedDetails{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      role,
		UserID:    userId,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "MovieStream",
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	signedRefreshToken, err := refreshToken.SignedString([]byte(REFRESH_KEY))

	if err != nil {
		return "", "", err
	}

	return signedAccessToken, signedRefreshToken, nil
}

func UpdateTokens(userId, accessToken, refreshToken string) (err error) {
	var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
	defer cancel()

	updatedAt, _ := time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
	updateData := bson.M{
		"$set": bson.M{
			"access_token":  accessToken,
			"refresh_token": refreshToken,
			"updated_at":    updatedAt,
		},
	}
	_, err = userCollection.UpdateOne(ctx, bson.M{"user_id": userId}, updateData)

	if err != nil {
		return err
	}

	return nil
}
