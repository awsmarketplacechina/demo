"""
SDK mappings for converting Aliyun OSS SDK calls to AWS S3 SDK calls.
Based on example code from AliyunStorageService.java
"""

OSS_TO_S3_MAPPINGS = {
    'putObject': {
        'aws_method': 'put_object',
        'param_mapping': {
            'bucketName': 'Bucket',
            'key': 'Key',
            'input_stream': 'Body'
        }
    },
    'getObject': {
        'aws_method': 'get_object',
        'param_mapping': {
            'bucketName': 'Bucket',
            'key': 'Key'
        }
    },
    'deleteObject': {
        'aws_method': 'delete_object',
        'param_mapping': {
            'bucketName': 'Bucket',
            'key': 'Key'
        }
    },
    'getBucketLocation': {
        'aws_method': 'get_bucket_location',
        'param_mapping': {
            'bucketName': 'Bucket'
        }
    }
}
