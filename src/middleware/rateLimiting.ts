import rateLimit from "express-rate-limit";

interface RateLimitOptions {
    seconds: number;
    maxRequests: number;
}

export const rateLimiter = ({ seconds, maxRequests }: RateLimitOptions) => {
    return rateLimit({
        windowMs: seconds * 1000,// mls-sn
        max: maxRequests,
        message: {
            message: `Too many requests. Try again in ${seconds} seconds.`,
        },
        standardHeaders: true,// headers for rate limit info-- yeni headers
        legacyHeaders: false,// disable the `X-RateLimit-*` headers -- kohne headers
    });
};
