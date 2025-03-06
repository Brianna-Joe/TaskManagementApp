using Microsoft.EntityFrameworkCore;
using TaskManagementBackend.Models;
using MongoDB.Driver;

namespace TaskManagementBackend.Data
{
    public class AppDbContext
    {
        private readonly IMongoDatabase _database;

        public AppDbContext(IConfiguration configuration)
        {
            var client = new MongoClient(configuration["MongoDBSettings:ConnectionString"]);
            _database = client.GetDatabase(configuration["MongoDBSettings:DatabaseName"]);
        }

        public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
        public IMongoCollection<Models.Task> Tasks => _database.GetCollection<Models.Task>("Tasks");
        public IMongoCollection<TimeTracking> TimeTrackings => _database.GetCollection<TimeTracking>("TimeTrackings");
        public IMongoCollection<InvalidToken> InvalidTokens => _database.GetCollection<InvalidToken>("InvalidTokens");
    }
}