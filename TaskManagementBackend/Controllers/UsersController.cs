using Microsoft.AspNetCore.Mvc; // For ApiController, HttpGet, etc.
using MongoDB.Driver;           // For IMongoCollection, IMongoDatabase, etc.
using TaskManagementBackend.Models; // For the User model
using System.Threading.Tasks;   // For Task (async methods)

namespace TaskManagementBackend.Controllers
{
    [ApiController] // Add this attribute
    [Route("api/[controller]")] // Define the route
    public class UsersController : ControllerBase // Inherit from ControllerBase
    {
        private readonly IMongoCollection<User> _users;

        // Constructor to inject IMongoDatabase
        public UsersController(IMongoDatabase database)
        {
            _users = database.GetCollection<User>("Users");
        }

        // GET: api/Users
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _users.Find(_ => true).ToListAsync();
            return Ok(users);
        }
    }
}