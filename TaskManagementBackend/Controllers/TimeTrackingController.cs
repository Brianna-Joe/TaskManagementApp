using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using TaskManagementBackend.Models;

namespace TaskManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimeTrackingController : ControllerBase
    {
        private readonly IMongoCollection<TimeTracking> _timeTrackings;

        public TimeTrackingController(IMongoDatabase database)
        {
            _timeTrackings = database.GetCollection<TimeTracking>("TimeTrackings");
        }

       [HttpPost("{taskId}/start-timer")]
public async Task<IActionResult> StartTimer(Guid taskId)
{
    var lastRecord = await _timeTrackings
        .Find(t => t.TaskId == taskId)
        .SortByDescending(t => t.EndTime)
        .FirstOrDefaultAsync();

    double lastDuration = lastRecord?.Duration ?? 0; // Restore previous time

    var newRecord = new TimeTracking
    {
        Id = Guid.NewGuid(),
        TaskId = taskId,
        StartTime = DateTime.UtcNow,
        Duration = lastDuration // Carry over previous duration
    };

    await _timeTrackings.InsertOneAsync(newRecord);
    return Ok(new { message = "Timer resumed.", lastDuration });
}



        [HttpPost("{taskId}/stop-timer")]
public async Task<IActionResult> StopTimer(Guid taskId)
{
    var timeTracking = await _timeTrackings
        .Find(t => t.TaskId == taskId && t.EndTime == default)
        .FirstOrDefaultAsync();

    if (timeTracking == null)
    {
        return NotFound("No active timer found for this task.");
    }

    timeTracking.EndTime = DateTime.UtcNow;
    timeTracking.Duration += (timeTracking.EndTime - timeTracking.StartTime).TotalSeconds; // Accumulate time

    await _timeTrackings.ReplaceOneAsync(t => t.Id == timeTracking.Id, timeTracking);
    return Ok(new { message = "Timer stopped.", totalDuration = timeTracking.Duration });
}


        [HttpGet("{taskId}/time-tracking")]
        public async Task<IActionResult> GetTimeTracking(Guid taskId)
        {
            var timeTrackings = await _timeTrackings
                .Find(t => t.TaskId == taskId)
                .ToListAsync();

            return Ok(timeTrackings);
        }
    }
}