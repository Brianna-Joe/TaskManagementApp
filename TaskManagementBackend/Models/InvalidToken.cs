public class InvalidToken
{
    public string Id { get; set; } = Guid.NewGuid().ToString(); // Ensure a unique ID
    public required string Token { get; set; } = string.Empty;
    public DateTime Expiry { get; set; }
}