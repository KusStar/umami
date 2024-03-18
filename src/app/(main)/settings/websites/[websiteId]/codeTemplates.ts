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

export const genKotlinCode = (websiteId: string, hostUrl: string) => `package your.package

import your.package.BuildConfig

import android.os.Build
import android.util.Log
import org.json.JSONObject
import java.io.DataOutputStream
import java.net.HttpURLConnection
import java.net.HttpURLConnection.HTTP_OK
import java.net.URL
import java.util.Locale
import java.util.concurrent.Executors

/**
 * Data class to represent the tracked properties similarly to the TypeScript type.
 * Nullable types are used to represent optional properties.
 */
data class TrackedProperties(
    val website: String,
    val hostname: String?,
    val language: String?,
    val referrer: String?,
    val screen: String?,
    val title: String?,
    val url: String?,
    val page: String?,
    val app: String?,
    val os: String?,
    val device: String?
) {
    fun toMap(): Map<String, String> {
        val map = mutableMapOf<String, String>()
        map["website"] = website
        if (hostname != null) map["hostname"] = hostname
        if (language != null) map["language"] = language
        if (referrer != null) map["referrer"] = referrer
        if (screen != null) map["screen"] = screen
        if (title != null) map["title"] = title
        if (url != null) map["url"] = url
        if (page != null) map["page"] = page
        if (app != null) map["app"] = app
        if (os != null) map["os"] = os
        if (device != null) map["device"] = device
        return map
    }
}

/**
 * Singleton object to represent the tracking functionality.
 * This is analogous to the functions and variables in the TypeScript example.
 */
object Umami {
    private fun getDeviceName(): String {
        val manufacturer = Build.MANUFACTURER
        val model = Build.MODEL
        return if (model.lowercase(Locale.getDefault())
                .startsWith(manufacturer.lowercase(Locale.getDefault()))
        ) {
            capitalize(model)
        } else {
            capitalize(manufacturer) + " " + model
        }
    }

    private fun capitalize(s: String?): String {
        if (s.isNullOrEmpty()) {
            return ""
        }
        val first = s[0]
        return if (Character.isUpperCase(first)) {
            s
        } else {
            first.uppercaseChar().toString() + s.substring(1)
        }
    }

    private var payload = TrackedProperties(
        website = "",
        language = null,
        referrer = null,
        screen = null,
        title = null,
        page = null,
        hostname = null,
        url = null,
        app = "krude \${BuildConfig.VERSION_NAME}",
        os = "Android \${Build.VERSION.RELEASE}, API \${Build.VERSION.SDK_INT}",
        device = getDeviceName()
    )
    private var cache: String? = null
    private var endpoint: String = ""
    private val executor = Executors.newSingleThreadExecutor()

    private fun init(websiteId: String, hostUrl: String, extraPayload: TrackedProperties? = null) {
        payload = extraPayload?.let {
            payload.copy(
                website = websiteId,
                hostname = it.hostname ?: payload.hostname,
                language = it.language ?: payload.language,
                referrer = it.referrer ?: payload.referrer,
                screen = it.screen ?: payload.screen,
                title = it.title ?: payload.title,
                url = it.url ?: payload.url,
                page = it.page ?: payload.page,
                app = it.app ?: payload.app,
                os = it.os ?: payload.os,
                device = it.device ?: payload.device
            )
        } ?: payload.copy(website = websiteId)
        endpoint = "$hostUrl/api/send"
    }

    private fun send(extraPayload: TrackedProperties?, type: String = "event") {
        val headers = mutableMapOf("Content-Type" to "application/json")
        cache?.let { headers["x-umami-cache"] = it }

        val nextPayload = extraPayload?.let {
            payload.copy(
                hostname = it.hostname ?: payload.hostname,
                language = it.language,
                referrer = it.referrer,
                screen = it.screen,
                title = it.title,
                url = it.url ?: payload.url,
                page = it.page ?: payload.page,
                app = it.app ?: payload.app,
                os = it.os ?: payload.os,
                device = it.device ?: payload.device
            )
        } ?: payload

        val body = JSONObject(mapOf("type" to type, "payload" to nextPayload.toMap()))

        executor.execute {
            val urlObject = URL(endpoint)
            val connection = urlObject.openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.doOutput = true
            connection.useCaches = false
            connection.connectTimeout = 5000
            try {
                headers.forEach { (key, value) -> connection.setRequestProperty(key, value) }

                val outputStream = DataOutputStream(connection.outputStream)
                outputStream.writeBytes(body.toString())
                outputStream.flush()
                outputStream.close()

                val responseCode = connection.responseCode

                if (responseCode == HTTP_OK) {
                    val data = connection.inputStream.bufferedReader().readText()
                    cache = data
                    Log.d(TAG, cache!!)
                } else {
                    val errorText = connection.errorStream?.bufferedReader()?.readText()
                    Log.e(TAG, "Error: $responseCode, \${connection.responseMessage}, $errorText")
                }

            } catch (e: Exception) {
                Log.e(TAG, e.stackTraceToString())
            } finally {
                connection.disconnect()
            }
        }
    }

    fun trackInit(payload: TrackedProperties? = null) {
        init("${websiteId}", "${hostUrl}", null)

        send(payload)
    }
    
    fun trackEvent(payload: TrackedProperties? = null) {
        send(payload)
    }
}`;

export const genJavaCode = (websiteId: string, hostUrl: string) => `package your.package;

import your.package.BuildConfig;

import android.os.Build;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Umami {
    private static Umami INSTANCE = null;
    private static final String TAG = "Umami";
    private static final String TYPE_EVENT = "event";

    public static Umami getInstance() {
        if (INSTANCE == null) {
            INSTANCE = new Umami();
        }
        return INSTANCE;
    }

    private String getDeviceName() {
        String manufacturer = Build.MANUFACTURER;
        String model = Build.MODEL;
        if (model.toLowerCase(Locale.getDefault()).startsWith(manufacturer.toLowerCase(Locale.getDefault()))) {
            return capitalize(model);
        } else {
            return capitalize(manufacturer) + " " + model;
        }
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) {
            return "";
        }
        char first = s.charAt(0);
        if (Character.isUpperCase(first)) {
            return s;
        } else {
            return Character.toUpperCase(first) + s.substring(1);
        }
    }

    public static class TrackedProperties {
        private String website;
        private String hostname;

        public String getWebsite() {
            return website;
        }

        public String getHostname() {
            return hostname;
        }

        public String getLanguage() {
            return language;
        }

        public String getReferrer() {
            return referrer;
        }

        public String getScreen() {
            return screen;
        }

        public String getTitle() {
            return title;
        }

        public String getUrl() {
            return url;
        }

        public String getPage() {
            return page;
        }

        public String getApp() {
            return app;
        }

        public String getOs() {
            return os;
        }

        public String getDevice() {
            return device;
        }

        private String language;
        private String referrer;
        private String screen;
        private String title;
        private String url;
        private String page;
        private String app;
        private String os;
        private String device;

        public Map<String, String> toMap() {
            Map<String, String> map = new HashMap<>();
            map.put("website", website);
            if (hostname != null) map.put("hostname", hostname);
            if (language != null) map.put("language", language);
            if (referrer != null) map.put("referrer", referrer);
            if (screen != null) map.put("screen", screen);
            if (title != null) map.put("title", title);
            if (url != null) map.put("url", url);
            if (page != null) map.put("page", page);
            if (app != null) map.put("app", app);
            if (os != null) map.put("os", os);
            if (device != null) map.put("device", device);
            return map;
        }

        public void setReferrer(String referrer) {
            this.referrer = referrer;
        }

        public void setWebsite(String website) {
            this.website = website;
        }

        public void setHostname(String hostname) {
            this.hostname = hostname;
        }

        public void setLanguage(String language) {
            this.language = language;
        }

        public void setScreen(String screen) {
            this.screen = screen;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public void setPage(String page) {
            this.page = page;
        }

        public void setApp(String app) {
            this.app = app;
        }

        public void setOs(String os) {
            this.os = os;
        }

        public void setDevice(String device) {
            this.device = device;
        }
    }

    private TrackedProperties payload;
    private String cache = null;
    private String endpoint = "";
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    private void init(String websiteId, String hostUrl, TrackedProperties extraPayload) {
        payload = new TrackedProperties();
        payload.setWebsite(websiteId);
        payload.setApp("krude " + BuildConfig.VERSION_NAME);
        payload.setOs("Android " + Build.VERSION.RELEASE + ", API " + Build.VERSION.SDK_INT);
        payload.setDevice(getDeviceName());
        if (extraPayload != null) {
            payload.setHostname(extraPayload.hostname != null ? extraPayload.hostname : payload.hostname);
            payload.setLanguage(extraPayload.language != null ? extraPayload.language : payload.language);
            payload.setReferrer(extraPayload.referrer != null ? extraPayload.referrer : payload.referrer);
            payload.setScreen(extraPayload.screen != null ? extraPayload.screen : payload.screen);
            payload.setTitle(extraPayload.title != null ? extraPayload.title : payload.title);
            payload.setUrl(extraPayload.url != null ? extraPayload.url : payload.url);
            payload.setPage(extraPayload.page != null ? extraPayload.page : payload.page);
            payload.setApp(extraPayload.app != null ? extraPayload.app : payload.app);
            payload.setOs(extraPayload.os != null ? extraPayload.os : payload.os);
            payload.setDevice(extraPayload.device != null ? extraPayload.device : payload.device);
        } else {
            payload = new TrackedProperties();
            payload.setWebsite(websiteId);
        }
        endpoint = hostUrl + "/api/send";
    }

    private void send(TrackedProperties extraPayload, String type) {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        if (cache != null) {
            headers.put("x-umami-cache", cache);
        }
        TrackedProperties nextPayload;
        if (extraPayload != null) {
            nextPayload = new TrackedProperties();
            nextPayload.setHostname(extraPayload.hostname != null ? extraPayload.hostname : payload.hostname);
            nextPayload.setLanguage(extraPayload.language);
            nextPayload.setReferrer(extraPayload.referrer);
            nextPayload.setScreen(extraPayload.screen);
            nextPayload.setTitle(extraPayload.title);
            nextPayload.setUrl(extraPayload.url != null ? extraPayload.url : payload.url);
            nextPayload.setPage(extraPayload.page != null ? extraPayload.page : payload.page);
            nextPayload.setApp(extraPayload.app != null ? extraPayload.app : payload.app);
            nextPayload.setOs(extraPayload.os != null ? extraPayload.os : payload.os);
            nextPayload.setDevice(extraPayload.device != null ? extraPayload.device : payload.device);            
        } else {
            nextPayload = payload;
        }

        executor.execute(() -> {
            try {
                JSONObject body = new JSONObject();
                body.put("type", type);
                body.put("payload", new JSONObject(nextPayload.toMap()));
                URL urlObject = new URL(endpoint);
                HttpURLConnection connection = (HttpURLConnection) urlObject.openConnection();
                connection.setRequestMethod("POST");
                connection.setDoOutput(true);
                connection.setUseCaches(false);
                connection.setConnectTimeout(5000);
                for (Map.Entry<String, String> entry : headers.entrySet()) {
                    connection.setRequestProperty(entry.getKey(), entry.getValue());
                }
                DataOutputStream outputStream = new DataOutputStream(connection.getOutputStream());
                outputStream.writeBytes(body.toString());
                outputStream.flush();
                outputStream.close();
                int responseCode = connection.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    cache = new BufferedReader(new InputStreamReader(connection.getInputStream())).readLine();
                    Log.d(TAG, cache);
                } else {
                    String errorText = new BufferedReader(new InputStreamReader(connection.getErrorStream())).readLine();
                    Log.e(TAG, "Error: " + responseCode + ", " + connection.getResponseMessage() + ", " + errorText);
                }
                connection.disconnect();
            } catch (Exception e) {
                Log.e(TAG, e.toString());
            }
        });
    }

    public void trackInit() {
        trackInit(null);
    }

    public void trackInit(TrackedProperties payload) {
        init(${websiteId}, ${hostUrl}, null);
        send(payload, TYPE_EVENT);
    }

    public void trackEvent() {
        trackEvent(null);
    }

    public void trackEvent(TrackedProperties payload) {
        send(payload, null);
    }
}

`;

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
