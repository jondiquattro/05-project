'use strict';

const fs = require('fs');

/**
 * Bitmap -- receives a file name, used in the transformer to note the new buffer
 * @param filePath
 * @constructor
 */


 //this function takes a file path 
function Bitmap(filePath) {
  this.file = filePath;
}

/**
 * Parser -- accepts a buffer and will parse through it, according to the specification, creating object properties for each segment of the file
 * @param buffer
 */
Bitmap.prototype.parse = function(buffer) {
  this.buffer = buffer;

//   let str1 ='';
//   for(let i = 0; i<100; i++){
// str1 += buffer[i].toString(16);
//   }
// console.log(str1)

  // console.log(buffer.toString(2))

  //used to get header and body
  this.type = buffer.toString('hex', 0, 2);
  this.header = header(buffer);
  console.log(this.header)

  this.body = arrayify(buffer);

  let whole = Buffer.alloc(41553)  //writes to the buffer
  whole.write(this.type);
  
  // console.log(this.body.length, this.header.length)
  return {header: this.header, body: this.body, whole: whole}
};

/**
 * Transform a bitmap using some set of rules. The operation points to some function, which will operate on a bitmap instance
 * @param operation
 */

//  all this does is make a file
Bitmap.prototype.transform = function(operation) {
  // This is really assumptive and unsafe
  transforms[operation](this);
  this.newFile = this.file.replace(/\.bmp/, `.${operation}.bmp`);
};

/**
 * Sample Transformer (greyscale)
 * Would be called by Bitmap.transform('greyscale')
 * Pro Tip: Use "pass by reference" to alter the bitmap's buffer in place so you don't have to pass it around ...
 * @param bmp
 */
const transformGreyscale = (bmp) => {

  // console.log('Transforming bitmap into greyscale', bmp);
  

  //TODO: Figure out a way to validate that the bmp instance is actually valid before trying to transform it

  //TODO: alter bmp to make the image greyscale ...

};

const doTheInversion = (bmp) => {
  bmp = {};
}

/**
 * A dictionary of transformations
 * Each property represents a transformation that someone could enter on the command line and then a function that would be called on the bitmap to do this job
 */
const transforms = {
  greyscale: transformGreyscale,
  invert: doTheInversion
};

// ------------------ GET TO WORK ------------------- //

function transformWithCallbacks() {

  fs.readFile(file, (err, buffer) => {//this is how the file is being loaded into the buffer

    if (err) {
      throw err;
    }
    
    bitmap.parse(buffer);

    bitmap.transform(operation);


    // Note that this has to be nested!
    // Also, it uses the bitmap's instance properties for the name and thew new buffer
    // fs.writeFile(bitmap.newFile, bitmap.parse(buffer).whole, (err, out) =>

    fs.writeFile(bitmap.newFile, buffAppend(input), (err, out) => { //bitmap.buffer needs to be the altered buffer 
      if (err) {
        throw err;
      }
      console.log(`Bitmap Transformed: ${bitmap.newFile}`);
    });

  });
}

// TODO: Explain how this works (in your README)
const [file, operation] = process.argv.slice(2);

function arrayify(data){
  let bufferArray = [];
  for(let i = 54; i < data.length; i++){
    bufferArray.push(data[i].toString(16));
    
  } 
  return bufferArray;
}

function header(data){
  let headerArray = [];
  for(let i = 0; i < 53; i++){
    headerArray.push(data[i].toString(16));
  }
  return headerArray;
}

//helper function that appends a string to the buffer
function buffAppend(str){
  var buf = Buffer.alloc(str.length);
  buf.fill(str);
  return str;
}

let bitmap = new Bitmap(file);

transformWithCallbacks();


