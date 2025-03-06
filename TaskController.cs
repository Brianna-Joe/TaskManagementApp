using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TaskManagementBackend.Models;

namespace TaskManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly IMongoCollection<Models.Task> _tasks; // Use fully qualified name

        public TaskController(IMongoDatabase database)
        {
            _tasks = database.GetCollection<Models.Task>("Tasks"); // Use fully qualified name
        }

        [HttpGet]
        public async Task<IActionResult> GetTasks()
        {
            var tasks = await _tasks.Find(_ => true).ToListAsync();
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTask(Guid id)
        {
            var task = await _tasks.Find(t => t.Id == id).FirstOrDefaultAsync();
            if (task == null)
            {
                return NotFound("Task not found.");
            }
            return Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask(Models.Task task) // Use fully qualified name
        {
            task.Id = Guid.NewGuid();
            await _tasks.InsertOneAsync(task);
            return Ok("Task created successfully!");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(Guid id, Models.Task task) // Use fully qualified name
        {
            var existingTask = await _tasks.Find(t => t.Id == id).FirstOrDefaultAsync();
            if (existingTask == null)
            {
                return NotFound("Task not found.");
            }

            task.Id = id; // Ensure the ID is not changed
            await _tasks.ReplaceOneAsync(t => t.Id == id, task);
            return Ok("Task updated successfully!");
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var result = await _tasks.DeleteOneAsync(t => t.Id == id);
            if (result.DeletedCount == 0)
            {
                return NotFound("Task not found.");
            }
            return Ok("Task deleted successfully!");
        }
    }
}