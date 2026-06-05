package database

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func Connect() *mongo.Client {

	err := godotenv.Load(".env")

	if err != nil {
		log.Println("Unable to locate .env file")
	}

	MongoDb := os.Getenv("MONGODB_URI")
	if MongoDb == "" {
		log.Fatal("MONGODB_URI not set")
	}

	fmt.Println("MongoDB URI: ", MongoDb)

	clientOptions := options.Client().ApplyURI(MongoDb)

	client, err := mongo.Connect(clientOptions)

	if err != nil {
		return nil
	}

	return client
}

func OpenCollection(collectionName string, client *mongo.Client) *mongo.Collection {
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Unable to locate .env file")
	}

	databaseName := os.Getenv("DATABASE_NAME")

	fmt.Println("DATABASE NAME: ", databaseName)

	collection := client.Database(databaseName).Collection(collectionName)

	if collection == nil {
		return nil
	}

	return collection
}
