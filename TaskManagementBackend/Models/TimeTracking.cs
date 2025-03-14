using MongoDB.Bson.Serialization.Attributes;
using System;

namespace TaskManagementBackend.Models
{
    public class TimeTracking
    {
        [BsonId]
        public Guid Id { get; set; }
        public Guid TaskId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public double Duration { get; set; }
    }
}