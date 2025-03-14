using Microsoft.AspNetCore.Http;
using System.Threading.Tasks; // For System.Threading.Tasks.Task
using TaskManagementBackend.Data;
using MongoDB.Driver;
using TaskManagementBackend.Models;

namespace TaskManagementBackend
{
    public class TokenValidationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly AppDbContext _context;

        public TokenValidationMiddleware(RequestDelegate next, AppDbContext context)
        {
            _next = next;
            _context = context;
        }

        public async System.Threading.Tasks.Task InvokeAsync(HttpContext context) // Fully qualify Task
        {
            // Skip token validation for public endpoints
            if (context.Request.Path.StartsWithSegments("/api/Auth/register") ||
                context.Request.Path.StartsWithSegments("/api/Auth/login") ||
                context.Request.Path.StartsWithSegments("/api/Auth/logout"))
            {
                await _next(context);
                return;
            }

            // Get the token from the request header
            var token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            if (await IsTokenInvalid(token))
            {
                context.Response.StatusCode = 401; // Unauthorized
                await context.Response.WriteAsync("Token is invalid");
                return;
            }

            await _next(context);
        }

        private async System.Threading.Tasks.Task<bool> IsTokenInvalid(string token) // Fully qualify Task
        {
            var filter = Builders<InvalidToken>.Filter.Eq(t => t.Token, token);
            var invalidToken = await _context.InvalidTokens.Find(filter).FirstOrDefaultAsync();
            return invalidToken != null;
        }
    }
}