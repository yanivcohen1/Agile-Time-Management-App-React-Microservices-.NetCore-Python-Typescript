namespace AuthApi.Models;

public record RegisterRequest(string Email, string FullName, string Password);