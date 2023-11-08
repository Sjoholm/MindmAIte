// See https://aka.ms/new-console-template for more information
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using QuikGraph.Graphviz.Dot;
using System.Text;
using System.Web;

internal class Program
{
    private const string OpenAiEndpoint = "https://api.openai.com/v1/chat/completions"; // Replace with the appropriate endpoint if it has changed
    private const string OpenAiApiKey = "REPLACE_WITH_REAL_KEY"; // Replace with your OpenAI API key
    private const string QuickChartApiUrl = "https://quickchart.io/graphviz?format=png&graph=";
    private static async Task Main(string[] args)
    {
        string inputText = "Natural language processing in Microsoft Azure\r\nIn Microsoft Azure, you can use the following Azure AI services to build natural language processing solutions:\r\n\r\nService\tCapabilities\r\nAzure AI Language\tUse this service to access features for understanding and analyzing text, training language models that can understand spoken or text-based commands, and building intelligent applications.\r\nAzure AI Translator\tUse this service to translate text between more than 60 languages.\r\nAzure AI Speech\tUse this service to recognize and synthesize speech, and to translate spoken languages.\r\nAzure AI Bot Service\tThis service provides a platform for conversational AI, the capability of a software \"agent\" to participate in a conversation. Developers can use the Bot Framework to create a bot and manage it with Azure Bot Service - integrating back-end services like Language, and connecting to channels for web chat, email, Microsoft Teams, and others.";
        await GenerateMindMapFromText(inputText);
        Console.ReadKey();


        static async Task GenerateMindMapFromText(string inputText)
        {
            string dotScript = await GetDotLanguageFromOpenAi(inputText);
            //string dotScript = "digraph G { A -> B; A -> C; B -> D; C -> D; }";
            Console.WriteLine(dotScript);
            await GenerateMindMap(dotScript, "output.png");
            Console.WriteLine("Image created");
            Console.ReadKey(true);
        }

        static async Task<string> GetDotLanguageFromOpenAi(string inputText)
        {
            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {OpenAiApiKey}");

                var payload = new
                {
                    model = "gpt-4", // You can specify the model you want to use
                    messages = new[]
                {
                    new { role = "system", content = "I want a mind map in form of Graphviz dot script. Just give me the script anddon't type anything else than the actrual script. No backticks before and after the script. The edges should be arrows. No colors." },
                    new { role = "user", content = inputText }
                }
                };

                var response = await httpClient.PostAsync(OpenAiEndpoint, new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json"));
                var responseBody = await response.Content.ReadAsStringAsync();

                var jsonResponse = JObject.Parse(responseBody);
                return jsonResponse["choices"][0]["message"]["content"].ToString().Trim();
            }
        }

        static async Task GenerateMindMap(string dotScript, string outputPath)
        {
            using (var client = new HttpClient())
            {
                // Encode the DOT script for URL
                string encodedDotScript = HttpUtility.UrlEncode(dotScript);
                string apiUrl = QuickChartApiUrl + encodedDotScript;

                // Make the GET request
                var response = await client.GetAsync(apiUrl);

                // Save the image
                if (response.IsSuccessStatusCode)
                {
                    var imageBytes = await response.Content.ReadAsByteArrayAsync();
                    await File.WriteAllBytesAsync(outputPath, imageBytes);
                }
                else
                {
                    throw new Exception($"Error: {response.StatusCode}");
                }
            }
        }
    }
}


