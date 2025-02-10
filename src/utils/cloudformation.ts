import { DeployedResource } from '../types/resources';

export interface CloudFormationTemplate {
  AWSTemplateFormatVersion: string;
  Resources: Record<string, {
    Type: string;
    Properties: Record<string, any>;
  }>;
}

export const convertToCloudFormation = (resource: DeployedResource): CloudFormationTemplate => {
  const template: CloudFormationTemplate = {
    AWSTemplateFormatVersion: '2010-09-09',
    Resources: {}
  };
  
  switch (resource.type) {
    case 'iam':
      template.Resources[resource.id] = {
        Type: 'AWS::IAM::User',
        Properties: {
          UserName: resource.name,
          ManagedPolicyArns: resource.details.permissions,
          Groups: resource.details.groups || []
        }
      };
      break;
    case 'network':
      template.Resources[resource.id] = {
        Type: 'AWS::EC2::VPC',
        Properties: {
          CidrBlock: resource.details.cidr,
          EnableDnsHostnames: true,
          EnableDnsSupport: true,
          Tags: [{ Key: 'Name', Value: resource.name }]
        }
      };
      break;
    case 'compute':
      template.Resources[resource.id] = {
        Type: 'AWS::AutoScaling::AutoScalingGroup',
        Properties: {
          MinSize: resource.details.minInstances,
          MaxSize: resource.details.maxInstances,
          DesiredCapacity: resource.details.minInstances,
          LaunchConfigurationName: `${resource.name}-lc`,
          Tags: [{ Key: 'Name', Value: resource.name }]
        }
      };
      break;
    case 'storage':
      template.Resources[resource.id] = {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: resource.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          VersioningConfiguration: {
            Status: resource.details.versioning === '已启用' ? 'Enabled' : 'Suspended'
          },
          BucketEncryption: {
            ServerSideEncryptionConfiguration: [{
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'aws:kms'
              }
            }]
          }
        }
      };
      break;
    default:
      throw new Error(`Unsupported resource type: ${resource.type}`);
  }
  
  return template;
};

export const formatCloudFormation = (template: CloudFormationTemplate): string => {
  return JSON.stringify(template, null, 2);
};

export const generateFullTemplate = (resources: DeployedResource[]): CloudFormationTemplate => {
  const template: CloudFormationTemplate = {
    AWSTemplateFormatVersion: '2010-09-09',
    Resources: {}
  };

  resources.forEach(resource => {
    const singleTemplate = convertToCloudFormation(resource);
    Object.assign(template.Resources, singleTemplate.Resources);
  });

  return template;
};
