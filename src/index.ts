import {Request, Response, NextFunction, Router}  from 'express';

import fs from 'fs';
import pathlib from 'path';

async function getFilePath(folderPath: string, req:Request):Promise<string | null> { //dalam format '/path/name'. pug dan js tambahin dewek.
  if (req.path === '/') return '/index';
  var result = req.path;
  if (result.slice(-1) === '/') result = result.slice(0,-1);
  let pathParams:string[] = [];
  while (true) {
    let thePath = `${folderPath}${result}`;
    if (fs.existsSync(`${thePath}.js`)) {
      req.pathParams = pathParams; //Only if found, put pathParams to request 
      return result;
    }
    // Cancel to include subfolder index.js into folder route.
    // Since it can cause confusion with files.
    // Use app.use('/folder', folderRoute) to include /folder/index.js
    // if (fs.existsSync(`${thePath}/index.js`)) {
    //   req.pathParams = pathParams;
    //   return `${result}/index`;
    // }
    pathParams.unshift(pathlib.basename(result));
    result = pathlib.dirname(result);
    if (result === '/') return null;
  }
}

let folderRoute = function(folderPath: string, viewFolder: string): Router {
  var router = Router();
  router.get('*', async function(req:Request, res:Response, next:NextFunction) {
    req.app.set('views', viewFolder);
    //req.app, baseurl, body, cookies, hostname, ip, params, path, protocol, query, route, secure, subdomains
    var filepath = await getFilePath(folderPath, req);
    if (filepath === null) { next(); return; }
    try {
      var obj:any = await require(`${folderPath}${filepath}.js`).get(req,res);
      if (!res.headersSent) res.render(filepath.substring(1), obj);
    } catch (err) {
      var error: any = err;
      var errStack = error.stack.replace(/\n/g, '<br />');
      res.send(errStack);
    }
  });
  router.post('*', async function(req:Request,res:Response,next:NextFunction) {
    var filepath = await getFilePath(folderPath, req);
    if (filepath === null) { next(); return; }
    try {
      var obj:any = await require(`${folderPath}${filepath}.js`).post(req,res);
      if (!obj.handled) res.send(obj);  
    } catch (err) {
      var error: any = <Error>err;
      var errStack = error.stack.replace(/\n/g, '<br />');
      res.send({result:'error', message:error.message, data: errStack});
    }
  });
  return router;
}

export default folderRoute;