export async function resolve(specifier,context,next){if(specifier==='ws')return {url:new URL('./ws-mock.mjs',import.meta.url).href,shortCircuit:true};return next(specifier,context);}
