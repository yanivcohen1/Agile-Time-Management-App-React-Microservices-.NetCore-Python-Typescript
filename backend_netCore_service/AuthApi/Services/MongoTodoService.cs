using AuthApi.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace AuthApi.Services;

public class MongoTodoService : ITodoService
{
    private readonly IMongoCollection<Todo> _todos;

    public MongoTodoService(string connectionString, string databaseName)
    {
        var client = new MongoClient(connectionString);
        var database = client.GetDatabase(databaseName);
        _todos = database.GetCollection<Todo>("todos");
    }

    public async Task<TodoResponse> GetTodosAsync(string userId, int page, int size, string sortBy, bool sortDesc, Status? status, string? search, DateTime? dueDateStart, DateTime? dueDateEnd)
    {
        var userObjectId = ObjectId.Parse(userId);
        var builder = Builders<Todo>.Filter;
        var filter = builder.Eq(t => t.UserLink.Id, userObjectId);

        if (status.HasValue)
        {
            filter &= builder.Eq(t => t.Status, status.Value);
        }

        if (!string.IsNullOrEmpty(search))
        {
            filter &= builder.Regex(t => t.Title, new BsonRegularExpression(search, "i"));
        }

        if (dueDateStart.HasValue)
        {
            filter &= builder.Gte(t => t.DueDate, dueDateStart.Value);
        }

        if (dueDateEnd.HasValue)
        {
            filter &= builder.Lte(t => t.DueDate, dueDateEnd.Value);
        }

        var total = await _todos.CountDocumentsAsync(filter);
        
        var sort = sortDesc 
            ? Builders<Todo>.Sort.Descending(sortBy) 
            : Builders<Todo>.Sort.Ascending(sortBy);

        var items = await _todos.Find(filter)
            .Sort(sort)
            .Skip((page - 1) * size)
            .Limit(size)
            .ToListAsync();

        return new TodoResponse
        {
            Items = items,
            Total = total,
            Page = page,
            Size = size,
            Pages = (total + size - 1) / size
        };
    }

    public async Task<Todo> CreateTodoAsync(Todo todo)
    {
        await _todos.InsertOneAsync(todo);
        return todo;
    }

    public async Task<Todo?> UpdateTodoAsync(string id, string userId, TodoUpdate update)
    {
        var userObjectId = ObjectId.Parse(userId);
        var filter = Builders<Todo>.Filter.And(
            Builders<Todo>.Filter.Eq(t => t.Id, id),
            Builders<Todo>.Filter.Eq(t => t.UserLink!.Id, userObjectId)
        );

        var updateDef = Builders<Todo>.Update.Set(t => t.UpdatedAt, DateTime.UtcNow);

        if (update.Title != null) updateDef = updateDef.Set(t => t.Title, update.Title);
        if (update.Description != null) updateDef = updateDef.Set(t => t.Description, update.Description);
        if (update.Status.HasValue) updateDef = updateDef.Set(t => t.Status, update.Status.Value);
        if (update.DueDate.HasValue) updateDef = updateDef.Set(t => t.DueDate, update.DueDate.Value);
        if (update.Duration != null) updateDef = updateDef.Set(t => t.Duration, update.Duration);

        var options = new FindOneAndUpdateOptions<Todo> { ReturnDocument = ReturnDocument.After };
        return await _todos.FindOneAndUpdateAsync(filter, updateDef, options);
    }

    public async Task<bool> DeleteTodoAsync(string id, string userId)
    {
        var userObjectId = ObjectId.Parse(userId);
        var filter = Builders<Todo>.Filter.And(
            Builders<Todo>.Filter.Eq(t => t.Id, id),
            Builders<Todo>.Filter.Eq(t => t.UserLink!.Id, userObjectId)
        );

        var result = await _todos.DeleteOneAsync(filter);
        return result.DeletedCount > 0;
    }

    public async Task<Dictionary<string, int>> GetStatusStatsAsync(string userId)
    {
        var userObjectId = ObjectId.Parse(userId);
        var pipeline = new EmptyPipelineDefinition<Todo>()
            .Match(t => t.UserLink!.Id == userObjectId)
            .Group(t => t.Status, g => new { Status = g.Key, Count = g.Count() });

        var stats = await _todos.Aggregate(pipeline).ToListAsync();
        
        var result = Enum.GetNames(typeof(Status)).ToDictionary(name => name, _ => 0);
        
        foreach (var stat in stats)
        {
            result[stat.Status.ToString()] = (int)stat.Count;
        }

        return result;
    }

    public async Task<List<object>> GetWorkloadStatsAsync(string userId)
    {
        var userObjectId = ObjectId.Parse(userId);
        
        // Use typed filter for match to ensure correct mapping of DBRef/UserLink
        var matchFilter = Builders<Todo>.Filter.And(
            Builders<Todo>.Filter.Eq(t => t.UserLink!.Id, userObjectId),
            Builders<Todo>.Filter.Ne(t => t.DueDate, null)
        );

        var group = new BsonDocument("$group", new BsonDocument
        {
            { "_id", new BsonDocument("$dateToString", new BsonDocument { { "format", "%Y-%m-%d" }, { "date", "$due_date" } }) },
            { "total", new BsonDocument("$sum", 1) },
            { "backlog", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$eq", new BsonArray { "$status", "BACKLOG" }), 1, 0 })) },
            { "pending", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$eq", new BsonArray { "$status", "PENDING" }), 1, 0 })) },
            { "in_progress", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$eq", new BsonArray { "$status", "IN_PROGRESS" }), 1, 0 })) },
            { "completed", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray { new BsonDocument("$eq", new BsonArray { "$status", "COMPLETED" }), 1, 0 })) }
        });

        var sort = new BsonDocument("$sort", new BsonDocument("_id", 1));

        var result = await _todos.Aggregate()
            .Match(matchFilter)
            .AppendStage<BsonDocument>(group)
            .AppendStage<BsonDocument>(sort)
            .ToListAsync();
        
        return result.Select(d => new
        {
            _id = d["_id"].AsString,
            total = d["total"].ToInt32(),
            backlog = d["backlog"].ToInt32(),
            pending = d["pending"].ToInt32(),
            in_progress = d["in_progress"].ToInt32(),
            completed = d["completed"].ToInt32()
        }).Cast<object>().ToList();
    }
}
