using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

class LoggingHandler : DelegatingHandler {
    public LoggingHandler() : base(new HttpClientHandler()) {}
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) {
        Console.WriteLine("REQUEST URI: " + request.RequestUri);
        var response = await base.SendAsync(request, cancellationToken);
        Console.WriteLine("STATUS: " + response.StatusCode);
        return response;
    }
}

class Program {
    static async Task Main() {
        var apiKey = "AIzaSyDummy"; 
        var httpClient = new HttpClient(new LoggingHandler());
        var builder = Kernel.CreateBuilder();
        builder.AddGoogleAIGeminiChatCompletion(
            modelId: "gemini-1.5-flash",
            apiKey: apiKey,
            apiVersion: Microsoft.SemanticKernel.Connectors.Google.GoogleAIVersion.V1,
            httpClient: httpClient);
        var chat = builder.Build().GetRequiredService<IChatCompletionService>();
        try {
            await chat.GetChatMessageContentAsync("Hello");
        } catch (Exception ex) {
            Console.WriteLine("Error: " + ex.Message);
        }
    }
}
