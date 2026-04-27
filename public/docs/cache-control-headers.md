---
title: Cache-Control headers
product: vercel
url: /docs/caching/cache-control-headers
type: reference
prerequisites:
  - /docs/caching
related:
  - /docs/cdn-cache
  - /docs/manage-cdn-usage
  - /docs/project-configuration
  - /docs/functions
summary: Learn about the cache-control headers sent to each Vercel deployment and how to use them to control the caching behavior of your application.
---

# Cache-Control headers

You can control how Vercel's CDN caches your Function responses by setting a Cache-Control header.

## Default `cache-control` value

The default value is `cache-control: public, max-age=0, must-revalidate` which instructs both the CDN and the browser not to cache.

## Recommended settings

The right `Cache-Control` value depends on what you're caching and how fresh it needs to be:

| Content type                                    | Recommended header            | When to use                                                                                |
| ----------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| Server-rendered, same for all visitors          | `max-age=0, s-maxage=86400`   | Pages where every visitor sees the same content.                                           |
| Semi-static (product pages, blogs, marketing)   | `max-age=120, s-maxage=86400` | Content that tolerates short staleness.                                                    |
| Personalized or per-user                        | `private, max-age=0`          | Responses that vary by cookie, session, or auth.                                           |
| Immutable static assets (hashed JS, CSS, fonts) | `max-age=31536000, immutable` | Content-hashed assets. Frameworks like Next.js set this automatically.                     |

## `s-maxage`

This directive sets the number of seconds a response is considered "fresh" by the CDN. After this period ends, Vercel's CDN will serve the "stale" response from the edge until the response is asynchronously revalidated.

Vercel's proxy consumes `s-maxage` for all requests. After processing it, the CDN does not include it in the final HTTP response to the client.

### `s-maxage` example

```js
Cache-Control: s-maxage=60
```

The following example instructs the CDN to cache the response for 60 seconds. A response can be cached a minimum of `1` second and maximum of `31536000` seconds (1 year).

## `stale-while-revalidate`

This directive allows you to serve content from the Vercel CDN cache while simultaneously updating the cache in the background. It is useful when:

- Your content changes frequently, but regeneration is slow
- Your content changes infrequently but you want to have the flexibility to update it without waiting for the cache to expire

### SWR example

```js
Cache-Control: s-maxage=1, stale-while-revalidate=59
```

This instructs the CDN to:
- Serve content from the cache for 1 second
- Return a stale request (if requested after 1 second)
- Update the cache in the background asynchronously

## `stale-if-error`

When you set the `stale-if-error` HTTP Cache-Control extension, the CDN serves a stale response when an error is encountered instead of returning the error to the client.

```js
Cache-Control: max-age=604800, stale-if-error=86400
```

1. Cache and serve a successful response fresh for 7 days
2. Attempt revalidation after 7 days, serve the stale response for up to 1 additional day
3. If the origin never returns a successful response, users will see the error

## Using `private`

Using the `private` directive specifies that the response can only be cached by the client and **not by Vercel's CDN**. Use this when you want to cache content on the user's browser, but prevent caching on Vercel's CDN.

## `Pragma: no-cache`

When Vercel's CDN receives a request with `Pragma: no-cache`, it will revalidate any stale resource synchronously, instead of in the background.

## CDN-Cache-Control Header

The `CDN-Cache-Control` and `Vercel-CDN-Cache-Control` headers are response headers that can be used to specify caching behavior on the CDN.

### Priority order

1. **Vercel-CDN-Cache-Control** - Exclusive to Vercel, top priority
2. **CDN-Cache-Control** - Second priority, overrides `Cache-Control`
3. **Cache-Control** - Web standard, last priority

## Example usage

```js
export async function GET() {
  return new Response('Cache Control example', {
    status: 200,
    headers: {
      'Cache-Control': 'max-age=10',
      'CDN-Cache-Control': 'max-age=60',
      'Vercel-CDN-Cache-Control': 'max-age=3600',
    },
  });
}
```

This example demonstrates:
- Vercel's Cache: 3600 seconds TTL
- Downstream CDNs: 60 seconds TTL
- Clients: 10 seconds TTL

## Which Cache-Control headers to use with CDNs

- If you want to control caching similarly on Vercel, CDNs, and the client, use `Cache-Control`
- If you want to control caching on Vercel and also on other CDNs, use `CDN-Cache-Control`
- If you want to control caching only on Vercel, use `Vercel-CDN-Cache-Control`
- If you want to specify different caching behaviors for all three, set all three headers