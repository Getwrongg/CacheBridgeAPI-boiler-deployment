// statistics.js
let cacheHits = 0;
let cacheMisses = 0;
let requestCount = 0;

export function recordHit() {
    cacheHits++;
}

export function recordMiss() {
    cacheMisses++;
}

export function recordRequest() {
    requestCount++;
}

export function getStats() {
    return {
        hits: cacheHits,
        misses: cacheMisses,
        requests: requestCount
    };
}
