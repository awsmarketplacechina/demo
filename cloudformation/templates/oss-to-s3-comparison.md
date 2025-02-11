# OSS to S3 Migration - Configuration Comparison

## Original Alibaba Cloud OSS (Terraform)
```hcl
# alicloud_oss_bucket.default:
resource "alicloud_oss_bucket" "default" {
    acl               = "private"
    bucket            = "awsmp-demo-001"
    creation_date     = "2025-02-11"
    extranet_endpoint = "oss-cn-beijing.aliyuncs.com"
    id                = "awsmp-demo-001"
    intranet_endpoint = "oss-cn-beijing-internal.aliyuncs.com"
    location          = "oss-cn-beijing"
    owner             = "1186838991269606"
    policy            = null
    redundancy_type   = "LRS"
    resource_group_id = "rg-acfmwwtrazro5zq"
    storage_class     = "Standard"
    tags              = {}

    access_monitor {
        status = "Disabled"
    }
}
```

## Equivalent AWS S3 (CloudFormation)
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'AWS CloudFormation template for S3 bucket (converted from Alibaba Cloud OSS)'

Resources:
  DemoS3Bucket:
    Type: 'AWS::S3::Bucket'
    Properties:
      BucketName: 'awsmp-demo-001'
      AccessControl: Private
      Tags:
        - Key: Name
          Value: awsmp-demo-001
      VersioningConfiguration:
        Status: Suspended
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

Outputs:
  BucketName:
    Description: Name of the created S3 bucket
    Value: !Ref DemoS3Bucket
  BucketARN:
    Description: ARN of the created S3 bucket
    Value: !GetAtt DemoS3Bucket.Arn
```

## Key Mappings
- `acl = "private"` → `AccessControl: Private`
- `bucket = "awsmp-demo-001"` → `BucketName: 'awsmp-demo-001'`
- `storage_class = "Standard"` → Default in S3
- `tags = {}` → Basic Name tag added
- Added security best practices with `PublicAccessBlockConfiguration`
- Added useful outputs for bucket name and ARN
