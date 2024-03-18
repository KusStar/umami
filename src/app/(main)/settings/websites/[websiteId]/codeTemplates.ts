export const genTsCode = (websiteId: string, hostUrl: string) => `export type TrackedProperties = {
  /**
   * Hostname of server
   *
   * @description extracted from \`window.location.hostname\`
   * @example 'analytics.umami.is'
   */
  hostname?: string

  /**
   * Browser language
   *
   * @description extracted from \`window.navigator.language\`
   * @example 'en-US', 'fr-FR'
   */
  language: string

  /**
   * Page referrer
   *
   * @description extracted from \`document.referrer\`
   * @example 'https://analytics.umami.is/docs/getting-started'
   */
  referrer: string

  /**
   * Screen dimensions
   *
   * @description extracted from \`window.screen.width\` and \`window.screen.height\`
   * @example '1920x1080', '2560x1440'
   */
  screen: string

  /**
   * Page title
   *
   * @description extracted from \`document.querySelector('head > title')\`
   * @example 'umami'
   */
  title: string

  /**
   * Page url
   *
   * @description built from \`${window.location.pathname}${window.location.search}\`
   * @example 'docs/getting-started'
   */
  url?: string

  /**
   * page name
   */
  page?: string

  /**
   * Website ID (required)
   *
   * @example 'b59e9c65-ae32-47f1-8400-119fcf4861c4'
   */
  website: string

  /**
   * app name
   *
   * @example 'rewind v3.5.0'
   */
  app?: string
  /**
   * os name
   */
  os?: string
  /**
   * device name
   */
  device?: string
}

let _payload: TrackedProperties = {
  website: '',
  language: '',
  referrer: '',
  screen: '',
  title: '',
  page: '',
}
let _cache: string | undefined
let _endpoint = ''

export const init = (
  websiteId: string,
  hostUrl: string,
  extraPayload?: Partial<Omit<TrackedProperties, 'website'>>,
) => {
  _payload = { ..._payload, ...extraPayload, website: websiteId }
  _endpoint = \`${hostUrl}/api/send\`
}

export const send = async (payload: Record<string, any>, type = 'event') => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (typeof _cache !== 'undefined') {
    headers['x-umami-cache'] = _cache
  }
  try {
    const res = await fetch(_endpoint, {
      method: 'POST',
      body: JSON.stringify({ type, payload }),
      headers,
    })
    const text = await res.text()

    _cache = text

    return {
      status: res.status,
      statusText: res.statusText,
      text,
    }
  } catch (e) {
    console.error('Err', e)
    /* empty */
    return null
  }
}

export const trackEvent = (
  obj?:
    | string
    | Partial<TrackedProperties>
    | ((payload: TrackedProperties) => Record<any, any>),
  data?: Record<any, any>,
) => {
  if (typeof obj === 'string') {
    return send({
      ..._payload,
      name: obj,
      data: typeof data === 'object' ? data : undefined,
    })
  }
  if (typeof obj === 'object') {
    return send({ ..._payload, ...obj })
  }
  if (typeof obj === 'function') {
    return send(obj(_payload))
  }
  return send(_payload)
}

export const trackInit = () => {
  init('${websiteId}', '${hostUrl}', {
    language: 'en',
    screen: '412x915',
    app: 'app',
    os: 'os',
    device: "device",
  })

  trackEvent()
}
`;

export const genJsCode = (websiteId: string, hostUrl: string) => `/**
* Payload structure with optional and required properties
* @typedef {Object} TrackedProperties
* @property {string} [hostname] - Hostname of server, extracted from \`window.location.hostname\`
* @example 'analytics.umami.is'
* @property {string} language - Browser language, extracted from \`window.navigator.language\`
* @example 'en-US', 'fr-FR'
* @property {string} referrer - Page referrer, extracted from \`document.referrer\`
* @example 'https://analytics.umami.is/docs/getting-started'
* @property {string} screen - Screen dimensions, extracted from \`window.screen.width\` and \`window.screen.height\`
* @example '1920x1080', '2560x1440'
* @property {string} title - Page title, extracted from \`document.querySelector('head > title')\`
* @example 'umami'
* @property {string} [url] - Page url, built from \`${window.location.pathname}${window.location.search}\`
* @example 'docs/getting-started'
* @property {string} [page] - Page name
* @property {string} website - Website ID (required)
* @example 'b59e9c65-ae32-47f1-8400-119fcf4861c4'
* @property {string} [app] - App name
* @example 'rewind v3.5.0'
* @property {string} [os] - OS name
* @property {string} [device] - Device name
*/

// Initialize payload with default values
// @type {TrackedProperties}
let _payload = {
  website: '',
  language: '',
  referrer: '',
  screen: '',
  title: '',
  page: '',
};

// Initialize cache and endpoint as undefined and empty string respectively
let _cache;
let _endpoint = '';

/**
* Initialize the tracking configuration.
* @param {string} websiteId - The ID of the website
* @param {string} hostUrl - The URL of the host server
* @param {Object} [extraPayload] - Additional payload information to merge
*/
export const init = (websiteId, hostUrl, extraPayload) => {
  _payload = { ..._payload, ...extraPayload, website: websiteId };
  _endpoint = \`${hostUrl}/api/send\`;
};

/**
* Send an event or payload to the server.
* @param {Object} payload - The payload data to send
* @param {string} [type] - The type of event, defaults to 'event'
* @returns {Promise<Object|null>} The server response or null in case of error
*/
export const send = async (payload, type = 'event') => {
 const headers = {
   'Content-Type': 'application/json',
 };

 if (typeof _cache !== 'undefined') {
   headers['x-umami-cache'] = _cache;
 }

 try {
   const res = await fetch(_endpoint, {
     method: 'POST',
     body: JSON.stringify({ type, payload }),
     headers,
   });

   const text = await res.text();
   _cache = text;

   return {
     status: res.status,
     statusText: res.statusText,
     text,
   };
 } catch (e) {
   console.error('Err', e);
   return null;
 }
};

/**
* Track an event with the given name and data.
* @param {string|TrackedProperties|Function} [obj] - The event name, payload object, or a function to generate the payload
* @param {Object} [data] - The data associated with the event if the name is provided
* @returns {Promise<Object|null>} The server response or null in case of error
*/
export const trackEvent = (obj, data) => {
  if (typeof obj === 'string') {
    return send({
      ..._payload,
      name: obj,
      data: typeof data === 'object' ? data : undefined,
    });
  }

  if (typeof obj === 'object') {
    return send({ ..._payload, ...obj });
  }

  if (typeof obj === 'function') {
    return send(obj(_payload));
  }

  return send(_payload);
};

/**
* An example function to initialize tracking and send a default event.
*/
export const trackInit = () => {
  init('${websiteId}', '${hostUrl}', {
    language: 'en',
    screen: '412x915',
    app: \`app\`,
    os: \`os\`,
    device: "device",
  });
  trackEvent();
};`;

export const genKotlinCode = (websiteId: string, hostUrl: string) => `/**
* Data class to represent the tracked properties similarly to the TypeScript type.
* Nullable types are used to represent optional properties.
*/
data class TrackedProperties(
   val hostname: String?,           // Optional hostname
   val language: String,            // Required language
   val referrer: String,            // Required referrer
   val screen: String,              // Required screen dimensions
   val title: String,               // Required page title
   val url: String?,                // Optional page URL
   val page: String?,               // Optional page name
   val website: String,             // Required website ID
   val app: String?,                // Optional app name
   val os: String?,                 // Optional OS name
   val device: String?              // Optional device name
)

/**
* Singleton object to represent the tracking functionality.
* This is analogous to the functions and variables in the TypeScript example.
*/
object Tracking {
  private var payload = TrackedProperties(
      website = "",
      language = "",
      referrer = "",
      screen = "",
      title = "",
      page = "",
      hostname = null,
      url = null,
      app = null,
      os = null,
      device = null
  )

  private var cache: String? = null
  private var endpoint: String = ""

  fun init(websiteId: String, hostUrl: String, extraPayload: TrackedProperties? = null) {
      payload = extraPayload?.let { 
          payload.copy(
              hostname = it.hostname ?: payload.hostname,
              language = it.language,
              referrer = it.referrer,
              screen = it.screen,
              title = it.title,
              url = it.url ?: payload.url,
              page = it.page ?: payload.page,
              website = websiteId,
              app = it.app ?: payload.app,
              os = it.os ?: payload.os,
              device = it.device ?: payload.device
          )
      } ?: payload.copy(website = websiteId)
      endpoint = "$hostUrl/api/send"
  }

  suspend fun send(payload: Map<String, Any>, type: String = "event"): Response? {
      val headers = mutableMapOf("Content-Type" to "application/json")
      cache?.let { headers["x-umami-cache"] = it }

      // Replace \`fetch\` with a Kotlin HTTP client call (e.g., using Ktor or OkHttp).
      // The below is a pseudo-code representation as Kotlin doesn't have a \`fetch\` function.
      try {
          val res = httpClient.post<String>(endpoint) {
              body = Json.encodeToString(mapOf("type" to type, "payload" to payload))
              headers(headers)
          }
          cache = res
          return Response(res.status, res.statusText, res)
      } catch (e: Exception) {
          println("Error during send: $e")
          return null
      }
  }

  fun trackInit(event: String, payload: Map<String, Any>) {
    // The \`send\` function is called with the \`type\` parameter set to "event".
    init("${websiteId}", "${hostUrl}", null)

    send(payload)
  }

   // More functions for trackEvent and trackInit would be implemented here.
   // As Kotlin is statically typed, we may need to create several overloads of \`trackEvent\`
   // to handle the different types of input parameters.
}`;

export const genJavaCode = (
  websiteId: string,
  hostUrl: string,
) => `import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class Tracker {
    private TrackedProperties payload;
    private Optional<String> cache = Optional.empty();
    private String endpoint;
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public Tracker() {
        // Initialize with default values
        this.payload = new TrackedProperties(null, "", "", "", "", null, null, "", null, null, null);
    }

    public void init(String websiteId, String hostUrl, TrackedProperties extraPayload) {
        // Combine properties from extraPayload into payload
        // You need to manually copy over the properties
        this.payload.setWebsite(websiteId);
        // ...other properties
        this.endpoint = hostUrl + "/api/send";
    }

    public HttpResponse<String> send(Map<String, Object> payloadMap, String type) throws IOException, InterruptedException {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        cache.ifPresent(c -> headers.put("x-umami-cache", c));

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .POST(HttpRequest.BodyPublishers.ofString(toJson(Map.of("type", type, "payload", payloadMap))))
                .headers(headers.entrySet().stream().flatMap(e -> Stream.of(e.getKey(), e.getValue())).toArray(String[]::new));

        HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());
        cache = Optional.of(response.body());
        return response;
    }

    public void trackEvent(/* Parameters based on your needs */) {
        // Implementation depends on how you want to use trackEvent
    }

    public void trackInit(/* Parameters based on your needs */) {
        // Implementation depends on how you want to use trackInit
    }

    // Utility method for JSON conversion
    private static String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return "{}";
        }
    }

    // TrackedProperties class with all the properties inside Tracker
    public static class TrackedProperties {
        // properties, getters, setters, and constructor (as shown previously)
    }

    // Main method for demonstration purposes
    public static void main(String[] args) throws IOException, InterruptedException {
        Tracker tracker = new Tracker();
        // Initialize with some dummy values for demonstration
        tracker.init("${websiteId}", "${hostUrl}", new TrackedProperties(/*...*/));

        // Simulate an event tracking
        HttpResponse<String> response = tracker.send(Map.of(
                "eventName", "click",
                "eventData", "button1"
        ), "event");

        System.out.println("Response: " + response.body());
    }
}`;

export const genSwiftCode = (websiteId: string, hostUrl: string) => `import Foundation

extension Encodable where Self: Decodable {
  func copy() throws -> Self {
    let data = try JSONEncoder().encode(self)
    return try JSONDecoder().decode(Self.self, from: data)
  }
}

extension Encodable {
  func asDictionary() throws -> [String: Any] {
    let data = try JSONEncoder().encode(self)
    guard
      let dictionary = try JSONSerialization.jsonObject(with: data, options: .allowFragments)
        as? [String: Any]
    else {
      throw NSError()
    }
    return dictionary
  }
}

// Define TrackedProperties as a struct within the same file
struct TrackedProperties: Codable {
  var website: String?
  var hostname: String?
  var language: String?
  var referrer: String?
  var screen: String?
  var title: String?
  var url: String?
  var page: String?
  var app: String?
  var os: String?
  var device: String?

  // Initializer that accepts a dictionary
  init(_ dictionary: [String: String?]) {
    website = dictionary["website"] ?? nil
    hostname = dictionary["hostname"] ?? nil
    language = dictionary["language"] ?? nil
    referrer = dictionary["referrer"] ?? nil
    screen = dictionary["screen"] ?? nil
    title = dictionary["title"] ?? nil
    url = dictionary["url"] ?? nil
    page = dictionary["page"] ?? nil
    app = dictionary["app"] ?? nil
    os = dictionary["os"] ?? nil
    device = dictionary["device"] ?? nil
  }
}

struct Response {
  var data: Data?
  var urlResponse: URLResponse?
}

typealias ResponseCompletion = (Result<Response, Error>) -> Void

final class Tracker {
  static let shared = Tracker()

  private var payload: TrackedProperties
  private var cache: String?
  private var endpoint: String = ""

  private init() {
    // Initialize with default values
    payload = TrackedProperties([
      "website": "",
      "language": "en",
    ])
  }

  func initialize(websiteId: String, hostUrl: String, extraPayload: TrackedProperties? = nil) {
    self.payload.website = websiteId
    mergePayload(payload: &self.payload, extraPayload: extraPayload)
    self.endpoint = "\\(hostUrl)/api/send"
  }

  private func mergePayload(payload: inout TrackedProperties, extraPayload: TrackedProperties?) {
    if let extraPayload = extraPayload {
      payload.referrer = extraPayload.referrer ?? payload.referrer
      payload.screen = extraPayload.screen ?? payload.screen
      payload.title = extraPayload.title ?? payload.title
      payload.url = extraPayload.url ?? payload.url
      payload.page = extraPayload.page ?? payload.page
      payload.app = extraPayload.app ?? payload.app
      payload.os = extraPayload.os ?? payload.os
      payload.device = extraPayload.device ?? payload.device
    }
  }

  func send(
    _ extraPayload: TrackedProperties? = nil,
    eventType: String,
    completion: @escaping ResponseCompletion = { _ in }
  ) throws {
    guard let url = URL(string: endpoint) else { return }

    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")

    if let cache = cache {
      request.addValue(cache, forHTTPHeaderField: "x-umami-cache")
    }
    var clonedPayload = try payload.copy()
    mergePayload(payload: &clonedPayload, extraPayload: extraPayload)
    let json: [String: Any] = ["type": eventType, "payload": try clonedPayload.asDictionary()]

    let jsonData = try JSONSerialization.data(withJSONObject: json, options: [])
    // let jsonString = String(data: jsonData, encoding: .utf8)!
    // print(jsonString)
    request.httpBody = jsonData

    let task = URLSession.shared.dataTask(with: request) { data, response, error in
      if let error = error {
        print("Error \\(error)")
        completion(.failure(error))
      } else if let httpResponse = response as? HTTPURLResponse {
        completion(.success(Response(data: data, urlResponse: httpResponse)))
        if let data = data, let dataString = String(data: data, encoding: .utf8) {
          self.cache = dataString
        }
      } else {
        let error = NSError(
          domain: "", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid response"])
        completion(.failure(error))
      }
    }
    task.resume()
  }

  func trackEvent(
    _ payload: TrackedProperties? = nil,
    eventName: String = "event",
    completion: @escaping ResponseCompletion = { _ in }
  ) throws {
    // Add relevant data to the payload and call send
    try send(payload, eventType: eventName, completion: completion)
  }

}

func example() {
  let tracker = Tracker.shared
  tracker.initialize(
    websiteId: "${websiteId}", hostUrl: "${hostUrl}",
    extraPayload: TrackedProperties([
      "app": "rewind-ios",
      "os": "ios",
      "device": "iphone",
    ]))
  do {
    try tracker.trackEvent(TrackedProperties(["page": "test"])) { result in
      if case let .failure(error) = result {
        print(error)
      }
      if case let .success(response) = result {
        if let data = response.data, let dataString = String(data: data, encoding: .utf8) {
          print(dataString)
        } else {
          print("response \\(response.urlResponse!)")
        }
      }
      print("\ndone")
      exit(0)
    }
  } catch {
    print(error)
  }

  RunLoop.main.run()
}

// example()
`;
