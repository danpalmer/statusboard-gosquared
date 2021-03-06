## GoSquared API Proxy for Panic's Status Board

#### Timeline

Status Board by Panic can display custom graphs. This API translates a response for the timeline of a site's visitors from GoSquared into a format that Status Board can display.

```
http://domain/timeline/API_KEY/SITE_TOKEN
http://domain/timeline/API_KEY/SITE_TOKEN/COLOUR
```

The colour of the graph is defined in the JSON returned, and defaults to "blue". Colours that Status Board will display are *red, blue, green, yellow, orange, purple, aqua, or pink*.

#### Pages

Status Board can also display tables of data. The API also provides an endpoint for accessing the most popular pages and their current visitor count.

```
http://domain/pages/API_KEY/SITE_TOKEN
```

[Example using the GoSquared Demo stats](http://statusboard.danpalmer.me/timeline/demo/GSN-181546-E)
