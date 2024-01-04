/**
 * Extracts the X-USER header from the request headers
 * @param headers 
 * @returns 
 */
export const extractXuserHeader = (headers : Headers) => {
    return {
        'X-USER': headers.get('X-USER')
    }
}