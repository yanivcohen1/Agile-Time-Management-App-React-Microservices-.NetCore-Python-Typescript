using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AuthApi.Models;
using FluentAssertions;
using Xunit;

namespace AuthApi.Tests;

public class DateFilterTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public DateFilterTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private async Task<string> GetTokenAsync(HttpClient client, string username, string password)
    {
        var formContent = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("username", username),
            new KeyValuePair<string, string>("password", password)
        });
        
        var response = await client.PostAsync("/auth/login", formContent);
        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return payload!.Access_token;
    }

    [Fact]
    public async Task Filter_By_Date_Range_Should_Include_End_Date()
    {
        using var client = _factory.CreateClient();
        var token = await GetTokenAsync(client, "admin@todo.dev", "ChangeMe123!");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };

        // 1. Create Todo with Due Date
        var dueDate = new DateTime(2023, 10, 27); // This will be normalized to Noon UTC by the controller
        var createRequest = new TodoCreate 
        { 
            Title = "Date Filter Test Todo", 
            Status = Status.BACKLOG,
            DueDate = dueDate
        };
        var createResponse = await client.PostAsJsonAsync("/todos", createRequest, options);
        createResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var createdTodo = await createResponse.Content.ReadFromJsonAsync<Todo>(options);

        // 2. Filter with range including the date
        // Case A: Exact date match for start and end
        var start = "2023-10-27";
        var end = "2023-10-27";
        var getResponse = await client.GetAsync($"/todos?due_date_start={start}&due_date_end={end}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var result = await getResponse.Content.ReadFromJsonAsync<TodoResponse>(options);
        result!.Items.Should().Contain(t => t.Id == createdTodo!.Id);

        // Case B: Range before the date
        var startBefore = "2023-10-20";
        var endBefore = "2023-10-26";
        var getResponseBefore = await client.GetAsync($"/todos?due_date_start={startBefore}&due_date_end={endBefore}");
        getResponseBefore.StatusCode.Should().Be(HttpStatusCode.OK);
        var resultBefore = await getResponseBefore.Content.ReadFromJsonAsync<TodoResponse>(options);
        resultBefore!.Items.Should().NotContain(t => t.Id == createdTodo!.Id);

        // Case C: Range after the date
        var startAfter = "2023-10-28";
        var endAfter = "2023-10-30";
        var getResponseAfter = await client.GetAsync($"/todos?due_date_start={startAfter}&due_date_end={endAfter}");
        getResponseAfter.StatusCode.Should().Be(HttpStatusCode.OK);
        var resultAfter = await getResponseAfter.Content.ReadFromJsonAsync<TodoResponse>(options);
        resultAfter!.Items.Should().NotContain(t => t.Id == createdTodo!.Id);

        // Cleanup
        await client.DeleteAsync($"/todos/{createdTodo!.Id}");
    }
}
