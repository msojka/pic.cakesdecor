## Building distributable for customization

* Create `pic.cakesdecor.src-us-east-1` bucket.
* Rename `pic.cakesdecor.template` and search&replace all `pic.cakesdecor` in it.
* Build on micro EC2 instance (Amazon Linux AMI & install `nvm` and `node 8.10`).
* Zip all files from cloned repo.
* Ex. `scp -i ~/.ssh/amazonlinuxer.pem src.zip ec2-user@ec2-54-152-128-215.compute-1.amazonaws.com:src.zip`
* Ex. `ssh -i ~/.ssh/amazonlinuxer.pem ec2-user@ec2-54-152-128-215.compute-1.amazonaws.com`

# a) Build

* Unzip and cd to `deployment`

* Now build the distributable
```bash
sudo ./build-s3-dist.sh
```

* Deploy the distributable to an Amazon S3 bucket in your account. Note: you must have the AWS Command Line Interface installed.
```bash
aws s3 cp ./dist/ s3://pic.cakesdecor.src-us-east-1/ --recursive --exclude "*" --include "*.zip"
aws s3 cp ./dist/pic.cakesdecor.template s3://pic.cakesdecor.src-us-east-1/
```
* Get the link of the pic.cakesdecor.template uploaded to your Amazon S3 bucket.
* Deploy the Serverless Image Handler solution to your account by launching a new AWS CloudFormation stack using the link of the pic.cakesdecor.template
```bash
https://s3.amazonaws.com/pic.cakesdecor.src-us-east-1/pic.cakesdecor.template
```

# b) Build & update just image handler lambda

* Unzip and cd to `source/image-handler`
* `npm install`
* `npm run build`
* `cd dist/`
* Ex. `aws lambda update-function-code --function-name PicCakesdecor-ImageHandlerFunction-1I251OAM5WPBG --zip-file fileb://image-handler.zip`

Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Amazon Software License (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/asl/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and limitations under the License.
