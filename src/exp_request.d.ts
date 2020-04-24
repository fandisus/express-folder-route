declare namespace Express {
  export interface Request {
    pathParams?: string[]
  }
}

// Put the following lines into index.d.ts so the pathParams is recognized by linter
// https://stackoverflow.com/questions/54030381/unable-to-extend-express-request-in-typescript/54030481
// declare global {
//   namespace Express {
//     export interface Request {
//       pathParams?: string[]
//     }
//   }
// }

