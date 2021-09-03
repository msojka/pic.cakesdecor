/********************************************************************************************************************* 
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           * 
 *                                                                                                                    * 
 *  Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance        * 
 *  with the License. A copy of the License is located at                                                             * 
 *                                                                                                                    * 
 *      http://aws.amazon.com/asl/                                                                                    * 
 *                                                                                                                    * 
 *  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES * 
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    * 
 *  and limitations under the License.                                                                                * 
 *********************************************************************************************************************/ 
 
const AWS = require('aws-sdk');  
const sharp = require('sharp');  
  
class ImageHandler {  
  
    /**  
     * Main method for processing image requests and outputting modified images.  
     * @param {ImageRequest} request - An ImageRequest object.  
     */  
    async process(request) {  
        const originalImage = request.originalImage; 
        if (request.transform === "o") { 
            return originalImage.toString('base64'); 
        } else { 
            const modifiedImage = await this.applyTransform(originalImage, request.transform, request.bucket); 
            const bufferImage = await modifiedImage.toBuffer();  
            return bufferImage.toString('base64'); 
        }
    }
    
    /**  
     * Applies image modifications to the original image based on edits  
     * specified in the ImageRequest.  
     * @param {Buffer} originalImage - The original image.  
     * @param {Object} transform - The requested transform type.  
     * @param {Object} overlaysBucket - The bucket with the overlays.  
     */  
    async applyTransform(originalImage, transform, overlaysBucket) {  
        const image = sharp(originalImage);
        switch(transform) {
            case "t":
                image.resize({width: 200, height: 200, fit: "cover"}).sharpen().jpeg({quality: 75});
                break;
            case "s":
                image.resize({width: 320, height: 320, fit: "cover"}).sharpen().jpeg({quality: 75});
                break;
            case "m":
                image.resize({width: 640, fit: "inside"}).sharpen().jpeg({quality: 75});
                break;
            // cake 360 wide
            case "c400":
                image.resize({width: 400, fit: "inside"}).sharpen().jpeg({quality: 75});
                break;
            // cake 720 wide
            case "c700":
                image.resize({width: 700, fit: "inside"}).sharpen().jpeg({quality: 75});
                break;
            case "ig":
                // 4x5 format
                image.resize({width: 800, height: 1000, fit: "cover"}).sharpen().jpeg({quality: 95});
                break;
            case "l":
                image.resize({width: 1024, height: 1024, fit: "inside"}).sharpen().jpeg({quality: 75});
                break;
            case "dt3":
                image.resize({width: 196, height: 196, fit: "cover"})
                    .sharpen()
                    .extend({top: 2, bottom: 60, left: 2, right: 2})
                    .overlayWith(await this.getOverlayImage(overlaysBucket, "overlays/dt3.png"))  
                    .jpeg({quality: 95});
                break;
            case "ec":
                image.resize({width: 196, height: 196, fit: "cover"})
                    .sharpen()
                    .extend({top: 2, bottom: 60, left: 2, right: 2})
                    .overlayWith(await this.getOverlayImage(overlaysBucket, "overlays/ec.png"))
                    .jpeg({quality: 95});
                break;
            default:
                throw {
                    status: 400,
                    code: 'RequestTypeError',
                    message: 'Unrecognized transform.'
                };
        }
        return image;  
    } 
      
    /**  
     * Gets an image to be used as an overlay to the primary image from an  
     * Amazon S3 bucket.  
     * @param {string} bucket - The name of the bucket containing the overlay.  
     * @param {string} key - The keyname corresponding to the overlay.  
     */  
    async getOverlayImage(bucket, key) {  
        const s3 = new AWS.S3();  
        const params = { Bucket: bucket, Key: key };  
        // Request  
        const request = s3.getObject(params).promise();  
        // Response handling  
        try {  
            const overlayImage = await request;  
            return Promise.resolve(overlayImage.Body);  
        } catch (err) {  
            return Promise.reject({  
                status: 500,  
                code: err.code,  
                message: err.message  
            })  
        }  
    }  
}  
  
// Exports  
module.exports = ImageHandler;  

