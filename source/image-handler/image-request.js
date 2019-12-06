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

class ImageRequest {

    /**
     * Initializer function for creating a new image request, used by the image
     * handler to perform image modifications.
     * @param {Object} event - Lambda request body.
     */
    async setup(event) {
        try {
            const path = event["path"];
            const expectedPath = new RegExp(/^\/\d+\/\w+\/[^.^\/]+.jpg$/);
            if (!expectedPath.test(path)) {  // use sharp
                throw {
                    status: 400,
                    code: 'RequestTypeError',
                    message: 'Unrecognized path format.'
                };
            }
            
            this.bucket = this.getAllowedSourceBuckets()[0];
            
            // Ex. /1/dt3/safdsafdsfdcadasd.jpg
            const pathSegments = path.split("/");
            this.version = parseInt(pathSegments[1]);
            this.transform = pathSegments[2];
            this.key = pathSegments[3];        
            
            this.originalImage = await this.getOriginalImage(this.bucket, this.key)
            return Promise.resolve(this);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /**
     * Gets the original image from an Amazon S3 bucket.
     * @param {String} bucket - The name of the bucket containing the image.
     * @param {String} key - The key name corresponding to the image.
     * @return {Promise} - The original image or an error.
     */
    async getOriginalImage(bucket, key) {
        const S3 = require('aws-sdk/clients/s3');
        const s3 = new S3();
        const imageLocation = { Bucket: bucket, Key: key };
        const request = s3.getObject(imageLocation).promise();
        try {
            const originalImage = await request;
            return Promise.resolve(originalImage.Body);
        }
        catch(err) {
            return Promise.reject({
                status: 500,
                code: err.code,
                message: err.message
            })
        }
    }

    /**
     * Returns a formatted image source bucket whitelist as specified in the
     * SOURCE_BUCKETS environment variable of the image handler Lambda
     * function. Provides error handling for missing/invalid values.
     */
    getAllowedSourceBuckets() {
        const sourceBuckets = process.env.SOURCE_BUCKETS;
        if (sourceBuckets === undefined) {
            throw ({
                status: 400,
                code: 'GetAllowedSourceBuckets::NoSourceBuckets',
                message: 'The SOURCE_BUCKETS variable could not be read. Please check that it is not empty and contains at least one source bucket, or multiple buckets separated by commas. Spaces can be provided between commas and bucket names, these will be automatically parsed out when decoding.'
            });
        } else {
            const formatted = sourceBuckets.replace(/\s+/g, '');
            const buckets = formatted.split(',');
            return buckets;
        }
    }
}

// Exports
module.exports = ImageRequest;
