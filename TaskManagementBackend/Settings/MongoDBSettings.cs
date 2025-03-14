namespace TaskManagementBackend.Settings
{
    public class MongoDBSettings
    {
        public string ConnectionString { get; set; } = string.Empty; // Initialize with default value
        public string DatabaseName { get; set; } = string.Empty;    // Initialize with default value
    }
}