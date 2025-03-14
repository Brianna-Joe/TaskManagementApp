using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TaskManagementBackend.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using TaskManagementBackend.Data;

namespace TaskManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMongoCollection<User> _users;
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(IMongoDatabase database, AppDbContext context, IConfiguration configuration)
        {
            _users = database.GetCollection<User>("Users");
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            // Check if the username or email already exists
            if (await _users.Find(u => u.Username == user.Username || u.Email == user.Email).AnyAsync())
            {
                return BadRequest("Username or email already exists.");
            }

            // Hash the password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

            user.Id = Guid.NewGuid();
            await _users.InsertOneAsync(user);

            return Ok("User registered successfully!");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(User user)
        {
            var dbUser = await _users.Find(u => u.Username == user.Username).FirstOrDefaultAsync();

            if (dbUser == null || !BCrypt.Net.BCrypt.Verify(user.PasswordHash, dbUser.PasswordHash))
            {
                return Unauthorized("Invalid username or password.");
            }

            var token = GenerateJwtToken(dbUser);
            return Ok(new { Token = token });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            // Get the token from the request header
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            // Add the token to the blacklist (store in MongoDB)
            var invalidToken = new InvalidToken
            {
                Id = Guid.NewGuid().ToString(), // Ensure a unique ID
                Token = token,
                Expiry = DateTime.UtcNow.AddMinutes(30) // Set expiry time
            };

            await _context.InvalidTokens.InsertOneAsync(invalidToken);

            return Ok(new { message = "Logged out successfully" });
        }

        // Updated GenerateJwtToken method to include user.Id in NameIdentifier claim
        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                // Add the user's GUID under the NameIdentifier claim
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "default_secret_key_here"));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
